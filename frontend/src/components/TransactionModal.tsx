import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const incomeCategories = [
  { label: "Uber", emoji: "🚗" },
  { label: "Ola", emoji: "🚕" },
  { label: "Swiggy", emoji: "🛵" },
  { label: "Zomato", emoji: "🍱" },
  { label: "Freelance", emoji: "💻" },
  { label: "Other", emoji: "💰" },
];

const expenseCategories = [
  { label: "Fuel", emoji: "⛽" },
  { label: "Food", emoji: "🍔" },
  { label: "Maintenance", emoji: "🔧" },
  { label: "Phone", emoji: "📱" },
  { label: "Rent", emoji: "🏠" },
  { label: "Health", emoji: "💊" },
  { label: "Transport", emoji: "🚌" },
  { label: "Other", emoji: "📦" },
];

const TransactionModal = ({ open, onClose }: TransactionModalProps) => {
  const { addTransaction } = useApp();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleClose = () => {
    setCategory(""); setAmount(""); setDescription(""); setAmountError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!category) { toast.error("Please select a category"); return; }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return;
    }
    setAmountError("");
    try {
      setIsSubmitting(true);
      const now = new Date();
      await addTransaction({
        type,
        category,
        amount: parsed,
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: now.toISOString().split("T")[0],
        description: description.trim() || undefined,
      });
      toast.success(`${type === "income" ? "Income" : "Expense"} of ₹${parsed.toLocaleString("en-IN")} added`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Type toggle */}
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setCategory(""); }}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                  type === t
                    ? t === "income"
                      ? "bg-green-500 text-white shadow"
                      : "bg-red-500 text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "income" ? "💚 Income" : "🔴 Expense"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                className={cn("pl-7 text-lg font-bold", amountError && "border-red-500")}
                autoFocus
              />
            </div>
            {amountError && <p className="text-xs text-red-500">{amountError}</p>}
          </div>

          {/* Category grid */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => setCategory(label)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all text-sm",
                    category === label
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              placeholder="e.g., Evening shift, grocery run…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button
              className={cn("flex-1", type === "income" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}
              onClick={handleSubmit}
              disabled={isSubmitting || !category || !amount}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add {type === "income" ? "Income" : "Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
