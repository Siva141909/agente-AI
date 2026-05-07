"""ContextIntelligenceAgent — derives key financial insights, logs to agent_logs."""
import json
from agents.base import BaseAgent


class ContextIntelligenceAgent(BaseAgent):
    name = "context_intelligence"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=30)
        user = self.get_user(user_id)

        data = self.ask_json(
            system="""You are a financial health advisor for Indian gig workers.
Summarize the user's current financial context. Return JSON.""",
            user=f"""User: {user.get('full_name')}, {user.get('occupation')}, {user.get('city')}
Recent transactions (30 days): {json.dumps(txns[:20])}

Return JSON:
{{
  "financial_health": "<excellent|good|fair|poor>",
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "spending_pattern": "<one sentence>",
  "income_stability": "<stable|volatile|improving>",
  "next_steps": ["<step 1>", "<step 2>"]
}}""",
        )

        self.log(user_id, "context_analysis", f"Health: {data.get('financial_health')}. {data.get('spending_pattern', '')}")
        return {"success": True, "agent": self.name, "data": data}
