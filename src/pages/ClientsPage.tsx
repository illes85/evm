import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { ClientCard } from "../components/clients/ClientCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Fab } from "../components/ui/Fab";

export default function ClientsPage() {
  usePageTitle("Ügyfelek");
  const clients = useAppStore((s) => s.clients);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "hu"));
  }, [clients, query]);

  return (
    <div className="px-4 pt-4 md:px-6">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keresés az ügyfelek között…"
          className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Még nincs ügyfeled"
          description="Adj hozzá egy új ügyfelet a jobb alsó gombbal."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nincs találat" />
      ) : (
        <div className="mt-4 space-y-3 pb-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <Fab to="/clients/new" label="Új ügyfél" />
    </div>
  );
}
