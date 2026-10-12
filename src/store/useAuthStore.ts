import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../lib/api";

export type SyncState = "idle" | "syncing" | "offline" | "error";

interface AuthStore {
  token: string | null;
  user: AuthUser | null;

  /** Meddig jutottunk a letöltésben — a szerver órája szerint. */
  cursor: string;
  lastSyncedAt: string | null;
  syncState: SyncState;
  syncError: string | null;

  signedIn: (token: string, user: AuthUser) => void;
  signedOut: () => void;
  setSyncState: (state: SyncState, error?: string | null) => void;
  syncFinished: (cursor: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      cursor: "",
      lastSyncedAt: null,
      syncState: "idle",
      syncError: null,

      signedIn: (token, user) =>
        set({ token, user, syncState: "idle", syncError: null }),

      // Kilépéskor a kurzor is nullázódik: a következő belépés mindent
      // újra letölt, így nem maradhat ki rekord két fiók között váltva.
      signedOut: () =>
        set({ token: null, user: null, cursor: "", lastSyncedAt: null, syncState: "idle", syncError: null }),

      setSyncState: (syncState, syncError = null) => set({ syncState, syncError }),

      syncFinished: (cursor) =>
        set({ cursor, lastSyncedAt: new Date().toISOString(), syncState: "idle", syncError: null }),
    }),
    {
      name: "evm-auth",
      version: 1,
      // A futásidejű állapotot nem mentjük: újraindulás után ne tűnjön úgy,
      // mintha épp szinkronizálnánk.
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        cursor: s.cursor,
        lastSyncedAt: s.lastSyncedAt,
      }),
    },
  ),
);
