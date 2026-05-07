"""RiskAssessmentAgent — writes to risk_assessments table."""
import json
from datetime import datetime
from agents.base import BaseAgent


class RiskAssessmentAgent(BaseAgent):
    name = "risk_assessment"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=90)
        user = self.get_user(user_id)
        patterns = self.sb.table("income_patterns").select("*").eq("user_id", user_id).execute().data
        pattern_info = patterns[0] if patterns else {}

        income_amounts = [t["amount"] for t in txns if t["transaction_type"] == "income"]
        avg = sum(income_amounts) / len(income_amounts) if income_amounts else 0
        volatility = (max(income_amounts) - min(income_amounts)) / avg if avg > 0 and income_amounts else 0

        data = self.ask_json(
            system="""You are a financial risk assessor for Indian gig workers.
Identify financial risks and mitigation strategies. Return JSON.""",
            user=f"""Occupation: {user.get('occupation')}, City: {user.get('city')}
Income volatility index: {volatility:.2f}
Average monthly income: ₹{avg:.0f}
Income patterns: {json.dumps(pattern_info)}
Recent transactions: {json.dumps(txns[:20])}

Return JSON:
{{
  "overall_risk_level": "<low|medium|high>",
  "emergency_fund_months": <float>,
  "risk_factors": [
    {{"factor": "<name>", "severity": <1-10>, "description": "<desc>"}}
  ],
  "mitigation_strategies": ["<strategy 1>", "<strategy 2>"],
  "insurance_recommendations": ["<recommendation>"]
}}""",
        )

        self.sb.table("risk_assessments").insert({
            "user_id": user_id,
            "assessment_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "overall_risk_score": data.get("overall_risk_level", "medium"),
            "income_risk_score": min(volatility * 3, 10),
            "expense_risk_score": 5.0,
            "savings_risk_score": 5.0,
            "emergency_fund_months": data.get("emergency_fund_months", 0),
            "risk_factors": data.get("risk_factors", []),
            "mitigation_strategies": data.get("mitigation_strategies", []),
            "insurance_recommendations": data.get("insurance_recommendations", []),
        }).execute()

        self.log(user_id, "assess_risk", f"Risk level: {data.get('overall_risk_level', 'unknown')}")
        return {"success": True, "agent": self.name, "data": data}
