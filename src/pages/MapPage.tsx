import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { PROJECT_STATUSES, statusConfig } from "../lib/projectStatus";
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from "../lib/mapTiles";
import { formatCurrency } from "../lib/format";
import { PremiumGate } from "../components/ui/PremiumGate";
import { EmptyState } from "../components/ui/EmptyState";
import { cx } from "../lib/cx";
import { MapPin, WifiOff } from "lucide-react";

function markerIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

export default function MapPage() {
  usePageTitle("Térkép");
  const projects = useAppStore((s) => s.projects);
  const base = useAppStore((s) => s.settings.profile.location);

  const [tilesFailed, setTilesFailed] = useState(false);

  const located = useMemo(() => projects.filter((p) => p.location), [projects]);
  const center = base ?? located[0]?.location ?? { lat: 47.4979, lng: 19.0402 };

  return (
    <div className="px-4 pt-4 md:px-6">
      <PremiumGate
        title="Projektek térképen"
        description="Lásd egyszerre, hol vannak az ügyfeleid és a munkáid — útvonaltervezéshez és a nap megszervezéséhez."
      >
        {located.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nincs koordinátával rendelkező projekt"
            description="Add meg a projektek szerkesztésénél a koordinátákat, hogy megjelenjenek a térképen."
          />
        ) : (
          <div
            className={cx(
              "map-surface relative overflow-hidden rounded-2xl border border-border",
              tilesFailed && "map-surface--fallback",
            )}
            style={{ height: "70vh" }}
          >
            {tilesFailed && (
              <div className="pointer-events-none absolute right-3 top-3 left-16 z-[500] flex items-start gap-2 rounded-xl border border-border bg-surface/95 p-2.5 text-xs text-text-muted shadow-sm backdrop-blur">
                <WifiOff size={14} className="mt-px shrink-0" />
                <span>A térképcsempék nem érhetők el — a jelölők így is a valós koordinátákon állnak.</span>
              </div>
            )}
            <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution={MAP_TILE_ATTRIBUTION}
                url={MAP_TILE_URL}
                eventHandlers={{ tileerror: () => setTilesFailed(true) }}
              />
              {base && (
                <Marker position={[base.lat, base.lng]} icon={markerIcon("#0f172a")}>
                  <Popup>Székhely</Popup>
                </Marker>
              )}
              {located.map((project) => {
                const status = statusConfig(project.status);
                return (
                  <Marker
                    key={project.id}
                    position={[project.location!.lat, project.location!.lng]}
                    icon={markerIcon(status.color)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-xs text-slate-500">{status.label}</p>
                        {typeof project.estimatedValue === "number" && (
                          <p className="text-xs">{formatCurrency(project.estimatedValue)}</p>
                        )}
                        <Link to={`/projects/${project.id}`} className="text-xs text-sky-600 underline">
                          Megnyitás
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {located.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {PROJECT_STATUSES.map((s) => (
              <li key={s.id} className="flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  className="status-dot size-2.5 rounded-full"
                  style={{ ["--status" as string]: s.color }}
                />
                {s.label}
              </li>
            ))}
            <li className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="size-2.5 rounded-full bg-text" />
              Székhely
            </li>
          </ul>
        )}
      </PremiumGate>
    </div>
  );
}
