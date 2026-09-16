import { Check, Laptop, Moon, Sun } from "lucide-react";
import { PALETTES } from "../../theme/palettes";
import { useAppStore } from "../../store/useAppStore";
import { cx } from "../../lib/cx";
import type { ThemeMode } from "../../types/domain";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Világos", icon: Sun },
  { id: "dark", label: "Sötét", icon: Moon },
  { id: "system", label: "Rendszer", icon: Laptop },
];

export function ThemePicker() {
  const palette = useAppStore((s) => s.settings.palette);
  const mode = useAppStore((s) => s.settings.mode);
  const setPalette = useAppStore((s) => s.setPalette);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-text-muted">Megjelenés</p>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cx(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
                mode === m.id ? "bg-primary text-primary-foreground" : "text-text-muted",
              )}
            >
              <m.icon size={14} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-text-muted">Színpaletta</p>
        <div className="grid grid-cols-3 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              className={cx(
                "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors",
                palette === p.id ? "border-primary" : "border-border",
              )}
            >
              <span className="relative flex h-8 w-full overflow-hidden rounded-lg">
                <span className="flex-1" style={{ backgroundColor: p.primary }} />
                <span className="flex-1" style={{ backgroundColor: p.accent }} />
                {palette === p.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <Check size={14} />
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
