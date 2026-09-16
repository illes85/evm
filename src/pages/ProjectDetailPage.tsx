import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { statusConfig, PROJECT_STATUSES } from "../lib/projectStatus";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { DistanceCostCard } from "../components/projects/DistanceCostCard";
import { VoiceNoteRecorder } from "../components/projects/VoiceNoteRecorder";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { cx } from "../lib/cx";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const client = useAppStore((s) => s.clients.find((c) => c.id === project?.clientId));
  const allQuotes = useAppStore((s) => s.quotes);
  const allInvoices = useAppStore((s) => s.invoices);
  const quotes = useMemo(() => allQuotes.filter((q) => q.projectId === id), [allQuotes, id]);
  const invoices = useMemo(() => allInvoices.filter((i) => i.projectId === id), [allInvoices, id]);
  const setProjectStatus = useAppStore((s) => s.setProjectStatus);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const addProjectNote = useAppStore((s) => s.addProjectNote);
  const updateProject = useAppStore((s) => s.updateProject);

  const [noteText, setNoteText] = useState("");

  usePageTitle(project?.title ?? "Projekt");

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const status = statusConfig(project.status);

  function handleDelete() {
    if (!project) return;
    if (window.confirm(`Biztosan törlöd a(z) "${project.title}" projektet?`)) {
      deleteProject(project.id);
      navigate("/");
    }
  }

  function handleAddNote() {
    if (!noteText.trim() || !project) return;
    addProjectNote(project.id, noteText.trim());
    setNoteText("");
  }

  function handleVoiceCapture(text: string, hints: { amount: number | null; phone: string | null }) {
    if (!project) return;
    addProjectNote(project.id, text, "voice");
    if (hints.amount) {
      updateProject(project.id, { estimatedValue: hints.amount });
    }
  }

  return (
    <div className="animate-slide-up px-4 pb-8 pt-3 md:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Vissza a projektekhez
      </Link>

      <Card className="mt-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold leading-tight">{project.title}</h2>
          <Badge className={status.badge}>
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </Badge>
        </div>

        {client && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Link to={`/clients/${client.id}`} className="font-medium text-primary hover:underline">
              {client.name}
            </Link>
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-1 text-text-muted">
                <Phone size={14} /> {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-text-muted">
                <Mail size={14} /> {client.email}
              </a>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {project.address && (
            <div className="col-span-2 flex items-start gap-2 text-text-muted">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span>{project.address}</span>
            </div>
          )}
          {project.scheduledDate && (
            <div className="flex items-center gap-2 text-text-muted">
              <CalendarClock size={15} />
              <span>Ütemezve: {formatDate(project.scheduledDate)}</span>
            </div>
          )}
          {project.dueDate && (
            <div className="flex items-center gap-2 text-text-muted">
              <CalendarClock size={15} />
              <span>Határidő: {formatDate(project.dueDate)}</span>
            </div>
          )}
          {typeof project.estimatedValue === "number" && (
            <div className="col-span-2 font-semibold text-primary">
              {formatCurrency(project.estimatedValue)}
            </div>
          )}
        </div>

        {project.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-text-muted">{project.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/projects/${project.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />}>
              Szerkesztés
            </Button>
          </Link>
          <Link to={`/quotes/new?projectId=${project.id}`}>
            <Button size="sm" variant="secondary" icon={<FileText size={14} />}>
              Ajánlat készítése
            </Button>
          </Link>
          <Link to={`/invoices/new?projectId=${project.id}`}>
            <Button size="sm" variant="secondary" icon={<Receipt size={14} />}>
              Számla készítése
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={handleDelete} icon={<Trash2 size={14} />}>
            Törlés
          </Button>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h3 className="mb-3 text-sm font-semibold text-text-muted">Állapot módosítása</h3>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => setProjectStatus(project.id, s.id)}
              className={cx(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                s.id === project.status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-text-muted hover:border-primary/50",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-muted">Távolság és költség</h3>
          <PremiumBadge />
        </div>
        <DistanceCostCard location={project.location} />
      </div>

      {(quotes.length > 0 || invoices.length > 0) && (
        <Card className="mt-4 divide-y divide-border p-0">
          {quotes.map((q) => (
            <Link key={q.id} to={`/quotes/${q.id}`} className="flex items-center gap-3 p-3.5">
              <FileText size={16} className="text-text-muted" />
              <span className="flex-1 text-sm font-medium">Ajánlat {q.number}</span>
              <span className="text-xs text-text-muted">{q.status}</span>
            </Link>
          ))}
          {invoices.map((i) => (
            <Link key={i.id} to={`/invoices/${i.id}`} className="flex items-center gap-3 p-3.5">
              <Receipt size={16} className="text-text-muted" />
              <span className="flex-1 text-sm font-medium">Számla {i.number}</span>
              <span className="text-xs text-text-muted">{i.status}</span>
            </Link>
          ))}
        </Card>
      )}

      <Card className="mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-muted">Jegyzetek</h3>
          <PremiumBadge />
        </div>

        <VoiceNoteRecorder onCapture={handleVoiceCapture} />

        <div className="mt-3 flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="Új jegyzet…"
            className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <Button size="sm" onClick={handleAddNote}>
            Hozzáad
          </Button>
        </div>

        <ul className="mt-3 space-y-2">
          {project.notes.map((note) => (
            <li key={note.id} className="rounded-lg bg-surface-2 p-2.5 text-sm">
              <p>{note.text}</p>
              <p className="mt-1 text-[11px] text-text-muted">
                {note.source === "voice" ? "🎙 Hangból · " : ""}
                {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
          {project.notes.length === 0 && (
            <p className="text-xs text-text-muted">Még nincs jegyzet ehhez a projekthez.</p>
          )}
        </ul>
      </Card>
    </div>
  );
}
