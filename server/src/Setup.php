<?php

/**
 * Önbeállítás, hogy a tárhelyre telepítés ne igényeljen több lépést a
 * config.php kitöltésénél.
 *
 * - A titkos kulcsot magunk generáljuk és fájlba tesszük, így a
 *   felhasználónak nem kell ilyesmivel foglalkoznia.
 * - A séma magától létrejön és frissül. Ez csak azért biztonságos, mert a
 *   migrációink kizárólag hozzáadnak (CREATE TABLE IF NOT EXISTS, új
 *   oszlop) — adatot törlő vagy átíró lépést sosem futtatunk automatikusan.
 */
final class Setup
{
    /**
     * Gondoskodik róla, hogy a séma naprakész legyen. Egyetlen olcsó
     * lekérdezés, ha nincs tennivaló.
     */
    public static function ensureSchema(Db $db): void
    {
        $expected = count(Schema::migrations());

        try {
            $row = $db->one('SELECT COUNT(*) AS c FROM migrations');
            if ((int) ($row['c'] ?? 0) >= $expected) {
                return;
            }
        } catch (Throwable $e) {
            // Még nincs migrations tábla — ez az első indulás.
        }

        Schema::migrate($db);
    }

    /**
     * Hosszú véletlen kulcs, első hívásra generálva és fájlba mentve.
     * Jelenleg semmi nem használja kötelezően; a későbbi aláírt linkekhez
     * (pl. jelszó-visszaállító email) lesz rá szükség.
     */
    public static function secret(string $dir): string
    {
        $path = $dir . '/secret.key';

        if (is_file($path)) {
            $existing = trim((string) file_get_contents($path));
            if ($existing !== '') {
                return $existing;
            }
        }

        $secret = bin2hex(random_bytes(32));
        if (@file_put_contents($path, $secret, LOCK_EX) !== false) {
            @chmod($path, 0600);
        }
        return $secret;
    }
}
