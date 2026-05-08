import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const occupationEmoji: Record<string, string> = {
  "Cab Driver": "🚗", "Uber Driver": "🚗", "Ola Driver": "🚗",
  "Food Delivery": "🛵", "Swiggy Partner": "🛵", "Zomato Partner": "🛵",
  "Home Services": "🏠", "Freelancer": "💻", "Other": "💼",
};

type Period = "today" | "week" | "month";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const periodLabel: Record<Period, string> = { today: "Today", week: "This Week", month: "This Month" };

const Dashboard = () => {
  const { user, transactions, dailyGoal, goalProgress, isLoading, isAuthenticated, error } = useApp();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("today");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/signup");
  }, [isLoading, isAuthenticated, navigate]);

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "today") return t.date === now.toISOString().split("T")[0];
      if (period === "week") {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
      return d >= monthAgo;
    });
  }, [transactions, period]);

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  // Compare with previous period for delta
  const prevFiltered = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "today") {
        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
        return t.date === yesterday.toISOString().split("T")[0];
      }
      if (period === "week") {
        const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return d >= twoWeeksAgo && d < weekAgo;
      }
      const twoMonthsAgo = new Date(now); twoMonthsAgo.setMonth(now.getMonth() - 2);
      const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
      return d >= twoMonthsAgo && d < monthAgo;
    });
  }, [transactions, period]);

  const prevNet = prevFiltered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
    - prevFiltered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const deltaAmt = net - prevNet;
  const deltaPositive = deltaAmt >= 0;

  const recentTxns = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const emoji = occupationEmoji[user.occupation || ""] || "💼";

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </motion.div>
      )}

      {/* Greeting + Period Toggle */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-muted-foreground text-sm">{getGreeting()}</p>
          <h1 className="text-3xl font-bold mt-0.5">{user.name?.split(" ")[0] || "User"} 👋</h1>
          {user.occupation && (
            <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {emoji} {user.occupation}{user.phone ? "" : ""}{user.occupation && (user as any).city ? ` · ${(user as any).city}` : ""}
            </span>
          )}
        </div>

        {/* Period pill toggle */}
        <div className="flex bg-muted rounded-xl p-1 gap-0.5">
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                period === p ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
        whileHover={{ scale: 1.01, y: -3 }} className="group">
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-7">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full -ml-36 -mb-36 blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-semibold opacity-75 uppercase tracking-widest">Total Balance</p>
            <p className="text-5xl font-black mt-1 mb-4">₹{user.balance?.toLocaleString("en-IN") ?? "0"}</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs opacity-75">{periodLabel[period]} Net</p>
                <p className="text-xl font-bold">{net >= 0 ? "+" : ""}₹{net.toLocaleString("en-IN")}</p>
              </div>
              {prevNet !== 0 && (
                <div className={cn("flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full",
                  deltaPositive ? "bg-white/20" : "bg-red-400/30")}>
                  {deltaPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {deltaPositive ? "+" : ""}₹{Math.abs(deltaAmt).toLocaleString("en-IN")} vs last
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Income / Expense Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Income", value: income, color: "text-green-600 dark:text-green-400", bg: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950", icon: TrendingUp },
          { label: "Expenses", value: expense, color: "text-red-600 dark:text-red-400", bg: "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950", icon: TrendingDown },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }}>
            <Card className={`p-5 bg-gradient-to-br ${bg} border-0 shadow-md`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>₹{value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{periodLabel[period]}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily Goal (shown only for "today") */}
      {period === "today" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Daily Savings Goal</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">₹{dailyGoal}</p>
              </div>
              <span className="text-4xl">{goalProgress >= 100 ? "🎉" : "🎯"}</span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {goalProgress >= 100 ? "Goal achieved! Great work today!" : `${Math.round(goalProgress)}% of daily goal reached`}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <button onClick={() => navigate("/transactions")}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTxns.length === 0 ? (
          <Card className="p-10 text-center border-0 shadow-md bg-muted/40">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-semibold text-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Tap the + button to log your first earning or expense</p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="divide-y divide-border/50">
              {recentTxns.map((t, i) => (
                <motion.div key={t.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 + i * 0.04 }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                      t.type === "income"
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400")}>
                      {t.type === "income" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.category}</p>
                      <p className="text-xs text-muted-foreground">{t.date}{t.time ? ` · ${t.time}` : ""}</p>
                    </div>
                  </div>
                  <p className={cn("font-bold text-sm",
                    t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-3 bg-muted/30 text-center">
              <button onClick={() => navigate("/transactions")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mx-auto">
                See all transactions <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
