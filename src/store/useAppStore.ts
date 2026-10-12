import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newId } from "../lib/id";
import {
  createSeedClients,
  createSeedInvoices,
  createSeedLeads,
  createSeedProjects,
  createSeedQuotes,
  createSeedSettings,
} from "../data/seed";
import type {
  BusinessProfile,
  Client,
  Invoice,
  Lead,
  PaletteId,
  PlanTier,
  Project,
  ProjectNote,
  ProjectStatus,
  Quote,
  Settings,
  SyncMeta,
  ThemeMode,
} from "../types/domain";

const seedClients = createSeedClients();
const seedProjects = createSeedProjects(seedClients);

const nowIso = () => new Date().toISOString();

/** Timestamps for a freshly created record. */
function stamp(): { createdAt: string; updatedAt: string } {
  const now = nowIso();
  return { createdAt: now, updatedAt: now };
}

/** Deleting marks the record instead of dropping it: the tombstone is what
 * tells the server (and the user's other devices) that it went away. Rows are
 * purged for real once the server has acknowledged the deletion. */
function tombstone<T extends SyncMeta>(record: T): T {
  const now = nowIso();
  return { ...record, deletedAt: now, updatedAt: now };
}

interface AppState {
  clients: Client[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];
  leads: Lead[];
  settings: Settings;

  addClient: (client: Omit<Client, keyof SyncMeta | "id">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (project: Omit<Project, keyof SyncMeta | "id" | "notes">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  addProjectNote: (id: string, text: string, source?: ProjectNote["source"]) => void;

  addQuote: (quote: Omit<Quote, keyof SyncMeta | "id">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, keyof SyncMeta | "id">) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  addLead: (lead: Omit<Lead, keyof SyncMeta | "id">) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToProject: (id: string) => Project | null;

  setPlan: (plan: PlanTier) => void;
  setPalette: (palette: PaletteId) => void;
  setMode: (mode: ThemeMode) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: seedClients,
      projects: seedProjects,
      quotes: createSeedQuotes(seedProjects),
      invoices: createSeedInvoices(seedProjects),
      leads: createSeedLeads(),
      settings: createSeedSettings(),

      addClient: (client) => {
        const created: Client = { ...client, id: newId(), ...stamp() };
        set((s) => ({ clients: [created, ...s.clients] }));
        return created;
      },
      updateClient: (id, patch) => {
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c,
          ),
        }));
      },
      deleteClient: (id) => {
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? tombstone(c) : c)) }));
      },

      addProject: (project) => {
        const now = new Date().toISOString();
        const created: Project = {
          ...project,
          id: newId(),
          notes: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ projects: [created, ...s.projects] }));
        return created;
      },
      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },
      deleteProject: (id) => {
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? tombstone(p) : p)) }));
      },
      setProjectStatus: (id, status) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },
      addProjectNote: (id, text, source = "manual") => {
        const note: ProjectNote = {
          id: newId(),
          text,
          createdAt: new Date().toISOString(),
          source,
        };
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, notes: [note, ...p.notes], updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },

      addQuote: (quote) => {
        const created: Quote = { ...quote, id: newId(), ...stamp() };
        set((s) => ({ quotes: [created, ...s.quotes] }));
        return created;
      },
      updateQuote: (id, patch) => {
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: nowIso() } : q)),
        }));
      },
      deleteQuote: (id) => {
        set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? tombstone(q) : q)) }));
      },

      addInvoice: (invoice) => {
        const created: Invoice = { ...invoice, id: newId(), ...stamp() };
        set((s) => ({ invoices: [created, ...s.invoices] }));
        return created;
      },
      updateInvoice: (id, patch) => {
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i,
          ),
        }));
      },
      deleteInvoice: (id) => {
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? tombstone(i) : i)) }));
      },

      addLead: (lead) => {
        const created: Lead = { ...lead, id: newId(), ...stamp() };
        set((s) => ({ leads: [created, ...s.leads] }));
        return created;
      },
      updateLead: (id, patch) => {
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l)),
        }));
      },
      deleteLead: (id) => {
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? tombstone(l) : l)) }));
      },
      convertLeadToProject: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (!lead) return null;
        const project = get().addProject({
          title: lead.name,
          status: "lead",
          address: lead.address,
          description: lead.note,
        });
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, convertedProjectId: project.id, updatedAt: nowIso() } : l,
          ),
        }));
        return project;
      },

      setPlan: (plan) => set((s) => ({ settings: { ...s.settings, plan } })),
      setPalette: (palette) => set((s) => ({ settings: { ...s.settings, palette } })),
      setMode: (mode) => set((s) => ({ settings: { ...s.settings, mode } })),
      updateProfile: (patch) =>
        set((s) => ({ settings: { ...s.settings, profile: { ...s.settings.profile, ...patch } } })),
    }),
    {
      name: "evm-store",
      version: 2,
      // v1 records predate sync metadata: without updatedAt the first sync
      // could not tell which side was newer, so they inherit createdAt.
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as AppState;
        const state = persisted as AppState;
        const backfill = <T extends { createdAt: string; updatedAt?: string }>(rows: T[] = []) =>
          rows.map((row) => ({ ...row, updatedAt: row.updatedAt ?? row.createdAt }));
        return {
          ...state,
          clients: backfill(state.clients),
          projects: backfill(state.projects),
          quotes: backfill(state.quotes),
          invoices: backfill(state.invoices),
          leads: backfill(state.leads),
        } as AppState;
      },
    },
  ),
);

// Persist the freshly-generated seed data immediately, so the demo dataset
// (and its ids) stays stable across reloads even before the user makes a
// first edit — otherwise a reload before any change would re-seed random ids.
if (typeof window !== "undefined" && !window.localStorage.getItem("evm-store")) {
  useAppStore.setState({});
}
