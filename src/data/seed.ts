import { newId } from "../lib/id";
import type {
  Client,
  Invoice,
  Lead,
  Project,
  Quote,
  Settings,
} from "../types/domain";

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();

export function createSeedClients(): Client[] {
  return [
    {
      id: newId(),
      name: "Nagy Katalin",
      email: "nagy.katalin@example.com",
      phone: "+36 30 123 4567",
      address: "1111 Budapest, Bartók Béla út 12.",
      location: { lat: 47.4808, lng: 19.0553 },
      createdAt: daysAgo(120),
    },
    {
      id: newId(),
      name: "Tóth Gábor",
      companyName: "Tóth Ingatlan Kft.",
      email: "toth.gabor@example.com",
      phone: "+36 20 234 5678",
      address: "1027 Budapest, Margit körút 45.",
      location: { lat: 47.5099, lng: 19.0364 },
      createdAt: daysAgo(95),
    },
    {
      id: newId(),
      name: "Szabó Éva",
      email: "szabo.eva@example.com",
      phone: "+36 70 345 6789",
      address: "1088 Budapest, Rákóczi út 5.",
      location: { lat: 47.4949, lng: 19.0682 },
      createdAt: daysAgo(60),
      notes: "Törzsvásárló, mindig pontosan fizet.",
    },
    {
      id: newId(),
      name: "Kiss Ferenc",
      email: "kiss.ferenc@example.com",
      phone: "+36 30 456 7890",
      address: "1222 Budapest, Nagytétényi út 120.",
      location: { lat: 47.4076, lng: 19.0389 },
      createdAt: daysAgo(30),
    },
    {
      id: newId(),
      name: "Varga Anna",
      email: "varga.anna@example.com",
      phone: "+36 20 567 8901",
      address: "1015 Budapest, Batthyány tér 3.",
      location: { lat: 47.5058, lng: 19.0392 },
      createdAt: daysAgo(10),
    },
  ];
}

