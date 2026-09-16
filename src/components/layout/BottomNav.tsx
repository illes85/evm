import { NavLink } from "react-router-dom";
import { Lock } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { useAppStore } from "../../store/useAppStore";
import { cx } from "../../lib/cx";

export function BottomNav() {
  const plan = useAppStore((s) => s.settings.plan);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-safe"
      aria-label="Fő navigáció"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const locked = item.premium && plan !== "premium";
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-text-muted",
                  )
                }
              >
                <span className="relative">
                  <item.icon size={22} strokeWidth={2} />
                  {locked && (
                    <Lock
                      size={11}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-surface text-text-muted"
                    />
                  )}
                </span>
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
