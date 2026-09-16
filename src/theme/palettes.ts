import type { PaletteId } from "../types/domain";

export interface PaletteOption {
  id: PaletteId;
  label: string;
  primary: string;
  accent: string;
}

export const PALETTES: PaletteOption[] = [
  { id: "ocean", label: "Óceán", primary: "#0284c7", accent: "#14b8a6" },
  { id: "sunset", label: "Naplemente", primary: "#ea580c", accent: "#db2777" },
  { id: "forest", label: "Erdő", primary: "#15803d", accent: "#84cc16" },
  { id: "midnight", label: "Éjfél", primary: "#6366f1", accent: "#a855f7" },
  { id: "lavender", label: "Levendula", primary: "#9333ea", accent: "#ec4899" },
  { id: "rose", label: "Rózsa", primary: "#e11d48", accent: "#f59e0b" },
];
