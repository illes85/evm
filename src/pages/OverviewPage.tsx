import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Plus, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { useNotifications } from "../lib/notifications";
import { useDashboard } from "../lib/dashboard";
import { formatCurrency, formatCurrencyCompact } from "../lib/format";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PremiumGate } from "../components/ui/PremiumGate";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { StatTile } from "../components/overview/StatTile";
import { RevenueChart } from "../components/overview/RevenueChart";
import { StatusBars } from "../components/overview/StatusBars";
import { ScheduleList } from "../components/overview/ScheduleList";
import { AttentionList } from "../components/overview/AttentionList";

function SectionHeading({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
      <h2 className="text-sm font-semibold text-text-muted">{children}</h2>
      {action}
    </div>
  );
}

export default function OverviewPage() {
  usePageTitle("Áttekintés");
  const ownerName = useAppStore((s) => s.settings.profile.ownerName);
  const notifications = useNotifications();
  const { finance, revenue, performance, schedule, statuses, projectCount } = useDashboard();

  const firstName = ownerName.split(" ").slice(-1)[0] || ownerName;
  const today = new Date().toLocaleDateString("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const change = finance.revenueChangePct;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:px-6">
      <div className="mb-4">
        <p className="text-sm text-text-muted">
          {today} · Jó napot, {firstName}!
        </p>
        <p className="mt-0.5 text-sm">
          {schedule.today.length > 0
            ? `${schedule.today.length} munka van folyamatban vagy ma esedékes.`
            : "Mára nincs aktív munkád."}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {notifications.length > 0 && (
          <section>
            <SectionHeading
              action={
                notifications.length > 3 ? (
                  <Link
                    to="/notifications"
                    className="flex items-center gap-0.5 text-xs font-medium text-primary"
                  >
                    Összes ({notifications.length})
                    <ChevronRight size={13} />
                  </Link>
                ) : undefined
              }
            >
              Figyelmet igényel
            </SectionHeading>
            <Card className="p-2.5">
              <AttentionList items={notifications.slice(0, 3)} />
            </Card>
          </section>
        )}

        <section>
          <SectionHeading>Ma és a héten</SectionHeading>
          <Card className="p-2.5">
            <ScheduleList today={schedule.today} upcoming={schedule.upcoming} />
          </Card>
        </section>

        <section>
          <SectionHeading>Pénzügyi állapot</SectionHeading>
          <Card className="p-4">
            <p className="text-xs text-text-muted">Bevétel ebben a hónapban</p>
            <p className="mt-1 text-[clamp(2.25rem,9vw,3rem)] font-semibold leading-none tracking-tight">
              {formatCurrency(finance.revenueThisMonth)}
            </p>
            {change !== null ? (
              <p
                className={`mt-2 flex flex-wrap items-center gap-x-1 text-xs font-medium ${
                  change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change >= 0 ? "+" : ""}
                {Math.round(change)}%
                <span className="font-normal text-text-muted">
                  az előző hónap azonos időszakához
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-muted">
                Nincs előző havi adat az összehasonlításhoz.
              </p>
            )}
          </Card>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile
              label="Kintlévőség"
              value={formatCurrencyCompact(finance.outstanding)}
              tone={finance.overdue > 0 ? "danger" : "neutral"}
              sub={
                finance.overdue > 0
                  ? `Ebből lejárt: ${formatCurrencyCompact(finance.overdue)}`
                  : `${finance.outstandingCount} nyitott számla`
              }
              to="/invoices"
            />
            <StatTile
              label="Nyitott ajánlatok"
              value={formatCurrencyCompact(finance.openQuotes)}
              sub={`${finance.openQuotesCount} db válaszra vár`}
              to="/quotes"
            />
            <StatTile
              label="Aktív munkák"
              value={formatCurrencyCompact(finance.activeWork)}
              sub={`${finance.activeWorkCount} projekt folyamatban`}
              to="/projects"
            />
          </div>
        </section>

        <section>
          <SectionHeading action={<PremiumBadge />}>Bevétel alakulása</SectionHeading>
          <PremiumGate
            title="Bevételi trend és teljesítménymutatók"
            description="Lásd a havi bevétel alakulását, az ajánlataid elfogadási arányát és az átlagos projektértéket."
          >
            <Card className="p-4">
              <RevenueChart months={revenue} />

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3.5">
                <div>
                  <p className="text-[11px] text-text-muted">Ajánlat elfogadás</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {performance.quoteWinRate !== null
                      ? `${Math.round(performance.quoteWinRate)}%`
                      : "—"}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {performance.decidedQuotes > 0
                      ? `${performance.decidedQuotes} lezárt ajánlat`
                      : "Nincs lezárt ajánlat"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Átlagos projekt</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {performance.avgProjectValue !== null
                      ? formatCurrencyCompact(performance.avgProjectValue)
                      : "—"}
                  </p>
                  <p className="text-[10px] text-text-muted">becsült érték</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Teljesítve</p>
                  <p className="mt-0.5 text-sm font-semibold">{performance.completedLast30Days}</p>
                  <p className="text-[10px] text-text-muted">elmúlt 30 nap</p>
                </div>
              </div>
            </Card>
          </PremiumGate>
        </section>

        <section>
          <SectionHeading
            action={
              <Link
                to="/projects"
                className="flex items-center gap-0.5 text-xs font-medium text-primary"
              >
                Projektek
                <ChevronRight size={13} />
              </Link>
            }
          >
            Munkák állapota
          </SectionHeading>
          <Card className="p-4">
            {projectCount === 0 ? (
              <div className="py-2 text-center">
                <p className="text-sm text-text-muted">Még nincs projekted.</p>
                <Link to="/projects/new" className="mt-2 inline-block">
                  <Button size="sm" icon={<Plus size={14} />}>
                    Első projekt létrehozása
                  </Button>
                </Link>
              </div>
            ) : (
              <StatusBars counts={statuses} />
            )}
          </Card>
        </section>

        <Link to="/leads" className="block self-start">
          <Card className="flex items-center gap-3 p-4 hover:shadow-md">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Érdeklődők</span>
              <span className="block text-xs text-text-muted">
                Beérkező megkeresések kezelése és projektté alakítása
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-text-muted" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
