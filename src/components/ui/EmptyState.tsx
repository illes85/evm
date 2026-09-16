import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-text-muted">
        <Icon size={26} />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-text">{title}</p>
        {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
