import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Client } from "../../types/domain";
import { Card } from "../ui/Card";

export function ClientCard({ client }: { client: Client }) {
  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link to={`/clients/${client.id}`}>
      <Card className="flex items-start gap-3 p-4 transition-shadow hover:shadow-md active:scale-[0.99]">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{client.name}</p>
          {client.companyName && <p className="text-xs text-text-muted">{client.companyName}</p>}
          <div className="mt-1.5 space-y-0.5 text-xs text-text-muted">
            {client.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={12} /> {client.phone}
              </p>
            )}
            {client.email && (
              <p className="flex items-center gap-1.5 truncate">
                <Mail size={12} /> {client.email}
              </p>
            )}
            {client.address && (
              <p className="flex items-center gap-1.5 truncate">
                <MapPin size={12} /> {client.address}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
