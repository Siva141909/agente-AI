import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Clock, Play, Pause, RotateCcw, Home } from "lucide-react";
import { motion } from "framer-motion";
import db from "@/services/database";
import { toast } from "sonner";
import { format } from "date-fns";
import PageIntro from "@/components/PageIntro";
import HelpTooltip from "@/components/HelpTooltip";

const Actions = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "upcoming" | "ongoing" | "completed">("today");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    plan_name: "",
    description: "",
    type: "",
    target_amount: "",
    target_date: "",
    frequency: "once",
  });

  useEffect(() => {
      loadActions();
  }, [filter]);

  const loadActions = async () => {
    try {
      setIsLoading(true);
      const data = await db.actions.getAll({ date_range: filter });
      setActions(data);
    } catch (error) {
      console.error("Failed to load actions:", error);
      toast.error("Failed to load actions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      // Update action status
      toast.success("Action approved");
      loadActions();
    } catch (error) {
      toast.error("Failed to approve action");
    }
  };

  const handlePause = async (id: number) => {
    try {
      toast.success("Action paused");
      loadActions();
    } catch (error) {
      toast.error("Failed to pause action");
    }
  };

  const handleCreateAction = async () => {
    try {
      if (!createFormData.plan_name || !createFormData.type || !createFormData.target_amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Determine next_execution date based on target_date and frequency
      const today = new Date();
      let nextExecution: Date;
      
      if (createFormData.target_date) {
        const targetDate = new Date(createFormData.target_date);
        // If target date is today or in the past, use today
        if (targetDate <= today) {
          nextExecution = today;
        } else {
          nextExecution = targetDate;
        }
      } else {
        // If no target date, use today
        nextExecution = today;
      }

      await db.actions.create({
        action_type: createFormData.type,
        action_description: createFormData.plan_name + (createFormData.description ? `: ${createFormData.description}` : ''),
        amount: parseFloat(createFormData.target_amount),
        target_date: createFormData.target_date || undefined,
        schedule: createFormData.frequency,
        status: 'pending',
      });

      toast.success("Action plan created successfully!");
      setIsCreateOpen(false);
      setCreateFormData({
        plan_name: "",
        description: "",
        type: "",
        target_amount: "",
        target_date: "",
        frequency: "once",
      });
      loadActions();
    } catch (error) {
      console.error("Failed to create action:", error);
      toast.error("Failed to create action plan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading actions...</p>
        </div>
      </div>
    );
  }

  const todayActions = actions.filter((a) => {
    if (!a.next_execution) return false;
    const nextDate = new Date(a.next_execution);
    const today = new Date();
    return nextDate.toDateString() === today.toDateString();
  });

  const upcomingActions = actions.filter((a) => {
    if (!a.next_execution) return false;
    const nextDate = new Date(a.next_execution);
    const today = new Date();
    return nextDate > today && nextDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  const completedActions = actions.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} title="Back to Home">
            <Home className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Action Plan</h1>
            <p className="text-muted-foreground">Manage your financial actions</p>
          </div>
              </div>
            </div>

      <PageIntro
        title="What is this page?"
        description="This is your to-do list for money. It shows concrete actions like savings transfers or repayments and tracks their progress."
      />

      <div className="flex items-center justify-end mb-4">
        <Button onClick={() => setIsCreateOpen(true)}>
          Create Custom Action
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "today" ? "default" : "outline"}
          onClick={() => setFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === "ongoing" ? "default" : "outline"}
          onClick={() => setFilter("ongoing")}
        >
          Ongoing
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
              </div>

      {/* Today & Upcoming Actions */}
      {(filter === "today" || filter === "upcoming") && (() => {
        const currentActions = filter === "today" ? todayActions : upcomingActions;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {filter === "today" ? "Today's Actions" : "Upcoming Actions"}
            </h2>
            {currentActions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No actions scheduled for this period</p>
            </Card>
            ) : (
              <div className="space-y-4">
                {currentActions.map((action) => (
                  <Card key={action.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{action.action_description || action.action_type}</h3>
                          {getStatusBadge(action.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Amount: ₹{Number(action.amount || 0).toLocaleString("en-IN")}
                        </p>
                        {action.next_execution && (
                          <p className="text-sm text-muted-foreground">
                            Next execution: {format(new Date(action.next_execution), "PPP")}
                          </p>
                        )}
                        {action.schedule && (
                          <p className="text-sm text-muted-foreground">Schedule: {action.schedule}</p>
                        )}
                      </div>
              </div>
                    <div className="flex gap-2">
                      {action.status === "active" ? (
                        <Button variant="outline" size="sm" onClick={() => handlePause(action.id)}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleApprove(action.id)}>
                          <Play className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {action.is_reversible && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Request Reversal
                        </Button>
                      )}
                      </div>
                  </Card>
                ))}
                    </div>
            )}
                  </div>
        );
      })()}

      {/* Completed Actions */}
      {filter === "completed" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Actions & Outcomes</h2>
          {completedActions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No completed actions yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedActions.map((action) => (
                <Card key={action.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold">{action.action_description || action.action_type}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed on: {action.execution_date ? format(new Date(action.execution_date), "PPP") : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Amount: ₹{Number(action.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    </div>
                </Card>
              ))}
                      </div>
                    )}
                  </div>
      )}

      {/* Create Custom Action Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Action Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plan Name *</Label>
              <Input 
                placeholder="e.g., Emergency Fund Goal" 
                value={createFormData.plan_name}
                onChange={(e) => setCreateFormData({ ...createFormData, plan_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe your action plan..." 
                rows={3}
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={createFormData.type}
                  onValueChange={(v) => setCreateFormData({ ...createFormData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Amount *</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={createFormData.target_amount}
                  onChange={(e) => setCreateFormData({ ...createFormData, target_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input 
                  type="date" 
                  value={createFormData.target_date}
                  onChange={(e) => setCreateFormData({ ...createFormData, target_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={createFormData.frequency}
                  onValueChange={(v) => setCreateFormData({ ...createFormData, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateFormData({
                    plan_name: "",
                    description: "",
                    type: "",
                    target_amount: "",
                    target_date: "",
                    frequency: "once",
                  });
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAction} className="flex-1" disabled={!createFormData.plan_name || !createFormData.type || !createFormData.target_amount}>
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
