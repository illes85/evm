import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { docTotal } from "./format";
import type { Invoice, Project, ProjectStatus, Quote } from "../types/domain";

/** Statuses that count as work in hand: sold or being delivered, not yet closed. */
const ACTIVE_STATUSES: ProjectStatus[] = ["scheduled", "in_progress", "done"];

export interface MonthRevenue {
  /** First day of the month, for labelling. */
  date: Date;
  label: string;
  amount: number;
  isCurrent: boolean;
}

export interface FinanceSummary {
  /** Invoiced but not paid (issued + overdue), i.e. money owed to the business. */
  outstanding: number;
  outstandingCount: number;
  /** The part of `outstanding` whose due date has passed. */
  overdue: number;
  overdueCount: number;
  /** Paid invoices in the current calendar month. */
  revenueThisMonth: number;
  /** The previous month up to the same day of the month, so a part-way month
   * is never compared against a whole one. */
  revenuePrevMonthToDate: number;
  /** Signed percentage change vs `revenuePrevMonthToDate`, or null when there
   * is nothing to compare against. */
  revenueChangePct: number | null;
  /** Sent quotes still awaiting an answer. */
  openQuotes: number;
  openQuotesCount: number;
  /** Estimated value of projects in hand. */
  activeWork: number;
  activeWorkCount: number;
}

export interface PerformanceSummary {
  /** Accepted / (accepted + rejected), or null when nothing has been decided. */
  quoteWinRate: number | null;
  decidedQuotes: number;
  avgProjectValue: number | null;
  completedLast30Days: number;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function invoiceIsUnpaid(invoice: Invoice): boolean {
  return invoice.status === "issued" || invoice.status === "overdue";
}

export function financeSummary(
  projects: Project[],
  quotes: Quote[],
  invoices: Invoice[],
  now = new Date(),
): FinanceSummary {
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const dayOfMonth = now.getDate();

  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;
  let revenueThisMonth = 0;
  let revenuePrevMonthToDate = 0;

  for (const invoice of invoices) {
    const total = docTotal(invoice.items);

    if (invoiceIsUnpaid(invoice)) {
      outstanding += total;
      outstandingCount++;
      if (new Date(invoice.dueDate).getTime() < now.getTime()) {
        overdue += total;
        overdueCount++;
      }
    }

    if (invoice.status === "paid" && invoice.paidAt) {
      const paidAt = new Date(invoice.paidAt);
      if (isSameMonth(paidAt, now)) revenueThisMonth += total;
      else if (isSameMonth(paidAt, prevMonthDate) && paidAt.getDate() <= dayOfMonth) {
        revenuePrevMonthToDate += total;
      }
    }
  }

  let openQuotes = 0;
  let openQuotesCount = 0;
  for (const quote of quotes) {
    if (quote.status === "sent") {
      openQuotes += docTotal(quote.items);
      openQuotesCount++;
    }
  }

  let activeWork = 0;
  let activeWorkCount = 0;
  for (const project of projects) {
    if (ACTIVE_STATUSES.includes(project.status)) {
      activeWork += project.estimatedValue ?? 0;
      activeWorkCount++;
    }
  }

  return {
    outstanding,
    outstandingCount,
    overdue,
    overdueCount,
    revenueThisMonth,
    revenuePrevMonthToDate,
    revenueChangePct:
      revenuePrevMonthToDate > 0
        ? ((revenueThisMonth - revenuePrevMonthToDate) / revenuePrevMonthToDate) * 100
        : null,
    openQuotes,
    openQuotesCount,
    activeWork,
    activeWorkCount,
  };
}

/** Paid revenue per month for the last `months` months, oldest first. */
export function revenueByMonth(invoices: Invoice[], months = 6, now = new Date()): MonthRevenue[] {
  const buckets: MonthRevenue[] = [];
  const formatter = new Intl.DateTimeFormat("hu-HU", { month: "short" });

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      date,
      label: formatter.format(date).replace(".", ""),
      amount: 0,
      isCurrent: i === 0,
    });
  }

  for (const invoice of invoices) {
    if (invoice.status !== "paid" || !invoice.paidAt) continue;
    const paidAt = new Date(invoice.paidAt);
    const bucket = buckets.find((b) => isSameMonth(b.date, paidAt));
    if (bucket) bucket.amount += docTotal(invoice.items);
  }

  return buckets;
}

export function performanceSummary(
  projects: Project[],
  quotes: Quote[],
  now = new Date(),
): PerformanceSummary {
  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const rejected = quotes.filter((q) => q.status === "rejected").length;
  const decidedQuotes = accepted + rejected;

  const valued = projects.filter((p) => typeof p.estimatedValue === "number");
  const thirtyDaysAgo = now.getTime() - 30 * 86400000;

  return {
    quoteWinRate: decidedQuotes > 0 ? (accepted / decidedQuotes) * 100 : null,
    decidedQuotes,
    avgProjectValue:
      valued.length > 0
        ? Math.round(valued.reduce((sum, p) => sum + (p.estimatedValue ?? 0), 0) / valued.length)
        : null,
    completedLast30Days: projects.filter(
      (p) =>
        (p.status === "done" || p.status === "invoiced") &&
        new Date(p.updatedAt).getTime() >= thirtyDaysAgo,
    ).length,
  };
}

export interface ScheduleBuckets {
  today: Project[];
  upcoming: Project[];
}

/** What needs attention on site: work in progress plus anything scheduled for
 * today (`now`), then the days after it up to `days`. Work in progress counts
 * as current even when its start date has passed. */
export function scheduleBuckets(projects: Project[], days = 7, now = new Date()): ScheduleBuckets {
  const horizon = startOfDay(now).getTime() + days * 86400000;
  const today: Project[] = [];
  const upcoming: Project[] = [];

  for (const project of projects) {
    if (project.status === "done" || project.status === "invoiced") continue;

    const scheduled = project.scheduledDate ? new Date(project.scheduledDate) : null;
    const isToday = scheduled !== null && isSameDay(scheduled, now);

    if (isToday || project.status === "in_progress") today.push(project);
    else if (
      scheduled !== null &&
      scheduled.getTime() > now.getTime() &&
      scheduled.getTime() <= horizon
    ) {
      upcoming.push(project);
    }
  }

  const byDate = (a: Project, b: Project) =>
    new Date(a.scheduledDate ?? a.updatedAt).getTime() -
    new Date(b.scheduledDate ?? b.updatedAt).getTime();

  return { today: today.sort(byDate), upcoming: upcoming.sort(byDate) };
}

export function statusCounts(projects: Project[]): Record<ProjectStatus, number> {
  const counts = {
    lead: 0,
    quoting: 0,
    scheduled: 0,
    in_progress: 0,
    done: 0,
    invoiced: 0,
  } satisfies Record<ProjectStatus, number>;

  for (const project of projects) counts[project.status]++;
  return counts;
}

export function useDashboard() {
  const projects = useAppStore((s) => s.projects);
  const quotes = useAppStore((s) => s.quotes);
  const invoices = useAppStore((s) => s.invoices);

  return useMemo(
    () => ({
      finance: financeSummary(projects, quotes, invoices),
      revenue: revenueByMonth(invoices),
      performance: performanceSummary(projects, quotes),
      schedule: scheduleBuckets(projects),
      statuses: statusCounts(projects),
      projectCount: projects.length,
    }),
    [projects, quotes, invoices],
  );
}
