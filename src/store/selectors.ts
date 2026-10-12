import { useMemo } from "react";
import { useAppStore } from "./useAppStore";
import type { Client, Invoice, Lead, Project, Quote } from "../types/domain";

/** Deleted records stay in the store as tombstones until the server has seen
 * them, so everything the UI reads goes through these hooks. Filtering inside
 * a zustand selector would hand React a new array on every call and spin it
 * into an infinite render, hence the useMemo on the raw list. */

export function useProjects(): Project[] {
  const all = useAppStore((s) => s.projects);
  return useMemo(() => all.filter((p) => !p.deletedAt), [all]);
}

export function useClients(): Client[] {
  const all = useAppStore((s) => s.clients);
  return useMemo(() => all.filter((c) => !c.deletedAt), [all]);
}

export function useQuotes(): Quote[] {
  const all = useAppStore((s) => s.quotes);
  return useMemo(() => all.filter((q) => !q.deletedAt), [all]);
}

export function useInvoices(): Invoice[] {
  const all = useAppStore((s) => s.invoices);
  return useMemo(() => all.filter((i) => !i.deletedAt), [all]);
}

export function useLeads(): Lead[] {
  const all = useAppStore((s) => s.leads);
  return useMemo(() => all.filter((l) => !l.deletedAt), [all]);
}

/** Single-record lookups return an element of the stored array, so the
 * reference stays stable between renders. */
export function useProject(id?: string): Project | undefined {
  return useAppStore((s) => s.projects.find((p) => p.id === id && !p.deletedAt));
}

export function useClient(id?: string): Client | undefined {
  return useAppStore((s) => s.clients.find((c) => c.id === id && !c.deletedAt));
}

export function useQuote(id?: string): Quote | undefined {
  return useAppStore((s) => s.quotes.find((q) => q.id === id && !q.deletedAt));
}

export function useInvoice(id?: string): Invoice | undefined {
  return useAppStore((s) => s.invoices.find((i) => i.id === id && !i.deletedAt));
}
