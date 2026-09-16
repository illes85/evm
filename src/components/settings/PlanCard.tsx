import { Check, Sparkles } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/Button";
import { cx } from "../../lib/cx";

const BASIC_FEATURES = [
  "Projektek, ügyfelek kezelése",
  "Ajánlatok és számlák készítése",
  "Kanban tábla és lista nézet",
  "Színpaletták, sötét mód",
];

const PREMIUM_FEATURES = [
  "AI ajánlatkészítő",
  "Hangalapú jegyzetfelvétel",
  "Távolság- és kiszállásiköltség-számítás",
  "Térkép nézet",
  "AI email tervezetek",
  "Lead-importálás (Google Sheets, Google Cégem)",
];

export function PlanCard() {
  const plan = useAppStore((s) => s.settings.plan);
  const setPlan = useAppStore((s) => s.setPlan);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div
        className={cx(
          "rounded-2xl border p-4",
          plan === "basic" ? "border-primary ring-1 ring-primary" : "border-border",
        )}
      >
        <p className="font-semibold">Alap csomag</p>
        <p className="text-xs text-text-muted">A napi ügyvitelhez</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {BASIC_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          variant={plan === "basic" ? "secondary" : "ghost"}
          fullWidth
          className="mt-4"
          disabled={plan === "basic"}
          onClick={() => setPlan("basic")}
        >
          {plan === "basic" ? "Jelenlegi csomag" : "Váltás Alapra"}
        </Button>
      </div>

      <div
        className={cx(
          "rounded-2xl border p-4",
          plan === "premium" ? "border-accent ring-1 ring-accent" : "border-border",
        )}
      >
        <p className="flex items-center gap-1.5 font-semibold text-accent">
          <Sparkles size={15} />
          Prémium csomag
        </p>
        <p className="text-xs text-text-muted">Okos, AI-alapú funkciókkal</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          variant={plan === "premium" ? "secondary" : "primary"}
          fullWidth
          className="mt-4"
          disabled={plan === "premium"}
          onClick={() => setPlan("premium")}
        >
          {plan === "premium" ? "Jelenlegi csomag" : "Váltás Prémiumra"}
        </Button>
      </div>
      <p className="text-xs text-text-muted sm:col-span-2">
        Ez egy demó kapcsoló, hogy kipróbálhasd mindkét csomagot — éles verzióban ez előfizetéshez
        lenne kötve.
      </p>
    </div>
  );
}
