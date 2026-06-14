import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Play, Pause, RotateCcw, Plus } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
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

type FilterType = "today" | "upcoming" | "ongoing" | "completed";

const Actions = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    plan_name: "", description: "", type: "", target_amount: "", target_date: "", frequency: "once",
  });

  useEffect(() => { loadActions(); }, [filter]);

  const loadActions = async () => {
    try {
      setIsLoading(true);
      const data = await db.actions.getAll({ date_range: filter });
      setActions(data);
    } catch {
      toast.error("Failed to load actions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("executed_actions")
        .update({ status: "active", user_approved: true, approval_date: new Date().toISOString() })
        .eq("id", id).eq("user_id", userId);
      if (error) throw error;
      toast.success("Action approved");
      loadActions();
    } catch { toast.error("Failed to approve action"); }
  };

  const handlePause = async (id: number) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("executed_actions").update({ status: "paused" }).eq("id", id).eq("user_id", userId);
      if (error) throw error;
      toast.success("Action paused");
      loadActions();
    } catch { toast.error("Failed to pause action"); }
  };

  const handleCreateAction = async () => {
    try {
      if (!createFormData.plan_name || !createFormData.type || !createFormData.target_amount) {
        toast.error("Please fill in all required fields"); return;
      }
      await db.actions.create({
        action_type: createFormData.type,
        action_description: createFormData.plan_name + (createFormData.description ? `: ${createFormData.description}` : ""),
        amount: parseFloat(createFormData.target_amount),
        target_date: createFormData.target_date || undefined,
        schedule: createFormData.frequency,
        status: "pending",
      });
      toast.success("Action plan created successfully!");
      setIsCreateOpen(false);
      setCreateFormData({ plan_name: "", description: "", type: "", target_amount: "", target_date: "", frequency: "once" });
      loadActions();
    } catch { toast.error("Failed to create action plan"); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>Completed</Badge>;
      case "active":    return <Badge style={{ background: "rgba(0,212,255,0.10)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>Active</Badge>;
      case "paused":    return <Badge style={{ background: "rgba(255,107,53,0.12)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.25)" }}>Paused</Badge>;
      default:          return <Badge style={{ background: S.surface2, color: S.textSec, border: `1px solid ${S.border}` }}>Pending</Badge>;
    }
  };

  const today     = new Date();
  const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const todayActions     = actions.filter(a => a.next_execution && new Date(a.next_execution).toDateString() === today.toDateString());
  const upcomingActions  = actions.filter(a => a.next_execution && new Date(a.next_execution) > today && new Date(a.next_execution) <= weekAhead);
  const ongoingActions   = actions.filter(a => a.status === "active" || a.status === "paused");
  const completedActions = actions.filter(a => a.status === "completed");

  const tabCounts: Record<FilterType, number> = {
    today: todayActions.length,
    upcoming: upcomingActions.length,
    ongoing: ongoingActions.length,
    completed: completedActions.length,
  };

  const currentActions: Record<FilterType, any[]> = {
    today: todayActions,
    upcoming: upcomingActions,
    ongoing: ongoingActions,
    completed: completedActions,
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  const TABS: { id: FilterType; label: string }[] = [
    { id: "today",     label: "Today" },
    { id: "upcoming",  label: "Upcoming" },
    { id: "ongoing",   label: "Ongoing" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6 page-in">
      {/* ── Header with dominant CTA ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Action Plan</h1>
          <p className="text-sm" style={{ color: S.textSec }}>Manage your financial actions</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} style={{ background: S.cyan, color: "#070D1A", fontWeight: 600 }}>
          <Plus className="w-4 h-4 mr-1.5" />Create Action
        </Button>
      </div>

      {/* ── Tab bar with count badges ── */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={filter === id
              ? { background: "rgba(0,212,255,0.12)", color: S.cyan }
              : { color: S.textSec }}
            onMouseEnter={(e) => { if (filter !== id) (e.currentTarget as HTMLButtonElement).style.color = S.textPri; }}
            onMouseLeave={(e) => { if (filter !== id) (e.currentTarget as HTMLButtonElement).style.color = S.textSec; }}
          >
            {label}
            {tabCounts[id] > 0 && (
              <span
                className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                style={filter === id
                  ? { background: S.cyan, color: "#070D1A" }
                  : { background: S.surface2, color: S.textSec }}
              >
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Actions list ── */}
      {currentActions[filter].length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <Clock className="w-12 h-12 opacity-30" style={{ color: S.textSec }} />
          <p className="text-lg font-semibold" style={{ color: S.textPri }}>
            {filter === "completed" ? "No completed actions yet" : `No ${filter} actions`}
          </p>
          <p className="text-sm" style={{ color: S.textSec }}>
            {filter === "today" ? "No actions scheduled for today" : `No ${filter} actions to show`}
          </p>
          <Button onClick={() => setIsCreateOpen(true)} style={{ background: S.cyan, color: "#070D1A" }}>
            <Plus className="w-4 h-4 mr-1.5" />Create Action
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {currentActions[filter].map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-lg"
              style={{ background: S.surface, border: `1px solid ${S.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {filter === "completed" && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: S.green }} />}
                    <h3 className="font-semibold text-base" style={{ color: S.textPri }}>{action.action_description || action.action_type}</h3>
                    {getStatusBadge(action.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: S.textSec }}>
                    <span className="data-value" style={{ color: S.cyan }}>₹{Number(action.amount || 0).toLocaleString("en-IN")}</span>
                    {action.next_execution && <span>Due: {format(new Date(action.next_execution), "MMM dd, yyyy")}</span>}
                    {action.execution_date && filter === "completed" && <span>Done: {format(new Date(action.execution_date), "MMM dd, yyyy")}</span>}
                    {action.schedule && <span>Schedule: {action.schedule}</span>}
                  </div>
                </div>
              </div>
              {filter !== "completed" && (
                <div className="flex gap-2">
                  {action.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => handlePause(action.id)} style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
                      <Pause className="w-4 h-4 mr-1.5" />Pause
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleApprove(action.id)} style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", color: S.cyan }}>
                      <Play className="w-4 h-4 mr-1.5" />Approve
                    </Button>
                  )}
                  {action.is_reversible && (
                    <Button variant="outline" size="sm" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textSec }}>
                      <RotateCcw className="w-4 h-4 mr-1.5" />Request Reversal
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create Action Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: S.textPri }}>Create Custom Action Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Plan Name *</Label>
              <Input placeholder="e.g., Emergency Fund Goal" value={createFormData.plan_name} onChange={(e) => setCreateFormData({ ...createFormData, plan_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: S.textSec }}>Description</Label>
              <Textarea placeholder="Describe your action plan…" rows={3} value={createFormData.description} onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Type *</Label>
                <Select value={createFormData.type} onValueChange={(v) => setCreateFormData({ ...createFormData, type: v })}>
                  <SelectTrigger style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Target Amount *</Label>
                <Input type="number" placeholder="0" value={createFormData.target_amount} onChange={(e) => setCreateFormData({ ...createFormData, target_amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Target Date</Label>
                <Input type="date" value={createFormData.target_date} onChange={(e) => setCreateFormData({ ...createFormData, target_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: S.textSec }}>Frequency</Label>
                <Select value={createFormData.frequency} onValueChange={(v) => setCreateFormData({ ...createFormData, frequency: v })}>
                  <SelectTrigger style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); setCreateFormData({ plan_name: "", description: "", type: "", target_amount: "", target_date: "", frequency: "once" }); }} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateAction} className="flex-1" disabled={!createFormData.plan_name || !createFormData.type || !createFormData.target_amount} style={{ background: S.cyan, color: "#070D1A" }}>
                Save Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Actions;
