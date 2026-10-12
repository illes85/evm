<?php
/**
 * Séma létrehozása/frissítése. Futtatható parancssorból (SSH) vagy
 * böngészőből — utóbbi esetben a config.php-ban megadott kulcsot kéri,
 * hogy ne tudja bárki elindítani.
 *
 *   php migrate.php
 *   https://evm.szilab.hu/api/migrate.php?key=<app_secret>
 */
declare(strict_types=1);

require __DIR__ . '/src/Db.php';
require __DIR__ . '/src/Schema.php';

$cli = PHP_SAPI === 'cli';
$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    exit("Hiányzik a config.php — másold át a config.example.php fájlt.\n");
}
$config = require $configPath;

if (!$cli) {
    header('Content-Type: text/plain; charset=utf-8');
    $key = (string) ($_GET['key'] ?? '');
    if (!hash_equals((string) $config['app_secret'], $key)) {
        http_response_code(403);
        exit("Hibás kulcs.\n");
    }
}

$applied = Schema::migrate(new Db($config['db']));
echo $applied === []
    ? "Nincs új migráció, a séma naprakész.\n"
    : "Lefuttatva:\n - " . implode("\n - ", $applied) . "\n";
