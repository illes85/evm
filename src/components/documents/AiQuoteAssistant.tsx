import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { generateQuoteFromDescription } from "../../lib/aiQuoteGenerator";
import type { DocLineItem } from "../../types/domain";
import { Button } from "../ui/Button";
import { PremiumGate } from "../ui/PremiumGate";
import { textareaClass } from "../../lib/formStyles";

export function AiQuoteAssistant({ onGenerate }: { onGenerate: (items: DocLineItem[]) => void }) {
  const [description, setDescription] = useState("");

  return (
    <PremiumGate
      title="AI ajánlatkészítő"
      description="Írd le pár mondatban a munkát, és a rendszer automatikusan összeállítja a tételeket és mennyiségeket."
    >
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent">
          <Sparkles size={15} />
          AI ajánlatkészítő (demo)
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="pl. 15 négyzetméteres fürdőszoba csempézése és egy bojler cseréje"
          className={textareaClass}
          rows={3}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Ez a demó egy helyi kulcsszó-alapú sablonmotorral generál tételeket — a végleges verzióban
          ezt egy valódi nyelvi modell (LLM) váltja, ami a te árlistádból és korábbi ajánlataidból tanul.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-2"
          icon={<Wand2 size={14} />}
          onClick={() => description.trim() && onGenerate(generateQuoteFromDescription(description))}
        >
          Tételek generálása
        </Button>
      </div>
    </PremiumGate>
  );
}
