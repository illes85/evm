<?php

/**
 * Az API egyetlen belépési pontja.
 *
 * Útvonal átírás nélkül is működik: /api/index.php?r=auth/login
 * Ha a tárhelyen van mod_rewrite, a .htaccess ugyanezt elérhetővé teszi
 * szebb formában is (/api/auth/login).
 */

declare(strict_types=1);

// Kétféle elrendezésben is működnie kell, és a kettőt nem szabad
// összekeverni: a kódtárban a belépési pont a public/ mappában van, a
// forrás és a beállítás eggyel feljebb; a tárhelyen viszont minden egyetlen
// api/ mappába kerül. Ezért nem feltételezzük a szerkezetet, hanem
// megkeressük, hol van a src/ könyvtár.
$root = is_dir(__DIR__ . '/src') ? __DIR__ : dirname(__DIR__);

require $root . '/src/Db.php';
require $root . '/src/Http.php';
require $root . '/src/Auth.php';
require $root . '/src/Schema.php';
require $root . '/src/Sync.php';
require $root . '/src/Setup.php';

$configPath = $root . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'not_configured',
        'message' => 'Hiányzik a config.php. Másold át a config.example.php fájlt és töltsd ki.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
$config = require $configPath;

// Kitöltetlen sablon: mondjuk meg emberi nyelven, mi a teendő.
$dbConfig = $config['db'] ?? [];
foreach (['name', 'user', 'pass'] as $field) {
    if (strpos((string) ($dbConfig[$field] ?? ''), 'IDE_') === 0) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'not_configured',
            'message' => 'A config.php még a minta szöveget tartalmazza. '
                . 'Írd bele az adatbázis nevét, felhasználóját és jelszavát.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$http = new Http($config);
$http->applyCors();

// A belső hibák részletei a naplóba mennek, a válaszba soha.
set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    try {
        $db = new Db($config['db']);
    } catch (PDOException $e) {
        error_log('[evm-api] db connect: ' . $e->getMessage());
        Http::fail(500, 'db_unavailable',
            'Nem sikerült csatlakozni az adatbázishoz. Ellenőrizd a config.php-ban '
            . 'az adatbázis nevét, felhasználóját és jelszavát.');
    }
    // Első indításkor (és frissítés után) magától létrehozza a táblákat,
    // így a telepítés nem igényel külön lépést.
    Setup::ensureSchema($db);
    $auth = new Auth($db);
    $route = Http::route();
    $method = Http::method();
    $body = in_array($method, ['POST', 'PUT', 'PATCH'], true) ? Http::body() : [];

    /** Bejelentkezést igénylő végpontokhoz. */
    $requireUser = static function () use ($auth): array {
        $user = $auth->authenticate(Http::bearerToken());
        if ($user === null) {
            Http::fail(401, 'unauthenticated', 'Jelentkezz be újra.');
        }
        return $user;
    };

    switch ("$method $route") {
        case 'GET health':
            Http::json([
                'ok' => true,
                'php' => PHP_VERSION,
                'database' => 'kapcsolódva',
                'tables' => count(Schema::migrations()),
                'time' => gmdate('c'),
            ]);
            // no break — a Http::json kilép

        case 'POST auth/register':
            Http::json($auth->register(
                (string) ($body['email'] ?? ''),
                (string) ($body['password'] ?? ''),
                isset($body['device']) ? (string) $body['device'] : null
            ), 201);

        case 'POST auth/login':
            Http::json($auth->login(
                (string) ($body['email'] ?? ''),
                (string) ($body['password'] ?? ''),
                isset($body['device']) ? (string) $body['device'] : null
            ));

        case 'POST auth/logout':
            $auth->logout(Http::bearerToken());
            Http::json(['ok' => true]);

        case 'GET auth/me':
            $user = $requireUser();
            Http::json(['user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'plan' => $user['plan'],
            ]]);

        case 'POST sync/pull':
            $user = $requireUser();
            Http::json((new Sync($db))->pull($user['id'], (string) ($body['since'] ?? '')));

        case 'POST sync/push':
            $user = $requireUser();
            Http::json((new Sync($db))->push($user['id'], is_array($body['changes'] ?? null) ? $body['changes'] : []));

        default:
            Http::fail(404, 'unknown_route', 'Nincs ilyen végpont.');
    }
} catch (Throwable $e) {
    error_log('[evm-api] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    Http::fail(500, 'server_error', 'Váratlan hiba történt a szerveren.');
}
