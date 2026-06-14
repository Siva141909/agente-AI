import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Edit, Trash2, Plus, Receipt } from "lucide-react";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import db from "@/services/database";
import { toast } from "sonner";
import TransactionModal from "@/components/TransactionModal";

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

const Transactions = () => {
  const { isAuthenticated } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadTransactions();
  }, [isAuthenticated, dateRange]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await db.transactions.getAll({
        date_start: dateRange.from?.toISOString().split("T")[0],
        date_end: dateRange.to?.toISOString().split("T")[0],
      });
      setTransactions(data);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (dateRange.from) filtered = filtered.filter((t) => new Date(t.transaction_date) >= dateRange.from!);
    if (dateRange.to)   filtered = filtered.filter((t) => new Date(t.transaction_date) <= dateRange.to!);
    if (typeFilter !== "all") filtered = filtered.filter((t) => t.transaction_type === typeFilter);
    if (categoryFilter !== "all") filtered = filtered.filter((t) => t.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.category?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.merchant_name?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, dateRange, typeFilter, categoryFilter, searchQuery]);

  /* Single chronological grouping — replaces "Today" + "Last 10 Days" duplicate sections */
  const groupedTransactions = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredTransactions.forEach((t) => {
      const date = t.transaction_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    });
    return Object.entries(grouped).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredTransactions]);

  const handleEdit = (transaction: any) => { setEditingTransaction(transaction); setIsEditDialogOpen(true); };
  const handleDelete = (id: string) => setDeleteTransaction(id);
  const confirmDelete = async () => {
    if (!deleteTransaction) return;
    try {
      await db.transactions.delete(deleteTransaction);
      toast.success("Transaction deleted");
      setDeleteTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonList rows={8} /></div>;
  }

  const totalIncome  = filteredTransactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filteredTransactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-0 page-in">

      {/* ── Sticky filter bar ── */}
      <div
        className="sticky top-0 z-20 p-4 rounded-lg mb-6"
        style={{ background: S.surface, border: `1px solid ${S.border}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: S.textSec }} />
            <Input
              placeholder="Search transactions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[130px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[140px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[210px] justify-start text-left font-normal" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                <CalendarIcon className="mr-2 h-4 w-4" style={{ color: S.textSec }} />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MMM dd")} – ${format(dateRange.to, "MMM dd")}`
                  : "Pick date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <Calendar
                initialFocus mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => setTxOpen(true)}
            style={{ background: S.cyan, color: "#070D1A", fontWeight: 600 }}
          >
            <Plus className="w-4 h-4 mr-1.5" />Add
          </Button>
        </div>

        {/* Filter result summary */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
            <span className="text-xs" style={{ color: S.textSec }}>{filteredTransactions.length} transactions</span>
            <span className="text-xs font-semibold" style={{ color: S.green }}>+₹{totalIncome.toLocaleString("en-IN")}</span>
            <span className="text-xs font-semibold" style={{ color: S.danger }}>−₹{totalExpense.toLocaleString("en-IN")}</span>
            <span className="text-xs font-semibold ml-auto" style={{ color: totalIncome - totalExpense >= 0 ? S.green : S.danger }}>
              Net: {totalIncome - totalExpense >= 0 ? "+" : ""}₹{(totalIncome - totalExpense).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Single chronological grouped list ── */}
      {groupedTransactions.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4" style={{ color: S.textSec }}>
          <Receipt className="w-12 h-12 opacity-30" />
          <p className="text-lg font-semibold" style={{ color: S.textPri }}>No transactions found</p>
          <p className="text-sm">
            {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first transaction to get started"}
          </p>
          <Button onClick={() => setTxOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
            <Plus className="w-4 h-4 mr-1.5" />Add Transaction
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map(([date, txs]) => {
            const dayIncome  = txs.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
            const dayExpense = txs.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);
            const isToday = date === new Date().toISOString().split("T")[0];
            return (
              <div key={date} className="rounded-lg overflow-hidden" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                {/* Date header with day totals */}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: S.surface2, borderBottom: `1px solid ${S.border}` }}>
                  <h3 className="font-semibold text-sm" style={{ color: isToday ? S.cyan : S.textSec }}>
                    {isToday ? "Today" : format(new Date(date), "EEEE, MMM dd, yyyy")}
                  </h3>
                  <div className="flex items-center gap-3">
                    {dayIncome  > 0 && <span className="text-xs font-semibold data-value" style={{ color: S.green }}>+₹{dayIncome.toLocaleString("en-IN")}</span>}
                    {dayExpense > 0 && <span className="text-xs font-semibold data-value" style={{ color: S.danger }}>−₹{dayExpense.toLocaleString("en-IN")}</span>}
                  </div>
                </div>
                {txs.map((t) => (
                  <TransactionRow key={t.transaction_id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <EditTransactionDialog
        open={isEditDialogOpen}
        onClose={() => { setIsEditDialogOpen(false); setEditingTransaction(null); }}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
        <AlertDialogContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: S.textPri }}>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription style={{ color: S.textSec }}>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} style={{ background: S.danger, color: "#fff" }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} />
    </div>
  );
};

const TransactionRow = ({ transaction: t, onEdit, onDelete }: { transaction: any; onEdit: (t: any) => void; onDelete: (id: string) => void }) => {
  const isIncome = t.transaction_type === "income";
  return (
    <motion.div
      whileHover={{ backgroundColor: "hsl(215 49% 15%)" }}
      className="px-4 py-3.5 flex items-center justify-between"
      style={{ borderBottom: "1px solid hsl(210 46% 19%)" }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={isIncome
            ? { background: "rgba(0,255,136,0.12)", color: "#00FF88" }
            : { background: "rgba(255,51,102,0.12)", color: "#FF3366" }}
        >
          {isIncome ? "+" : "−"}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "#E8F4FF" }}>{t.category || "Uncategorized"}</div>
          <div className="text-xs truncate" style={{ color: "#6B8CAE" }}>
            {t.transaction_time || ""}{t.description ? ` · ${t.description}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="font-bold text-sm data-value" style={{ color: isIncome ? "#00FF88" : "#FF3366" }}>
          {isIncome ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onEdit(t)}><Edit className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onDelete(t.transaction_id)}>
          <Trash2 className="w-3.5 h-3.5" style={{ color: "#FF3366" }} />
        </Button>
      </div>
    </motion.div>
  );
};

const EditTransactionDialog = ({ open, onClose, transaction }: { open: boolean; onClose: () => void; transaction: any }) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || "",
    transaction_type: transaction?.transaction_type || "expense",
    transaction_date: transaction?.transaction_date ? new Date(transaction.transaction_date) : new Date(),
    transaction_time: transaction?.transaction_time || "",
    category: transaction?.category || "",
    payment_method: transaction?.payment_method || "",
    description: transaction?.description || "",
    merchant_name: transaction?.merchant_name || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount?.toString() || "",
        transaction_type: transaction.transaction_type || "expense",
        transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date) : new Date(),
        transaction_time: transaction.transaction_time || "",
        category: transaction.category || "",
        payment_method: transaction.payment_method || "",
        description: transaction.description || "",
        merchant_name: transaction.merchant_name || "",
      });
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction) return;
    try {
      setIsSaving(true);
      await db.transactions.update(transaction.transaction_id, {
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
        transaction_time: formData.transaction_time,
        category: formData.category,
        description: formData.description || undefined,
        payment_method: formData.payment_method || undefined,
        merchant_name: formData.merchant_name || undefined,
      });
      toast.success("Transaction updated!");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = { income: ["Delivery", "Freelance", "Salary", "Other"], expense: ["Food", "Fuel", "Rent", "Groceries", "Maintenance", "Phone", "EMI", "Misc"] };
  if (!transaction) return null;

  const S = { surface: "hsl(215 56% 12%)", border: "hsl(210 46% 19%)", textPri: "#E8F4FF", textSec: "#6B8CAE", cyan: "#00D4FF" };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <DialogHeader>
          <DialogTitle style={{ color: S.textPri }}>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Amount (₹)</Label>
              <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Type</Label>
              <Select value={formData.transaction_type} onValueChange={(v) => setFormData({ ...formData, transaction_type: v as any, category: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories[formData.transaction_type as "income" | "expense"].map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{["UPI", "Cash", "Card", "Bank Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: S.textSec }}>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Transactions;
