import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Home, FileText, Info, AlertCircle, RefreshCw } from "lucide-react";
import db from "@/services/database";
import { toast } from "sonner";
import PageIntro from "@/components/PageIntro";

const Tax = () => {
  const navigate = useNavigate();
  const [taxRecords, setTaxRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2024-25");
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  useEffect(() => {
    loadTaxRecords();
  }, []);

  useEffect(() => {
    if (selectedYear && taxRecords.length > 0) {
      const record = taxRecords.find((r) => r.financial_year === selectedYear);
      setCurrentRecord(record || null);
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
      
      // Get available financial years
      const years = [...new Set((data || []).map((r) => r.financial_year))].sort().reverse();
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0] as string);
      }
    } catch (err) {
      console.error("Failed to load tax records:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load tax records";
      setError(errorMessage);
      toast.error("Failed to load tax records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTaxRecord = async () => {
    try {
      if (!manualFormData.financial_year || !manualFormData.gross_income) {
        toast.error("Please fill in all required fields");
        return;
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
        gross_income: "",
        total_deductions: "",
        tax_paid: "",
        filing_status: "not_filed",
        filing_date: "",
        acknowledgement_number: "",
        notes: "",
      });
      // Reload tax records after saving
      await loadTaxRecords();
    } catch (err) {
      console.error("Failed to save tax record:", err);
      toast.error("Failed to save tax record");
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-[15px] text-muted-foreground">Loading tax information...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} title="Back to Home">
            <Home className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Tax Planning</h1>
            <p className="text-[15px] text-muted-foreground">Manage your tax records and filing</p>
          </div>
        </div>

        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-[15px] font-semibold">Unable to load tax information</AlertTitle>
          <AlertDescription className="text-[13px] mt-1">
            Something went wrong while fetching your tax details.
            </AlertDescription>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={loadTaxRecords}>
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Retry
          </Button>
        </div>
        </Alert>
      </div>
    );
  }

  // Empty State
  if (!isLoading && !error && taxRecords.length === 0) {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} title="Back to Home">
            <Home className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Tax Planning</h1>
            <p className="text-[15px] text-muted-foreground">Manage your tax records and filing</p>
          </div>
          </div>

        {/* Empty State Card */}
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="max-w-md w-full space-y-6">
            <Card className="p-8 text-center border-border/40 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-[6px] bg-muted/60 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
            </div>
              <h2 className="text-[20px] font-semibold tracking-tight text-foreground mb-2">
                No Tax Records Found
              </h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-1">
                You haven't added any tax information yet.
              </p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                If your income is below the taxable limit, you may not be required to file an ITR.
              </p>
          </Card>

            {/* Info Text */}
            <div className="bg-muted/30 rounded-[6px] p-4 border border-border/40">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Many gig workers have zero tax liability when their annual income is low.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    You can still file an ITR voluntarily for loans or visa purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsPreviewOpen(true)}
                className="flex-1"
              >
                Prepare Tax Summary (Preview Only)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsManualFormOpen(true)}
                className="flex-1"
              >
                Add Tax Information Manually
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Tax Summary Drawer */}
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="text-[18px] font-semibold">Tax Summary Preview</SheetTitle>
              <SheetDescription className="text-[13px]">
                Preview your tax summary based on your transaction data
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="bg-muted/30 rounded-[6px] p-4 border border-border/40">
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                  We will generate a preview tax summary using your income and expense data.
                </p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  This does not file an official tax return.
                </p>
            </div>
              <div className="text-center py-8">
                <p className="text-[14px] text-muted-foreground">
                  Tax summary preview feature coming soon
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Manual Tax Form Dialog */}
        <Dialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold">Add Tax Information</DialogTitle>
              <DialogDescription className="text-[13px]">
                Enter your tax details for the financial year
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Financial Year *</Label>
                  <Input
                    value={manualFormData.financial_year}
                    onChange={(e) => setManualFormData({ ...manualFormData, financial_year: e.target.value })}
                    placeholder="e.g., 2024-25"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Gross Income (₹) *</Label>
                  <Input
                    type="number"
                    value={manualFormData.gross_income}
                    onChange={(e) => setManualFormData({ ...manualFormData, gross_income: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Total Deductions (₹)</Label>
                  <Input
                    type="number"
                    value={manualFormData.total_deductions}
                    onChange={(e) => setManualFormData({ ...manualFormData, total_deductions: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Tax Paid (₹)</Label>
                  <Input
                    type="number"
                    value={manualFormData.tax_paid}
                    onChange={(e) => setManualFormData({ ...manualFormData, tax_paid: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Filing Status *</Label>
                <Select
                  value={manualFormData.filing_status}
                  onValueChange={(v) => setManualFormData({ ...manualFormData, filing_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_filed">Not Filed</SelectItem>
                    <SelectItem value="filed">Filed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Filing Date</Label>
                  <Input
                    type="date"
                    value={manualFormData.filing_date}
                    onChange={(e) => setManualFormData({ ...manualFormData, filing_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Acknowledgement Number</Label>
                  <Input
                    value={manualFormData.acknowledgement_number}
                    onChange={(e) => setManualFormData({ ...manualFormData, acknowledgement_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Notes</Label>
                <Textarea
                  value={manualFormData.notes}
                  onChange={(e) => setManualFormData({ ...manualFormData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
                  </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsManualFormOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTaxRecord}
                  disabled={!manualFormData.financial_year || !manualFormData.gross_income}
                  className="flex-1"
                >
                  Save Tax Record
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
                      </div>
    );
  }

  // Non-Empty State (Existing Tax Records)
  const financialYears = [...new Set(taxRecords.map((r) => r.financial_year))].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} title="Back to Home">
            <Home className="w-4 h-4" />
          </Button>
                    <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Tax Planning</h1>
            <p className="text-[15px] text-muted-foreground">Manage your tax records and filing</p>
          </div>
        </div>
                    </div>

      <PageIntro
        title="What is this page?"
        description="This page is for your tax information. When you start filing returns, you'll see your yearly tax summary and status here."
      />

      {/* Financial Year Selector */}
      <div className="bg-background border border-border/40 rounded-[6px] p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <Label className="text-[13px] font-medium">Financial Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentRecord ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-background border border-border/40 rounded-[6px] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <p className="text-[13px] text-muted-foreground font-medium mb-1.5">Gross Income</p>
              <p className="text-[28px] font-semibold tracking-tight">
                ₹{Number(currentRecord.gross_income || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-background border border-border/40 rounded-[6px] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <p className="text-[13px] text-muted-foreground font-medium mb-1.5">Taxable Income</p>
              <p className="text-[28px] font-semibold tracking-tight">
                ₹{Number(currentRecord.taxable_income || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-background border border-border/40 rounded-[6px] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <p className="text-[13px] text-muted-foreground font-medium mb-1.5">Tax Liability</p>
              <p className="text-[28px] font-semibold tracking-tight text-[#dc2626]">
                ₹{Number(currentRecord.tax_liability || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-background border border-border/40 rounded-[6px] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <p className="text-[13px] text-muted-foreground font-medium mb-1.5">Tax Paid</p>
              <p className="text-[28px] font-semibold tracking-tight text-[#16a34a]">
                ₹{Number(currentRecord.tax_paid || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Income by Source */}
          <div className="bg-background border border-border/40 rounded-[6px] p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">Income by Source</h3>
            {currentRecord.income_by_source && typeof currentRecord.income_by_source === "object" ? (
              <div className="space-y-3">
                {Object.entries(currentRecord.income_by_source).map(([source, amount]: [string, any]) => (
                  <div key={source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{source}</span>
                    <span className="font-semibold">₹{Number(amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-muted-foreground">No income source data available</p>
            )}
          </div>

          {/* Deductions */}
          <div className="bg-background border border-border/40 rounded-[6px] p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">Deductions</h3>
            <div className="space-y-4">
                  <div>
                <p className="text-sm text-muted-foreground mb-2">Total Deductions</p>
                <p className="text-2xl font-bold">
                  ₹{Number(currentRecord.total_deductions || 0).toLocaleString("en-IN")}
                </p>
              </div>
              {currentRecord.deduction_details && typeof currentRecord.deduction_details === "object" ? (
                <div className="space-y-3">
                  {Object.entries(currentRecord.deduction_details).map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200">
                      <span className="font-medium">{category}</span>
                      <span className="font-semibold text-green-600">₹{Number(amount).toLocaleString("en-IN")}</span>
                        </div>
                    ))}
                </div>
              ) : null}
            </div>
                  </div>

          {/* Filing Status */}
          <div className="bg-background border border-border/40 rounded-[6px] p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">Filing Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{currentRecord.filing_status || "Not Filed"}</span>
              </div>
              {currentRecord.filing_date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Filing Date</span>
                  <span className="font-semibold">
                    {new Date(currentRecord.filing_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {currentRecord.acknowledgement_number && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Acknowledgement Number</span>
                  <span className="font-semibold">{currentRecord.acknowledgement_number}</span>
                </div>
              )}
              {currentRecord.refund_amount && Number(currentRecord.refund_amount) > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <span className="text-muted-foreground">Refund Amount</span>
                  <span className="font-semibold text-green-600">
                    ₹{Number(currentRecord.refund_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-background border border-border/40 rounded-[6px] p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">Additional Notes</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Manual Deduction Note</Label>
                <Textarea placeholder="Add any additional deduction notes..." rows={3} />
              </div>
      </div>
          </div>
        </>
      ) : (
        <div className="bg-background border border-border/40 rounded-[6px] p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <p className="text-[18px] font-semibold mb-2">No tax record found for selected year</p>
          <p className="text-[14px] text-muted-foreground">Select a different financial year or add a new tax record</p>
        </div>
      )}
    </div>
  );
};

export default Tax;
