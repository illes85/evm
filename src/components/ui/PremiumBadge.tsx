import { Sparkles } from "lucide-react";
import { cx } from "../../lib/cx";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent",
        className,
      )}
    >
      <Sparkles size={11} />
      Prémium
    </span>
  );
}
