import { useMemo, useState } from "react";
import { Kanban, LayoutList, Search } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { ProjectKanban } from "../components/projects/ProjectKanban";
import { ProjectCard } from "../components/projects/ProjectCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Fab } from "../components/ui/Fab";
import { cx } from "../lib/cx";
import { PROJECT_STATUSES } from "../lib/projectStatus";
import type { ProjectStatus } from "../types/domain";

type ViewMode = "list" | "kanban";

export default function ProjectsPage() {
  usePageTitle("Projektek");
  const projects = useAppStore((s) => s.projects);
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  const filtered = useMemo(() => {
    return projects
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, query, statusFilter]);

  return (
    <div>
      <div className="space-y-3 px-4 pt-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keresés a projektek között…"
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex shrink-0 rounded-lg border border-border bg-surface p-0.5">
            <button
              aria-label="Lista nézet"
              onClick={() => setView("list")}
              className={cx(
                "flex size-9 items-center justify-center rounded-md transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-text-muted",
              )}
            >
              <LayoutList size={17} />
            </button>
            <button
              aria-label="Tábla nézet"
              onClick={() => setView("kanban")}
              className={cx(
                "flex size-9 items-center justify-center rounded-md transition-colors",
                view === "kanban" ? "bg-primary text-primary-foreground" : "text-text-muted",
              )}
            >
              <Kanban size={17} />
            </button>
          </div>
        </div>

        {view === "list" && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={cx(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                statusFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-muted",
              )}
            >
              Összes ({projects.length})
            </button>
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={cx(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                  statusFilter === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted",
                )}
              >
                {s.shortLabel} ({projects.filter((p) => p.status === s.id).length})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {projects.length === 0 ? (
          <EmptyState
            icon={LayoutList}
            title="Még nincs projekted"
            description="Hozz létre egy új projektet a jobb alsó gombbal, vagy alakíts át egy érdeklődőt projektté."
          />
        ) : view === "kanban" ? (
          <ProjectKanban projects={projects.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()))} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="Nincs találat" description="Próbálj más keresőszót vagy szűrőt." />
        ) : (
          <div className="space-y-3 px-4 pb-4 md:px-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <Fab to="/projects/new" label="Új projekt" />
    </div>
  );
}
