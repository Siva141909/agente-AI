"""TaxComplianceAgent — calculates tax liability and writes to tax_records."""
import json
from datetime import datetime
from agents.base import BaseAgent


class TaxComplianceAgent(BaseAgent):
    name = "tax_compliance"

    async def analyze_user(self, user_id: str) -> dict:
        txns = self.get_transactions(user_id, days=365)
        user = self.get_user(user_id)

        income_txns = [t for t in txns if t["transaction_type"] == "income"]
        total_income = sum(t["amount"] for t in income_txns)
        expense_txns = [t for t in txns if t["transaction_type"] == "expense"]
        total_expenses = sum(t["amount"] for t in expense_txns)

        data = self.ask_json(
            system="""You are a tax advisor for Indian gig workers.
Calculate estimated tax liability under Indian income tax rules. Return JSON.""",
            user=f"""Occupation: {user.get('occupation')}
Annual gross income (from transactions): ₹{total_income:.0f}
Business expenses: ₹{total_expenses:.0f}
Current financial year: {datetime.utcnow().year}-{datetime.utcnow().year + 1 if datetime.utcnow().month >= 4 else datetime.utcnow().year}

Apply Section 44ADA presumptive taxation if applicable (50% of gross as taxable income).
Standard deduction: ₹50,000

Return JSON:
{{
  "financial_year": "<YYYY-YY>",
  "gross_income": <float>,
  "taxable_income": <float>,
  "tax_liability": <float>,
  "total_deductions": <float>,
  "applicable_scheme": "<44ADA|regular|nil>",
  "filing_deadline": "<YYYY-MM-DD>",
  "savings_tips": ["<tip 1>", "<tip 2>"]
}}""",
        )

        fy_now = datetime.utcnow()
        fy = f"{fy_now.year - 1}-{str(fy_now.year)[-2:]}" if fy_now.month < 4 else f"{fy_now.year}-{str(fy_now.year + 1)[-2:]}"

        self.sb.table("tax_records").upsert({
            "user_id": user_id,
            "financial_year": data.get("financial_year", fy),
            "gross_income": data.get("gross_income", total_income),
            "taxable_income": data.get("taxable_income", 0),
            "tax_liability": data.get("tax_liability", 0),
            "total_deductions": data.get("total_deductions", 0),
            "tax_paid": 0,
            "filing_status": "not_filed",
        }, on_conflict="user_id,financial_year").execute()

        self.log(user_id, "calculate_tax", f"Tax liability: ₹{data.get('tax_liability', 0):.0f}")
        return {"success": True, "agent": self.name, "data": data}
