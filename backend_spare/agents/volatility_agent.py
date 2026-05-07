"""VolatilityForecasterAgent — writes to income_forecasts table."""
import json
from datetime import datetime, timedelta
from agents.base import BaseAgent


class VolatilityForecasterAgent(BaseAgent):
    name = "volatility_forecaster"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=90)
        patterns = self.sb.table("income_patterns").select("*").eq("user_id", user_id).execute().data
        pattern_info = patterns[0] if patterns else {}

        data = self.ask_json(
            system="""You are an income forecaster for Indian gig workers.
Predict income for the next 30 days considering volatility. Return JSON.""",
            user=f"""Income patterns: {json.dumps(pattern_info)}
Recent transactions: {json.dumps(txns[:30])}

Return JSON:
{{
  "forecast_period_days": 30,
  "predicted_total_income": <float>,
  "confidence_score": <0-1>,
  "high_income_days": ["monday", "friday"],
  "low_income_days": ["tuesday"],
  "risk_level": "<low|medium|high>",
  "advice": "<one sentence>"
}}""",
        )

        forecast_start = datetime.utcnow()
        forecast_end = forecast_start + timedelta(days=30)

        self.sb.table("income_forecasts").insert({
            "user_id": user_id,
            "forecast_date": forecast_start.strftime("%Y-%m-%d"),
            "forecast_period": "monthly",
            "predicted_income": data.get("predicted_total_income", 0),
            "confidence_score": data.get("confidence_score", 0.6),
            "forecast_factors": {
                "high_income_days": data.get("high_income_days", []),
                "low_income_days": data.get("low_income_days", []),
                "risk_level": data.get("risk_level", "medium"),
            },
            "period_start": forecast_start.strftime("%Y-%m-%d"),
            "period_end": forecast_end.strftime("%Y-%m-%d"),
        }).execute()

        self.log(user_id, "forecast_income", data.get("advice", "Forecast complete"))
        return {"success": True, "agent": self.name, "data": data}
