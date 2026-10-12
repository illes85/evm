<?php
/**
 * Másold át config.php néven a tárhelyen, és töltsd ki. A config.php NEM
 * kerül be a kódtárba (lásd .gitignore) — csak a szerveren létezik.
 */
return [
    // Adatbázisok kezelése menüben létrehozott adatbázis adatai
    'db' => [
        'host' => 'localhost',
        'name' => 'VALTOZTASD_MEG',
        'user' => 'VALTOZTASD_MEG',
        'pass' => 'VALTOZTASD_MEG',
    ],

    // Egyszer kell generálni, utána soha ne változtasd (kilépteti a felhasználókat).
    // Készíts hosszú véletlen szöveget, pl. a tárhely SSH-ján: openssl rand -hex 32
    'app_secret' => 'VALTOZTASD_MEG',

    // Honnan fogadunk kérést. Ha az app ugyanarról a domainről megy, üresen
    // hagyható; a GitHub Pages-es teszthez viszont fel kell venni.
    'allowed_origins' => [
        'https://evm.szilab.hu',
        'https://illes85.github.io',
    ],
];
