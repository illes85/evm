import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cx } from "../../lib/cx";

export function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
  to,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: "neutral" | "warning" | "danger";
  to?: string;
}) {
  const body = (
    <>
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={cx(
          "mt-1 text-lg font-semibold leading-tight",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-text-muted">{sub}</p>}
    </>
  );

  const className = "rounded-2xl border border-border bg-surface p-3.5 shadow-sm min-w-0";

  if (to) {
    return (
      <Link to={to} className={cx(className, "block transition-shadow hover:shadow-md")}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
