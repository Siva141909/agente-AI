import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Info, AlertCircle, RefreshCw, CheckCircle, Plus } from "lucide-react";
import { SkeletonCard, SkeletonStat } from "@/components/ui/skeleton-card";
import db from "@/services/database";
import { toast } from "sonner";

const STANDARD_DEDUCTION = 50000;
const BASIC_EXEMPTION    = 300000;

function calculateTax(taxableIncome: number): number {
  if (taxableIncome <= BASIC_EXEMPTION) return 0;
  let tax = 0;
  const slabs = [
    { limit: 300000,  rate: 0 },
    { limit: 600000,  rate: 0.05 },
    { limit: 900000,  rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let remaining = taxableIncome;
  let prevLimit = 0;
  for (const slab of slabs) {
    const slabSize = Math.min(remaining, slab.limit - prevLimit);
    if (slabSize <= 0) break;
    tax += slabSize * slab.rate;
    remaining -= slabSize;
    prevLimit = slab.limit;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

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

const Tax = () => {
  const [taxRecords, setTaxRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2024-25");
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [taxPreview, setTaxPreview] = useState<any | null>(null);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    financial_year: new Date().getFullYear() - 1 + "-" + String(new Date().getFullYear()).slice(-2),
    gross_income: "",
    total_deductions: "",
    tax_paid: "",
    filing_status: "not_filed",
    filing_date: "",
    acknowledgement_number: "",
    notes: "",
  });

  useEffect(() => { loadTaxRecords(); }, []);
  useEffect(() => {
    if (selectedYear && taxRecords.length > 0) {
      setCurrentRecord(taxRecords.find((r) => r.financial_year === selectedYear) || null);
    } else {
      setCurrentRecord(null);
    }
  }, [selectedYear, taxRecords]);

  const loadTaxRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.taxRecords.getAll();
      setTaxRecords(data || []);
      const years = [...new Set((data || []).map((r) => r.financial_year))].sort().reverse();
      if (years.length > 0 && !selectedYear) setSelectedYear(years[0] as string);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tax records";
      setError(errorMessage);
      toast.error("Failed to load tax records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    try {
      setIsPreviewLoading(true);
      setTaxPreview(null);
      const currentFY = `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(-2)}`;
      const startDate = `${new Date().getFullYear() - 1}-04-01`;
      const endDate   = `${new Date().getFullYear()}-03-31`;
      const transactions = await db.transactions.getAll({ date_start: startDate, date_end: endDate });
      const grossIncome   = transactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const totalExpenses = transactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      const byCategory: Record<string, number> = {};
      transactions.filter(t => t.transaction_type === "income").forEach(t => {
        const cat = t.category || t.source || "Other";
        byCategory[cat] = (byCategory[cat] || 0) + Number(t.amount);
      });
      const deductions    = Math.min(STANDARD_DEDUCTION, grossIncome);
      const taxableIncome = Math.max(0, grossIncome - deductions);
      const taxLiability  = calculateTax(taxableIncome);
      setTaxPreview({
        financial_year: currentFY,
        gross_income: grossIncome, total_expenses: totalExpenses,
        standard_deduction: deductions, taxable_income: taxableIncome,
        tax_liability: taxLiability, quarterly_advance_tax: Math.round(taxLiability / 4),
        income_by_category: byCategory, transaction_count: transactions.length,
        needs_filing: grossIncome > BASIC_EXEMPTION,
      });
    } catch { toast.error("Failed to generate tax preview"); }
    finally { setIsPreviewLoading(false); }
  };

  const handleSaveTaxRecord = async () => {
    try {
      if (!manualFormData.financial_year || !manualFormData.gross_income) {
        toast.error("Please fill in all required fields"); return;
      }
      await db.taxRecords.create({
        financial_year: manualFormData.financial_year,
        gross_income: parseFloat(manualFormData.gross_income) || 0,
        total_deductions: parseFloat(manualFormData.total_deductions) || 0,
        tax_paid: parseFloat(manualFormData.tax_paid) || 0,
        filing_status: manualFormData.filing_status,
        filing_date: manualFormData.filing_date || undefined,
        acknowledgement_number: manualFormData.acknowledgement_number || undefined,
      });
      toast.success("Tax record saved successfully");
      setIsManualFormOpen(false);
      setManualFormData({
        financial_year: new Date().getFullYear() - 1 + "-" + String(new Date().getFullYear()).slice(-2),
        gross_income: "", total_deductions: "", tax_paid: "",
        filing_status: "not_filed", filing_date: "", acknowledgement_number: "", notes: "",
      });
      await loadTaxRecords();
    } catch { toast.error("Failed to save tax record"); }
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><div className="grid grid-cols-2 gap-4"><SkeletonStat /><SkeletonStat /></div><SkeletonCard /><SkeletonCard /></div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Tax Planning</h1>
        <Alert style={{ background: "rgba(255,51,102,0.10)", border: "1px solid rgba(255,51,102,0.3)" }}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-[15px] font-semibold">Unable to load tax information</AlertTitle>
          <AlertDescription className="text-[13px] mt-1">Something went wrong while fetching your tax details.</AlertDescription>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={loadTaxRecords}><RefreshCw className="w-3.5 h-3.5 mr-2" />Retry</Button>
          </div>
        </Alert>
      </div>
    );
  }

  /* ── Empty State ── */
  if (!isLoading && !error && taxRecords.length === 0) {
    return (
      <div className="space-y-6 page-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Tax Planning</h1>
            <p className="text-sm" style={{ color: S.textSec }}>Manage your tax records and filing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)} style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              Preview Tax
            </Button>
            <Button onClick={() => setIsManualFormOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
              <Plus className="w-4 h-4 mr-1.5" />Add Record
            </Button>
          </div>
        </div>

        <div className="py-20 flex flex-col items-center gap-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <FileText className="w-8 h-8" style={{ color: S.cyan }} />
          </div>
          <p className="text-xl font-bold font-display" style={{ color: S.textPri }}>No Tax Records Found</p>
          <p className="text-sm text-center max-w-sm" style={{ color: S.textSec }}>
            You haven't added any tax information yet. If your income is below ₹3,00,000, you may not be required to file an ITR.
          </p>
          <div className="flex gap-2 mt-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: S.textSec }} />
            <p className="text-sm" style={{ color: S.textSec }}>You can still file voluntarily for loans or visa purposes.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)} style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              Preview Tax Summary
            </Button>
            <Button onClick={() => setIsManualFormOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
              <Plus className="w-4 h-4 mr-1.5" />Add Tax Record
            </Button>
          </div>
        </div>

        <PreviewSheet open={isPreviewOpen} onOpenChange={(open) => { setIsPreviewOpen(open); if (open && !taxPreview) handleGeneratePreview(); }} isLoading={isPreviewLoading} preview={taxPreview} onRecalculate={handleGeneratePreview} />
        <ManualFormDialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen} formData={manualFormData} setFormData={setManualFormData} onSave={handleSaveTaxRecord} />
      </div>
    );
  }

  /* ── Non-empty state: two-column layout ── */
  const financialYears = [...new Set(taxRecords.map((r) => r.financial_year))].sort().reverse();

  return (
    <div className="space-y-6 page-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Tax Planning</h1>
          <p className="text-sm" style={{ color: S.textSec }}>Manage your tax records and filing</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              {financialYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsManualFormOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
            <Plus className="w-4 h-4 mr-1.5" />Add Record
          </Button>
        </div>
      </div>

      {currentRecord ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* ── Left 60%: Record details ── */}
          <div className="md:col-span-3 space-y-5">
            {/* Income by Source */}
            <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <h3 className="text-base font-semibold font-display mb-3" style={{ color: S.textPri }}>Income by Source</h3>
              {currentRecord.income_by_source && typeof currentRecord.income_by_source === "object" ? (
                <div className="space-y-2">
                  {Object.entries(currentRecord.income_by_source).map(([source, amount]: [string, any]) => (
                    <div key={source} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: S.surface2 }}>
                      <span className="font-medium text-sm" style={{ color: S.textPri }}>{source}</span>
                      <span className="font-semibold text-sm data-value" style={{ color: S.green }}>₹{Number(amount).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: S.textSec }}>No income source data available</p>
              )}
            </div>

            {/* Deductions */}
            <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <h3 className="text-base font-semibold font-display mb-3" style={{ color: S.textPri }}>Deductions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: S.textSec }}>Total Deductions</span>
                  <span className="font-bold data-value text-lg" style={{ color: S.green }}>₹{Number(currentRecord.total_deductions || 0).toLocaleString("en-IN")}</span>
                </div>
                {currentRecord.deduction_details && typeof currentRecord.deduction_details === "object" && (
                  <div className="space-y-2">
                    {Object.entries(currentRecord.deduction_details).map(([category, amount]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                        <span className="font-medium text-sm" style={{ color: S.textPri }}>{category}</span>
                        <span className="font-semibold text-sm data-value" style={{ color: S.green }}>₹{Number(amount).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <h3 className="text-base font-semibold font-display mb-3" style={{ color: S.textPri }}>Notes</h3>
              <Textarea placeholder="Add any additional deduction notes..." rows={3} style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }} />
            </div>
          </div>

          {/* ── Right 40%: Sticky Tax Summary ── */}
          <div className="md:col-span-2">
            <div className="sticky top-4 space-y-4">
              {/* Summary cards */}
              <div className="p-5 rounded-lg space-y-4" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <h3 className="text-base font-semibold font-display" style={{ color: S.textPri }}>FY {currentRecord.financial_year}</h3>
                {[
                  { label: "Gross Income",   value: currentRecord.gross_income || 0,   color: S.textPri },
                  { label: "Taxable Income", value: currentRecord.taxable_income || 0, color: S.textPri },
                  { label: "Tax Liability",  value: currentRecord.tax_liability || 0,  color: S.danger },
                  { label: "Tax Paid",       value: currentRecord.tax_paid || 0,       color: S.green },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${S.border}` }}>
                    <span className="text-sm" style={{ color: S.textSec }}>{label}</span>
                    <span className="font-bold data-value" style={{ color }}>₹{Number(value).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* Filing Status */}
              <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <h3 className="text-base font-semibold font-display mb-3" style={{ color: S.textPri }}>Filing Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: S.textSec }}>Status</span>
                    <span className="font-semibold capitalize" style={{ color: currentRecord.filing_status === "filed" ? S.green : S.textPri }}>
                      {currentRecord.filing_status?.replace("_", " ") || "Not Filed"}
                    </span>
                  </div>
                  {currentRecord.filing_date && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: S.textSec }}>Filing Date</span>
                      <span className="font-semibold" style={{ color: S.textPri }}>{new Date(currentRecord.filing_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {currentRecord.acknowledgement_number && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: S.textSec }}>Ack. No.</span>
                      <span className="font-semibold font-mono text-xs" style={{ color: S.cyan }}>{currentRecord.acknowledgement_number}</span>
                    </div>
                  )}
                  {currentRecord.refund_amount && Number(currentRecord.refund_amount) > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg mt-2" style={{ background: "rgba(0,255,136,0.08)" }}>
                      <span style={{ color: S.textSec }}>Refund</span>
                      <span className="font-semibold" style={{ color: S.green }}>₹{Number(currentRecord.refund_amount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={() => setIsPreviewOpen(true)} className="w-full" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                Preview Current FY
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <p className="text-lg font-semibold" style={{ color: S.textPri }}>No record for {selectedYear}</p>
          <p className="text-sm mt-1 mb-4" style={{ color: S.textSec }}>Select a different year or add a new tax record</p>
          <Button onClick={() => setIsManualFormOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
            <Plus className="w-4 h-4 mr-1.5" />Add Record
          </Button>
        </div>
      )}

      <PreviewSheet open={isPreviewOpen} onOpenChange={(open) => { setIsPreviewOpen(open); if (open && !taxPreview) handleGeneratePreview(); }} isLoading={isPreviewLoading} preview={taxPreview} onRecalculate={handleGeneratePreview} />
      <ManualFormDialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen} formData={manualFormData} setFormData={setManualFormData} onSave={handleSaveTaxRecord} />
    </div>
  );
};

const PreviewSheet = ({ open, onOpenChange, isLoading, preview, onRecalculate }: { open: boolean; onOpenChange: (v: boolean) => void; isLoading: boolean; preview: any; onRecalculate: () => void }) => {
  const S = { surface: "hsl(215 56% 12%)", border: "hsl(210 46% 19%)", cyan: "#00D4FF", green: "#00FF88", danger: "#FF3366", textPri: "#E8F4FF", textSec: "#6B8CAE" };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto" style={{ background: S.surface, borderLeft: `1px solid ${S.border}` }}>
        <SheetHeader>
          <SheetTitle style={{ color: S.textPri }}>Tax Summary Preview</SheetTitle>
          <SheetDescription style={{ color: S.textSec }}>Estimated tax for current FY based on your transactions. Not an official return.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-4"><SkeletonStat /><SkeletonStat /></div>
          ) : preview ? (
            <>
              <div className="rounded-lg p-3" style={{ background: "hsl(215 49% 15%)", border: `1px solid ${S.border}` }}>
                <p className="text-xs" style={{ color: S.textSec }}>Financial Year: <span className="font-medium" style={{ color: S.textPri }}>{preview.financial_year}</span></p>
                <p className="text-xs mt-1" style={{ color: S.textSec }}>Based on {preview.transaction_count} transactions</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Gross Income",      value: `₹${preview.gross_income.toLocaleString("en-IN")}`,         color: S.textPri },
                  { label: "Standard Deduction", value: `-₹${preview.standard_deduction.toLocaleString("en-IN")}`, color: S.green },
                  { label: "Taxable Income",     value: `₹${preview.taxable_income.toLocaleString("en-IN")}`,      color: S.textPri },
                  { label: "Estimated Tax",      value: `₹${preview.tax_liability.toLocaleString("en-IN")}`,       color: preview.tax_liability > 0 ? S.danger : S.green },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-lg" style={{ background: "hsl(215 49% 15%)", border: `1px solid ${S.border}` }}>
                    <p className="text-xs mb-1" style={{ color: S.textSec }}>{label}</p>
                    <p className="text-lg font-semibold data-value" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
              {preview.tax_liability > 0 && (
                <div className="rounded-lg p-4" style={{ background: "rgba(255,107,53,0.10)", border: "1px solid rgba(255,107,53,0.3)" }}>
                  <p className="text-sm font-medium mb-1" style={{ color: "#FF6B35" }}>Advance Tax (Quarterly)</p>
                  <p className="text-xl font-bold" style={{ color: "#FF6B35" }}>₹{preview.quarterly_advance_tax.toLocaleString("en-IN")} / quarter</p>
                  <p className="text-xs mt-1" style={{ color: S.textSec }}>Due dates: 15 Jun, 15 Sep, 15 Dec, 15 Mar</p>
                </div>
              )}
              {!preview.needs_filing ? (
                <div className="flex items-start gap-2.5 rounded-lg p-4" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)" }}>
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: S.green }} />
                  <p className="text-sm" style={{ color: S.green }}>Income below ₹3,00,000. Not required to file an ITR, but you can file voluntarily for loans or visa.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-lg p-4" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)" }}>
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: S.cyan }} />
                  <p className="text-sm" style={{ color: S.cyan }}>Income exceeds ₹3,00,000. You should file ITR-1 by 31 July.</p>
                </div>
              )}
              {Object.keys(preview.income_by_category).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: S.textPri }}>Income by Source</p>
                  <div className="space-y-2">
                    {Object.entries(preview.income_by_category).map(([cat, amt]: [string, any]) => (
                      <div key={cat} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "hsl(215 49% 15%)" }}>
                        <span className="text-sm" style={{ color: S.textPri }}>{cat}</span>
                        <span className="text-sm font-medium data-value" style={{ color: S.green }}>₹{Number(amt).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={onRecalculate} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />Recalculate
              </Button>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ManualFormDialog = ({ open, onOpenChange, formData, setFormData, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; formData: any; setFormData: (v: any) => void; onSave: () => void }) => {
  const S = { surface: "hsl(215 56% 12%)", border: "hsl(210 46% 19%)", cyan: "#00D4FF", textPri: "#E8F4FF", textSec: "#6B8CAE" };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <DialogHeader>
          <DialogTitle style={{ color: S.textPri }}>Add Tax Information</DialogTitle>
          <DialogDescription style={{ color: S.textSec }}>Enter your tax details for the financial year</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Financial Year *</Label>
              <Input value={formData.financial_year} onChange={(e) => setFormData({ ...formData, financial_year: e.target.value })} placeholder="e.g., 2024-25" />
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Gross Income (₹) *</Label>
              <Input type="number" value={formData.gross_income} onChange={(e) => setFormData({ ...formData, gross_income: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Total Deductions (₹)</Label>
              <Input type="number" value={formData.total_deductions} onChange={(e) => setFormData({ ...formData, total_deductions: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Tax Paid (₹)</Label>
              <Input type="number" value={formData.tax_paid} onChange={(e) => setFormData({ ...formData, tax_paid: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: S.textSec }}>Filing Status *</Label>
            <Select value={formData.filing_status} onValueChange={(v) => setFormData({ ...formData, filing_status: v })}>
              <SelectTrigger style={{ background: "hsl(215 49% 15%)", border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
              <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <SelectItem value="not_filed">Not Filed</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Filing Date</Label>
              <Input type="date" value={formData.filing_date} onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Acknowledgement Number</Label>
              <Input value={formData.acknowledgement_number} onChange={(e) => setFormData({ ...formData, acknowledgement_number: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: S.textSec }}>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes..." rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button onClick={onSave} disabled={!formData.financial_year || !formData.gross_income} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>Save Tax Record</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Tax;