export function createSeedProjects(clients: Client[]): Project[] {
  const [katalin, gabor, eva, ferenc, anna] = clients;
  return [
    {
      id: newId(),
      title: "Fürdőszoba felújítás",
      clientId: katalin.id,
      status: "in_progress",
      address: katalin.address,
      location: katalin.location,
      estimatedValue: 1450000,
      scheduledDate: daysAgo(3),
      dueDate: daysAhead(4),
      description: "Teljes fürdőszoba felújítás, csempézés, szaniterek cseréje.",
      notes: [
        {
          id: newId(),
          text: "Csempe megrendelve, várható szállítás holnap.",
          createdAt: daysAgo(1),
          source: "manual",
        },
      ],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
    {
      id: newId(),
      title: "Konyhabútor szerelés",
      clientId: gabor.id,
      status: "scheduled",
      address: gabor.address,
      location: gabor.location,
      estimatedValue: 380000,
      scheduledDate: daysAhead(2),
      description: "Egyedi konyhabútor összeszerelése és beépítése.",
      notes: [],
      createdAt: daysAgo(8),
      updatedAt: daysAgo(2),
    },
    {
      id: newId(),
      title: "Villanybojler csere",
      clientId: eva.id,
      status: "quoting",
      address: eva.address,
      location: eva.location,
      estimatedValue: 145000,
      description: "120 literes bojler cseréje, régi leszerelése.",
      notes: [],
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    {
      id: newId(),
      title: "Teraszburkolás",
      clientId: ferenc.id,
      status: "lead",
      address: ferenc.address,
      location: ferenc.location,
      estimatedValue: 620000,
      description: "Érdeklődés kültéri járólap lerakásról, kb. 25 m².",
      notes: [],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: newId(),
      title: "Festés-mázolás, nappali",
      clientId: anna.id,
      status: "done",
      address: anna.address,
      location: anna.location,
      estimatedValue: 210000,
      dueDate: daysAgo(1),
      description: "Nappali és előszoba festése, glettelés.",
      notes: [
        {
          id: newId(),
          text: "Munka elkészült, ügyfél elégedett — számlázásra vár.",
          createdAt: daysAgo(1),
          source: "manual",
        },
      ],
      createdAt: daysAgo(15),
      updatedAt: daysAgo(1),
    },
    {
      id: newId(),
      title: "Gipszkartonozás, gyerekszoba",
      clientId: katalin.id,
      status: "invoiced",
      address: katalin.address,
      location: katalin.location,
      estimatedValue: 340000,
      dueDate: daysAgo(12),
      description: "Álmennyezet és válaszfal kialakítása.",
      notes: [],
      createdAt: daysAgo(40),
      updatedAt: daysAgo(10),
    },
  ];
}

export function createSeedQuotes(projects: Project[]): Quote[] {
  const bojler = projects.find((p) => p.title.startsWith("Villanybojler"));
  const terasz = projects.find((p) => p.title.startsWith("Teraszburkolás"));
  return [
    {
      id: newId(),
      number: "AJ-2026-014",
      projectId: bojler?.id,
      clientId: bojler?.clientId,
      status: "sent",
      items: [
        { id: newId(), description: "120 literes villanybojler", quantity: 1, unit: "db", unitPrice: 95000 },
        { id: newId(), description: "Régi bojler bontása, elszállítása", quantity: 1, unit: "alk.", unitPrice: 15000 },
        { id: newId(), description: "Szerelési munkadíj", quantity: 3, unit: "óra", unitPrice: 12000 },
      ],
      validUntil: daysAhead(10),
      createdAt: daysAgo(2),
    },
    {
      id: newId(),
      number: "AJ-2026-015",
      projectId: terasz?.id,
      clientId: terasz?.clientId,
      status: "draft",
      items: [
        { id: newId(), description: "Kültéri járólap", quantity: 25, unit: "m²", unitPrice: 9800 },
        { id: newId(), description: "Aljzatkészítés", quantity: 25, unit: "m²", unitPrice: 4500 },
        { id: newId(), description: "Lerakási munkadíj", quantity: 25, unit: "m²", unitPrice: 6200 },
      ],
      validUntil: daysAhead(14),
      createdAt: daysAgo(1),
    },
  ];
}

export function createSeedInvoices(projects: Project[]): Invoice[] {
  const gipszkarton = projects.find((p) => p.title.startsWith("Gipszkartonozás"));
  const festes = projects.find((p) => p.title.startsWith("Festés"));
  return [
    {
      id: newId(),
      number: "SZ-2026-031",
      projectId: gipszkarton?.id,
      clientId: gipszkarton?.clientId,
      status: "paid",
      items: [
        { id: newId(), description: "Gipszkarton anyag", quantity: 1, unit: "tétel", unitPrice: 140000 },
        { id: newId(), description: "Szerelési munkadíj", quantity: 16, unit: "óra", unitPrice: 12500 },
      ],
      issueDate: daysAgo(12),
      dueDate: daysAgo(2),
      paidAt: daysAgo(3),
      createdAt: daysAgo(12),
    },
    {
      id: newId(),
      number: "SZ-2026-032",
      projectId: festes?.id,
      clientId: festes?.clientId,
      status: "issued",
      items: [
        { id: newId(), description: "Festék, glettanyag", quantity: 1, unit: "tétel", unitPrice: 60000 },
        { id: newId(), description: "Festési munkadíj", quantity: 12, unit: "óra", unitPrice: 12500 },
      ],
      issueDate: daysAgo(1),
      dueDate: daysAhead(7),
      createdAt: daysAgo(1),
    },
  ];
}

export function createSeedLeads(): Lead[] {
  return [
    {
      id: newId(),
      name: "Molnár Zsolt",
      phone: "+36 30 987 6543",
      address: "1134 Budapest, Váci út 76.",
      source: "google_business",
      note: "Google Cégem profilról érkezett érdeklődés: garázskapu javítás.",
      createdAt: daysAgo(1),
    },
    {
      id: newId(),
      name: "Pintér Judit",
      email: "pinter.judit@example.com",
      address: "1201 Budapest, Kossuth Lajos utca 22.",
      source: "google_sheets",
      note: "Weboldal kapcsolatfelvételi űrlap → Google Sheets importból.",
      createdAt: daysAgo(2),
    },
  ];
}

export function createSeedSettings(): Settings {
  return {
    plan: "premium",
    palette: "ocean",
    mode: "system",
    profile: {
      businessName: "Kovács Péter EV.",
      ownerName: "Kovács Péter",
      taxId: "12345678-1-42",
      email: "info@kovacsszerelo.hu",
      phone: "+36 30 111 2233",
      address: "1112 Budapest, Budaörsi út 8.",
      location: { lat: 47.4738, lng: 19.0212 },
      iban: "HU12 1234 5678 9012 3456 7890 1234",
      currency: "HUF",
      distanceRatePerKm: 250,
    },
  };
}
