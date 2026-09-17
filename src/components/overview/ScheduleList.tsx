import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import type { Project } from "../../types/domain";
import { useAppStore } from "../../store/useAppStore";
import { statusConfig } from "../../lib/projectStatus";

const dayFormatter = new Intl.DateTimeFormat("hu-HU", { weekday: "short", day: "numeric" });

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function dayLabel(project: Project): string {
  if (project.scheduledDate && isToday(project.scheduledDate)) return "Ma";
  if (project.status === "in_progress") return "Most";
  if (project.scheduledDate) return dayFormatter.format(new Date(project.scheduledDate));
  return "—";
}

function ScheduleRow({ project }: { project: Project }) {
  const client = useAppStore((s) => s.clients.find((c) => c.id === project.clientId));
  const status = statusConfig(project.status);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex items-start gap-3 rounded-xl px-1 py-2 hover:bg-surface-2"
    >
      <span className="w-12 shrink-0 pt-0.5 text-xs font-medium text-text-muted">
        {dayLabel(project)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className="status-dot size-2 shrink-0 rounded-full"
            style={{ ["--status" as string]: status.color }}
          />
          <span className="truncate text-sm font-medium">{project.title}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-text-muted">
          {client?.name}
          {project.address && (
            <>
              {client?.name && " · "}
              {project.address}
            </>
          )}
        </span>
      </span>
    </Link>
  );
}

export function ScheduleList({ today, upcoming }: { today: Project[]; upcoming: Project[] }) {
  if (today.length === 0 && upcoming.length === 0) {
    return (
      <div className="flex items-center gap-2 px-1 py-3 text-sm text-text-muted">
        <CalendarDays size={15} />
        Nincs ütemezett munka a következő egy hétben.
      </div>
    );
  }

  return (
    <div className="-mx-1">
      {today.map((project) => (
        <ScheduleRow key={project.id} project={project} />
      ))}
      {upcoming.slice(0, 4).map((project) => (
        <ScheduleRow key={project.id} project={project} />
      ))}
    </div>
  );
}
