import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

/* ── Inline style tokens ── */
const S = {
  surface:  "hsl(215 56% 12%)",
  surface2: "hsl(215 49% 15%)",
  border:   "hsl(210 46% 19%)",
  cyan:     "#00D4FF",
  green:    "#00FF88",
  danger:   "#FF3366",
  textPri:  "#E8F4FF",
  textSec:  "#6B8CAE",
};

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

  const income  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

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
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: S.cyan }} />
          <p className="text-sm" style={{ color: S.textSec }}>Loading your command centre…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const emoji = occupationEmoji[user.occupation ?? ""] ?? "💼";

  return (
    <div className="space-y-6 pb-24 md:pb-8 page-in">

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-3 text-sm"
          style={{ background: "rgba(255,51,102,0.12)", border: "1px solid rgba(255,51,102,0.3)", color: S.danger }}
        >
          {error}
        </motion.div>
      )}

      {/* Greeting + Period Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-sm" style={{ color: S.textSec }}>{getGreeting()}</p>
          <h1 className="text-3xl font-bold font-display mt-0.5" style={{ color: S.textPri }}>
            {user.name?.split(" ")[0] ?? "User"} 👋
          </h1>
          {user.occupation && (
            <span
              className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,212,255,0.10)", border: "1px solid rgba(0,212,255,0.2)", color: S.cyan }}
            >
              {emoji} {user.occupation}
              {(user as any).city ? ` · ${(user as any).city}` : ""}
            </span>
          )}
        </div>

        {/* Period pill toggle */}
        <div
          className="flex rounded-lg p-1 gap-0.5"
          style={{ background: S.surface }}
        >
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={
                period === p
                  ? { background: S.surface2, color: S.textPri, boxShadow: "0 0 8px rgba(0,212,255,0.12)" }
                  : { color: S.textSec }
              }
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        whileHover={{ scale: 1.01, y: -3 }}
        className="group"
      >
        <div
          className="relative overflow-hidden rounded-lg p-7"
          style={{
            background: S.surface,
            border: "1px solid rgba(0,212,255,0.20)",
            boxShadow: "0 0 30px rgba(0,212,255,0.08)",
          }}
        >
          {/* Ambient cyan glow */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: S.textSec }}>
              Total Balance
            </p>
            <p className="text-5xl font-black mt-1 mb-4 font-display data-value" style={{ color: S.textPri }}>
              ₹{user.balance?.toLocaleString("en-IN") ?? "0"}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs" style={{ color: S.textSec }}>{periodLabel[period]} Net</p>
                <p className="text-xl font-bold data-value" style={{ color: net >= 0 ? S.green : S.danger }}>
                  {net >= 0 ? "+" : ""}₹{net.toLocaleString("en-IN")}
                </p>
              </div>
              {prevNet !== 0 && (
                <div
                  className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full"
                  style={deltaPositive
                    ? { background: "rgba(0,255,136,0.12)", color: S.green }
                    : { background: "rgba(255,51,102,0.12)", color: S.danger }}
                >
                  {deltaPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {deltaPositive ? "+" : ""}₹{Math.abs(deltaAmt).toLocaleString("en-IN")} vs last
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Income / Expense Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Income",   value: income,  color: S.green,  icon: TrendingUp,  glow: "rgba(0,255,136,0.08)" },
          { label: "Expenses", value: expense, color: S.danger, icon: TrendingDown, glow: "rgba(255,51,102,0.08)" },
        ].map(({ label, value, color, icon: Icon, glow }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }}
          >
            <div
              className="p-5 rounded-lg"
              style={{ background: S.surface, border: `1px solid ${color}30`, boxShadow: `0 0 16px ${glow}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: S.textSec }}>{label}</p>
              </div>
              <p className="text-2xl font-bold data-value" style={{ color }}>₹{value.toLocaleString("en-IN")}</p>
              <p className="text-xs mt-0.5" style={{ color: S.textSec }}>{periodLabel[period]}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Goal */}
      {period === "today" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div
            className="p-5 rounded-lg"
            style={{ background: S.surface, border: "1px solid rgba(0,212,255,0.15)" }}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: S.textSec }}>
                  Daily Savings Goal
                </p>
                <p className="text-2xl font-bold data-value mt-0.5" style={{ color: S.cyan }}>₹{dailyGoal}</p>
              </div>
              <span className="text-4xl">{goalProgress >= 100 ? "🎉" : "🎯"}</span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-2 mb-2 [&>div]:bg-[#00D4FF]" />
            <p className="text-xs" style={{ color: S.textSec }}>
              {goalProgress >= 100
                ? "Goal achieved! Great work today!"
                : `${Math.round(goalProgress)}% of daily goal reached`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-display" style={{ color: S.textPri }}>Recent Transactions</h2>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: S.cyan }}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTxns.length === 0 ? (
          <div
            className="p-10 text-center rounded-lg"
            style={{ background: S.surface, border: "1px solid hsl(210 46% 19%)" }}
          >
            <div className="text-5xl mb-3">📊</div>
            <p className="font-semibold" style={{ color: S.textPri }}>No transactions yet</p>
            <p className="text-sm mt-1" style={{ color: S.textSec }}>Tap the + button to log your first earning or expense</p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-lg"
            style={{ background: S.surface, border: "1px solid hsl(210 46% 19%)" }}
          >
            <div className="divide-y" style={{ borderColor: "hsl(210 46% 19%)" }}>
              {recentTxns.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.04 }}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors"
                  style={{ borderBottom: "1px solid hsl(210 46% 19%)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = S.surface2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={
                        t.type === "income"
                          ? { background: "rgba(0,255,136,0.12)", color: S.green }
                          : { background: "rgba(255,51,102,0.12)", color: S.danger }
                      }
                    >
                      {t.type === "income" ? "+" : "−"}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: S.textPri }}>{t.category}</p>
                      <p className="text-xs" style={{ color: S.textSec }}>{t.date}{t.time ? ` · ${t.time}` : ""}</p>
                    </div>
                  </div>
                  <p
                    className="font-bold text-sm data-value"
                    style={{ color: t.type === "income" ? S.green : S.danger }}
                  >
                    {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                  </p>
                </motion.div>
              ))}
            </div>
            <div
              className="px-4 py-3 text-center"
              style={{ background: S.surface2, borderTop: "1px solid hsl(210 46% 19%)" }}
            >
              <button
                onClick={() => navigate("/transactions")}
                className="text-xs font-semibold flex items-center gap-1 mx-auto"
                style={{ color: S.cyan }}
              >
                See all transactions <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
