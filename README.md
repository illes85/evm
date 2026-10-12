# EVM — Egyéni Vállalkozó Manager

Mobile-first üzletvitel-menedzsment app szakembereknek és egyéni vállalkozóknak:
projektek, ügyfelek, ajánlatok és számlák egy helyen, kétszintű (Alap / Prémium)
csomagstruktúrával előkészítve a jövőbeli értékesítéshez.

## Funkciók

### Alap csomag
- **Áttekintés** (kezdőnézet): a nap indításához — mi igényel figyelmet (lejárt
  számla, lejáró ajánlat, csúszó munka), mi van folyamatban vagy ma esedékes,
  havi bevétel az előző hónap *azonos időszakához* mérve, kintlévőség (és
  abból a lejárt rész), nyitott ajánlatok, aktív munkák értéke, valamint a
  projektek állapot szerinti megoszlása — a sorokra koppintva szűrt
  projektlista nyílik.
- **Projektek**: lista nézet (alapértelmezett) és kanban tábla, ahol a mobil
  nézetben az állapot-oszlopok között jobbra-balra húzva (natív scroll-snap)
  lehet lapozni, pont-indikátorral. Kártyára koppintva a projekt "előtérbe kerül"
  a teljes adatlapjával (státusz, ügyfél, cím, jegyzetek, kapcsolódó
  dokumentumok).
- **Ügyfelek**: nyilvántartás, kereséssel, projekt-történettel.
- **Ajánlatok és számlák**: tételes szerkesztő, automatikus sorszámozás,
  állapotkövetés (piszkozat → elküldve/kiállítva → elfogadva/kifizetve),
  ajánlat → számla konvertálás egy kattintással.
- **Színpaletták és sötét mód**: 6 beépített téma (Óceán, Naplemente, Erdő,
  Éjfél, Levendula, Rózsa) × világos/sötét/rendszer mód, CSS-változós
  motorral — futásidőben, újratöltés nélkül váltható.
- **Értesítések**: lejárt/hamarosan esedékes számlák, lejáró ajánlatok,
  közelgő és csúszásban lévő projektek — kliensoldalon, a meglévő adatokból
  számolva.

### Prémium csomag (a jövőbeli előfizetéses réteg)
Ezek a funkciók a kódban `PremiumGate` mögött futnak, és a Beállítások oldalon
lévő demó csomagváltóval bárki kipróbálhatja mindkét állapotot:
- **AI ajánlatkészítő**: szöveges munkaleírásból tételjavaslat. A jelen
  változatban egy helyi kulcsszó-alapú sablonmotor működik éles LLM helyett
  (lásd *AI és külső API-k* lent).
- **Hangalapú jegyzetfelvétel**: valódi böngésző Speech-to-Text (Web Speech
  API) a projekt jegyzeteihez, egyszerű heurisztikával (összeg, telefonszám
  felismerése a rámondott szövegből).
- **Távolság- és kiszállásiköltség-számítás**: a székhely és a projekt
  koordinátái alapján (Haversine-képlet + útkanyar-szorzó), a beállított
  Ft/km díjjal.
- **Bevételi trend és teljesítménymutatók**: 6 havi bevétel-oszlopdiagram (a
  folyó, még nem zárt hónap halványan jelölve), ajánlat-elfogadási arány,
  átlagos projektérték.
- **Térkép nézet**: a projektek státusz szerint színezett pöttyökkel egy
  Leaflet/OpenStreetMap térképen, jelmagyarázattal.
- **AI email tervezetek**: ajánlathoz és számlához generált, vágólapra
  másolható email-tervezet sablon alapján.
- **Lead-import**: kézi felvitel most, Google Sheets és Google Cégem
  (Google Business Profile) integrációk UI-ja előkészítve, "Hamarosan"
  jelzéssel — ezekhez backend + OAuth szükséges.

## AI és külső API-k

Ez a build egy önálló, backend nélküli kliensalkalmazás, ezért minden "AI"
funkció jelenleg **determinisztikus, kliensoldali heurisztikával** van
megvalósítva (kulcsszó-illesztés, sablonok), egyértelműen demóként jelölve a
felületen. Kivétel a hangfelismerés, ami a böngésző natív Web Speech API-ját
használja (Chrome-ban működik igazán jól). Amikor lesz backend:
- az AI ajánlatkészítőt és az email tervezetet egy LLM hívás váltja fel,
- a cím/koordináta párosítást és az útvonal-alapú távolságot egy
  geokódoló/routing API (pl. Google Maps, Mapbox) váltja fel a jelenlegi
  légvonal-becslés helyett,
- a lead-integrációk valódi OAuth-alapú Google Sheets / Google Business
  Profile kapcsolatot kapnak.

## Fiók és szinkron

Fiók nélkül az app ugyanúgy használható, csak az adatok kizárólag az adott
eszközön, helyben tárolódnak. Bejelentkezés után minden eszközön ugyanaz
látszik, és a tárhelyen lévő adatbázis a biztonsági mentés.

A szinkron **offline-first**: minden művelet először helyben történik meg,
és a feltöltés a háttérben, magától fut — induláskor, változás után kis
késleltetéssel, amikor visszatér a net, amikor az app újra előtérbe kerül,
és ötpercenként. Térerő nélkül is lehet dolgozni; a feltöltésre váró
változások száma a Beállításokban látszik.

Egy kör mindig **előbb feltölt, aztán letölt**. Így a saját, még fel nem
küldött munkát nem írja felül egy régebbi szerveroldali állapot.

Bejelentkezéskor, ha az eszközön még csak a bemutató adatok vannak, azokat
eldobjuk — különben minden új eszközön megszaporodnának. Ha viszont már
dolgoztál helyben, az az adat felkerül a fiókba.

