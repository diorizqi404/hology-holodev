export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
};

export type AuthUser = {
  id: string;
  display_name?: string;
  displayName?: string;
  role: "farmer" | "reviewer";
};

const SESSION_KEY = "rembuktani.session.v1";
const USER_KEY = "rembuktani.user.v1";
const localApiBase = `${window.location.protocol}//${window.location.hostname}:3000/api`;
const apiBase = (import.meta.env.VITE_API_BASE_URL || localApiBase).replace(/\/$/, "");

const stores = () => [localStorage, sessionStorage];

export function getSession(): Session | null {
  for (const store of stores()) {
    const value = store.getItem(SESSION_KEY);
    if (value) try { return JSON.parse(value) as Session; } catch { store.removeItem(SESSION_KEY); }
  }
  return null;
}

export function getUser(): AuthUser | null {
  for (const store of stores()) {
    const value = store.getItem(USER_KEY);
    if (value) try { return JSON.parse(value) as AuthUser; } catch { store.removeItem(USER_KEY); }
  }
  return null;
}

export function saveAuth(session: Session, user: AuthUser, remember: boolean) {
  clearAuth();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(SESSION_KEY, JSON.stringify(session));
  store.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("rembuktani:auth"));
}

export function clearAuth() {
  for (const store of stores()) {
    for (let index = store.length - 1; index >= 0; index -= 1) {
      const key = store.key(index);
      if (key && (key === SESSION_KEY || key === USER_KEY || key.startsWith("rembuktani.") || key.startsWith("field-pulse:"))) {
        store.removeItem(key);
      }
    }
  }
  window.dispatchEvent(new Event("rembuktani:auth"));
}

async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new Error("Server RembukTani belum terhubung. Pastikan backend aktif, lalu coba lagi.");
  }
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || "Layanan sedang tidak tersedia");
  return body as T;
}

export const authApi = {
  login: (identity: string, password: string) => json<{ user: AuthUser; session: Session }>("/auth/login", { method: "POST", body: JSON.stringify({ identity, password }) }),
  register: (payload: { displayName: string; identity: string; password: string; role: string }) => json<{ user: AuthUser; session: Session | null; requiresVerification: boolean; verificationChannel?: "email" | "whatsapp"; verificationTarget?: string }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  verifyPhone: (phone: string, token: string) => json<{ user: AuthUser; session: Session }>("/auth/verify-phone", { method: "POST", body: JSON.stringify({ phone, token }) }),
  resendPhoneVerification: (phone: string) => json<{ message: string }>("/auth/resend-phone-verification", { method: "POST", body: JSON.stringify({ phone }) }),
  forgotPassword: (email: string) => json<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (accessToken: string, password: string) => json<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ accessToken, password }) }),
  logout: async (): Promise<{ serverRevoked: boolean }> => {
    const session = getSession();
    let serverRevoked = !session;
    try {
      if (session) {
        await json<void>("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${session.accessToken}` } });
        serverRevoked = true;
      }
    } catch {
      // Local logout must still complete when the network or auth provider is unavailable.
    } finally {
      clearAuth();
    }
    return { serverRevoked };
  },
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let session = getSession();
  if (!session) throw new Error("Sesi tidak tersedia");
  if (session.expiresAt <= Math.floor(Date.now() / 1000) + 30) {
    const refreshed = await json<{ session: Session }>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) });
    const user = getUser();
    if (!user) throw new Error("Profil sesi tidak tersedia");
    const remember = Boolean(localStorage.getItem(SESSION_KEY));
    saveAuth(refreshed.session, user, remember);
    session = refreshed.session;
  }
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}`, ...init.headers } });
  } catch {
    throw new Error("Server RembukTani belum terhubung. Pastikan backend aktif, lalu coba lagi.");
  }
  if (response.status === 401) { clearAuth(); throw new Error("Sesi berakhir. Silakan masuk kembali."); }
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || "Permintaan gagal");
  return body as T;
}
