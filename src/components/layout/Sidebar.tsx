import { NavLink } from "react-router-dom";
import { Lock, Settings, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { useAppStore } from "../../store/useAppStore";
import { cx } from "../../lib/cx";

export function Sidebar() {
  const plan = useAppStore((s) => s.settings.plan);
  const businessName = useAppStore((s) => s.settings.profile.businessName);

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface md:shrink-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
          EVM
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{businessName || "EVM"}</p>
          <p className="text-xs text-text-muted">
            {plan === "premium" ? "Prémium csomag" : "Alap csomag"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const locked = item.premium && plan !== "premium";
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-surface-2 hover:text-text",
                )
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock size={14} className="text-text-muted" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        {plan !== "premium" && (
          <NavLink
            to="/settings"
            className="mb-1 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/15"
          >
            <Sparkles size={16} />
            Váltás Prémiumra
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface-2 hover:text-text",
            )
          }
        >
          <Settings size={18} />
          Beállítások
        </NavLink>
      </div>
    </aside>
  );
}
