import { Link } from "react-router-dom";
import { CalendarClock, MapPin } from "lucide-react";
import type { Project } from "../../types/domain";
import { useAppStore } from "../../store/useAppStore";
import { statusConfig, statusVars } from "../../lib/projectStatus";
import { formatCurrency, formatDate } from "../../lib/format";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function ProjectCard({ project }: { project: Project }) {
  const client = useAppStore((s) => s.clients.find((c) => c.id === project.clientId));
  const status = statusConfig(project.status);
  const dateLabel = project.scheduledDate ?? project.dueDate;

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="p-4 transition-shadow hover:shadow-md active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{project.title}</h3>
          <Badge className="status-badge" style={statusVars(project.status)}>
            <span className="status-dot size-1.5 rounded-full" />
            {status.shortLabel}
          </Badge>
        </div>
        {client && <p className="mt-0.5 text-sm text-text-muted">{client.name}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
          {project.address && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate max-w-[10rem]">{project.address}</span>
            </span>
          )}
          {dateLabel && (
            <span className="flex items-center gap-1">
              <CalendarClock size={13} />
              {formatDate(dateLabel)}
            </span>
          )}
        </div>

        {typeof project.estimatedValue === "number" && (
          <p className="mt-3 text-sm font-semibold text-primary">
            {formatCurrency(project.estimatedValue)}
          </p>
        )}
      </Card>
    </Link>
  );
}
