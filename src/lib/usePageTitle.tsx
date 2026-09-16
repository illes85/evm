import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("EVM");
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>{children}</PageTitleContext.Provider>
  );
}

export function usePageTitle(title: string) {
  const ctx = useContext(PageTitleContext);
  useEffect(() => {
    ctx?.setTitle(title);
    document.title = `${title} · EVM`;
  }, [title, ctx]);
}

export function useCurrentTitle(): string {
  const ctx = useContext(PageTitleContext);
  return ctx?.title ?? "EVM";
}
