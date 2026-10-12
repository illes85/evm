import { useEffect, useMemo, useRef } from "react";
import { ApiError, api } from "./api";
import { SYNC_TABLES, useAppStore } from "../store/useAppStore";
import type { SyncTable } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import type { SyncRecord } from "../types/domain";

/** Két egyidejű kör semmit nem gyorsítana, viszont ütközhetne. */
let running = false;

/**
 * Egy teljes kör: előbb felküldjük a helyi változásokat, utána lehozzuk a
 * szerverét. Ebben a sorrendben, mert így a saját, még fel nem töltött
 * munkánkat nem írja felül egy régebbi szerveroldali állapot.
 */
export async function runSync(): Promise<void> {
  const auth = useAuthStore.getState();
  if (auth.token === null || running) return;

  running = true;
  const token = auth.token;
  useAuthStore.getState().setSyncState("syncing");

  try {
    const app = useAppStore.getState();

    const changes: Partial<Record<SyncTable, SyncRecord[]>> = {};
    const attempted: Partial<Record<SyncTable, string[]>> = {};
    let pendingCount = 0;

    for (const table of SYNC_TABLES) {
      const ids = app.pending[table];
      if (ids.length === 0) continue;
      const rows = app[table] as unknown as SyncRecord[];
      const records = ids
        .map((id) => rows.find((row) => row.id === id))
        .filter((row): row is SyncRecord => row !== undefined);
      if (records.length > 0) {
        changes[table] = records;
        attempted[table] = records.map((r) => r.id);
        pendingCount += records.length;
      }
    }

    if (pendingCount > 0) {
      await api.push(token, changes as Record<string, unknown[]>);
      // Az elutasítottakat is levesszük a listáról: azoknál a szerveré a
      // frissebb változat, amit a most következő letöltés hoz le — ha
      // fentmaradnának, minden körben újra próbálkoznánk velük.
      for (const table of SYNC_TABLES) {
        const ids = attempted[table];
        if (ids !== undefined) useAppStore.getState().clearPending(table, ids);
      }
    }

    const pulled = await api.pull(token, useAuthStore.getState().cursor);
    useAppStore.getState().applyServerChanges(
      pulled.changes as Partial<Record<SyncTable, SyncRecord[]>>,
    );
    useAuthStore.getState().syncFinished(pulled.cursor);
  } catch (error) {
    const auth = useAuthStore.getState();
    if (error instanceof ApiError && error.isOffline) {
      auth.setSyncState("offline");
    } else if (error instanceof ApiError && error.isAuthProblem) {
      // A munkamenet lejárt vagy visszavonták: a helyi adat marad, csak
      // újra be kell jelentkezni.
      auth.signedOut();
      auth.setSyncState("error", "A munkamenet lejárt, jelentkezz be újra.");
    } else {
      auth.setSyncState("error", error instanceof Error ? error.message : "Ismeretlen hiba.");
    }
  } finally {
    running = false;
  }
}

/** Hány rekord vár feltöltésre. */
export function usePendingCount(): number {
  const pending = useAppStore((s) => s.pending);
  return useMemo(
    () => SYNC_TABLES.reduce((sum, table) => sum + pending[table].length, 0),
    [pending],
  );
}

const DEBOUNCE_MS = 2500;
const PERIODIC_MS = 5 * 60 * 1000;

/**
 * Elindítja a szinkront, amikor értelme van: induláskor, változás után
 * (kis késleltetéssel, hogy gépelés közben ne küldjünk minden betűre),
 * amikor visszajön a net, amikor az app újra előtérbe kerül, és ritkán
 * magától is, hogy a másik eszköz változásai is megérkezzenek.
 */
export function useSyncEngine(): void {
  const token = useAuthStore((s) => s.token);
  const pendingCount = usePendingCount();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (token === null) return;
    void runSync();
  }, [token]);

  useEffect(() => {
    if (token === null || pendingCount === 0) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void runSync(), DEBOUNCE_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [token, pendingCount]);

  useEffect(() => {
    if (token === null) return;

    const onOnline = () => void runSync();
    const onVisible = () => {
      if (document.visibilityState === "visible") void runSync();
    };
    const interval = window.setInterval(() => void runSync(), PERIODIC_MS);

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [token]);
}
