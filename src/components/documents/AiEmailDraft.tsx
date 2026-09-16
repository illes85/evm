import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { PremiumGate } from "../ui/PremiumGate";
import { Button } from "../ui/Button";

export function AiEmailDraft({ subject, body }: { subject: string; body: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`Tárgy: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PremiumGate
      compact={!open}
      title="AI email tervezet készítése"
      description="Generálj küldésre kész emailt ehhez a dokumentumhoz."
    >
      {!open ? (
        <Button size="sm" variant="secondary" icon={<Mail size={14} />} onClick={() => setOpen(true)}>
          AI email tervezet
        </Button>
      ) : (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
          <p className="text-xs font-semibold text-accent">Tárgy: {subject}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{body}</p>
          <Button size="sm" className="mt-3" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopy}>
            {copied ? "Másolva!" : "Másolás vágólapra"}
          </Button>
        </div>
      )}
    </PremiumGate>
  );
}
