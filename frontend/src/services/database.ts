/**
 * Database Service Layer
 * Direct Supabase database access - fetches data directly from database
 */

import { supabase } from "@/lib/supabase";

// ============================================================================
// TYPES (Matching Database Schema)
// ============================================================================

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
  risk_tolerance: 'low' | 'moderate' | 'high';
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
  transaction_type: 'income' | 'expense';
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
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning?: string;
  action_items?: string[];
  target_amount?: number;
  target_date?: string;
  confidence_score?: number;
  success_probability?: number;
  agent_source?: string;
  status: 'pending' | 'accepted' | 'actioned' | 'completed' | 'rejected';
  user_feedback?: string;
  actual_outcome?: Record<string, any>;
  created_at: string;
}

export interface Budget {
  budget_id: string;
  user_id: string;
  budget_type: 'feast' | 'famine' | 'normal';
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

// ============================================================================
// HELPER: Get User ID
// ============================================================================

const getUserId = (): string | null => {
  return localStorage.getItem('user_id');
};

// ============================================================================
// DATABASE SERVICE
// ============================================================================

export const db = {
  // ========== AUTHENTICATION ==========
  auth: {
    login: async (phone_number: string, password: string) => {
      // For now, use backend API for auth (password hashing)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
      try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number, password }),
        });
        
        if (!response.ok) {
          // Handle connection errors
          if (!response.status) {
            throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 8000.');
          }
          const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
          throw new Error(errorData.detail || 'Login failed');
        }
        
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          // Set user_id - try multiple possible response formats
          const userId = data.user?.user_id || data.user_id || data.user?.id || data.id;
          if (userId) {
            localStorage.setItem('user_id', String(userId));
            console.log('[AUTH] Set user_id in localStorage:', userId);
          } else {
            console.warn('[AUTH] No user_id found in login response:', data);
          }
        }
        return data;
      } catch (error) {
        // Handle network errors (connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 8000, or set your user_id manually in the browser console for testing.');
        }
        throw error;
      }
    },

    signup: async (userData: {
      phone_number: string;
      full_name: string;
      password: string;
      email?: string;
      occupation?: string;
      city?: string;
      state?: string;
      date_of_birth?: string;
      preferred_language?: string;
    }) => {
      // For now, use backend API for auth (password hashing)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
      try {
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          // Handle connection errors
          if (!response.status) {
            throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 8000.');
          }
          const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
          throw new Error(errorData.detail || 'Signup failed');
        }
        
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          // Set user_id - try multiple possible response formats
          const userId = data.user?.user_id || data.user_id || data.user?.id || data.id;
          if (userId) {
            localStorage.setItem('user_id', String(userId));
            console.log('[AUTH] Set user_id in localStorage:', userId);
          } else {
            console.warn('[AUTH] No user_id found in signup response:', data);
          }
        }
        return data;
      } catch (error) {
        // Handle network errors (connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 8000, or set your user_id manually in the browser console for testing.');
        }
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    },
  },

  // ========== USERS ==========
  users: {
    getMe: async (): Promise<User> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('[DB] No user_id in localStorage. Current localStorage:', {
          user_id: localStorage.getItem('user_id'),
          auth_token: localStorage.getItem('auth_token') ? 'present' : 'missing'
        });
        throw new Error('Not authenticated - please login again');
      }

  const { data, error } = await supabase
        .from('users')
    .select('*')
    .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[DB] Error fetching user:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('User not found in database');
      }
      
      return data as User;
    },

    updateMe: async (data: Partial<User>): Promise<User> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: updated, error } = await supabase
        .from('users')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

  if (error) throw error;
      return updated as User;
    },

    getProfile: async (): Promise<UserProfile> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
      return data as UserProfile;
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
        .select()
    .single();

  if (error) throw error;
      return updated as UserProfile;
    },
  },

  // ========== TRANSACTIONS ==========
  transactions: {
    getAll: async (filters?: {
      date_start?: string;
      date_end?: string;
      transaction_type?: 'income' | 'expense' | 'all';
      category?: string;
      search_query?: string;
    }): Promise<Transaction[]> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('[DB] No user_id in localStorage for transactions');
        throw new Error('Not authenticated - please login again');
      }
      
      let query = supabase
        .from('transactions')
    .select('*')
    .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .order('transaction_time', { ascending: false });
      
      if (filters?.date_start) {
        query = query.gte('transaction_date', filters.date_start);
      }
      if (filters?.date_end) {
        query = query.lte('transaction_date', filters.date_end);
      }
      if (filters?.transaction_type && filters.transaction_type !== 'all') {
        query = query.eq('transaction_type', filters.transaction_type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search_query) {
        query = query.or(`description.ilike.%${filters.search_query}%,merchant_name.ilike.%${filters.search_query}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Transaction[];
    },

    getTodaySummary: async () => {
      const today = new Date().toISOString().split('T')[0];
      const transactions = await db.transactions.getAll({
        date_start: today,
        date_end: today,
      });
      const income = transactions
        .filter((t) => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = transactions
        .filter((t) => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { income, expense, count: transactions.length };
    },

    create: async (data: {
      transaction_date: string;
      transaction_time?: string;
      amount: number;
      transaction_type: 'income' | 'expense';
      category?: string;
      subcategory?: string;
  description?: string;
      payment_method?: string;
      merchant_name?: string;
      location?: string;
      source?: string;
      account_id?: string;
      is_recurring?: boolean;
      recurring_frequency?: string;
      tags?: string[];
    }): Promise<Transaction> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: created, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          ...data,
          verified: true,
          input_method: 'manual',
          confidence_score: 1.0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return created as Transaction;
    },

    update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: updated, error } = await supabase
        .from('transactions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('transaction_id', id)
        .eq('user_id', userId)
        .select()
    .single();

      if (error) throw error;
      return updated as Transaction;
    },

    delete: async (id: string): Promise<void> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('transaction_id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
  },

  // ========== RECOMMENDATIONS ==========
  recommendations: {
    getAll: async (filters?: {
      status?: string;
      priority?: string;
      recommendation_type?: string;
    }): Promise<Recommendation[]> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      let query = supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.recommendation_type) {
        query = query.eq('recommendation_type', filters.recommendation_type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Recommendation[];
    },

    update: async (id: string, data: {
      status?: string;
      user_feedback?: string;
    }): Promise<Recommendation> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const updateData: any = {};
      if (data.status) {
        updateData.status = data.status;
        if (data.status === 'actioned') updateData.actioned_at = new Date().toISOString();
        if (data.status === 'completed') updateData.completed_at = new Date().toISOString();
      }
      if (data.user_feedback) updateData.user_feedback = data.user_feedback;
      
      const { data: updated, error } = await supabase
        .from('recommendations')
        .update(updateData)
        .eq('recommendation_id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return updated as Recommendation;
    },
  },

  // ========== BANK ACCOUNTS ==========
  bankAccounts: {
    getAll: async (): Promise<BankAccount[]> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
        .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

  if (error) throw error;
      return (data || []) as BankAccount[];
    },

    create: async (data: {
      account_name: string;
      provider: string;
      account_number: string;
      current_balance: number;
      currency?: string;
    }): Promise<BankAccount> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: created, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: userId,
          ...data,
          currency: data.currency || 'INR',
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return created as BankAccount;
    },

    update: async (id: string, data: Partial<BankAccount>): Promise<BankAccount> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { data: updated, error } = await supabase
        .from('bank_accounts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('account_id', id)
        .eq('user_id', userId)
        .select()
        .single();

  if (error) throw error;
      return updated as BankAccount;
    },

    delete: async (id: string): Promise<void> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('account_id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
  },

  // ========== BUDGETS ==========
  budgets: {
    getAll: async (): Promise<Budget[]> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
        .order('created_at', { ascending: false });

  if (error) throw error;
      return (data || []) as Budget[];
    },

    getActive: async (): Promise<Budget | null> => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('valid_until', today)
        .lte('valid_from', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
      return data as Budget | null;
    },

    create: async (data: {
      budget_type: string;
      valid_from: string;
      valid_until: string;
      total_income_expected: number;
      fixed_costs?: Record<string, number>;
      variable_costs?: Record<string, number>;
      savings_target?: number;
      discretionary_budget?: number;
      category_limits?: Record<string, number>;
      is_active?: boolean;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const budgetData = {
        user_id: userId,
        budget_type: data.budget_type,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        total_income_expected: data.total_income_expected,
        fixed_costs: data.fixed_costs || {},
        variable_costs: data.variable_costs || {},
        savings_target: data.savings_target || 0,
        discretionary_budget: data.discretionary_budget || 0,
        category_limits: data.category_limits || {},
        is_active: data.is_active !== undefined ? data.is_active : true,
        confidence_score: 0.8, // Default confidence
        created_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

  if (error) throw error;
      return created;
    },

    update: async (budgetId: string, data: {
      budget_type?: string;
      valid_from?: string;
      valid_until?: string;
      total_income_expected?: number;
      fixed_costs?: Record<string, number>;
      variable_costs?: Record<string, number>;
      savings_target?: number;
      discretionary_budget?: number;
      category_limits?: Record<string, number>;
      is_active?: boolean;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      // Prepare update data, ensuring JSON fields are properly formatted
      const updateData: any = {
        budget_type: data.budget_type,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        total_income_expected: data.total_income_expected,
        savings_target: data.savings_target,
        discretionary_budget: data.discretionary_budget,
        is_active: data.is_active,
      };

      // Only include JSON fields if they are provided
      if (data.fixed_costs !== undefined) {
        updateData.fixed_costs = data.fixed_costs;
      }
      if (data.variable_costs !== undefined) {
        updateData.variable_costs = data.variable_costs;
      }
      if (data.category_limits !== undefined) {
        updateData.category_limits = data.category_limits;
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const { data: updated, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('budget_id', budgetId)
    .eq('user_id', userId)
        .select()
        .maybeSingle(); // Use maybeSingle instead of single to handle not found gracefully

      if (error) {
        console.error('[DB] Budget update error:', error);
        throw error;
      }
      
      if (!updated) {
        throw new Error('Budget not found or you do not have permission to update it');
      }
      
      return updated;
    },
  },

  // ========== RISK ASSESSMENTS ==========
  riskAssessments: {
    getLatest: async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
    },
  },

  // ========== TAX RECORDS ==========
  taxRecords: {
    getAll: async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
        .from('tax_records')
    .select('*')
    .eq('user_id', userId)
        .order('financial_year', { ascending: false });

  if (error) throw error;
  return data || [];
    },

    getByYear: async (financialYear: string) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
        .from('tax_records')
    .select('*')
    .eq('user_id', userId)
        .eq('financial_year', financialYear)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
    },

    create: async (data: {
      financial_year: string;
      gross_income?: number;
      total_deductions?: number;
      tax_paid?: number;
      filing_status?: string;
      filing_date?: string;
      acknowledgement_number?: string;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const recordData = {
        user_id: userId,
        financial_year: data.financial_year,
        gross_income: data.gross_income || 0,
        total_deductions: data.total_deductions || 0,
        tax_paid: data.tax_paid || 0,
        taxable_income: (data.gross_income || 0) - (data.total_deductions || 0),
        tax_liability: 0, // Will be calculated by backend
        filing_status: data.filing_status || 'not_filed',
        filing_date: data.filing_date || null,
        acknowledgement_number: data.acknowledgement_number || null,
      };

      const { data: created, error } = await supabase
        .from('tax_records')
        .insert(recordData)
        .select()
    .single();

  if (error) throw error;
      return created;
    },
  },

  // ========== GOVERNMENT SCHEMES ==========
  governmentSchemes: {
    getAll: async (filters?: {
      scheme_type?: string;
      government_level?: string;
      state_applicable?: string;
      is_active?: boolean;
    }) => {
      let query = supabase
        .from('government_schemes')
        .select('*')
        .order('scheme_name', { ascending: true });

      if (filters?.scheme_type) {
        query = query.eq('scheme_type', filters.scheme_type);
      }
      if (filters?.government_level) {
        query = query.eq('government_level', filters.government_level);
      }
      if (filters?.state_applicable) {
        query = query.ilike('state_applicable', `%${filters.state_applicable}%`);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      } else {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    getById: async (schemeId: string) => {
  const { data, error } = await supabase
    .from('government_schemes')
    .select('*')
        .eq('scheme_id', schemeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  },

  // ========== USER SCHEME APPLICATIONS ==========
  userSchemeApplications: {
    getAll: async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_scheme_applications')
        .select(`
          *,
          government_schemes (
            scheme_name,
            scheme_code,
            scheme_type,
            benefits
          )
        `)
        .eq('user_id', userId)
        .order('application_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    getBySchemeId: async (schemeId: string) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_scheme_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('scheme_id', schemeId)
        .order('application_date', { ascending: false });

  if (error) throw error;
  return data || [];
    },

    create: async (data: {
      scheme_id: string;
      application_date: string;
      application_status?: string;
      documents_submitted?: any;
      application_notes?: string;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const applicationData = {
        user_id: userId,
        scheme_id: data.scheme_id,
        application_date: data.application_date,
        application_status: data.application_status || 'submitted',
        documents_submitted: data.documents_submitted || null,
        application_notes: data.application_notes || null,
      };

      const { data: created, error } = await supabase
        .from('user_scheme_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;
      return created;
    },

    update: async (id: number, updates: {
      application_status?: string;
      documents_submitted?: any;
      documents_verified?: any;
      approval_date?: string;
      disbursement_date?: string;
      benefit_received?: number;
      application_notes?: string;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_scheme_applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // ========== EXECUTED ACTIONS ==========
  actions: {
    getAll: async (filters?: {
      status?: string;
      date_range?: 'today' | 'upcoming' | 'ongoing' | 'completed';
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');
      
      let query = supabase
        .from('executed_actions')
    .select('*')
    .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.date_range === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('next_execution', today).or('next_execution.is.null');
      } else if (filters?.date_range === 'upcoming') {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        query = query.gte('next_execution', today.toISOString().split('T')[0])
          .lte('next_execution', nextWeek.toISOString().split('T')[0]);
      } else if (filters?.date_range === 'ongoing') {
        query = query.eq('status', 'active').neq('schedule', 'once');
      } else if (filters?.date_range === 'completed') {
        query = query.eq('status', 'completed');
      }
      
      const { data, error } = await query;
  if (error) throw error;
      return data || [];
    },

    create: async (data: {
      action_type: string;
      action_description: string;
      amount: number;
      target_date?: string;
      schedule?: string;
      status?: string;
    }) => {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const today = new Date();
      const targetDate = data.target_date ? new Date(data.target_date) : today;
      
      // Determine next_execution date
      let nextExecution: string;
      if (data.schedule === 'once') {
        // For one-time actions, use target date or today
        nextExecution = targetDate.toISOString().split('T')[0];
      } else if (data.schedule === 'daily') {
        // For daily, start today
        nextExecution = today.toISOString().split('T')[0];
      } else if (data.schedule === 'weekly') {
        // For weekly, use target date or next week
        nextExecution = targetDate.toISOString().split('T')[0];
      } else if (data.schedule === 'monthly') {
        // For monthly, use target date or next month
        nextExecution = targetDate.toISOString().split('T')[0];
      } else {
        // Default to today
        nextExecution = today.toISOString().split('T')[0];
      }

      const actionData = {
        user_id: userId,
        action_type: data.action_type,
        action_description: data.action_description,
        amount: data.amount,
        status: data.status || 'pending',
        schedule: data.schedule || 'once',
        next_execution: nextExecution,
        user_approved: false,
        is_reversible: true,
      };

      const { data: created, error } = await supabase
        .from('executed_actions')
        .insert(actionData)
        .select()
        .single();

      if (error) throw error;
      return created;
    },
  },
};

export default db;
