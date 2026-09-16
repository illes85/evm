import { NavLink } from "react-router-dom";
import { cx } from "../../lib/cx";

export function FinancesTabs() {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      <NavLink
        to="/quotes"
        className={({ isActive }) =>
          cx(
            "flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "text-text-muted",
          )
        }
      >
        Ajánlatok
      </NavLink>
      <NavLink
        to="/invoices"
        className={({ isActive }) =>
          cx(
            "flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "text-text-muted",
          )
        }
      >
        Számlák
      </NavLink>
    </div>
  );
}
