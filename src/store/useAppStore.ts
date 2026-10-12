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
  SyncRecord,
  ThemeMode,
} from "../types/domain";

const seedClients = createSeedClients();
const seedProjects = createSeedProjects(seedClients);

const nowIso = () => new Date().toISOString();

/** A szerverrel szinkronizált gyűjtemények. */
export const SYNC_TABLES = ["clients", "projects", "quotes", "invoices", "leads"] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

/** Minden helyi módosítás feljegyzi, hogy az adott rekord feltöltésre vár,
 * és hogy a tárolt adat már nem csak a bemutató adathalmaz. */
function touch(state: AppState, table: SyncTable, id: string) {
  const ids = state.pending[table];
  return {
    hasUserData: true,
    pending: ids.includes(id) ? state.pending : { ...state.pending, [table]: [...ids, id] },
  };
}

const emptyPending = (): Record<SyncTable, string[]> => ({
  clients: [],
  projects: [],
  quotes: [],
  invoices: [],
  leads: [],
});

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

  /** Rekordok, amik még nem jutottak el a szerverre. */
  pending: Record<SyncTable, string[]>;
  /** Hamis, amíg csak a bemutató adatok vannak — belépéskor ezt eldobhatjuk. */
  hasUserData: boolean;

  applyServerChanges: (changes: Partial<Record<SyncTable, SyncRecord[]>>) => void;
  clearPending: (table: SyncTable, ids: string[]) => void;
  resetLocalData: () => void;

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
      pending: emptyPending(),
      hasUserData: false,

      addClient: (client) => {
        const created: Client = { ...client, id: newId(), ...stamp() };
        set((s) => ({ clients: [created, ...s.clients], ...touch(s, "clients", created.id) }));
        return created;
      },
      updateClient: (id, patch) => {
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c,
          ),
          ...touch(s, "clients", id),
        }));
      },
      deleteClient: (id) => {
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? tombstone(c) : c)),
          ...touch(s, "clients", id),
        }));
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
        set((s) => ({ projects: [created, ...s.projects], ...touch(s, "projects", created.id) }));
        return created;
      },
      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
          ...touch(s, "projects", id),
        }));
      },
      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? tombstone(p) : p)),
          ...touch(s, "projects", id),
        }));
      },
      setProjectStatus: (id, status) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
          ),
          ...touch(s, "projects", id),
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
          ...touch(s, "projects", id),
        }));
      },

      addQuote: (quote) => {
        const created: Quote = { ...quote, id: newId(), ...stamp() };
        set((s) => ({ quotes: [created, ...s.quotes], ...touch(s, "quotes", created.id) }));
        return created;
      },
      updateQuote: (id, patch) => {
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: nowIso() } : q)),
          ...touch(s, "quotes", id),
        }));
      },
      deleteQuote: (id) => {
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? tombstone(q) : q)),
          ...touch(s, "quotes", id),
        }));
      },

      addInvoice: (invoice) => {
        const created: Invoice = { ...invoice, id: newId(), ...stamp() };
        set((s) => ({ invoices: [created, ...s.invoices], ...touch(s, "invoices", created.id) }));
        return created;
      },
      updateInvoice: (id, patch) => {
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i,
          ),
          ...touch(s, "invoices", id),
        }));
      },
      deleteInvoice: (id) => {
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === id ? tombstone(i) : i)),
          ...touch(s, "invoices", id),
        }));
      },

      addLead: (lead) => {
        const created: Lead = { ...lead, id: newId(), ...stamp() };
        set((s) => ({ leads: [created, ...s.leads], ...touch(s, "leads", created.id) }));
        return created;
      },
      updateLead: (id, patch) => {
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l)),
          ...touch(s, "leads", id),
        }));
      },
      deleteLead: (id) => {
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? tombstone(l) : l)),
          ...touch(s, "leads", id),
        }));
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
          ...touch(s, "leads", id),
        }));
        return project;
      },

      /**
       * A szerverről érkezett rekordok beolvasztása. Amelyikből nálunk
       * frissebb van (mert offline módosítottuk és még nem ment fel), azt
       * megtartjuk — az majd a következő feltöltéskor nyer.
       */
      applyServerChanges: (changes) => {
        set((state) => {
          const next: Partial<Record<SyncTable, SyncRecord[]>> = {};

          for (const table of SYNC_TABLES) {
            const incoming = changes[table];
            if (!incoming || incoming.length === 0) continue;

            const current = state[table] as unknown as SyncRecord[];
            const byId = new Map(current.map((row) => [row.id, row]));

            for (const row of incoming) {
              const mine = byId.get(row.id);
              if (mine === undefined || row.updatedAt >= mine.updatedAt) {
                byId.set(row.id, row);
              }
            }
            next[table] = [...byId.values()];
          }

          return next as Partial<AppState>;
        });
      },

      /** Sikeres feltöltés után ezek a rekordok már a szerveren vannak. */
      clearPending: (table, ids) => {
        set((s) => ({
          pending: { ...s.pending, [table]: s.pending[table].filter((id) => !ids.includes(id)) },
        }));
      },

      /** Belépéskor, ha a fiók adatait vesszük át a helyiek helyett. */
      resetLocalData: () => {
        set({
          clients: [],
          projects: [],
          quotes: [],
          invoices: [],
          leads: [],
          pending: emptyPending(),
          hasUserData: false,
        });
      },

      setPlan: (plan) => set((s) => ({ settings: { ...s.settings, plan } })),
      setPalette: (palette) => set((s) => ({ settings: { ...s.settings, palette } })),
      setMode: (mode) => set((s) => ({ settings: { ...s.settings, mode } })),
      updateProfile: (patch) =>
        set((s) => ({ settings: { ...s.settings, profile: { ...s.settings.profile, ...patch } } })),
    }),
    {
      name: "evm-store",
      version: 3,
      // v1 records predate sync metadata: without updatedAt the first sync
      // could not tell which side was newer, so they inherit createdAt.
      migrate: (persisted, version) => {
        const state = persisted as AppState;

        // v3: a szinkron nyilvántartása. A meglévő helyi adat a felhasználóé,
        // tehát feltöltendő — de a sorrend miatt ezt csak akkor jelöljük meg,
        // ha tényleg dolgozott vele (lásd hasUserData).
        if (version < 3) {
          state.pending = state.pending ?? {
            clients: [],
            projects: [],
            quotes: [],
            invoices: [],
            leads: [],
          };
          state.hasUserData = state.hasUserData ?? false;
        }

        if (version >= 2) return state;
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
