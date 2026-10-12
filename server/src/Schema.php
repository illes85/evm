<?php

/**
 * Séma-migrációk. Mindegyik egyszer fut le, a lefutottakat a `migrations`
 * tábla tartja számon, így a migrate.php bármikor újra futtatható.
 *
 * A szinkronizált rekordokat szándékosan egységesen tároljuk: a sorhoz
 * tartozó mezők (id, tulajdonos, időbélyegek) rendes oszlopok, mert ezekre
 * szűrünk és indexelünk, a rekord többi része pedig JSON. Így a kliens
 * adatmodellje változhat anélkül, hogy minden alkalommal sémát kellene
 * migrálni — a későbbi kimutatásokhoz és a NAV-os számlázáshoz pedig
 * generált oszlopokat lehet kiemelni a JSON-ből, adatvesztés nélkül.
 */
final class Schema
{
    /** A szinkronizált tábláink. A kliens ugyanezeket a neveket küldi. */
    const SYNCED_TABLES = ['clients', 'projects', 'quotes', 'invoices', 'leads'];

    public static function migrations(): array
    {
        $migrations = [];

        $migrations['001_migrations'] = "
            CREATE TABLE IF NOT EXISTS migrations (
                name VARCHAR(190) NOT NULL PRIMARY KEY,
                ran_at DATETIME NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $migrations['002_users'] = "
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) NOT NULL PRIMARY KEY,
                email VARCHAR(190) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                plan VARCHAR(16) NOT NULL DEFAULT 'basic',
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        // A tokennek csak a hash-ét tároljuk: ha az adatbázis kiszivárog,
        // a meglévő munkamenetek attól még nem használhatók.
        $migrations['003_sessions'] = "
            CREATE TABLE IF NOT EXISTS sessions (
                id CHAR(36) NOT NULL PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                token_hash CHAR(64) NOT NULL UNIQUE,
                device_label VARCHAR(190) NULL,
                created_at DATETIME NOT NULL,
                last_used_at DATETIME NOT NULL,
                expires_at DATETIME NOT NULL,
                INDEX idx_sessions_user (user_id),
                CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
                    REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        // Bejelentkezési kísérletek számlálása, hogy a jelszó ne legyen
        // korlátlanul próbálgatható.
        $migrations['004_login_attempts'] = "
            CREATE TABLE IF NOT EXISTS login_attempts (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(190) NOT NULL,
                ip VARCHAR(45) NOT NULL,
                attempted_at DATETIME NOT NULL,
                INDEX idx_attempts_email (email, attempted_at),
                INDEX idx_attempts_ip (ip, attempted_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        foreach (self::SYNCED_TABLES as $table) {
            // Két időbélyeg kell, és ez szándékos:
            //  - updated_at a kliensé, ez dönti el ütközéskor, melyik a
            //    frissebb változat (a felhasználó szándéka szerinti sorrend);
            //  - server_updated_at a szerver órája, és csak ez szolgál a
            //    letöltés kurzoraként. Ha a kliens óráján múlna, egy rosszul
            //    beállított telefonról feltöltött rekord a múltba kerülne, és
            //    a többi eszköz "mi változott X óta" kérdésére soha nem
            //    jönne vissza — vagyis csendben elveszne.
            $migrations["010_$table"] = "
                CREATE TABLE IF NOT EXISTS `$table` (
                    id CHAR(36) NOT NULL,
                    user_id CHAR(36) NOT NULL,
                    payload JSON NOT NULL,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME(3) NOT NULL,
                    server_updated_at DATETIME(3) NOT NULL,
                    deleted_at DATETIME NULL,
                    PRIMARY KEY (user_id, id),
                    INDEX idx_{$table}_changed (user_id, server_updated_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        }

        return $migrations;
    }

    public static function migrate(Db $db): array
    {
        $applied = [];
        $migrations = self::migrations();

        // A nyilvántartó tábla magának is migráció, de előbb léteznie kell.
        $db->query($migrations['001_migrations']);

        $done = [];
        foreach ($db->all('SELECT name FROM migrations') as $row) {
            $done[$row['name']] = true;
        }

        foreach ($migrations as $name => $sql) {
            if (isset($done[$name])) {
                continue;
            }
            $db->query($sql);
            $db->query('INSERT INTO migrations (name, ran_at) VALUES (?, ?)', [
                $name,
                gmdate('Y-m-d H:i:s'),
            ]);
            $applied[] = $name;
        }

        return $applied;
    }
}
