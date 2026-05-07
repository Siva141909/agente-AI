/**
 * Backend API client — all data operations go through the FastAPI backend.
 * The Supabase JS SDK is only used for phone OTP (in AppContext).
 * After OTP verify, the Supabase JWT is stored here and sent as Bearer token.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Token management ─────────────────────────────────────────────────────────

export const TokenManager = {
  get: () => localStorage.getItem("access_token"),
  set: (token: string) => localStorage.setItem("access_token", token),
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
  },
  isAuthenticated: () => !!localStorage.getItem("access_token"),
};

// ── HTTP client ───────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = TokenManager.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    TokenManager.clear();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (res.status === 204) return undefined as unknown as T;

  const body = await res.json();
  if (!res.ok) throw new Error(body?.detail || `HTTP ${res.status}`);
  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: object) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body?: object) => request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  // Auth (backend wraps Supabase OTP — optional, frontend can call Supabase JS directly)
  auth: {
    sendOtp: (phone: string) => post("/api/auth/send-otp", { phone }),
    verifyOtp: (phone: string, token: string) =>
      post<{ access_token: string; refresh_token: string; user_id: string }>(
        "/api/auth/verify-otp", { phone, token }
      ),
  },

  // Users
  users: {
    me: () => get<any>("/api/users/me"),
    update: (data: object) => put<any>("/api/users/me", data),
    profile: () => get<any>("/api/users/me/profile"),
  },

  // Transactions
  transactions: {
    list: (params?: { limit?: number; from_date?: string; to_date?: string; transaction_type?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.from_date) q.set("from_date", params.from_date);
      if (params?.to_date) q.set("to_date", params.to_date);
      if (params?.transaction_type) q.set("transaction_type", params.transaction_type);
      const qs = q.toString();
      return get<any[]>(`/api/transactions${qs ? "?" + qs : ""}`);
    },
    create: (data: object) => post<any>("/api/transactions", data),
    delete: (id: string) => del<void>(`/api/transactions/${id}`),
    summary: (params?: { from_date?: string; to_date?: string }) => {
      const q = new URLSearchParams();
      if (params?.from_date) q.set("from_date", params.from_date);
      if (params?.to_date) q.set("to_date", params.to_date);
      const qs = q.toString();
      return get<{ income: number; expense: number; count: number }>(
        `/api/transactions/summary${qs ? "?" + qs : ""}`
      );
    },
  },

  // Recommendations
  recommendations: {
    list: (params?: { status?: string; priority?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.priority) q.set("priority", params.priority);
      const qs = q.toString();
      return get<any[]>(`/api/recommendations${qs ? "?" + qs : ""}`);
    },
    update: (id: string, data: object) => put<any>(`/api/recommendations/${id}`, data),
  },

  // Stats
  stats: {
    get: () => get<any>("/api/stats"),
  },

  // Budget
  budget: {
    list: () => get<any[]>("/api/budget"),
    active: () => get<any | null>("/api/budget/active"),
    create: (data: object) => post<any>("/api/budget", data),
    update: (id: string, data: object) => put<any>(`/api/budget/${id}`, data),
  },

  // Government schemes
  schemes: {
    list: () => get<any[]>("/api/schemes"),
    applications: () => get<any[]>("/api/schemes/applications"),
    applyToScheme: (data: object) => post<any>("/api/schemes/applications", data),
  },

  // Tax
  tax: {
    list: () => get<any[]>("/api/tax"),
    byYear: (year: string) => get<any>(`/api/tax/${year}`),
    create: (data: object) => post<any>("/api/tax", data),
  },

  // Risk
  risk: {
    latest: () => get<any | null>("/api/risk/latest"),
    list: () => get<any[]>("/api/risk"),
  },

  // Actions
  actions: {
    list: (params?: { status?: string }) => {
      const qs = params?.status ? `?status=${params.status}` : "";
      return get<any[]>(`/api/actions${qs}`);
    },
    create: (data: object) => post<any>("/api/actions", data),
    complete: (id: string) => put<any>(`/api/actions/${id}/complete`),
  },

  // Agents
  agents: {
    analyze: () => post<any>("/api/agents/analyze"),
    status: () => get<any>("/api/agents/status"),
  },

  health: () => get<any>("/api/health"),
};

export default api;
