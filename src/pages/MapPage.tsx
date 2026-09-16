import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { statusConfig } from "../lib/projectStatus";
import { formatCurrency } from "../lib/format";
import { PremiumGate } from "../components/ui/PremiumGate";
import { EmptyState } from "../components/ui/EmptyState";
import { MapPin } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  lead: "#94a3b8",
  quoting: "#fbbf24",
  scheduled: "#a78bfa",
  in_progress: "#60a5fa",
  done: "#34d399",
  invoiced: "#2dd4bf",
};

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
          <div className="overflow-hidden rounded-2xl border border-border" style={{ height: "70vh" }}>
            <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                    icon={markerIcon(STATUS_COLOR[project.status])}
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
      </PremiumGate>
    </div>
  );
}
