import { Route } from "lucide-react";
import type { GeoPoint } from "../../types/domain";
import { estimateTravelCost } from "../../lib/geo";
import { formatCurrency } from "../../lib/format";
import { useAppStore } from "../../store/useAppStore";
import { PremiumGate } from "../ui/PremiumGate";

export function DistanceCostCard({ location }: { location?: GeoPoint }) {
  const base = useAppStore((s) => s.settings.profile.location);
  const rate = useAppStore((s) => s.settings.profile.distanceRatePerKm);

  return (
    <PremiumGate
      compact
      title="Távolság és kiszállási költség automatikus számítása"
      description=""
    >
      {!base || !location ? (
        <p className="rounded-xl border border-dashed border-border p-3 text-xs text-text-muted">
          A számításhoz add meg a székhely és a projekt koordinátáit a Beállításokban, illetve a
          projekt szerkesztésekor.
        </p>
      ) : (
        (() => {
          const { distanceKm, cost } = estimateTravelCost(base, location, rate);
          return (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Route size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  ~{distanceKm.toFixed(1)} km a székhelytől · {formatCurrency(cost)} kiszállási díj
                </p>
                <p className="text-xs text-text-muted">
                  Becslés légvonalbeli távolság alapján, {formatCurrency(rate)}/km díjjal.
                </p>
              </div>
            </div>
          );
        })()
      )}
    </PremiumGate>
  );
}
