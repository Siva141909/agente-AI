import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import db from "@/services/database";
import { toast } from "sonner";
import type { Recommendation } from "@/services/database";

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

const Tips = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "all", priority: "all", recommendation_type: "all", search: "" });

  useEffect(() => { loadRecommendations(); }, [filters]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await db.recommendations.getAll({
        status: filters.status !== "all" ? filters.status : undefined,
        priority: filters.priority !== "all" ? filters.priority : undefined,
        recommendation_type: filters.recommendation_type !== "all" ? filters.recommendation_type : undefined,
      });
      let filtered = data;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = data.filter(r => r.title?.toLowerCase().includes(query) || r.description?.toLowerCase().includes(query));
      }
      setRecommendations(filtered);
    } catch {
      toast.error("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await db.recommendations.update(id, { status: "completed" });
      toast.success("Marked as completed!");
      loadRecommendations();
    } catch { toast.error("Failed to update recommendation"); }
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    switch (priority?.toLowerCase()) {
      case "high":   return { background: "rgba(255,107,53,0.12)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.25)" };
      case "medium": return { background: "rgba(255,215,0,0.10)",  color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)" };
      case "low":    return { background: "rgba(0,212,255,0.08)",  color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" };
      default:       return {};
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" style={{ color: S.green }} />;
      case "rejected":  return <XCircle className="w-4 h-4" style={{ color: S.textSec }} />;
      default:          return <Clock className="w-4 h-4" style={{ color: "#FF6B35" }} />;
    }
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  return (
    <div className="space-y-6 page-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>AI Recommendations</h1>
          <p className="text-sm" style={{ color: S.textSec }}>Personalized financial tips powered by AI</p>
        </div>
        <Button onClick={loadRecommendations} variant="outline" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
          <RefreshCw className="w-4 h-4 mr-1.5" />Refresh
        </Button>
      </div>

      {/* ── Sticky filter bar ── */}
      <div
        className="sticky top-0 z-20 p-4 rounded-lg"
        style={{ background: S.surface, border: `1px solid ${S.border}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: S.textSec }} />
            <Input
              placeholder="Search recommendations…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
              style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}
            />
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-full md:w-[140px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="actioned">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
            <SelectTrigger className="w-full md:w-[130px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.recommendation_type} onValueChange={(v) => setFilters({ ...filters, recommendation_type: v })}>
            <SelectTrigger className="w-full md:w-[130px]" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
              <SelectItem value="risk">Risk</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Recommendations Grid ── */}
      {recommendations.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <Lightbulb className="w-12 h-12 opacity-30" style={{ color: S.textSec }} />
          <p className="text-lg font-semibold" style={{ color: S.textPri }}>No recommendations found</p>
          <p className="text-sm" style={{ color: S.textSec }}>
            {filters.status !== "all" || filters.priority !== "all" || filters.search
              ? "Try adjusting your filters"
              : "Check back later for personalized recommendations"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.recommendation_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="p-5 h-full flex flex-col cursor-pointer rounded-lg"
                style={{ background: S.surface, border: `1px solid ${S.border}` }}
                onClick={() => { setSelectedRec(rec); setIsDetailOpen(true); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge style={{ ...getPriorityStyle(rec.priority || "medium"), fontSize: 11 }}>
                    {rec.priority?.toUpperCase() || "MEDIUM"}
                  </Badge>
                  {getStatusIcon(rec.status)}
                </div>
                <h3 className="font-bold text-base mb-2 line-clamp-2 font-display" style={{ color: S.textPri }}>{rec.title}</h3>
                <p className="text-sm mb-4 line-clamp-3 flex-1" style={{ color: S.textSec }}>{rec.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <span className="text-xs" style={{ color: S.textSec }}>
                    {rec.confidence_score && `Confidence: ${Math.round(rec.confidence_score * 100)}%`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleMarkDone(rec.recommendation_id); }}
                    style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri, fontSize: 12 }}
                  >
                    Mark Done
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Detail Dialog ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          {selectedRec && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={getPriorityStyle(selectedRec.priority || "medium")}>{selectedRec.priority?.toUpperCase() || "MEDIUM"}</Badge>
                  {getStatusIcon(selectedRec.status)}
                </div>
                <DialogTitle style={{ color: S.textPri }}>{selectedRec.title}</DialogTitle>
                <DialogDescription style={{ color: S.textSec }}>{selectedRec.recommendation_type}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm" style={{ color: S.textPri }}>Description</h4>
                  <p className="text-sm" style={{ color: S.textSec }}>{selectedRec.description}</p>
                </div>
                {selectedRec.reasoning && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: S.textPri }}>AI Reasoning</h4>
                    <p className="text-sm" style={{ color: S.textSec }}>{selectedRec.reasoning}</p>
                  </div>
                )}
                {selectedRec.action_items && Array.isArray(selectedRec.action_items) && selectedRec.action_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: S.textPri }}>Action Items</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: S.textSec }}>
                      {selectedRec.action_items.map((item: string | { step?: string; timeline?: string; [key: string]: any }, idx: number) => {
                        const displayText = typeof item === "string" ? item : (item?.step || (item as any)?.timeline || JSON.stringify(item));
                        return <li key={idx}>{displayText}</li>;
                      })}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {selectedRec.target_amount && (
                    <div>
                      <p className="text-sm" style={{ color: S.textSec }}>Target Amount</p>
                      <p className="font-semibold data-value" style={{ color: S.textPri }}>₹{selectedRec.target_amount.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  {selectedRec.confidence_score && (
                    <div>
                      <p className="text-sm" style={{ color: S.textSec }}>Confidence</p>
                      <p className="font-semibold data-value" style={{ color: S.textPri }}>{Math.round(selectedRec.confidence_score * 100)}%</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm" style={{ color: S.textPri }}>Your Feedback</h4>
                  <Textarea placeholder="What do you think about this recommendation?" defaultValue={selectedRec.user_feedback || ""} rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={async () => {
                    try { await db.recommendations.update(selectedRec.recommendation_id, { status: "accepted" }); toast.success("Marked as accepted!"); setIsDetailOpen(false); loadRecommendations(); }
                    catch { toast.error("Failed to update"); }
                  }}>Helpful</Button>
                  <Button variant="outline" onClick={async () => {
                    try { await db.recommendations.update(selectedRec.recommendation_id, { status: "rejected" }); toast.success("Marked as not relevant"); setIsDetailOpen(false); loadRecommendations(); }
                    catch { toast.error("Failed to update"); }
                  }}>Not Relevant</Button>
                  <Button onClick={() => { handleMarkDone(selectedRec.recommendation_id); setIsDetailOpen(false); }} className="flex-1" style={{ background: S.cyan, color: "#070D1A" }}>
                    Already Following This
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tips;