A szerver oldaláról lásd a `server/README.md`-t.

## Adatmodell és a szinkron előkészítése

Minden szinkronizálandó rekord hordoz három mezőt (`SyncMeta`):
`createdAt`, `updatedAt` és `deletedAt`. Az `updatedAt` dönti el, melyik
oldal a frissebb, ha ugyanaz a rekord két eszközön is változott.

A törlés **nem** dobja el a sort, hanem `deletedAt`-et állít rajta
(„sírkő"). Erre azért van szükség, mert egy net nélkül végzett törlés
máskülönben megkülönböztethetetlen lenne attól, hogy a másik oldal sosem
látta azt a rekordot — vagyis a törölt tétel a következő szinkronnál
visszaéledne. A sírköveket majd a szerver visszaigazolása után lehet
véglegesen kitakarítani.

Ebből következik, hogy a felület soha nem olvassa közvetlenül a store
listáit: minden nézet a `src/store/selectors.ts` hookjain keresztül kér
adatot, és azok szűrik ki a törölteket. Egyetlen szándékos kivétel van, az
ajánlat- és számlasorszámozás: az a teljes listát nézi, hogy egy törölt
dokumentum sorszámát se osszuk ki újra.

## Élesítés és visszaállítás

A `main` ágra érkező minden változtatást a
`.github/workflows/deploy.yml` automatikusan kitesz a
https://illes85.github.io/evm/ címre, kb. másfél perc alatt.

**Visszaállítás, ha egy változtatás rossznak bizonyul.** Két út van, mindkettő
pár perc, és egyik sem igényel fejlesztői környezetet:

1. *A GitHub felületéről, kattintással:* **Actions** → a bal oldali listából
   „Deploy to GitHub Pages" → a legutolsó **zöld** futás, ami még jó volt →
   jobb fent **Re-run all jobs**. Ez újra kiteszi azt a korábbi állapotot.
2. *Git-tel:* `git revert <commit>` a `main` ágon, majd push — ez egy új
   committal visszavonja a hibás változtatást, és magától újra élesít. Az
   előzmény megmarad, semmi nem vész el.

Mindkettő visszafordítható: a „rossz" commit nem tűnik el, bármikor újra
elővehető.

## Térkép csempeszolgáltató

A térkép alapértelmezésben az OpenStreetMap nyilvános csempéit tölti be, ami
fejlesztéshez megfelelő, **éles, kereskedelmi használatra viszont az OSM
használati szabályzata nem engedi**. Állíts be saját szolgáltatót a
`.env.example` alapján (`VITE_MAP_TILE_URL`, `VITE_MAP_TILE_ATTRIBUTION`).

Ha a csempék nem tölthetők be (nincs net, vagy a futtató környezet blokkolja a
külső képeket — például egy beágyazott, szigorú CSP-vel futó előnézet), a
térkép nem törik el: halvány rácsot rajzol, a jelölőket a valós koordinátákon
tartja, és egy rövid magyarázó sávot mutat.

## Státuszszínek

A hat projektállapot színe egyetlen helyen van definiálva
(`src/lib/projectStatus.ts`), és onnan származik a pötty, a címke, a
térképtű és a diagramsáv is. A készlet színvakság-szimulációval és
kontrasztméréssel lett kiválasztva: a legrosszabb szomszédos pár ΔE 15
(deuteranopia) és ΔE 19,9 (ép színlátás), mindegyik szín 3:1 feletti
kontraszttal mind a világos, mind a sötét háttéren. **Módosítás előtt
érdemes újra ellenőrizni**, mert a térképen a szín az egyetlen jelzés.

## Tech stack

- **React 19 + TypeScript**, Vite build
- **Tailwind CSS v4** — CSS-változós, futásidőben cserélhető színpaletta-motor
- **React Router v7** — útvonalak, mesterold/detail navigáció
- **Zustand** (`persist` middleware) — állapotkezelés, `localStorage`
  perzisztencia (backend nélküli, "local-first" adatréteg — a store
  (`src/store/useAppStore.ts`) API-ja úgy lett tervezve, hogy egy valódi
  backend/API réteggel később könnyen felcserélhető legyen)
- **React-Leaflet + Leaflet** — térkép, OpenStreetMap csempékkel
- **lucide-react** — ikonkészlet

## Fejlesztés

```bash
npm install
npm run dev       # fejlesztői szerver
npm run build     # típusellenőrzés + production build
npm run lint       # oxlint
npm run preview    # production build helyi előnézete
```

## Projektstruktúra

```
src/
  components/
    layout/       # AppShell, TopBar, Sidebar (desktop), BottomNav (mobil)
    projects/      # Kanban, kártya, hang-jegyzet felvevő, távolság-kártya
    clients/
    documents/      # tételszerkesztő, ajánlat/számla sorok, AI-asszisztensek
    settings/       # csomagváltó, témaválasztó, integrációk
    ui/             # Button, Card, Badge, PremiumGate, EmptyState, Fab…
  pages/            # útvonalankénti oldalak
  store/            # zustand store + akciók
  lib/               # tiszta segédfüggvények (formázás, geo, AI-heurisztikák…)
  theme/            # palettadefiníciók, futásidejű téma-hook
  types/             # doménmodellek (Project, Client, Quote, Invoice, Lead…)
  data/seed.ts       # induló demóadatok
```

## Ismert korlátok (ezt a buildet érintően)

- Nincs backend / többfelhasználós szinkron — minden adat a böngésző
  `localStorage`-jában van, eszközönként külön.
- A térképcsempék (OpenStreetMap) élő internetkapcsolatot igényelnek.
- A hangfelismerés böngészőfüggő (Web Speech API — Chrome-ban támogatott).
