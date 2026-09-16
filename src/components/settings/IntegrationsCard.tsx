import { Link } from "react-router-dom";
import { FileSpreadsheet, MapPinned, Users } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { PremiumBadge } from "../ui/PremiumBadge";
import { Button } from "../ui/Button";

const INTEGRATIONS = [
  {
    icon: FileSpreadsheet,
    title: "Google Sheets import",
    description: "Weboldali űrlapok és táblázatok automatikus beolvasása lead-ként.",
  },
  {
    icon: MapPinned,
    title: "Google Cégem érdeklődők",
    description: "A Google Cégem profilodon beérkező üzenetek, hívások automatikus rögzítése.",
  },
];

export function IntegrationsCard() {
  const plan = useAppStore((s) => s.settings.plan);

  return (
    <div className="space-y-3">
      {INTEGRATIONS.map((integration) => (
        <div key={integration.title} className="flex items-start gap-3 rounded-xl border border-border p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <integration.icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{integration.title}</p>
              <PremiumBadge />
            </div>
            <p className="text-xs text-text-muted">{integration.description}</p>
          </div>
          <Button size="sm" variant="secondary" disabled={plan !== "premium"}>
            Hamarosan
          </Button>
        </div>
      ))}
      <Link to="/leads" className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3.5 text-sm text-text-muted hover:border-primary/50 hover:text-text">
        <Users size={16} />
        Kézzel felvitt érdeklődők megtekintése
      </Link>
    </div>
  );
}
