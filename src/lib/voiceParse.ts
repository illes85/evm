export interface ParsedVoiceHints {
  amount: number | null;
  phone: string | null;
}

const AMOUNT_RE = /(\d[\d\s.]{2,})\s*(?:ft|forint|huf)/i;
const PHONE_RE = /(\+?36|06)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}/;

/** Very small heuristic extractor — looks for a HUF amount and a Hungarian
 * phone number inside a free-text transcript. Runs entirely client-side. */
export function parseVoiceHints(text: string): ParsedVoiceHints {
  const amountMatch = text.match(AMOUNT_RE);
  const amount = amountMatch ? Number(amountMatch[1].replace(/[\s.]/g, "")) : null;

  const phoneMatch = text.match(PHONE_RE);
  const phone = phoneMatch ? phoneMatch[0] : null;

  return {
    amount: amount && !Number.isNaN(amount) ? amount : null,
    phone,
  };
}
