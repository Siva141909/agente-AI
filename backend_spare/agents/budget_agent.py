"""BudgetAnalysisAgent — writes feast/famine budgets to budgets table."""
import json
from datetime import datetime, timedelta
from agents.base import BaseAgent


class BudgetAnalysisAgent(BaseAgent):
    name = "budget_analysis"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=60)
        user = self.get_user(user_id)

        patterns = self.sb.table("income_patterns").select("*").eq("user_id", user_id).execute().data
        pattern_info = patterns[0] if patterns else {}

        data = self.ask_json(
            system="""You are a budget planning expert for Indian gig workers.
Create feast/famine budgets based on income volatility. Return JSON.""",
            user=f"""Occupation: {user.get('occupation', 'gig worker')}
City: {user.get('city', 'India')}
Recent transactions: {json.dumps(txns[:40])}
Income patterns: {json.dumps(pattern_info)}

Return JSON:
{{
  "feast_budget": {{
    "total_income_expected": <float>,
    "fixed_costs": {{"rent": 0, "loan_emi": 0, "phone_recharge": 0}},
    "variable_costs": {{"food": 0, "fuel": 0, "maintenance": 0}},
    "savings_target": <float>,
    "discretionary_budget": <float>
  }},
  "famine_budget": {{
    "total_income_expected": <float>,
    "fixed_costs": {{}},
    "variable_costs": {{}},
    "savings_target": <float>,
    "discretionary_budget": <float>
  }},
  "advice": "<one sentence>"
}}""",
        )

        today = datetime.utcnow()
        month_end = (today.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        avg_income = pattern_info.get("avg_income", 0)

        for btype, bdata in [("feast", data.get("feast_budget", {})), ("famine", data.get("famine_budget", {}))]:
            self.sb.table("budgets").insert({
                "user_id": user_id,
                "budget_type": btype,
                "valid_from": today.strftime("%Y-%m-%d"),
                "valid_until": month_end.strftime("%Y-%m-%d"),
                "total_income_expected": bdata.get("total_income_expected", avg_income),
                "fixed_costs": bdata.get("fixed_costs", {}),
                "variable_costs": bdata.get("variable_costs", {}),
                "savings_target": bdata.get("savings_target", 0),
                "discretionary_budget": bdata.get("discretionary_budget", 0),
                "category_limits": {},
                "confidence_score": 0.75,
                "is_active": True,
            }).execute()

        self.log(user_id, "create_budgets", data.get("advice", "Budgets created"))
        return {"success": True, "agent": self.name, "data": data}
