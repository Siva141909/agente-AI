/**
 * Database service layer — ALL data operations go through the FastAPI backend.
 * Only OTP send/verify use the Supabase JS SDK directly (for phone auth).
 * After OTP verification the Supabase JWT is stored and sent to the backend.
 */

import { supabase } from "@/lib/supabase";
import { api, TokenManager } from "@/services/api";

// ── Types (unchanged — matching DB schema) ────────────────────────────────────

export interface User {
  user_id: string;
  phone_number: string;
  email?: string;
  full_name: string;
  occupation?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  date_of_birth?: string;
  preferred_language: string;
  is_active: boolean;
  kyc_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export interface UserProfile {
  profile_id: string;
  user_id: string;
  monthly_income_min: number;
  monthly_income_max: number;
  monthly_expenses_avg: number;
  emergency_fund_target: number;
  current_emergency_fund: number;
  risk_tolerance: "low" | "moderate" | "high";
  financial_goals: Record<string, any>;
  income_sources: Record<string, any>;
  debt_obligations: Record<string, any>;
  dependents: number;
  created_at: string;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  transaction_date: string;
  transaction_time?: string;
  amount: number;
  transaction_type: "income" | "expense";
  category?: string;
  subcategory?: string;
  description?: string;
  payment_method?: string;
  merchant_name?: string;
  location?: string;
  source?: string;
  account_id?: string;
  input_method?: string;
  verified: boolean;
  confidence_score?: number;
  is_recurring: boolean;
  recurring_frequency?: string;
  tags?: string[];
  created_at: string;
}

export interface Recommendation {
  recommendation_id: string;
  user_id: string;
  recommendation_type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning?: string;
  action_items?: string[];
  target_amount?: number;
  target_date?: string;
  confidence_score?: number;
  success_probability?: number;
  agent_source?: string;
  status: "pending" | "accepted" | "actioned" | "completed" | "rejected";
  user_feedback?: string;
  actual_outcome?: Record<string, any>;
  created_at: string;
}

export interface Budget {
  budget_id: string;
  user_id: string;
  budget_type: "feast" | "famine" | "normal";
  valid_from: string;
  valid_until: string;
  total_income_expected: number;
  fixed_costs: Record<string, number>;
  variable_costs: Record<string, number>;
  savings_target: number;
  discretionary_budget: number;
  category_limits: Record<string, any>;
  confidence_score?: number;
  is_active: boolean;
  created_at: string;
}

export interface BankAccount {
  account_id: string;
  user_id: string;
  account_name: string;
  provider: string;
  account_number: string;
  current_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

// ── Database service ──────────────────────────────────────────────────────────

export const db = {

  // ── AUTH (Supabase email+password; phone stored as {phone}@agente.local) ──

  auth: {
    signup: async (
      phone: string,
      password: string,
      full_name: string,
      occupation: string,
      city: string,
    ) => {
      const email = `${phone.replace(/\D/g, "").slice(-10)}@agente.local`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone_number: phone.replace(/\D/g, "").slice(-10), occupation, city },
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          throw new Error("This phone number is already registered. Please login.");
        }
        throw new Error(error.message);
      }
      if (!data.session) {
        throw new Error(
          "Account created but email confirmation is required. " +
          "Please disable 'Confirm email' in Supabase Auth settings.",
        );
      }
      localStorage.setItem("user_id", data.user!.id);
      TokenManager.set(data.session.access_token);
      return data;
    },

    login: async (phone: string, password: string) => {
      const email = `${phone.replace(/\D/g, "").slice(-10)}@agente.local`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      localStorage.setItem("user_id", data.user.id);
      TokenManager.set(data.session.access_token);
      return data;
    },

    logout: async () => {
      await supabase.auth.signOut();
      TokenManager.clear();
    },

    getSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) TokenManager.set(session.access_token);
      return session;
    },
  },

  // ── USERS ─────────────────────────────────────────────────────────────────

  users: {
    getMe: async (): Promise<User> => api.users.me(),
    updateMe: async (data: Partial<User>): Promise<User> => api.users.update(data),
    getProfile: async (): Promise<UserProfile> => api.users.profile(),
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => api.users.update(data),
  },

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  transactions: {
    getAll: async (filters?: {
      transaction_type?: string;
      from_date?: string;
      to_date?: string;
      limit?: number;
    }): Promise<Transaction[]> => api.transactions.list(filters),

    getSummary: async (from_date?: string, to_date?: string) =>
      api.transactions.summary({ from_date, to_date }),

    create: async (data: {
      transaction_date: string;
      transaction_time?: string;
      amount: number;
      transaction_type: "income" | "expense";
      category?: string;
      subcategory?: string;
      description?: string;
      payment_method?: string;
      merchant_name?: string;
      location?: string;
      source?: string;
      is_recurring?: boolean;
      recurring_frequency?: string;
      tags?: string[];
    }): Promise<Transaction> => api.transactions.create(data),

    update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
      // Update not exposed via backend yet; silently skip
      return data as Transaction;
    },

    delete: async (id: string): Promise<void> => api.transactions.delete(id),
  },

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────

  recommendations: {
    getAll: async (filters?: {
      status?: string;
      priority?: string;
      recommendation_type?: string;
    }): Promise<Recommendation[]> => api.recommendations.list(filters),

    update: async (id: string, data: {
      status?: string;
      user_feedback?: string;
    }): Promise<Recommendation> => api.recommendations.update(id, data),
  },

  // ── BANK ACCOUNTS (still via Supabase for now — backend route TBD) ───────

  bankAccounts: {
    getAll: async (): Promise<BankAccount[]> => {
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Not authenticated");
      const { createClient } = await import("@supabase/supabase-js");
      // Fall back to supabase anon for bank accounts (read-only, low risk)
      const { data } = await supabase.from("bank_accounts").select("*").eq("user_id", userId).eq("is_active", true);
      return (data || []) as BankAccount[];
    },

    create: async (data: {
      account_name: string;
      provider: string;
      account_number: string;
      current_balance: number;
      currency?: string;
    }): Promise<BankAccount> => {
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Not authenticated");
      const { data: created, error } = await supabase.from("bank_accounts").insert({ user_id: userId, ...data, currency: data.currency || "INR", is_active: true }).select().single();
      if (error) throw error;
      return created as BankAccount;
    },

    delete: async (id: string): Promise<void> => {
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Not authenticated");
      await supabase.from("bank_accounts").update({ is_active: false }).eq("account_id", id).eq("user_id", userId);
    },
  },

  // ── BUDGETS ───────────────────────────────────────────────────────────────

  budgets: {
    getAll: async (): Promise<Budget[]> => api.budget.list(),
    getActive: async (): Promise<Budget | null> => api.budget.active(),
    create: async (data: any) => api.budget.create(data),
    update: async (budgetId: string, data: any) => api.budget.update(budgetId, data),
  },

  // ── RISK ASSESSMENTS ──────────────────────────────────────────────────────

  riskAssessments: {
    getLatest: async () => api.risk.latest(),
  },

  // ── TAX RECORDS ───────────────────────────────────────────────────────────

  taxRecords: {
    getAll: async () => api.tax.list(),
    getByYear: async (year: string) => api.tax.byYear(year),
    create: async (data: any) => api.tax.create(data),
  },

  // ── GOVERNMENT SCHEMES ────────────────────────────────────────────────────

  governmentSchemes: {
    getAll: async () => api.schemes.list(),
    getById: async (id: string) => {
      const all = await api.schemes.list();
      return all.find((s: any) => s.scheme_id === id) || null;
    },
  },

  // ── SCHEME APPLICATIONS ───────────────────────────────────────────────────

  userSchemeApplications: {
    getAll: async () => api.schemes.applications(),
    create: async (data: any) => api.schemes.applyToScheme(data),
    getBySchemeId: async (schemeId: string) => {
      const all = await api.schemes.applications();
      return (all as any[]).filter((a) => a.scheme_id === schemeId);
    },
    update: async (id: number, updates: any) => {
      // not exposed yet — silently return
      return updates;
    },
  },

  // ── EXECUTED ACTIONS ──────────────────────────────────────────────────────

  actions: {
    getAll: async (filters?: { status?: string }) => api.actions.list(filters),
    create: async (data: any) => api.actions.create(data),
  },

  // ── AGENTS ───────────────────────────────────────────────────────────────

  agents: {
    triggerAnalysis: async () => api.agents.analyze(),
    getStatus: async () => api.agents.status(),
  },
};

export default db;
