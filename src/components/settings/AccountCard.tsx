import { Link } from "react-router-dom";
import { Check, CloudOff, LogIn, LogOut, RefreshCw, TriangleAlert } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePendingCount, runSync } from "../../lib/sync";
import { api } from "../../lib/api";
import { formatRelative } from "../../lib/format";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function AccountCard() {
  const { token, user, syncState, syncError, lastSyncedAt, signedOut } = useAuthStore();
  const pending = usePendingCount();

  if (token === null || user === null) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted">
            <CloudOff size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Nincs bejelentkezve</p>
            <p className="text-sm text-text-muted">
              Az adatok csak ezen az eszközön tárolódnak. Fiókkal minden
              eszközödön ugyanazt látod, és nem vesznek el.
            </p>
          </div>
        </div>
        <Link to="/login" className="mt-3 block">
          <Button fullWidth icon={<LogIn size={16} />}>
            Bejelentkezés vagy fiók létrehozása
          </Button>
        </Link>
      </Card>
    );
  }

  async function handleLogout() {
    const current = useAuthStore.getState().token;
    if (
      !window.confirm(
        "Kilépés után a fiókban lévő adatok ezen az eszközön nem lesznek elérhetők. Folytatod?",
      )
    ) {
      return;
    }
    if (current !== null) {
      // Ha nincs net, a helyi kilépés akkor is megtörténik.
      await api.logout(current).catch(() => undefined);
    }
    signedOut();
  }

  const status = {
    syncing: { icon: RefreshCw, text: "Szinkronizálás…", tone: "text-text-muted" },
    offline: { icon: CloudOff, text: "Nincs kapcsolat — a változások később mennek fel", tone: "text-warning" },
    error: { icon: TriangleAlert, text: syncError ?? "Hiba a szinkronban", tone: "text-danger" },
    idle: pending > 0
      ? { icon: RefreshCw, text: `${pending} változás vár feltöltésre`, tone: "text-text-muted" }
      : { icon: Check, text: "Minden mentve", tone: "text-success" },
  }[syncState];

  const StatusIcon = status.icon;

  return (
    <Card className="p-4">
      <p className="text-xs text-text-muted">Bejelentkezve</p>
      <p className="font-semibold">{user.email}</p>

      <div className={`mt-3 flex items-center gap-2 text-sm ${status.tone}`}>
        <StatusIcon size={15} className={syncState === "syncing" ? "animate-spin" : undefined} />
        {status.text}
      </div>
      {lastSyncedAt !== null && (
        <p className="mt-1 text-xs text-text-muted">
          Utolsó szinkron: {formatRelative(lastSyncedAt)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw size={14} />}
          onClick={() => void runSync()}
          disabled={syncState === "syncing"}
        >
          Szinkronizálás most
        </Button>
        <Button size="sm" variant="ghost" icon={<LogOut size={14} />} onClick={handleLogout}>
          Kilépés
        </Button>
      </div>
    </Card>
  );
}
