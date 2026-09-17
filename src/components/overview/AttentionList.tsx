import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, Clock, Info } from "lucide-react";
import type { AppNotification } from "../../lib/notifications";

const ICONS = { danger: AlertTriangle, warning: Clock, info: Info };
const TONES = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
};

export function AttentionList({ items }: { items: AppNotification[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const Icon = ICONS[item.severity];
        return (
          <li key={item.id}>
            <Link
              to={item.href}
              className="flex items-center gap-3 rounded-xl px-1 py-2 hover:bg-surface-2"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${TONES[item.severity]}`}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-text-muted">{item.description}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-text-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
