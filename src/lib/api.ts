/** Hol van az API. Fejlesztéskor felülírható a .env fájlban. */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "https://evm.szilab.hu/api/index.php";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** Igaz, ha a hálózat hiányzott — ilyenkor nincs mit javítani, várunk. */
  get isOffline(): boolean {
    return this.status === 0;
  }

  get isAuthProblem(): boolean {
    return this.status === 401;
  }
}

async function request<T>(route: string, options: { body?: unknown; token?: string } = {}): Promise<T> {
  const { body, token } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}?r=${encodeURIComponent(route)}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch csak hálózati hibánál dob — a szerveroldali hibák válaszok.
    throw new ApiError(0, "offline", "Nincs kapcsolat a szerverrel.");
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text === "" ? null : JSON.parse(text);
  } catch {
    throw new ApiError(response.status, "bad_response", "A szerver váratlan választ adott.");
  }

  if (!response.ok) {
    const error = payload as { error?: string; message?: string } | null;
    throw new ApiError(
      response.status,
      error?.error ?? "unknown",
      error?.message ?? "Ismeretlen hiba történt.",
    );
  }

  return payload as T;
}

export interface AuthUser {
  id: string;
  email: string;
  plan: "basic" | "premium";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PullResponse {
  changes: Record<string, Record<string, unknown>[]>;
  cursor: string;
  serverTime: string;
}

export interface PushResponse {
  accepted: number;
  rejected: Record<string, string[]>;
  cursor: string;
  serverTime: string;
}

/** A készülék neve a munkamenet-listához — így később kiléptethető egy eszköz. */
function deviceLabel(): string {
  if (typeof navigator === "undefined") return "ismeretlen";
  return navigator.userAgent.slice(0, 120);
}

export const api = {
  health: () => request<{ ok: boolean; php: string }>("health"),

  register: (email: string, password: string) =>
    request<AuthResponse>("auth/register", { body: { email, password, device: deviceLabel() } }),

  login: (email: string, password: string) =>
    request<AuthResponse>("auth/login", { body: { email, password, device: deviceLabel() } }),

  logout: (token: string) => request<{ ok: boolean }>("auth/logout", { body: {}, token }),

  me: (token: string) => request<{ user: AuthUser }>("auth/me", { token }),

  pull: (token: string, since: string) =>
    request<PullResponse>("sync/pull", { body: { since }, token }),

  push: (token: string, changes: Record<string, unknown[]>) =>
    request<PushResponse>("sync/push", { body: { changes }, token }),
};
