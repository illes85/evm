<?php
/**
 * Séma létrehozása/frissítése kézzel, parancssorból:
 *
 *   php migrate.php
 *
 * Böngészőből nem kell futtatni: az API az első kérésnél magától
 * létrehozza a hiányzó táblákat (lásd src/Setup.php).
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Ez a szkript csak parancssorból futtatható. Az API magától elvégzi a séma létrehozását.\n");
}

require __DIR__ . '/src/Db.php';
require __DIR__ . '/src/Schema.php';

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    exit("Hiányzik a config.php — másold át a config.example.php fájlt.\n");
}
$config = require $configPath;

$applied = Schema::migrate(new Db($config['db']));
echo $applied === []
    ? "Nincs új migráció, a séma naprakész.\n"
    : "Lefuttatva:\n - " . implode("\n - ", $applied) . "\n";
