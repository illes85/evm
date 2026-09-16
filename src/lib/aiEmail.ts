import type { BusinessProfile, Client, Invoice, Quote } from "../types/domain";
import { docTotal, formatCurrency, formatDate } from "./format";

/** Template-based email draft generator. Stands in for an LLM-backed writer —
 * production version would call a language model with the business's tone
 * and past correspondence as context. */
export function generateQuoteEmailDraft(
  quote: Quote,
  client: Client | undefined,
  profile: BusinessProfile,
): { subject: string; body: string } {
  const total = formatCurrency(docTotal(quote.items));
  const itemLines = quote.items.map((i) => `• ${i.description} — ${i.quantity} ${i.unit}`).join("\n");

  return {
    subject: `Árajánlat — ${quote.number}`,
    body: `Kedves ${client?.name ?? "Ügyfelünk"}!

Köszönjük megkeresését. Mellékelten küldjük a(z) ${quote.number} számú árajánlatunkat az alábbi tételekkel:

${itemLines}

Az ajánlat végösszege: ${total}.
${quote.validUntil ? `Az ajánlat érvényessége: ${formatDate(quote.validUntil)}.` : ""}

Kérdés esetén szívesen állunk rendelkezésére.

Üdvözlettel,
${profile.ownerName}
${profile.businessName}
${profile.phone ?? ""}`,
  };
}

export function generateInvoiceReminderEmail(
  invoice: Invoice,
  client: Client | undefined,
  profile: BusinessProfile,
): { subject: string; body: string } {
  const total = formatCurrency(docTotal(invoice.items));

  return {
    subject: `Fizetési emlékeztető — ${invoice.number}`,
    body: `Kedves ${client?.name ?? "Ügyfelünk"}!

Szeretnénk emlékeztetni, hogy a(z) ${invoice.number} számú, ${total} összegű számlánk fizetési
határideje ${formatDate(invoice.dueDate)}.

Amennyiben a számla időközben kiegyenlítésre került, kérjük tekintse tárgytalannak üzenetünket.

Üdvözlettel,
${profile.ownerName}
${profile.businessName}`,
  };
}
