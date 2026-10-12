# EVM szerver (PHP 8 + MySQL)

Az app adatait tároló és az eszközök között szinkronizáló háttérrendszer.
Szándékosan úgy készült, hogy **közös tárhelyen** is elfusson (Nethely és
hasonlók): nincs szükség külön szerverre, Node-ra vagy háttérfolyamatra.

## Mit hova kell feltölteni

A tárhelyen az `evm.szilab.hu` könyvtárába:

```
evm.szilab.hu/
  index.html, assets/…      <- az app (a frontend buildje)
  api/
    index.php               <- a server/public/ tartalma
    .htaccess
    migrate.php             <- a server/migrate.php
    config.php              <- EZT TE HOZOD LÉTRE, lásd lentebb
    src/                    <- a server/src/ tartalma
```

Vagyis a `server/public/` fájljai és a `server/src/` mappa együtt kerülnek az
`api/` könyvtárba.

## Beállítás

1. **Adatbázis.** A tárhely vezérlőpultján („Adatbázisok kezelése") hozz létre
   egy MySQL adatbázist, felhasználóval és jelszóval.

2. **config.php.** Másold át a `config.example.php` fájlt `config.php` néven az
   `api/` könyvtárba, és töltsd ki az adatbázis adataival. Az `app_secret`
   legyen hosszú véletlen szöveg (SSH-n: `openssl rand -hex 32`). Ezt a fájlt
   **soha ne töltsd fel a kódtárba** — a `.gitignore` ki is zárja.

3. **Séma létrehozása.** Vagy SSH-n `php migrate.php`, vagy böngészőből:
   `https://evm.szilab.hu/api/migrate.php?key=AZ_APP_SECRET`
   Újrafuttatható, csak a hiányzó lépéseket végzi el.

4. **Ellenőrzés.** `https://evm.szilab.hu/api/index.php?r=health` — JSON
   választ kell adnia.

## Végpontok

| Metódus | Útvonal | Mit csinál |
|---|---|---|
| GET | `?r=health` | Életjel |
| POST | `?r=auth/register` | Regisztráció, visszaad egy tokent |
| POST | `?r=auth/login` | Bejelentkezés |
| POST | `?r=auth/logout` | Munkamenet megszüntetése |
| GET | `?r=auth/me` | A bejelentkezett felhasználó |
| POST | `?r=sync/pull` | Ami a megadott kurzor óta változott |
| POST | `?r=sync/push` | A kliens változásainak feltöltése |

A védett végpontok `Authorization: Bearer <token>` fejlécet várnak. Ha a
tárhelyen van `mod_rewrite`, ugyanezek elérhetők szebben is
(`/api/auth/login`), de a `?r=` forma mindig működik.

## Döntések, amiket érdemes tudni

**Miért két időbélyeg.** Az `updated_at` a kliensé, ez dönti el ütközéskor,
melyik változat a frissebb. A `server_updated_at` a szerver órája, és csak ez
a letöltés kurzora — ha a kliens órájára bíznánk, egy rosszul beállított
telefonról feltöltött rekord a múltba kerülne, és a többi eszköz soha nem
kérné le.

**Miért JSON a rekord törzse.** A sorhoz tartozó mezők (azonosító, tulajdonos,
időbélyegek) rendes oszlopok, mert ezekre szűrünk és indexelünk; a rekord
többi része JSON. Így a kliens adatmodellje változhat séma-migráció nélkül.
A későbbi kimutatásokhoz és a NAV-os számlázáshoz a JSON-ből generált
oszlopokat lehet kiemelni, adatvesztés nélkül.

**Ütközésfeloldás.** Aki később mentett, az nyer (last write wins). Egy
vállalkozó egy fiókkal, jellemzően egy eszközön dolgozik, így valódi ütközés
ritka. Ha később többen dolgoznak egy fiókon, ezt mezőnkénti összefésülésre
kell cserélni.

**Biztonság.** A jelszavak `password_hash`-sel tárolódnak; a munkamenet-token
véletlen 32 bájt, és csak a SHA-256 lenyomata kerül adatbázisba, így egy
adatbázis-szivárgásból nem lehet belépni. Ismeretlen email esetén is lefut egy
ugyanolyan költségű hashelés, hogy a válaszidőből ne derüljön ki, létezik-e a
fiók. 15 percen belül 8 sikertelen belépés után a cím és az IP ideiglenesen
zárolódik. Minden lekérdezés valódi prepared statement (`EMULATE_PREPARES`
kikapcsolva), a tábla nevét pedig csak rögzített listáról fogadjuk el.

## Helyi fejlesztés

```bash
# adatbázis (bármilyen MySQL/MariaDB megteszi)
mysql -uroot -e "CREATE DATABASE evm_dev CHARACTER SET utf8mb4"

cp server/config.example.php server/config.php   # töltsd ki
php server/migrate.php
php -S 127.0.0.1:8099 -t server/public
curl "http://127.0.0.1:8099/index.php?r=health"
```
