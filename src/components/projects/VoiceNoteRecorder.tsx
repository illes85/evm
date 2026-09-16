import { useState } from "react";
import { Mic, Square, Check, X } from "lucide-react";
import { useVoiceCapture } from "../../lib/useVoiceCapture";
import { parseVoiceHints } from "../../lib/voiceParse";
import { formatCurrency } from "../../lib/format";
import { Button } from "../ui/Button";

export function VoiceNoteRecorder({
  onCapture,
}: {
  onCapture: (text: string, hints: { amount: number | null; phone: string | null }) => void;
}) {
  const { supported, listening, transcript, error, start, stop, reset } = useVoiceCapture();
  const [showResult, setShowResult] = useState(false);

  function handleStop() {
    stop();
    setShowResult(true);
  }

  function handleDiscard() {
    reset();
    setShowResult(false);
  }

  function handleSave() {
    if (transcript.trim()) {
      onCapture(transcript.trim(), parseVoiceHints(transcript));
    }
    reset();
    setShowResult(false);
  }

  if (!supported) {
    return (
      <p className="text-xs text-text-muted">
        A böngésződ nem támogatja a beépített hangfelismerést — próbáld Chrome-ban.
      </p>
    );
  }

  if (listening) {
    const hints = parseVoiceHints(transcript);
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          Hallgatom… mondd rá a projekt adatait
        </div>
        <p className="mt-2 min-h-10 text-sm text-text">{transcript || "…"}</p>
        {(hints.amount || hints.phone) && (
          <p className="mt-1 text-xs text-accent">
            Felismerve:{" "}
            {hints.amount && <>{formatCurrency(hints.amount)} </>}
            {hints.phone && <>· {hints.phone}</>}
          </p>
        )}
        <Button size="sm" variant="secondary" className="mt-2" onClick={handleStop} icon={<Square size={13} />}>
          Felvétel leállítása
        </Button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-3">
        <p className="text-sm">{transcript || "Nem sikerült rögzíteni szöveget."}</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={handleSave} icon={<Check size={13} />}>
            Mentés jegyzetként
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDiscard} icon={<X size={13} />}>
            Elvetés
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button size="sm" variant="secondary" onClick={start} icon={<Mic size={14} />}>
        Hangalapú jegyzet felvétele
      </Button>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
