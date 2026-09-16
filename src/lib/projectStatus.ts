import type { ProjectStatus } from "../types/domain";

export interface StatusConfig {
  id: ProjectStatus;
  label: string;
  shortLabel: string;
  dot: string;
  badge: string;
}

export const PROJECT_STATUSES: StatusConfig[] = [
  {
    id: "lead",
    label: "Érdeklődés",
    shortLabel: "Érdeklődés",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  },
  {
    id: "quoting",
    label: "Ajánlat készül",
    shortLabel: "Ajánlat",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  {
    id: "scheduled",
    label: "Ütemezve",
    shortLabel: "Ütemezve",
    dot: "bg-violet-400",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
  {
    id: "in_progress",
    label: "Folyamatban",
    shortLabel: "Folyamatban",
    dot: "bg-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  },
  {
    id: "done",
    label: "Kész",
    shortLabel: "Kész",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  {
    id: "invoiced",
    label: "Számlázva",
    shortLabel: "Számlázva",
    dot: "bg-teal-400",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  },
];

const byId = new Map(PROJECT_STATUSES.map((s) => [s.id, s]));

export function statusConfig(status: ProjectStatus): StatusConfig {
  const found = byId.get(status);
  if (!found) throw new Error(`Unknown status: ${status}`);
  return found;
}

export function nextStatus(status: ProjectStatus): ProjectStatus | null {
  const idx = PROJECT_STATUSES.findIndex((s) => s.id === status);
  return PROJECT_STATUSES[idx + 1]?.id ?? null;
}

export function prevStatus(status: ProjectStatus): ProjectStatus | null {
  const idx = PROJECT_STATUSES.findIndex((s) => s.id === status);
  return idx > 0 ? PROJECT_STATUSES[idx - 1].id : null;
}
