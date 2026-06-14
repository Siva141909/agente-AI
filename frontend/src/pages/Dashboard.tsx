import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, ArrowRight, Loader2,
  Plus, BarChart3, Wallet, Lightbulb, FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import TransactionModal from "@/components/TransactionModal";

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

const S = {
  surface:  "hsl(215 56% 12%)",
  surface2: "hsl(215 49% 15%)",
  border:   "hsl(210 46% 19%)",
  cyan:     "#00D4FF",
  green:    "#00FF88",
  danger:   "#FF3366",
  violet:   "#7B2FFF",
  textPri:  "#E8F4FF",
  textSec:  "#6B8CAE",
};

const Dashboard = () => {
  const { user, transactions, recommendations, dailyGoal, goalProgress, isLoading, isAuthenticated, error } = useApp();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("today");
  const [txOpen, setTxOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/signup");
  }, [isLoading, isAuthenticated, navigate]);

  /* ── Period-filtered transactions ── */
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

  /* ── Previous period for delta ── */
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

  /* ── Last 5 transactions ── */
  const recentTxns = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [transactions],
  );

  /* ── 7-day income sparkline ── */
  const incomeTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayIncome = transactions
        .filter(t => t.date === dateStr && t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), income: dayIncome };
    });
  }, [transactions]);

  /* ── Top pending AI tips ── */
  const topTips = useMemo(
    () => recommendations.filter(r => !r.status || r.status === "pending").slice(0, 3),
    [recommendations],
  );

  /* ── Quick nav actions ── */
  const quickActions = [
    { icon: BarChart3, label: "Analytics", sub: "Trends & charts", path: "/stats",        color: S.cyan },
    { icon: Wallet,    label: "Budget",    sub: "Spending plan",   path: "/budget",       color: "#7B2FFF" },
    { icon: Lightbulb, label: "AI Tips",   sub: "Recommendations", path: "/tips",         color: "#FFD700" },
    { icon: FileText,  label: "Tax",       sub: "ITR & filing",    path: "/tax",          color: S.green },
  ];

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

      {/* ── Row 1: Greeting + Period toggle + Add CTA ── */}
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

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period toggle */}
          <div className="flex rounded-lg p-1 gap-0.5" style={{ background: S.surface }}>
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

          {/* Primary CTA */}
          <Button
            onClick={() => setTxOpen(true)}
            className="flex items-center gap-2 font-semibold"
            style={{ background: S.cyan, color: "#070D1A", boxShadow: "0 0 20px rgba(0,212,255,0.30)" }}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      {/* ── Row 2: 4 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-1 relative overflow-hidden rounded-lg p-5 col-span-2"
          style={{ background: S.surface, border: "1px solid rgba(0,212,255,0.20)", boxShadow: "0 0 30px rgba(0,212,255,0.08)" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: S.textSec }}>Total Balance</p>
          <p className="text-4xl font-black mt-1 font-display data-value" style={{ color: S.textPri }}>
            ₹{user.balance?.toLocaleString("en-IN") ?? "0"}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-sm font-semibold data-value" style={{ color: net >= 0 ? S.green : S.danger }}>
              {net >= 0 ? "+" : ""}₹{net.toLocaleString("en-IN")} net
            </p>
            {prevNet !== 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={deltaPositive
                  ? { background: "rgba(0,255,136,0.12)", color: S.green }
                  : { background: "rgba(255,51,102,0.12)", color: S.danger }}>
                {deltaPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                vs last
              </span>
            )}
          </div>
        </motion.div>

        {/* Income */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-lg p-5"
          style={{ background: S.surface, border: "1px solid rgba(0,255,136,0.20)", boxShadow: "0 0 16px rgba(0,255,136,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: S.green }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: S.textSec }}>Income</p>
          </div>
          <p className="text-2xl font-bold data-value" style={{ color: S.green }}>₹{income.toLocaleString("en-IN")}</p>
          <p className="text-xs mt-0.5" style={{ color: S.textSec }}>{periodLabel[period]}</p>
        </motion.div>

        {/* Expenses */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
          className="rounded-lg p-5"
          style={{ background: S.surface, border: "1px solid rgba(255,51,102,0.20)", boxShadow: "0 0 16px rgba(255,51,102,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4" style={{ color: S.danger }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: S.textSec }}>Expenses</p>
          </div>
          <p className="text-2xl font-bold data-value" style={{ color: S.danger }}>₹{expense.toLocaleString("en-IN")}</p>
          <p className="text-xs mt-0.5" style={{ color: S.textSec }}>{periodLabel[period]}</p>
        </motion.div>

        {/* Daily Goal */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-lg p-5"
          style={{ background: S.surface, border: "1px solid rgba(0,212,255,0.15)", opacity: period !== "today" ? 0.6 : 1 }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: S.textSec }}>Daily Goal</p>
            <span className="text-lg">{goalProgress >= 100 ? "🎉" : "🎯"}</span>
          </div>
          <p className="text-2xl font-bold data-value" style={{ color: S.cyan }}>₹{dailyGoal}</p>
          <Progress value={Math.min(goalProgress, 100)} className="h-1.5 mt-2 mb-1 [&>div]:bg-[#00D4FF]" />
          <p className="text-xs" style={{ color: S.textSec }}>
            {period !== "today" ? "Today's target" : `${Math.round(goalProgress)}% reached`}
          </p>
        </motion.div>
      </div>

      {/* ── Row 3: 8-col Area Chart + 4-col AI Tips Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Area Chart — 8 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="lg:col-span-8 rounded-lg p-6"
          style={{ background: S.surface, border: `1px solid ${S.border}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold font-display" style={{ color: S.textPri }}>7-Day Income Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: S.textSec }}>Daily earnings this week</p>
            </div>
          </div>
          {incomeTrend.some(d => d.income > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={incomeTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={S.cyan} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={S.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={S.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: S.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: S.textSec, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: S.surface2, border: `1px solid ${S.border}`, borderRadius: 8, color: S.textPri }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Income"]}
                />
                <Area type="monotone" dataKey="income" stroke={S.cyan} strokeWidth={2}
                  fill="url(#incomeGrad)" dot={{ fill: S.cyan, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2">
              <p className="text-3xl">📈</p>
              <p className="text-sm font-medium" style={{ color: S.textPri }}>No income logged this week</p>
              <button
                onClick={() => setTxOpen(true)}
                className="text-xs font-semibold underline"
                style={{ color: S.cyan }}
              >
                Add your first earning →
              </button>
            </div>
          )}
        </motion.div>

        {/* AI Tips Panel — 4 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="lg:col-span-4 rounded-lg p-5 flex flex-col"
          style={{ background: S.surface, border: `1px solid ${S.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-display" style={{ color: S.textPri }}>AI Agent Tips</h2>
            <button onClick={() => navigate("/tips")} className="text-xs font-semibold" style={{ color: S.cyan }}>
              All tips →
            </button>
          </div>

          {topTips.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
              <span className="text-3xl">🤖</span>
              <p className="text-sm text-center font-medium" style={{ color: S.textPri }}>No tips yet</p>
              <p className="text-xs text-center" style={{ color: S.textSec }}>Add transactions and the AI will generate personalised advice</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {topTips.map((tip, i) => {
                const priorityStyle =
                  tip.priority?.toLowerCase() === "high"
                    ? { background: "rgba(255,51,102,0.10)", color: "#FF3366", border: "1px solid rgba(255,51,102,0.25)" }
                    : tip.priority?.toLowerCase() === "medium"
                    ? { background: "rgba(255,215,0,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" }
                    : { background: "rgba(0,212,255,0.08)", color: S.cyan, border: "1px solid rgba(0,212,255,0.2)" };
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="p-3 rounded-lg cursor-pointer"
                    style={{ background: S.surface2, border: `1px solid ${S.border}` }}
                    onClick={() => navigate("/tips")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={priorityStyle}>
                        {tip.priority}
                      </span>
                    </div>
                    <p className="text-xs font-semibold line-clamp-2" style={{ color: S.textPri }}>{tip.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: S.textSec }}>{tip.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 4: 8-col Recent Transactions + 4-col Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Transactions — 8 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold font-display" style={{ color: S.textPri }}>Recent Transactions</h2>
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
              style={{ background: S.surface, border: `1px solid ${S.border}` }}
            >
              <div className="text-5xl mb-3">📊</div>
              <p className="font-semibold" style={{ color: S.textPri }}>No transactions yet</p>
              <p className="text-sm mt-1 mb-4" style={{ color: S.textSec }}>Add your first earning or expense to get started</p>
              <Button onClick={() => setTxOpen(true)} size="sm"
                style={{ background: S.cyan, color: "#070D1A" }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />Add Transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <div className="divide-y" style={{ borderColor: S.border }}>
                {recentTxns.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.04 }}
                    className="flex items-center justify-between px-4 py-3.5 transition-colors cursor-pointer"
                    onMouseEnter={(e) => (e.currentTarget.style.background = S.surface2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => navigate("/transactions")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
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
                    <p className="font-bold text-sm data-value" style={{ color: t.type === "income" ? S.green : S.danger }}>
                      {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-3 text-center" style={{ background: S.surface2, borderTop: `1px solid ${S.border}` }}>
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

        {/* Quick Actions — 4 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="lg:col-span-4"
        >
          <h2 className="text-base font-bold font-display mb-3" style={{ color: S.textPri }}>Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, sub, path, color }, i) => (
              <motion.button
                key={path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + i * 0.04 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                className="flex flex-col items-start gap-2 p-4 rounded-lg text-left"
                style={{ background: S.surface, border: `1px solid ${S.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = color + "50")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = S.border)}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: color + "15" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: S.textPri }}>{label}</p>
                  <p className="text-[10px]" style={{ color: S.textSec }}>{sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} />
    </div>
  );
};

export default Dashboard;
