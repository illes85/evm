import type { CSSProperties } from "react";
import type { ProjectStatus } from "../types/domain";

export interface StatusConfig {
  id: ProjectStatus;
  label: string;
  shortLabel: string;
  /** Mark colour for dots, map pins and chart bars. This six-hue set is
   * validated for colour-vision deficiency and for 3:1 contrast against both
   * the light and dark surfaces — the worst adjacent pair separates at
   * ΔE 15 (deuteranopia) and ΔE 19.9 (normal vision). Re-validate before
   * changing any value: the map encodes status by colour alone. */
  color: string;
}

export const PROJECT_STATUSES: StatusConfig[] = [
  { id: "lead", label: "Érdeklődés", shortLabel: "Érdeklődés", color: "#4f6b9c" },
  { id: "quoting", label: "Ajánlat készül", shortLabel: "Ajánlat", color: "#ea580c" },
  { id: "scheduled", label: "Ütemezve", shortLabel: "Ütemezve", color: "#7c3aed" },
  { id: "in_progress", label: "Folyamatban", shortLabel: "Folyamatban", color: "#0891b2" },
  { id: "done", label: "Kész", shortLabel: "Kész", color: "#65a30d" },
  { id: "invoiced", label: "Számlázva", shortLabel: "Számlázva", color: "#0f766e" },
];

const byId = new Map(PROJECT_STATUSES.map((s) => [s.id, s]));

export function statusConfig(status: ProjectStatus): StatusConfig {
  const found = byId.get(status);
  if (!found) throw new Error(`Unknown status: ${status}`);
  return found;
}

/** Feeds `--status` to the `.status-badge` / `.status-dot` rules in index.css,
 * which derive the tint and the theme-appropriate text colour from it. */
export function statusVars(status: ProjectStatus): CSSProperties {
  return { "--status": statusConfig(status).color } as CSSProperties;
}
