import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudOff } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiError, api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { inputClass } from "../lib/formStyles";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type Mode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const signedIn = useAuthStore((s) => s.signedIn);
  const hasUserData = useAppStore((s) => s.hasUserData);
  const resetLocalData = useAppStore((s) => s.resetLocalData);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(mode === "login" ? "Bejelentkezés" : "Fiók létrehozása");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const result =
        mode === "login"
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password);

      // Ha eddig csak a bemutató adatok voltak a gépen, azokat nem visszük
      // fel a fiókba — különben minden új eszközön megszaporodnának.
      if (!hasUserData) resetLocalData();

      signedIn(result.token, result.user);
      navigate("/settings");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Nem sikerült kapcsolódni. Ellenőrizd az internetkapcsolatot.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-3">
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Vissza
      </Link>

      <Card className="mt-3 p-5">
        <h2 className="text-xl font-bold">
          {mode === "login" ? "Bejelentkezés" : "Fiók létrehozása"}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          A fiókkal az adataid az összes eszközödön megjelennek, és biztonsági
          mentésük is lesz.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Email cím">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Jelszó">
            <input
              type="password"
              required
              minLength={mode === "register" ? 10 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          {mode === "register" && (
            <p className="-mt-2 text-xs text-text-muted">Legalább 10 karakter.</p>
          )}

          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={busy}>
            {busy
              ? "Egy pillanat…"
              : mode === "login"
                ? "Bejelentkezés"
                : "Fiók létrehozása"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="mt-4 w-full text-sm text-primary"
        >
          {mode === "login" ? "Még nincs fiókom — létrehozom" : "Van már fiókom — belépek"}
        </button>
      </Card>

      <div className="mt-4 flex items-start gap-2 px-1 text-xs text-text-muted">
        <CloudOff size={14} className="mt-0.5 shrink-0" />
        <p>
          Fiók nélkül is használhatod az appot: az adatok ilyenkor csak ezen az
          eszközön, helyben tárolódnak.
        </p>
      </div>
    </div>
  );
}
