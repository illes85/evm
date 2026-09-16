import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import type { Client, Invoice, Project, Quote } from "../types/domain";

export type NotificationSeverity = "danger" | "warning" | "info";

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  at: string;
}

const DAY = 86400000;

function clientName(clients: Client[], id?: string): string {
  return clients.find((c) => c.id === id)?.name ?? "ismeretlen ügyfél";
}

export function computeNotifications(
  projects: Project[],
  quotes: Quote[],
  invoices: Invoice[],
  clients: Client[],
): AppNotification[] {
  const now = Date.now();
  const list: AppNotification[] = [];

  for (const inv of invoices) {
    if (inv.status === "paid") continue;
    const due = new Date(inv.dueDate).getTime();
    if (Number.isNaN(due)) continue;
    const daysLeft = Math.round((due - now) / DAY);
    if (due < now) {
      list.push({
        id: `inv-overdue-${inv.id}`,
        severity: "danger",
        title: `Lejárt számla: ${inv.number}`,
        description: `${clientName(clients, inv.clientId)} — ${Math.abs(daysLeft)} napja lejárt.`,
        href: "/invoices/" + inv.id,
        at: inv.dueDate,
      });
    } else if (daysLeft <= 3) {
      list.push({
        id: `inv-due-${inv.id}`,
        severity: "warning",
        title: `Hamarosan esedékes számla: ${inv.number}`,
        description: `${clientName(clients, inv.clientId)} — fizetési határidő ${daysLeft} nap múlva.`,
        href: "/invoices/" + inv.id,
        at: inv.dueDate,
      });
    }
  }

  for (const q of quotes) {
    if (q.status !== "sent" || !q.validUntil) continue;
    const until = new Date(q.validUntil).getTime();
    const daysLeft = Math.round((until - now) / DAY);
    if (daysLeft >= 0 && daysLeft <= 3) {
      list.push({
        id: `quote-expiring-${q.id}`,
        severity: "info",
        title: `Ajánlat hamarosan lejár: ${q.number}`,
        description: `${clientName(clients, q.clientId)} — érvényesség ${daysLeft} nap múlva jár le.`,
        href: "/quotes/" + q.id,
        at: q.validUntil,
      });
    }
  }

  for (const p of projects) {
    if (p.scheduledDate && ["scheduled", "in_progress"].includes(p.status)) {
      const sched = new Date(p.scheduledDate).getTime();
      const daysLeft = Math.round((sched - now) / DAY);
      if (daysLeft >= 0 && daysLeft <= 1) {
        list.push({
          id: `proj-scheduled-${p.id}`,
          severity: "info",
          title: `Közelgő munka: ${p.title}`,
          description: `${clientName(clients, p.clientId)} — ${daysLeft === 0 ? "ma" : "holnap"} esedékes.`,
          href: "/projects/" + p.id,
          at: p.scheduledDate,
        });
      }
    }
    if (p.dueDate && !["done", "invoiced"].includes(p.status)) {
      const due = new Date(p.dueDate).getTime();
      if (due < now) {
        list.push({
          id: `proj-overdue-${p.id}`,
          severity: "danger",
          title: `Csúszásban: ${p.title}`,
          description: `${clientName(clients, p.clientId)} — a határidő lejárt.`,
          href: "/projects/" + p.id,
          at: p.dueDate,
        });
      }
    }
  }

  return list.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function useNotifications(): AppNotification[] {
  const projects = useAppStore((s) => s.projects);
  const quotes = useAppStore((s) => s.quotes);
  const invoices = useAppStore((s) => s.invoices);
  const clients = useAppStore((s) => s.clients);

  return useMemo(
    () => computeNotifications(projects, quotes, invoices, clients),
    [projects, quotes, invoices, clients],
  );
}
