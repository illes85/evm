import type { InvoiceStatus, QuoteStatus } from "../types/domain";

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; badge: string }> = {
  draft: { label: "Piszkozat", badge: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300" },
  sent: { label: "Elküldve", badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300" },
  accepted: { label: "Elfogadva", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  rejected: { label: "Elutasítva", badge: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300" },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string }> = {
  draft: { label: "Piszkozat", badge: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300" },
  issued: { label: "Kiállítva", badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300" },
  paid: { label: "Kifizetve", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  overdue: { label: "Lejárt", badge: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300" },
};

export function nextDocumentNumber(existing: { number: string }[], prefix: string): string {
  const year = new Date().getFullYear();
  const nums = existing
    .map((d) => d.number.match(new RegExp(`^${prefix}-${year}-(\\d+)$`)))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => Number(m[1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${year}-${String(next).padStart(3, "0")}`;
}
