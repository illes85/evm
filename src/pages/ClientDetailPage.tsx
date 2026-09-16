import { useMemo } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProjectCard } from "../components/projects/ProjectCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LayoutList } from "lucide-react";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useAppStore((s) => s.clients.find((c) => c.id === id));
  const allProjects = useAppStore((s) => s.projects);
  const projects = useMemo(() => allProjects.filter((p) => p.clientId === id), [allProjects, id]);
  const deleteClient = useAppStore((s) => s.deleteClient);

  usePageTitle(client?.name ?? "Ügyfél");

  if (!client) return <Navigate to="/clients" replace />;

  function handleDelete() {
    if (!client) return;
    if (window.confirm(`Biztosan törlöd "${client.name}" ügyfelet?`)) {
      deleteClient(client.id);
      navigate("/clients");
    }
  }

  return (
    <div className="animate-slide-up px-4 pb-8 pt-3 md:px-6">
      <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Vissza az ügyfelekhez
      </Link>

      <Card className="mt-3 p-4">
        <h2 className="text-xl font-bold">{client.name}</h2>
        {client.companyName && <p className="text-sm text-text-muted">{client.companyName}</p>}

        <div className="mt-3 space-y-1.5 text-sm">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-text-muted">
              <Phone size={15} /> {client.phone}
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-text-muted">
              <Mail size={15} /> {client.email}
            </a>
          )}
          {client.address && (
            <p className="flex items-center gap-2 text-text-muted">
              <MapPin size={15} /> {client.address}
            </p>
          )}
        </div>

        {client.notes && <p className="mt-3 text-sm text-text-muted">{client.notes}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/clients/${client.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />}>
              Szerkesztés
            </Button>
          </Link>
          <Link to={`/projects/new?clientId=${client.id}`}>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />}>
              Új projekt
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={handleDelete} icon={<Trash2 size={14} />}>
            Törlés
          </Button>
        </div>
      </Card>

      <div className="mt-4">
        <h3 className="mb-2 px-0.5 text-sm font-semibold text-text-muted">Projektek ({projects.length})</h3>
        {projects.length === 0 ? (
          <EmptyState icon={LayoutList} title="Nincs még projekt ehhez az ügyfélhez" />
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
