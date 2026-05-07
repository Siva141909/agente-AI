"""AgentOrchestrator — runs all 9 agents in sequence for a given user."""
import asyncio
import logging
from datetime import datetime
from typing import Any
from supabase import Client

from agents.pattern_agent import PatternRecognitionAgent
from agents.budget_agent import BudgetAnalysisAgent
from agents.context_agent import ContextIntelligenceAgent
from agents.volatility_agent import VolatilityForecasterAgent
from agents.knowledge_agent import KnowledgeIntegrationAgent
from agents.tax_agent import TaxComplianceAgent
from agents.recommendation_agent import RecommendationAgent
from agents.risk_agent import RiskAssessmentAgent
from agents.action_agent import ActionExecutionAgent

logger = logging.getLogger(__name__)

# In-memory status tracker (per-pod, fine for single instance)
_status: dict[str, dict[str, Any]] = {}

PIPELINE = [
    ("pattern",        PatternRecognitionAgent,  "Pattern Recognition"),
    ("context",        ContextIntelligenceAgent, "Context Intelligence"),
    ("volatility",     VolatilityForecasterAgent,"Volatility Forecaster"),
    ("budget",         BudgetAnalysisAgent,      "Budget Analysis"),
    ("knowledge",      KnowledgeIntegrationAgent,"Knowledge Integration"),
    ("tax",            TaxComplianceAgent,        "Tax Compliance"),
    ("risk",           RiskAssessmentAgent,       "Risk Assessment"),
    ("recommendation", RecommendationAgent,       "Recommendation Engine"),
    ("action",         ActionExecutionAgent,      "Action Execution"),
]


class AgentOrchestrator:
    def __init__(self, supabase: Client):
        self.sb = supabase

    async def run_all_agents(self, user_id: str) -> dict:
        _status[user_id] = {
            "status": "in_progress",
            "agents_completed": 0,
            "total_agents": len(PIPELINE),
            "started_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat(),
        }

        results: dict[str, Any] = {}

        for idx, (key, AgentClass, label) in enumerate(PIPELINE, 1):
            logger.info(f"[{idx}/{len(PIPELINE)}] {label} — user {user_id}")
            try:
                agent = AgentClass(self.sb)
                result = await agent.analyze_user(user_id)
                results[key] = result
                _status[user_id]["agents_completed"] = idx
                _status[user_id]["last_updated"] = datetime.utcnow().isoformat()
            except Exception as e:
                logger.error(f"{label} failed for {user_id}: {e}")
                results[key] = {"success": False, "error": str(e)}
            await asyncio.sleep(1)  # brief pause between Claude calls

        _status[user_id]["status"] = "completed"
        _status[user_id]["last_updated"] = datetime.utcnow().isoformat()
        return results

    @staticmethod
    def get_status(user_id: str) -> dict | None:
        return _status.get(user_id)
