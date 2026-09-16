import { Link } from "react-router-dom";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { useNotifications } from "../lib/notifications";
import { usePageTitle } from "../lib/usePageTitle";
import { formatRelative } from "../lib/format";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

const ICONS = { danger: AlertTriangle, warning: AlertTriangle, info: Info };
const COLORS = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
};

export default function NotificationsPage() {
  usePageTitle("Értesítések");
  const notifications = useNotifications();

  return (
    <div className="px-4 pt-4 md:px-6">
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Nincs új értesítésed" description="Minden rendben van, nincs elmaradás." />
      ) : (
        <div className="space-y-3 pb-4">
          {notifications.map((n) => {
            const Icon = ICONS[n.severity];
            return (
              <Link key={n.id} to={n.href}>
                <Card className="flex items-start gap-3 p-4 hover:shadow-md">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${COLORS[n.severity]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-sm text-text-muted">{n.description}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatRelative(n.at)}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
