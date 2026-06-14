import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Edit, Trash2 } from "lucide-react";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import db from "@/services/database";
import { toast } from "sonner";
import PageIntro from "@/components/PageIntro";

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
      console.error("Failed to load transactions:", error);
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

  const groupedTransactions = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredTransactions.forEach((t) => {
      const date = t.transaction_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    });
    return grouped;
  }, [filteredTransactions]);

  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.transaction_date === today);
  const todayIncome  = todayTransactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const todayExpense = todayTransactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);

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

  return (
    <div className="space-y-6 page-in">
      {/* Filters */}
      <div
        className="p-4 rounded-lg"
        style={{ background: S.surface, border: `1px solid ${S.border}` }}
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
            <SelectTrigger className="w-full md:w-[140px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
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
              <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                <CalendarIcon className="mr-2 h-4 w-4" style={{ color: S.textSec }} />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MMM dd")} – ${format(dateRange.to, "MMM dd")}`
                  : "Pick date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <PageIntro
        title="What is this page?"
        description="Every income and expense you've recorded. Search, filter, and edit past transactions."
      />

      {/* Today's Summary */}
      <div
        className="p-6 rounded-lg"
        style={{ background: S.surface, border: `1px solid rgba(0,212,255,0.15)`, boxShadow: "0 0 20px rgba(0,212,255,0.05)" }}
      >
        <h2 className="text-xl font-bold font-display mb-4" style={{ color: S.textPri }}>Today's Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm" style={{ color: S.textSec }}>Income</p>
            <p className="text-2xl font-bold data-value" style={{ color: S.green }}>₹{todayIncome.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: S.textSec }}>Expense</p>
            <p className="text-2xl font-bold data-value" style={{ color: S.danger }}>₹{todayExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Today's Transactions */}
      {todayTransactions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-display mb-4" style={{ color: S.textPri }}>Today</h2>
          <div className="rounded-lg overflow-hidden" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            {todayTransactions.map((t) => (
              <TransactionRow key={t.transaction_id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Grouped by date */}
      <div>
        <h2 className="text-xl font-bold font-display mb-4" style={{ color: S.textPri }}>Last 10 Days</h2>
        <div className="space-y-4">
          {Object.entries(groupedTransactions)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, txs]) => (
              <div key={date} className="rounded-lg overflow-hidden" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <div className="p-4" style={{ borderBottom: `1px solid ${S.border}` }}>
                  <h3 className="font-semibold text-sm" style={{ color: S.textSec }}>
                    {format(new Date(date), "EEEE, MMMM dd, yyyy")}
                  </h3>
                </div>
                {txs.map((t) => (
                  <TransactionRow key={t.transaction_id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            ))}
        </div>
      </div>

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
            <AlertDialogDescription style={{ color: S.textSec }}>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} style={{ background: S.danger, color: "#fff" }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const TransactionRow = ({ transaction: t, onEdit, onDelete }: { transaction: any; onEdit: (t: any) => void; onDelete: (id: string) => void }) => {
  const isIncome = t.transaction_type === "income";
  return (
    <motion.div
      whileHover={{ backgroundColor: "hsl(215 49% 15%)" }}
      className="p-4 flex items-center justify-between"
      style={{ borderBottom: "1px solid hsl(210 46% 19%)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
          style={isIncome
            ? { background: "rgba(0,255,136,0.12)", color: "#00FF88" }
            : { background: "rgba(255,51,102,0.12)", color: "#FF3366" }}
        >
          {isIncome ? "+" : "−"}
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "#E8F4FF" }}>{t.category || "Uncategorized"}</div>
          <div className="text-xs" style={{ color: "#6B8CAE" }}>{t.transaction_time || "N/A"} · {t.description || "No description"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="font-bold data-value" style={{ color: isIncome ? "#00FF88" : "#FF3366" }}>
          {isIncome ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onEdit(t)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(t.transaction_id)}>
          <Trash2 className="w-4 h-4" style={{ color: "#FF3366" }} />
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "hsl(215 56% 12%)", border: "1px solid hsl(210 46% 19%)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#E8F4FF" }}>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "#6B8CAE" }}>Amount (₹)</Label>
              <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#6B8CAE" }}>Type</Label>
              <Select value={formData.transaction_type} onValueChange={(v) => setFormData({ ...formData, transaction_type: v as any, category: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "#6B8CAE" }}>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories[formData.transaction_type as "income" | "expense"].map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#6B8CAE" }}>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{["UPI", "Cash", "Card", "Bank Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#6B8CAE" }}>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1" style={{ background: "#00D4FF", color: "#070D1A" }}>
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Transactions;
