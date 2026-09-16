import { Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { useNotifications } from "../../lib/notifications";

export function TopBar({ title }: { title: string }) {
  const notifications = useNotifications();
  const count = notifications.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 pt-safe backdrop-blur md:px-6">
      <h1 className="py-3.5 text-lg font-semibold tracking-tight md:py-4 md:text-xl">{title}</h1>
      <div className="flex items-center gap-1">
        <Link
          to="/notifications"
          className="relative flex size-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Értesítések"
        >
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
        <Link
          to="/settings"
          className="flex size-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-2 hover:text-text md:hidden"
          aria-label="Beállítások"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
