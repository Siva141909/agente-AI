import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { SkeletonChart } from "@/components/ui/skeleton-card";
import { format, subDays } from "date-fns";
import db from "@/services/database";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from "recharts";

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

const CHART_COLORS = ["#00D4FF", "#7B2FFF", "#00FF88", "#FF6B35", "#FF3366", "#FFD700", "#00BFFF"];

const tooltipStyle = {
  backgroundColor: "hsl(215 56% 12%)",
  border: "1px solid hsl(210 46% 19%)",
  color: "#E8F4FF",
};

const Stats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [incomeExpenseDateRange, setIncomeExpenseDateRange] = useState({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [stats, setStats] = useState({
    total_income: 0, total_expense: 0,
    expense_by_category: [] as any[],
    income_vs_expense: [] as any[],
    income_trend: [] as any[],
    emergency_fund: { current: 0, target: 0, percentage: 0, months_covered: 0 },
  });

  useEffect(() => { loadStats(); }, [dateRange, groupBy, incomeExpenseDateRange]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const transactions = await db.transactions.getAll({
        date_start: format(dateRange.from, "yyyy-MM-dd"),
        date_end: format(dateRange.to, "yyyy-MM-dd"),
      });

      const income  = transactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expense = transactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);

      const categoryMap = new Map<string, number>();
      transactions.filter(t => t.transaction_type === "expense" && t.category).forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Number(t.amount));
      });
      const expenseByCategory = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount, percentage: expense > 0 ? (amount / expense) * 100 : 0 }))
        .sort((a, b) => b.amount - a.amount);

      const incomeExpenseTransactions = await db.transactions.getAll({
        date_start: format(incomeExpenseDateRange.from, "yyyy-MM-dd"),
        date_end: format(incomeExpenseDateRange.to, "yyyy-MM-dd"),
      });
      const dayMap = new Map<string, { income: number; expense: number }>();
      incomeExpenseTransactions.forEach(t => {
        if (!dayMap.has(t.transaction_date)) dayMap.set(t.transaction_date, { income: 0, expense: 0 });
        const day = dayMap.get(t.transaction_date)!;
        if (t.transaction_type === "income") day.income += Number(t.amount);
        else day.expense += Number(t.amount);
      });
      const allDays: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(incomeExpenseDateRange.from);
        d.setDate(d.getDate() + i);
        allDays.push(format(d, "yyyy-MM-dd"));
      }
      const incomeVsExpense = allDays.map(dateStr => {
        const d = dayMap.get(dateStr) || { income: 0, expense: 0 };
        return { date: format(new Date(dateStr), "MMM dd"), income: d.income, expense: d.expense };
      });

      const incomeByDay = transactions.filter(t => t.transaction_type === "income").reduce((m, t) => {
        m.set(t.transaction_date, (m.get(t.transaction_date) || 0) + Number(t.amount));
        return m;
      }, new Map<string, number>());
      const incomeTrend = Array.from(incomeByDay.entries())
        .map(([date, amount]) => ({ date: format(new Date(date), "MMM dd"), amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let emergencyFund = { current: 0, target: 0, percentage: 0, months_covered: 0 };
      try {
        const profile = await db.users.getProfile();
        emergencyFund = {
          current: Number(profile.current_emergency_fund) || 0,
          target: Number(profile.emergency_fund_target) || 0,
          percentage: profile.emergency_fund_target
            ? (Number(profile.current_emergency_fund) / Number(profile.emergency_fund_target)) * 100 : 0,
          months_covered: profile.monthly_expenses_avg
            ? Number(profile.current_emergency_fund) / Number(profile.monthly_expenses_avg) : 0,
        };
      } catch {}

      setStats({ total_income: income, total_expense: expense, expense_by_category: expenseByCategory, income_vs_expense: incomeVsExpense, income_trend: incomeTrend, emergency_fund: emergencyFund });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-6 pb-24 md:pb-8"><SkeletonChart /><SkeletonChart /><SkeletonChart /></div>;
  }

  return (
    <div className="space-y-6 page-in">

      {/* ── Sticky filter header ── */}
      <div
        className="sticky top-0 z-20 p-4 rounded-lg"
        style={{ background: S.surface, border: `1px solid ${S.border}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <h1 className="text-2xl font-bold font-display mr-auto" style={{ color: S.textPri }}>Statistics</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[240px] justify-start font-normal" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                <CalendarIcon className="mr-2 h-4 w-4" style={{ color: S.textSec }} />
                {format(dateRange.from, "MMM dd")} – {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <Calendar
                initialFocus mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(r) => setDateRange({ from: r?.from || dateRange.from, to: r?.to || dateRange.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
            <SelectTrigger className="w-full md:w-[130px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Chart 1: Income vs Expenses bar (full width) ── */}
      <div className="p-6 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display" style={{ color: S.textPri }}>Income vs Expenses</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-[12px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textSec }}>
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {format(incomeExpenseDateRange.from, "MMM dd")} – {format(incomeExpenseDateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <Calendar
                initialFocus mode="range"
                defaultMonth={incomeExpenseDateRange.from}
                selected={{ from: incomeExpenseDateRange.from, to: incomeExpenseDateRange.to }}
                onSelect={(r) => {
                  if (r?.from) {
                    const start = r.from;
                    const end = new Date(start); end.setDate(end.getDate() + 6);
                    const today = new Date(); today.setHours(23, 59, 59, 999);
                    setIncomeExpenseDateRange({ from: start, to: end > today ? today : end });
                  }
                }}
                numberOfMonths={1}
                disabled={(date) => { const t = new Date(); t.setHours(23, 59, 59, 999); return date > t; }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {stats.income_vs_expense.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.income_vs_expense}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.border} />
              <XAxis dataKey="date" stroke={S.textSec} tick={{ fill: S.textSec, fontSize: 12 }} />
              <YAxis stroke={S.textSec} tick={{ fill: S.textSec, fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Legend />
              <Bar dataKey="income" fill={S.green} name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill={S.danger} name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center" style={{ color: S.textSec }}>No data for selected period</div>
        )}
      </div>

      {/* ── Charts 2 & 3: Income Trend + Expense Pie (side by side) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <h3 className="text-lg font-semibold font-display mb-4" style={{ color: S.textPri }}>Income Trend</h3>
          {stats.income_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.income_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={S.border} />
                <XAxis dataKey="date" stroke={S.textSec} tick={{ fill: S.textSec, fontSize: 12 }} />
                <YAxis stroke={S.textSec} tick={{ fill: S.textSec, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Line type="monotone" dataKey="amount" stroke={S.cyan} strokeWidth={2} dot={{ fill: S.cyan, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center" style={{ color: S.textSec }}>No income data</div>
          )}
        </div>

        <div className="p-6 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <h3 className="text-lg font-semibold font-display mb-4" style={{ color: S.textPri }}>Expenses by Category</h3>
          {stats.expense_by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.expense_by_category} cx="50%" cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                  outerRadius={80} dataKey="amount"
                >
                  {stats.expense_by_category.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center" style={{ color: S.textSec }}>No expense data</div>
          )}
        </div>
      </div>

      {/* ── Emergency Fund (unique to this page) ── */}
      <div className="p-6 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold font-display" style={{ color: S.textPri }}>Emergency Fund</h3>
            <p className="text-sm" style={{ color: S.textSec }}>Set targets in Profile → Financial Profile</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold data-value" style={{ color: S.cyan }}>
              {stats.emergency_fund.months_covered.toFixed(1)} <span className="text-sm font-normal" style={{ color: S.textSec }}>months</span>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: S.textSec }}>Current</span>
            <span className="font-semibold data-value" style={{ color: S.green }}>₹{stats.emergency_fund.current.toLocaleString("en-IN")}</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: S.surface2 }}>
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${Math.min(stats.emergency_fund.percentage, 100)}%`, background: `linear-gradient(90deg, ${S.cyan}, ${S.green})` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: S.textSec }}>Target</span>
            <span className="data-value" style={{ color: S.textSec }}>₹{stats.emergency_fund.target.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
