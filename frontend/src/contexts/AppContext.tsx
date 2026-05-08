import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { TokenManager } from "@/services/api";
import db from "@/services/database";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  occupation?: string;
  created_at: string;
  updated_at: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  time: string;
  date: string;
  description?: string;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low" | "High" | "Medium" | "Low" | "Alert" | "Opportunity";
  title: string;
  description: string;
  reason?: string;
  status?: "pending" | "accepted" | "later";
  impact?: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  recommendations: Recommendation[];
  updateRecommendationStatus: (id: string, status: "accepted" | "later") => void;
  dailyGoal: number;
  goalProgress: number;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (phone: string, password: string, full_name: string, occupation: string, city: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not authenticated');

      const [userData, transactionsData] = await Promise.all([
        db.users.getMe(),
        db.transactions.getAll(),
      ]);

      const balance = transactionsData.reduce((sum, t) => {
        return sum + (t.transaction_type === "income" ? t.amount : -t.amount);
      }, 0);

      let recommendationsData: any[] = [];
      try { recommendationsData = await db.recommendations.getAll(); } catch {}

      setUser({
        id: userData.user_id,
        email: userData.email || "",
        name: userData.full_name || "User",
        phone: userData.phone_number,
        occupation: userData.occupation,
        created_at: userData.created_at,
        updated_at: userData.created_at,
        balance,
      });

      setTransactions(transactionsData.map((t) => ({
        id: t.transaction_id,
        category: t.category || "Other",
        amount: t.amount,
        date: t.transaction_date,
        time: t.transaction_time || "",
        type: t.transaction_type as "income" | "expense",
        description: t.description || "",
      })));

      setRecommendations(recommendationsData.map((r) => ({
        id: r.recommendation_id || r.id,
        title: r.title,
        description: r.description || "",
        priority: (r.priority?.toLowerCase() || "medium") as Recommendation["priority"],
        reason: r.reasoning || "",
        status: (r.status || "pending") as "pending" | "accepted" | "later",
      })));
    } catch (err) {
      console.error("Error loading user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bootstrap: check Supabase session on mount and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        localStorage.setItem('user_id', session.user.id);
        if (session.access_token) TokenManager.set(session.access_token);
        setIsAuthenticated(true);
        await loadUserData();
      } else {
        setIsLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          localStorage.setItem('user_id', session.user.id);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user_id');
          setIsAuthenticated(false);
          setUser(null);
          setTransactions([]);
          setRecommendations([]);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          localStorage.setItem('user_id', session.user.id);
          if (session.access_token) TokenManager.set(session.access_token);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const dailyGoal = 300;
  const today = new Date().toISOString().split("T")[0];
  const todayTxns = transactions.filter((t) => t.date === today);
  const todayIncome = todayTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const goalProgress = Math.min(Math.max(((todayIncome - todayExpense) / dailyGoal) * 100, 0), 100);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setError(null);
      if (!isAuthenticated) throw new Error("Please login to add transactions");
      const newTxn = await db.transactions.create({
        amount: transaction.amount,
        transaction_type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        transaction_date: transaction.date,
        transaction_time: transaction.time,
      });
      const mapped: Transaction = {
        id: newTxn.transaction_id || newTxn.id,
        category: newTxn.category || transaction.category,
        amount: newTxn.amount,
        date: newTxn.transaction_date || transaction.date,
        time: newTxn.transaction_time || transaction.time,
        type: (newTxn.transaction_type || transaction.type) as "income" | "expense",
        description: newTxn.description || transaction.description,
      };
      setTransactions([mapped, ...transactions]);
      setUser(user ? { ...user, balance: user.balance + (transaction.type === "income" ? transaction.amount : -transaction.amount) } : null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add transaction";
      setError(msg);
      throw err;
    }
  };

  const updateRecommendationStatus = (id: string, status: "accepted" | "later") => {
    setRecommendations(recommendations.map((r) => r.id === id ? { ...r, status } : r));
  };

  const login = async (phone: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await db.auth.login(phone, password);
      setIsAuthenticated(true);
      await loadUserData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (phone: string, password: string, full_name: string, occupation: string, city: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await db.auth.signup(phone, password, full_name, occupation, city);
      setIsAuthenticated(true);
      await loadUserData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await db.auth.logout();
    navigate("/");
  };

  const refreshData = async () => {
    if (isAuthenticated) await loadUserData();
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      transactions, addTransaction,
      recommendations, updateRecommendationStatus,
      dailyGoal, goalProgress,
      isLoading, error,
      isAuthenticated,
      login, signup, logout,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
