# EVM — Egyéni Vállalkozó Manager

Mobile-first üzletvitel-menedzsment app szakembereknek és egyéni vállalkozóknak:
projektek, ügyfelek, ajánlatok és számlák egy helyen, kétszintű (Alap / Prémium)
csomagstruktúrával előkészítve a jövőbeli értékesítéshez.

## Funkciók

### Alap csomag
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
- **Térkép nézet**: a projektek státusz szerint színezett pöttyökkel egy
  Leaflet/OpenStreetMap térképen.
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
