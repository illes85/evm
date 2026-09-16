import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
