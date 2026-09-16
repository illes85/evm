import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export function useThemeEffect() {
  const palette = useAppStore((s) => s.settings.palette);
  const mode = useAppStore((s) => s.settings.mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", palette);
  }, [palette]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.setAttribute("data-mode", dark ? "dark" : "light");

    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(mode === "dark");
    return undefined;
  }, [mode]);
}
