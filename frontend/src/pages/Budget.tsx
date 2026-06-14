import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, X, Loader2 } from "lucide-react";
import { SkeletonCard, SkeletonStat } from "@/components/ui/skeleton-card";
import { useNavigate } from "react-router-dom";
import db from "@/services/database";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";
import PageIntro from "@/components/PageIntro";
import HelpTooltip from "@/components/HelpTooltip";

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

const Budget = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [activeBudget, setActiveBudget] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    budget_type: "monthly",
    valid_from: format(new Date(), "yyyy-MM-dd"),
    valid_until: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    total_income_expected: "",
    savings_target: "",
    discretionary_budget: "",
    fixed_costs: [] as Array<{ name: string; amount: string }>,
    variable_costs: [] as Array<{ category: string; amount: string }>,
    category_limits: [] as Array<{ category: string; limit: string }>,
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeBudget) loadTransactionsForBudget(); }, [activeBudget?.budget_id]);
  useEffect(() => {
    const handle = () => { if (activeBudget) loadTransactionsForBudget(); };
    window.addEventListener("focus", handle);
    return () => window.removeEventListener("focus", handle);
  }, [activeBudget]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const budgetsData = await db.budgets.getAll();
      setBudgets(budgetsData);
      const active = await db.budgets.getActive();
      setActiveBudget(active);
      if (active) await loadTransactionsForBudget(active);
      else {
        const tData = await db.transactions.getAll({ date_start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") });
        setTransactions(tData);
      }
    } catch (error) {
      console.error("Failed to load budget data:", error);
      toast.error("Failed to load budget data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactionsForBudget = async (budget?: any) => {
    const b = budget || activeBudget;
    if (!b) return;
    try {
      const data = await db.transactions.getAll({
        date_start: format(new Date(b.valid_from), "yyyy-MM-dd"),
        date_end: format(new Date(b.valid_until), "yyyy-MM-dd"),
      });
      setTransactions(data);
    } catch {}
  };

  const calculateActualSpending = (category: string) => {
    if (!category) return 0;
    return transactions.filter(t => t.transaction_type === "expense" && (t.category || "").toLowerCase().trim() === category.toLowerCase().trim()).reduce((s, t) => s + Number(t.amount || 0), 0);
  };

  useEffect(() => {
    if (activeBudget && isEditOpen) {
      let validFrom = format(new Date(), "yyyy-MM-dd");
      let validUntil = format(addMonths(new Date(), 1), "yyyy-MM-dd");
      try {
        if (activeBudget.valid_from) { const d = new Date(activeBudget.valid_from); if (!isNaN(d.getTime())) validFrom = format(d, "yyyy-MM-dd"); }
        if (activeBudget.valid_until) { const d = new Date(activeBudget.valid_until); if (!isNaN(d.getTime())) validUntil = format(d, "yyyy-MM-dd"); }
      } catch {}
      setFormData({
        budget_type: activeBudget.budget_type || "monthly",
        valid_from: validFrom, valid_until: validUntil,
        total_income_expected: String(activeBudget.total_income_expected || ""),
        savings_target: String(activeBudget.savings_target || ""),
        discretionary_budget: String(activeBudget.discretionary_budget || ""),
        fixed_costs: Object.entries(activeBudget.fixed_costs || {}).map(([name, amount]) => ({ name, amount: String(amount) })),
        variable_costs: Object.entries(activeBudget.variable_costs || {}).map(([category, amount]) => ({ category, amount: String(amount) })),
        category_limits: Object.entries(activeBudget.category_limits || {}).map(([category, limit]) => ({ category, limit: String(limit) })),
      });
    } else if (!activeBudget && isEditOpen) {
      setFormData({ budget_type: "monthly", valid_from: format(new Date(), "yyyy-MM-dd"), valid_until: format(addMonths(new Date(), 1), "yyyy-MM-dd"), total_income_expected: "", savings_target: "", discretionary_budget: "", fixed_costs: [], variable_costs: [], category_limits: [] });
    }
  }, [activeBudget, isEditOpen]);

  const handleSaveBudget = async () => {
    if (!formData.total_income_expected || !formData.valid_from || !formData.valid_until) { toast.error("Fill in all required fields"); return; }
    try {
      setIsSaving(true);
      const fixedCostsObj: Record<string, number> = {};
      formData.fixed_costs.forEach(c => { if (c.name && c.amount) fixedCostsObj[c.name] = parseFloat(c.amount); });
      const variableCostsObj: Record<string, number> = {};
      formData.variable_costs.forEach(c => { if (c.category && c.amount) variableCostsObj[c.category] = parseFloat(c.amount); });
      const categoryLimitsObj: Record<string, number> = {};
      formData.category_limits.forEach(l => { if (l.category && l.limit) categoryLimitsObj[l.category] = parseFloat(l.limit); });
      const payload = { budget_type: formData.budget_type, valid_from: formData.valid_from, valid_until: formData.valid_until, total_income_expected: parseFloat(formData.total_income_expected), fixed_costs: fixedCostsObj, variable_costs: variableCostsObj, savings_target: formData.savings_target ? parseFloat(formData.savings_target) : 0, discretionary_budget: formData.discretionary_budget ? parseFloat(formData.discretionary_budget) : 0, category_limits: categoryLimitsObj };
      if (activeBudget) { await db.budgets.update(activeBudget.budget_id, payload); toast.success("Budget updated!"); }
      else { await db.budgets.create({ ...payload, is_active: true }); toast.success("Budget created!"); }
      setIsEditOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24 md:pb-8">
        <div className="grid grid-cols-2 gap-4"><SkeletonStat /><SkeletonStat /></div>
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  const fixedCosts = (activeBudget?.fixed_costs || {}) as Record<string, number>;
  const variableCosts = (activeBudget?.variable_costs || {}) as Record<string, number>;
  const categoryLimits = (activeBudget?.category_limits || {}) as Record<string, number>;
  const totalFixed = Object.values(fixedCosts).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  const totalVariable = Object.values(variableCosts).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  const totalExpenses = totalFixed + totalVariable;

  return (
    <div className="space-y-6 page-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Budget Management</h1>
          <p className="text-sm" style={{ color: S.textSec }}>Plan and track your spending</p>
        </div>
        <Button onClick={() => setIsEditOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
          <Plus className="w-4 h-4 mr-2" />Create Budget
        </Button>
      </div>

      {/* Budget Selector */}
      <div className="p-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <Select value={activeBudget?.budget_id || ""} onValueChange={(id) => setActiveBudget(budgets.find(b => b.budget_id === id) || null)}>
          <SelectTrigger className="w-full md:w-[300px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
            <SelectValue placeholder="Select a budget" />
          </SelectTrigger>
          <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            {budgets.map(b => (
              <SelectItem key={b.budget_id} value={b.budget_id}>
                {b.budget_type || "Budget"} — {format(new Date(b.valid_from), "MMM dd")} to {format(new Date(b.valid_until), "MMM dd")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeBudget ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold font-display" style={{ color: S.textPri }}>{activeBudget.budget_type || "Budget"} Budget</h2>
              <p className="text-sm" style={{ color: S.textSec }}>{format(new Date(activeBudget.valid_from), "MMM dd, yyyy")} – {format(new Date(activeBudget.valid_until), "MMM dd, yyyy")}</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditOpen(true)} style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              <Edit className="w-4 h-4 mr-2" />Edit Budget
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Expected Income",   value: activeBudget.total_income_expected || 0, color: S.green },
              { label: "Total Expenses",    value: totalExpenses,                           color: S.danger },
              { label: "Savings Target",    value: activeBudget.savings_target || 0,        color: S.cyan },
              { label: "Discretionary",     value: activeBudget.discretionary_budget || 0,  color: S.textPri },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-6 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <p className="text-sm mb-2" style={{ color: S.textSec }}>{label}</p>
                <p className="text-2xl font-bold data-value font-display" style={{ color }}>₹{Number(value).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>

          {/* Fixed Costs */}
          <BudgetSection title="Fixed Costs" tooltip="Bills that stay almost the same every month, like rent or EMIs.">
            {Object.entries(fixedCosts).map(([name, amount]) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: S.surface2 }}>
                <p className="font-medium" style={{ color: S.textPri }}>{name}</p>
                <p className="font-semibold data-value" style={{ color: S.textSec }}>₹{Number(amount).toLocaleString("en-IN")}</p>
              </div>
            ))}
            {Object.keys(fixedCosts).length === 0 && <p className="text-center py-4" style={{ color: S.textSec }}>No fixed costs defined</p>}
          </BudgetSection>

          {/* Variable Costs */}
          <BudgetSection title="Variable Costs" tooltip="Spending that changes month to month, like fuel, food, or shopping.">
            {Object.entries(variableCosts).map(([category, amount]) => {
              const actual = calculateActualSpending(category);
              const amountNum = Number(amount) || 0;
              const pct = amountNum > 0 ? (actual / amountNum) * 100 : 0;
              const over = pct > 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: S.textPri }}>{category}</span>
                    <span className="text-sm" style={{ color: over ? S.danger : S.textSec }}>
                      ₹{actual.toLocaleString("en-IN")} / ₹{amountNum.toLocaleString("en-IN")}
                      {over && " (Over budget!)"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: S.surface2 }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? S.danger : S.cyan }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(variableCosts).length === 0 && <p className="text-center py-4" style={{ color: S.textSec }}>No variable costs defined</p>}
          </BudgetSection>

          {/* Category Limits */}
          <BudgetSection title="Category Limits" tooltip="Maximum amount you plan to spend in each category for this period.">
            {Object.entries(categoryLimits).map(([category, limit]) => {
              const actual = calculateActualSpending(category);
              const limitNum = Number(limit) || 0;
              const pct = limitNum > 0 ? (actual / limitNum) * 100 : 0;
              const over = pct > 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: S.textPri }}>{category}</span>
                    <span className="text-sm" style={{ color: over ? S.danger : S.textSec }}>
                      ₹{actual.toLocaleString("en-IN")} / ₹{limitNum.toLocaleString("en-IN")}
                      {over && " (Over limit!)"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: S.surface2 }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? S.danger : S.violet }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(categoryLimits).length === 0 && <p className="text-center py-4" style={{ color: S.textSec }}>No category limits defined</p>}
          </BudgetSection>
        </>
      ) : (
        <div className="p-12 text-center rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <p className="text-lg font-semibold mb-2" style={{ color: S.textPri }}>No active budget</p>
          <p className="mb-4" style={{ color: S.textSec }}>Create a budget to start tracking your spending</p>
          <Button onClick={() => setIsEditOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>Create Budget</Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: S.textPri }}>{activeBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
            <DialogDescription style={{ color: S.textSec }}>Define your income, expenses, and savings goals.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Budget Type *</Label>
                <Select value={formData.budget_type} onValueChange={(v) => setFormData({ ...formData, budget_type: v })}>
                  <SelectTrigger style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                    {["monthly", "weekly", "feast_famine", "custom"].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("_", "/")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Expected Income (₹) *</Label>
                <Input type="number" placeholder="0" value={formData.total_income_expected} onChange={(e) => setFormData({ ...formData, total_income_expected: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Valid From *</Label>
                <Input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Valid Until *</Label>
                <Input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Savings Target (₹)</Label>
                <Input type="number" placeholder="0" value={formData.savings_target} onChange={(e) => setFormData({ ...formData, savings_target: e.target.value })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label style={{ color: S.textSec }}>Discretionary (₹)</Label>
                  <HelpTooltip text="Money left after fixed bills and basics." />
                </div>
                <Input type="number" placeholder="0" value={formData.discretionary_budget} onChange={(e) => setFormData({ ...formData, discretionary_budget: e.target.value })} />
              </div>
            </div>

            {/* Fixed costs builder */}
            <FormListSection
              title="Fixed Costs"
              tooltip="Bills that stay almost the same every month."
              items={formData.fixed_costs}
              onAdd={() => setFormData({ ...formData, fixed_costs: [...formData.fixed_costs, { name: "", amount: "" }] })}
              onRemove={(i) => setFormData({ ...formData, fixed_costs: formData.fixed_costs.filter((_, x) => x !== i) })}
              renderRow={(item, i) => (
                <>
                  <Input placeholder="Cost name (e.g., Rent)" value={item.name} onChange={(e) => { const n = [...formData.fixed_costs]; n[i].name = e.target.value; setFormData({ ...formData, fixed_costs: n }); }} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={item.amount} onChange={(e) => { const n = [...formData.fixed_costs]; n[i].amount = e.target.value; setFormData({ ...formData, fixed_costs: n }); }} className="w-32" />
                </>
              )}
            />

            {/* Variable costs builder */}
            <FormListSection
              title="Variable Costs"
              tooltip="Spending that changes month to month."
              items={formData.variable_costs}
              onAdd={() => setFormData({ ...formData, variable_costs: [...formData.variable_costs, { category: "", amount: "" }] })}
              onRemove={(i) => setFormData({ ...formData, variable_costs: formData.variable_costs.filter((_, x) => x !== i) })}
              renderRow={(item, i) => (
                <>
                  <Input placeholder="Category (e.g., Food)" value={item.category} onChange={(e) => { const n = [...formData.variable_costs]; n[i].category = e.target.value; setFormData({ ...formData, variable_costs: n }); }} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={item.amount} onChange={(e) => { const n = [...formData.variable_costs]; n[i].amount = e.target.value; setFormData({ ...formData, variable_costs: n }); }} className="w-32" />
                </>
              )}
            />

            {/* Category limits builder */}
            <FormListSection
              title="Category Limits"
              tooltip="Max you plan to spend per category."
              items={formData.category_limits}
              onAdd={() => setFormData({ ...formData, category_limits: [...formData.category_limits, { category: "", limit: "" }] })}
              onRemove={(i) => setFormData({ ...formData, category_limits: formData.category_limits.filter((_, x) => x !== i) })}
              renderRow={(item, i) => (
                <>
                  <Input placeholder="Category" value={item.category} onChange={(e) => { const n = [...formData.category_limits]; n[i].category = e.target.value; setFormData({ ...formData, category_limits: n }); }} className="flex-1" />
                  <Input type="number" placeholder="Limit" value={item.limit} onChange={(e) => { const n = [...formData.category_limits]; n[i].limit = e.target.value; setFormData({ ...formData, category_limits: n }); }} className="w-32" />
                </>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveBudget} disabled={isSaving || !formData.total_income_expected} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>
                {isSaving ? "Saving…" : activeBudget ? "Update Budget" : "Create Budget"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const S_violet = "#7B2FFF";

/* Small helper components */
const BudgetSection = ({ title, tooltip, children }: { title: string; tooltip: string; children: React.ReactNode }) => (
  <div className="p-6 rounded-lg space-y-3" style={{ background: "hsl(215 56% 12%)", border: "1px solid hsl(210 46% 19%)" }}>
    <div className="flex items-center gap-1.5 mb-4">
      <h3 className="text-lg font-semibold font-display" style={{ color: "#E8F4FF" }}>{title}</h3>
      <HelpTooltip text={tooltip} />
    </div>
    {children}
  </div>
);

const FormListSection = ({ title, tooltip, items, onAdd, onRemove, renderRow }: {
  title: string; tooltip: string; items: any[];
  onAdd: () => void; onRemove: (i: number) => void;
  renderRow: (item: any, i: number) => React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Label style={{ color: "#6B8CAE" }}>{title}</Label>
        <HelpTooltip text={tooltip} />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} style={{ background: "hsl(215 49% 15%)", border: "1px solid hsl(210 46% 19%)", color: "#00D4FF" }}>
        <Plus className="w-4 h-4 mr-1" />Add
      </Button>
    </div>
    {items.map((item, i) => (
      <div key={i} className="flex gap-2">
        {renderRow(item, i)}
        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(i)}><X className="w-4 h-4" /></Button>
      </div>
    ))}
  </div>
);

export default Budget;
