export function formatCurrency(amount: number, currency = "HUF"): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short form for stat tiles, where the full figure would not fit: 524 E Ft,
 * 1,4 M Ft. Only millions keep a decimal — a fraction on thousands is noise. */
export function formatCurrencyCompact(amount: number, currency = "HUF"): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: Math.abs(amount) >= 1_000_000 ? 1 : 0,
  }).format(amount);
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelative(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = d - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat("hu-HU", { numeric: "auto" });
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, "hour");
  }
  return rtf.format(diffDays, "day");
}

export function lineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function docTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + lineItemTotal(item.quantity, item.unitPrice), 0);
}
