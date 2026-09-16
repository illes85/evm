import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "./Button";

export function PremiumGate({
  children,
  title,
  description,
  compact = false,
}: {
  children: ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  const plan = useAppStore((s) => s.settings.plan);
  if (plan === "premium") return <>{children}</>;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Lock size={16} className="shrink-0 text-text-muted" />
          <p className="truncate text-sm text-text-muted">{title}</p>
        </div>
        <Link to="/settings">
          <Button size="sm" variant="secondary" icon={<Sparkles size={14} />}>
            Prémium
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2 p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Lock size={22} />
      </div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      <Link to="/settings" className="mt-4 inline-block">
        <Button icon={<Sparkles size={16} />}>Prémiumra váltás</Button>
      </Link>
    </div>
  );
}
