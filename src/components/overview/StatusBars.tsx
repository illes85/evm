import { Link } from "react-router-dom";
import { PROJECT_STATUSES } from "../../lib/projectStatus";
import type { ProjectStatus } from "../../types/domain";

/** Projects per pipeline stage. Every row is direct-labelled, so the colour
 * is a recognition aid rather than the only channel. Rows link into the
 * project list, pre-filtered. */
export function StatusBars({ counts }: { counts: Record<ProjectStatus, number> }) {
  const max = Math.max(...PROJECT_STATUSES.map((s) => counts[s.id]), 1);

  return (
    <ul className="space-y-2.5">
      {PROJECT_STATUSES.map((status) => {
        const count = counts[status.id];
        return (
          <li key={status.id}>
            <Link
              to={`/projects?status=${status.id}`}
              className="group flex items-center gap-3 rounded-lg py-0.5"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className="status-dot size-2 shrink-0 rounded-full"
                  style={{ ["--status" as string]: status.color }}
                />
                <span className="truncate text-sm group-hover:text-primary">{status.label}</span>
              </span>

              <span className="flex w-28 items-center gap-2 sm:w-40">
                <span className="h-1.5 flex-1 overflow-hidden rounded-[2px] bg-surface-2">
                  <span
                    className="block h-full rounded-r-[3px]"
                    style={{
                      width: `${(count / max) * 100}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </span>
                <span className="w-6 text-right text-sm font-medium tabular-nums">{count}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
