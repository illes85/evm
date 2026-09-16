import { newId } from "./id";
import type { DocLineItem } from "../types/domain";

interface CatalogEntry {
  keywords: string[];
  description: string;
  unit: string;
  unitPrice: number;
  defaultQty: number;
}

/** A small local price catalogue used to turn a free-text job description into
 * draft line items. This runs entirely client-side as a keyword-matching
 * heuristic — a stand-in for a real LLM-based generator, which would need a
 * backend service and an API key to call safely. */
const CATALOG: CatalogEntry[] = [
  { keywords: ["fürdőszoba", "csempe", "csempéz"], description: "Csempézés", unit: "m²", unitPrice: 9500, defaultQty: 10 },
  { keywords: ["festés", "fest", "glettel", "mázol"], description: "Festés, glettelés", unit: "m²", unitPrice: 3200, defaultQty: 20 },
  { keywords: ["bojler", "vízmelegítő"], description: "Bojler csere", unit: "db", unitPrice: 95000, defaultQty: 1 },
  { keywords: ["villany", "villanyszerelés", "konnektor", "kapcsoló"], description: "Villanyszerelési munka", unit: "óra", unitPrice: 12000, defaultQty: 4 },
  { keywords: ["burkolás", "járólap", "padló", "terasz"], description: "Padló-/teraszburkolás", unit: "m²", unitPrice: 8800, defaultQty: 15 },
  { keywords: ["gipszkarton", "álmennyezet", "válaszfal"], description: "Gipszkartonozás", unit: "m²", unitPrice: 6500, defaultQty: 12 },
  { keywords: ["ajtó"], description: "Ajtócsere", unit: "db", unitPrice: 45000, defaultQty: 1 },
  { keywords: ["ablak"], description: "Ablakcsere", unit: "db", unitPrice: 85000, defaultQty: 1 },
  { keywords: ["konyhabútor", "bútor", "beépít"], description: "Bútor összeszerelés, beépítés", unit: "óra", unitPrice: 10500, defaultQty: 6 },
];

const GENERIC_LABOR: CatalogEntry = {
  keywords: [],
  description: "Általános szerelési munkadíj",
  unit: "óra",
  unitPrice: 11000,
  defaultQty: 4,
};

const QUANTITY_RE = /(\d+[.,]?\d*)\s*(m2|m²|négyzetméter|óra|db|darab)/i;

function normalizeUnit(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower === "m2" || lower === "m²" || lower === "négyzetméter") return "m²";
  if (lower === "db" || lower === "darab") return "db";
  return lower;
}

export function generateQuoteFromDescription(text: string): DocLineItem[] {
  const lower = text.toLowerCase();
  const matched = CATALOG.filter((entry) => entry.keywords.some((k) => lower.includes(k)));
  const qtyMatch = text.match(QUANTITY_RE);
  const parsedQty = qtyMatch ? Number(qtyMatch[1].replace(",", ".")) : null;
  const parsedUnit = qtyMatch ? normalizeUnit(qtyMatch[2]) : null;

  const base = matched.length > 0 ? matched : [GENERIC_LABOR];

  const items: DocLineItem[] = base.map((entry) => ({
    id: newId(),
    description: entry.description,
    quantity: parsedQty && entry.unit === parsedUnit ? parsedQty : entry.defaultQty,
    unit: entry.unit,
    unitPrice: entry.unitPrice,
  }));

  if (matched.length > 0) {
    items.push({
      id: newId(),
      description: GENERIC_LABOR.description,
      quantity: GENERIC_LABOR.defaultQty,
      unit: GENERIC_LABOR.unit,
      unitPrice: GENERIC_LABOR.unitPrice,
    });
  }

  return items;
}
