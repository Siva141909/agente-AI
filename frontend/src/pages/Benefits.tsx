import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, CheckCircle, Clock, XCircle, ExternalLink, Award } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import db from "@/services/database";
import { toast } from "sonner";
import { format } from "date-fns";
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

const Benefits = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "my-applications">("browse");
  const [filters, setFilters] = useState({ scheme_type: "all", government_level: "all", search: "" });
  const [applyFormData, setApplyFormData] = useState({ application_notes: "", documents_submitted: [] as string[] });

  useEffect(() => { loadData(); }, [filters, activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schemesData, applicationsData] = await Promise.all([
        db.governmentSchemes.getAll({
          scheme_type: filters.scheme_type !== "all" ? filters.scheme_type : undefined,
          government_level: filters.government_level !== "all" ? filters.government_level : undefined,
          is_active: true,
        }),
        db.userSchemeApplications.getAll(),
      ]);
      let filteredSchemes = schemesData;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filteredSchemes = schemesData.filter(s =>
          s.scheme_name?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.scheme_code?.toLowerCase().includes(query)
        );
      }
      setSchemes(filteredSchemes);
      setApplications(applicationsData || []);
    } catch {
      toast.error("Failed to load government schemes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (scheme: any) => { setSelectedScheme(scheme); setIsDetailOpen(true); };
  const handleApply = (scheme: any) => { setSelectedScheme(scheme); setApplyFormData({ application_notes: "", documents_submitted: [] }); setIsApplyOpen(true); };

  const handleSubmitApplication = async () => {
    if (!selectedScheme) return;
    try {
      await db.userSchemeApplications.create({
        scheme_id: selectedScheme.scheme_id,
        application_date: new Date().toISOString().split("T")[0],
        application_status: "submitted",
        application_notes: applyFormData.application_notes || undefined,
        documents_submitted: applyFormData.documents_submitted.length > 0 ? applyFormData.documents_submitted : undefined,
      });
      toast.success("Application submitted successfully!");
      setIsApplyOpen(false); setSelectedScheme(null);
      loadData(); setActiveTab("my-applications");
    } catch { toast.error("Failed to submit application"); }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":  return <Badge style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>Approved</Badge>;
      case "rejected":   return <Badge style={{ background: "rgba(255,51,102,0.12)", color: "#FF3366", border: "1px solid rgba(255,51,102,0.25)" }}>Rejected</Badge>;
      case "under_review":
      case "processing": return <Badge style={{ background: "rgba(255,107,53,0.12)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.25)" }}>Under Review</Badge>;
      default:           return <Badge style={{ background: "rgba(0,212,255,0.10)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>Submitted</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed": return <CheckCircle className="w-4 h-4" style={{ color: "#00FF88" }} />;
      case "rejected":  return <XCircle className="w-4 h-4" style={{ color: "#FF3366" }} />;
      default:          return <Clock className="w-4 h-4" style={{ color: "#FF6B35" }} />;
    }
  };

  const schemeTypes = [
    { value: "all", label: "All Types" }, { value: "health", label: "Health" },
    { value: "pension", label: "Pension" }, { value: "insurance", label: "Insurance" },
    { value: "social_security", label: "Social Security" }, { value: "education", label: "Education" },
    { value: "housing", label: "Housing" }, { value: "employment", label: "Employment" },
  ];

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  return (
    <div className="space-y-6 page-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Government Benefits</h1>
        <p className="text-sm" style={{ color: S.textSec }}>Discover and apply for government schemes</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "browse" | "my-applications")}>
        <TabsList className="mb-4" style={{ background: S.surface2 }}>
          <TabsTrigger value="browse" style={{ color: S.textSec }}>Browse Schemes</TabsTrigger>
          <TabsTrigger value="my-applications" style={{ color: S.textSec }}>
            My Applications {applications.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded" style={{ background: "rgba(0,212,255,0.15)", color: S.cyan }}>{applications.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── Browse Tab ── */}
        <TabsContent value="browse" className="space-y-5">
          {/* Sticky filter bar */}
          <div
            className="sticky top-0 z-20 p-4 rounded-lg"
            style={{ background: S.surface, border: `1px solid ${S.border}`, backdropFilter: "blur(12px)" }}
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: S.textSec }} />
                <Input
                  placeholder="Search schemes by name, code, or description…"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                  style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}
                />
              </div>
              <Select value={filters.scheme_type} onValueChange={(v) => setFilters({ ...filters, scheme_type: v })}>
                <SelectTrigger className="w-full md:w-[160px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
                <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                  {schemeTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.government_level} onValueChange={(v) => setFilters({ ...filters, government_level: v })}>
                <SelectTrigger className="w-full md:w-[140px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
                <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3-col card grid */}
          {schemes.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <Award className="w-12 h-12 opacity-30" style={{ color: S.textSec }} />
              <p className="text-lg font-semibold" style={{ color: S.textPri }}>No schemes found</p>
              <p className="text-sm" style={{ color: S.textSec }}>
                {filters.search || filters.scheme_type !== "all" || filters.government_level !== "all"
                  ? "Try adjusting your filters"
                  : "No government schemes available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schemes.map((scheme) => {
                const userApplication = applications.find(app => app.scheme_id === scheme.scheme_id);
                const hasApplied = !!userApplication;
                return (
                  <motion.div key={scheme.scheme_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
                    <div
                      className="h-full flex flex-col p-5 rounded-lg cursor-pointer"
                      style={{ background: S.surface, border: `1px solid ${S.border}` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge style={{ background: "rgba(0,212,255,0.10)", color: S.cyan, border: `1px solid rgba(0,212,255,0.25)`, fontSize: 11 }}>
                          {scheme.government_level === "central" ? "Central" : "State"}
                        </Badge>
                        {hasApplied && getStatusIcon(userApplication.application_status)}
                      </div>
                      <h3 className="text-base font-semibold font-display mb-2 line-clamp-2" style={{ color: S.textPri }}>{scheme.scheme_name}</h3>
                      {scheme.scheme_code && <p className="text-xs mb-2" style={{ color: S.textSec }}>Code: {scheme.scheme_code}</p>}
                      <p className="text-sm mb-4 line-clamp-3 flex-1" style={{ color: S.textSec }}>{scheme.description}</p>
                      {scheme.max_benefit_amount && (
                        <div className="mb-3 p-2 rounded-lg" style={{ background: S.surface2 }}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <p className="text-xs" style={{ color: S.textSec }}>Max Benefit</p>
                            <HelpTooltip text="Maximum value or coverage from this scheme if you are eligible and approved." />
                          </div>
                          <p className="font-semibold" style={{ color: S.green }}>₹{Number(scheme.max_benefit_amount).toLocaleString("en-IN")}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(scheme)} className="flex-1 text-xs"
                          style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                          Details
                        </Button>
                        {!hasApplied ? (
                          <Button size="sm" onClick={() => handleApply(scheme)} className="flex-1 text-xs" style={{ background: S.cyan, color: "#070D1A" }}>
                            Apply
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("my-applications")} className="flex-1 text-xs"
                            style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textSec }}>
                            View Status
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── My Applications Tab ── */}
        <TabsContent value="my-applications" className="space-y-4">
          {applications.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <FileText className="w-12 h-12 opacity-30" style={{ color: S.textSec }} />
              <p className="text-lg font-semibold" style={{ color: S.textPri }}>No applications yet</p>
              <p className="text-sm" style={{ color: S.textSec }}>Browse schemes and apply for benefits you're eligible for</p>
              <Button onClick={() => setActiveTab("browse")} style={{ background: S.cyan, color: "#070D1A" }}>Browse Schemes</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const scheme = app.government_schemes;
                return (
                  <div key={app.id} className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold font-display" style={{ color: S.textPri }}>{scheme?.scheme_name || "Unknown Scheme"}</h3>
                          {getStatusBadge(app.application_status)}
                        </div>
                        {scheme?.scheme_code && <p className="text-xs" style={{ color: S.textSec }}>Code: {scheme.scheme_code}</p>}
                      </div>
                      {getStatusIcon(app.application_status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p style={{ color: S.textSec }}>Application Date</p>
                        <p className="font-medium" style={{ color: S.textPri }}>{app.application_date ? format(new Date(app.application_date), "MMM dd, yyyy") : "N/A"}</p>
                      </div>
                      {app.approval_date && (
                        <div>
                          <p style={{ color: S.textSec }}>Approval Date</p>
                          <p className="font-medium" style={{ color: S.textPri }}>{format(new Date(app.approval_date), "MMM dd, yyyy")}</p>
                        </div>
                      )}
                      {app.benefit_received && (
                        <div>
                          <p style={{ color: S.textSec }}>Benefit Received</p>
                          <p className="font-medium data-value" style={{ color: S.green }}>₹{Number(app.benefit_received).toLocaleString("en-IN")}</p>
                        </div>
                      )}
                    </div>
                    {app.application_notes && (
                      <div className="mb-3 p-3 rounded-lg" style={{ background: S.surface2 }}>
                        <p className="text-xs mb-1" style={{ color: S.textSec }}>Notes</p>
                        <p className="text-sm" style={{ color: S.textPri }}>{app.application_notes}</p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full"
                      onClick={() => { const s = schemes.find(s => s.scheme_id === app.scheme_id); if (s) handleViewDetails(s); }}
                      style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                      View Scheme Details
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Scheme Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          {selectedScheme && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={{ background: "rgba(0,212,255,0.10)", color: S.cyan, border: "1px solid rgba(0,212,255,0.25)", fontSize: 11 }}>
                    {selectedScheme.government_level === "central" ? "Central" : "State"} Government
                  </Badge>
                  {selectedScheme.scheme_type && (
                    <Badge style={{ background: S.surface2, color: S.textSec, border: `1px solid ${S.border}`, fontSize: 11 }} className="capitalize">
                      {selectedScheme.scheme_type.replace("_", " ")}
                    </Badge>
                  )}
                </div>
                <DialogTitle style={{ color: S.textPri }}>{selectedScheme.scheme_name}</DialogTitle>
                {selectedScheme.scheme_code && <DialogDescription style={{ color: S.textSec }}>Scheme Code: {selectedScheme.scheme_code}</DialogDescription>}
              </DialogHeader>
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: S.textPri }}>Description</h4>
                  <p className="text-sm leading-relaxed" style={{ color: S.textSec }}>{selectedScheme.description}</p>
                </div>
                {selectedScheme.benefits && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: S.textPri }}>Benefits</h4>
                    <div className="p-4 rounded-lg" style={{ background: S.surface2, border: `1px solid ${S.border}` }}>
                      <p className="text-sm whitespace-pre-line" style={{ color: S.textSec }}>{selectedScheme.benefits}</p>
                    </div>
                  </div>
                )}
                {selectedScheme.max_benefit_amount && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: S.textSec }}>Maximum Benefit</p>
                      <p className="text-xl font-bold data-value font-display" style={{ color: S.green }}>₹{Number(selectedScheme.max_benefit_amount).toLocaleString("en-IN")}</p>
                    </div>
                    {selectedScheme.interest_rate && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: S.textSec }}>Interest Rate</p>
                        <p className="text-xl font-bold data-value" style={{ color: S.textPri }}>{selectedScheme.interest_rate}%</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedScheme.eligibility_criteria && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: S.textPri }}>Eligibility Criteria</h4>
                    <div className="p-4 rounded-lg" style={{ background: S.surface2, border: `1px solid ${S.border}` }}>
                      {typeof selectedScheme.eligibility_criteria === "string" ? (
                        <p className="text-sm whitespace-pre-line" style={{ color: S.textSec }}>{selectedScheme.eligibility_criteria}</p>
                      ) : (
                        <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: S.textSec }}>
                          {Object.entries(selectedScheme.eligibility_criteria).map(([key, value]: [string, any]) => (
                            <li key={key}><span className="font-medium" style={{ color: S.textPri }}>{key}:</span> {String(value)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                {selectedScheme.required_documents && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: S.textPri }}>Required Documents</h4>
                    <div className="p-4 rounded-lg" style={{ background: S.surface2, border: `1px solid ${S.border}` }}>
                      {Array.isArray(selectedScheme.required_documents) ? (
                        <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: S.textSec }}>
                          {selectedScheme.required_documents.map((doc: string, idx: number) => <li key={idx}>{doc}</li>)}
                        </ul>
                      ) : typeof selectedScheme.required_documents === "object" ? (
                        <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: S.textSec }}>
                          {Object.values(selectedScheme.required_documents).map((doc: any, idx: number) => <li key={idx}>{String(doc)}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm" style={{ color: S.textSec }}>{String(selectedScheme.required_documents)}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedScheme.official_url && (
                  <Button variant="outline" onClick={() => window.open(selectedScheme.official_url, "_blank")} className="w-full"
                    style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                    <ExternalLink className="w-4 h-4 mr-2" />Visit Official Website
                  </Button>
                )}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="flex-1" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>Close</Button>
                  {!applications.find(app => app.scheme_id === selectedScheme.scheme_id) && (
                    <Button onClick={() => { setIsDetailOpen(false); handleApply(selectedScheme); }} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>Apply Now</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-2xl" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          {selectedScheme && (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: S.textPri }}>Apply for {selectedScheme.scheme_name}</DialogTitle>
                <DialogDescription style={{ color: S.textSec }}>Fill in the application details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg" style={{ background: S.surface2, border: `1px solid ${S.border}` }}>
                  <p className="text-sm" style={{ color: S.textSec }}><strong style={{ color: S.textPri }}>Application Date:</strong> {format(new Date(), "MMMM dd, yyyy")}</p>
                  <p className="text-sm mt-1" style={{ color: S.textSec }}><strong style={{ color: S.textPri }}>Status:</strong> Will be set to "Submitted" upon application</p>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: S.textSec }}>Application Notes (Optional)</Label>
                  <Textarea value={applyFormData.application_notes} onChange={(e) => setApplyFormData({ ...applyFormData, application_notes: e.target.value })} placeholder="Add any additional notes or information..." rows={4} />
                </div>
                {selectedScheme.required_documents && (
                  <div className="space-y-2">
                    <Label style={{ color: S.textSec }}>Required Documents</Label>
                    <div className="p-3 rounded-lg" style={{ background: S.surface2, border: `1px solid ${S.border}` }}>
                      {Array.isArray(selectedScheme.required_documents) ? (
                        <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: S.textSec }}>
                          {selectedScheme.required_documents.map((doc: string, idx: number) => <li key={idx}>{doc}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm" style={{ color: S.textSec }}>Please refer to the scheme details for required documents.</p>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: S.textSec }}>Note: Document submission will be handled through the official application process.</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsApplyOpen(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleSubmitApplication} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>Submit Application</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Benefits;
