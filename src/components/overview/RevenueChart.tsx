import { useState } from "react";
import type { MonthRevenue } from "../../lib/dashboard";
import { formatCurrency, formatCurrencyCompact } from "../../lib/format";
import { cx } from "../../lib/cx";

/** Column chart of paid revenue per month. Single series, so it carries no
 * legend — the heading names what is plotted. The current month is drawn
 * lighter because its data is still incomplete. */
export function RevenueChart({ months }: { months: MonthRevenue[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...months.map((m) => m.amount));

  if (max === 0) {
    return (
      <p className="py-6 text-center text-xs text-text-muted">
        Még nincs kifizetett számla — itt fog megjelenni a bevétel alakulása.
      </p>
    );
  }

  const columns = { gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` };
  const shown = active ?? months.length - 1;
  const shownMonth = months[shown];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-base font-semibold">{formatCurrency(shownMonth.amount)}</p>
        <p className="text-xs text-text-muted">
          {shownMonth.date.toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
          {shownMonth.isCurrent && " (folyamatban)"}
        </p>
      </div>

      <div className="mt-3 grid gap-2 border-b border-border" style={columns}>
        {months.map((month, i) => (
          <button
            key={month.date.toISOString()}
            type="button"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(i)}
            aria-label={`${month.label}: ${formatCurrency(month.amount)}`}
            className="flex h-24 items-end justify-center"
          >
            <span
              style={{ height: `${Math.max((month.amount / max) * 100, 1.5)}%` }}
              className={cx(
                "w-5 rounded-t-[4px] bg-primary transition-opacity",
                month.isCurrent ? "opacity-40" : "opacity-100",
                active !== null && active !== i && "opacity-30",
              )}
            />
          </button>
        ))}
      </div>

      <div className="mt-1.5 grid gap-2" style={columns}>
        {months.map((month, i) => (
          <span
            key={month.date.toISOString()}
            className={cx(
              "text-center text-[11px] tabular-nums",
              i === shown ? "font-medium text-text" : "text-text-muted",
            )}
          >
            {month.label}
          </span>
        ))}
      </div>

      <p className="mt-2.5 text-[11px] text-text-muted">
        Legjobb hónap: {formatCurrencyCompact(max)} · a folyó hónap még nem zárt le.
      </p>
    </div>
  );
}
