"""RecommendationAgent — writes personalised tips to recommendations table."""
import json
from datetime import datetime
from agents.base import BaseAgent


class RecommendationAgent(BaseAgent):
    name = "recommendation_engine"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=60)
        user = self.get_user(user_id)

        risk_data = self.sb.table("risk_assessments").select("overall_risk_score, risk_factors").eq("user_id", user_id).order("assessment_date", desc=True).limit(1).execute().data
        pattern_data = self.sb.table("income_patterns").select("avg_income, monthly_trend, confidence_score").eq("user_id", user_id).execute().data

        data = self.ask_json(
            system="""You are a personal finance coach for Indian gig workers.
Generate 5 specific, actionable recommendations. Return JSON.""",
            user=f"""User: {user.get('occupation')} in {user.get('city')}
Risk: {json.dumps(risk_data[0] if risk_data else {})}
Income pattern: {json.dumps(pattern_data[0] if pattern_data else {})}
Recent transactions (sample): {json.dumps(txns[:15])}

Return JSON:
{{
  "recommendations": [
    {{
      "type": "<savings|investment|insurance|tax|expense|income>",
      "priority": "<high|medium|low>",
      "title": "<short title>",
      "description": "<2-3 sentences>",
      "action_items": ["<step 1>", "<step 2>"],
      "target_amount": <float or 0>,
      "confidence_score": <0-1>
    }}
  ]
}}""",
        )

        recs = data.get("recommendations", [])
        for rec in recs[:5]:
            self.sb.table("recommendations").insert({
                "user_id": user_id,
                "recommendation_type": rec.get("type", "general"),
                "priority": rec.get("priority", "medium"),
                "title": rec.get("title", ""),
                "description": rec.get("description", ""),
                "reasoning": "",
                "action_items": rec.get("action_items", []),
                "target_amount": rec.get("target_amount", 0),
                "confidence_score": rec.get("confidence_score", 0.7),
                "status": "pending",
                "created_at": datetime.utcnow().isoformat(),
            }).execute()

        self.log(user_id, "generate_recommendations", f"Generated {len(recs)} recommendations")
        return {"success": True, "agent": self.name, "count": len(recs)}
