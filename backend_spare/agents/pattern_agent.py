"""PatternRecognitionAgent — writes to income_patterns table."""
import json
from datetime import datetime
from agents.base import BaseAgent


class PatternRecognitionAgent(BaseAgent):
    name = "pattern_recognition"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=90)
        user = self.get_user(user_id)

        income_txns = [t for t in txns if t["transaction_type"] == "income"]
        amounts = [t["amount"] for t in income_txns]

        if not amounts:
            self.log(user_id, "analyze_patterns", "No income transactions found")
            return {"success": True, "skipped": True, "reason": "no income data"}

        data = self.ask_json(
            system="""You are a financial pattern analyst for Indian gig workers.
Analyze income transaction data and return patterns as JSON.""",
            user=f"""Occupation: {user.get('occupation', 'gig worker')}
City: {user.get('city', 'India')}
Income transactions (last 90 days): {json.dumps(income_txns[:60])}

Return JSON:
{{
  "avg_income": <float>,
  "min_income": <float>,
  "max_income": <float>,
  "weekday_income": {{"monday": 0, "tuesday": 0, "wednesday": 0, "thursday": 0, "friday": 0, "saturday": 0, "sunday": 0}},
  "monthly_trend": "<increasing|decreasing|stable>",
  "seasonal_factors": {{}},
  "confidence_score": <0-1>,
  "insights": "<1-2 sentences>"
}}""",
        )

        self.sb.table("income_patterns").upsert({
            "user_id": user_id,
            "avg_income": data.get("avg_income", 0),
            "min_income": data.get("min_income", 0),
            "max_income": data.get("max_income", 0),
            "weekday_income": data.get("weekday_income", {}),
            "monthly_trend": data.get("monthly_trend", "stable"),
            "seasonal_factors": data.get("seasonal_factors", {}),
            "confidence_score": data.get("confidence_score", 0.7),
            "last_updated": datetime.utcnow().isoformat(),
        }, on_conflict="user_id").execute()

        self.log(user_id, "analyze_patterns", data.get("insights", "Patterns analyzed"))
        return {"success": True, "agent": self.name, "data": data}
