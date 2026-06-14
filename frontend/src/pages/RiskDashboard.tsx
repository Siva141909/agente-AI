import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, CheckCircle, RefreshCw } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import db from "@/services/database";
import { toast } from "sonner";
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

const RiskDashboard = () => {
  const [risk, setRisk] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadRiskAssessment(); }, []);

  const loadRiskAssessment = async () => {
    try {
      setIsLoading(true);
      const data = await db.riskAssessments.getLatest();
      setRisk(data);
    } catch {
      setRisk({
        overall_risk_level: "medium",
        risk_score: 5.5,
        debt_to_income_ratio: 0.3,
        income_drop_percentage: 0,
        expense_spike_factor: 1.0,
        emergency_fund_coverage: 2.5,
        risk_factors: [],
        recommended_actions: [],
        escalation_needed: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskStyle = (level: string): React.CSSProperties => {
    switch (level?.toLowerCase()) {
      case "low":    return { background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" };
      case "medium": return { background: "rgba(255,107,53,0.12)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.3)" };
      case "high":   return { background: "rgba(255,51,102,0.12)", color: "#FF3366", border: "1px solid rgba(255,51,102,0.3)" };
      default:       return { background: "rgba(107,140,174,0.12)", color: "#6B8CAE", border: "1px solid rgba(107,140,174,0.3)" };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low": return <Shield className="w-8 h-8" />;
      default:    return <AlertTriangle className="w-8 h-8" />;
    }
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  if (!risk) {
    return (
      <div className="py-24 text-center rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
        <p className="text-lg font-semibold" style={{ color: S.textPri }}>No risk assessment available</p>
        <p className="text-sm mt-1" style={{ color: S.textSec }}>Risk assessment will be generated based on your financial data</p>
      </div>
    );
  }

  const riskFactors       = risk.risk_factors || [];
  const recommendedActions = risk.recommended_actions || [];

  return (
    <div className="space-y-6 page-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" style={{ color: S.textPri }}>Risk Analysis</h1>
          <p className="text-sm" style={{ color: S.textSec }}>Financial health assessment</p>
        </div>
        <Button onClick={loadRiskAssessment} variant="outline" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.textPri }}>
          <RefreshCw className="w-4 h-4 mr-1.5" />Refresh
        </Button>
      </div>

      {/* ── Hero Risk Score ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg"
        style={{ background: S.surface, border: `1px solid ${S.border}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={getRiskStyle(risk.overall_risk_level)}>
            {getRiskIcon(risk.overall_risk_level)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm" style={{ color: S.textSec }}>Overall Risk Level</p>
              <HelpTooltip text="Quick summary of how fragile or safe your money situation is right now." />
            </div>
            <p className="text-4xl font-bold capitalize font-display" style={{ color: S.textPri }}>{risk.overall_risk_level || "Medium"}</p>
            <p className="text-sm mt-1" style={{ color: S.textSec }}>Risk Score: <span className="font-semibold data-value" style={{ color: S.cyan }}>{risk.risk_score?.toFixed(1) || "N/A"}</span> / 10</p>
          </div>
          {/* Score bar */}
          <div className="flex-1 space-y-2">
            <div className="w-full h-3 rounded-full" style={{ background: S.surface2 }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min(((risk.risk_score || 0) / 10) * 100, 100)}%`,
                  background: risk.overall_risk_level === "low" ? "#00FF88"
                            : risk.overall_risk_level === "high" ? "#FF3366" : "#FF6B35",
                }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: S.textSec }}>
              <span>0 — Safe</span><span>10 — Critical</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 4 Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Debt-to-Income", value: risk.debt_to_income_ratio ? `${(risk.debt_to_income_ratio * 100).toFixed(1)}%` : "N/A", tooltip: "Part of your income that goes into EMIs and loan payments." },
          { label: "Income Drop",    value: `${risk.income_drop_percentage?.toFixed(1) || 0}%`,                                       tooltip: "How much your income has fallen compared to previous periods." },
          { label: "Expense Spike",  value: `${risk.expense_spike_factor?.toFixed(2) || "1.0"}×`,                                    tooltip: "How much your spending increased compared to your usual level." },
          { label: "Emergency Cover",value: `${risk.emergency_fund_coverage?.toFixed(1) || "N/A"} mo`,                                tooltip: "How many months you can survive on savings if income stops." },
        ].map(({ label, value, tooltip }) => (
          <div key={label} className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs" style={{ color: S.textSec }}>{label}</p>
              <HelpTooltip text={tooltip} />
            </div>
            <p className="text-2xl font-bold data-value font-display" style={{ color: S.textPri }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column: Risk Factors + Recommended Actions ── */}
      {(riskFactors.length > 0 || recommendedActions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Factors */}
          <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            <h3 className="text-base font-semibold font-display mb-4" style={{ color: S.textPri }}>Risk Factors</h3>
            {riskFactors.length > 0 ? (
              <div className="space-y-3">
                {riskFactors.map((factor: any, index: number) => {
                  const factorName   = typeof factor === "string" ? factor : (factor?.name || factor?.factor || factor?.detail || JSON.stringify(factor));
                  const factorDetail = typeof factor === "object"  ? (factor?.detail || factor?.impact || factor?.description) : null;
                  const severity     = typeof factor === "object"  ? factor?.severity : null;
                  return (
                    <div key={index} className="p-3 rounded-lg" style={{ background: S.surface2 }}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#FF6B35" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm" style={{ color: S.textPri }}>{factorName}</p>
                            {severity && <Badge variant="outline" className="text-xs">{severity}</Badge>}
                          </div>
                          {factorDetail && <p className="text-xs mt-1" style={{ color: S.textSec }}>{factorDetail}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: S.textSec }}>No risk factors detected</p>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="p-5 rounded-lg" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            <h3 className="text-base font-semibold font-display mb-4" style={{ color: S.textPri }}>Recommended Actions</h3>
            {recommendedActions.length > 0 ? (
              <div className="space-y-3">
                {recommendedActions.map((action: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: S.cyan }} />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: S.textPri }}>
                          {typeof action === "string" ? action : action.action || action.title}
                        </p>
                        {typeof action === "object" && action.description && (
                          <p className="text-xs mt-1" style={{ color: S.textSec }}>{action.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: S.textSec }}>No actions recommended</p>
            )}
          </div>
        </div>
      )}

      {/* Escalation Banner */}
      {risk.escalation_needed && (
        <Alert style={{ background: "rgba(255,51,102,0.10)", border: "1px solid rgba(255,51,102,0.3)" }}>
          <AlertTriangle className="h-4 w-4" style={{ color: S.danger }} />
          <AlertDescription style={{ color: S.danger }}>
            <strong>High Risk Detected:</strong> {risk.escalation_reason || "Please review your financial situation and consider seeking professional advice."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RiskDashboard;
