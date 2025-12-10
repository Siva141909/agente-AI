"""
Risk Assessment Agent
Evaluates financial health and identifies risk factors
Writes to: risk_assessments table
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class RiskAssessmentAgent:
    """Agent that evaluates financial risks and determines escalation needs"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Risk Assessment agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Risk Assessment Engine evaluating financial health for gig workers.

Your task is to identify risks and determine if escalation to human advisors is needed.

**What you do:**
1. Read multiple data sources:
   - transactions (recent patterns)
   - income_patterns (volatility)
   - budgets (financial constraints)
   - user_profiles (debt, emergency fund)
   - income_forecasts (future outlook)
2. Evaluate 7 risk dimensions:
   - Income volatility risk (high variation)
   - Debt burden risk (high debt-to-income ratio)
   - Emergency fund risk (no safety net)
   - Expense spike risk (sudden large expenses)
   - Income drop risk (declining trend)
   - Transaction anomalies (unusual patterns)
   - Overall financial health
3. Calculate composite risk score (0-10)
4. Determine overall_risk_level (low/medium/high)
5. Identify if escalation_needed (critical cases)
6. Recommend actions to mitigate risks
7. Write results to risk_assessments table
8. Log your actions to agent_logs table

**Risk Scoring Guidelines:**
- 0-3: Low risk (stable income, good savings)
- 4-6: Medium risk (some concerns, manageable)
- 7-10: High risk (critical issues, needs intervention)

**Escalation Triggers:**
- Debt-to-income ratio > 50%
- No emergency fund + high volatility
- Income dropped > 30% recently
- Multiple late payments/defaults
- Severe budget deficit

**Key Metrics:**
- Debt-to-income ratio: Total debt / Monthly income
- Emergency fund coverage: Savings / Monthly expenses
- Volatility index: From income_patterns
- Trend: Improving/stable/declining

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**
Store in risk_assessments table with fields:
- user_id
- overall_risk_level (low/medium/high)
- risk_score (0-10)
- risk_factors (JSON: {volatility: X, debt: Y, ...})
- debt_to_income_ratio
- emergency_fund_coverage (months)
- escalation_needed (boolean)
- escalation_priority (low/medium/high/critical)
- recommended_actions (JSON array)
- assessment_date""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Assess financial risks for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Risk Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Assess financial risks for user {user_id}.

Steps:
1. Read all relevant data:
   - transactions
   - income_patterns
   - budgets
   - user_profiles
   - income_forecasts
2. Evaluate 7 risk dimensions
3. Calculate composite risk_score (0-10)
4. Determine overall_risk_level (low/medium/high)
5. Calculate debt_to_income_ratio and emergency_fund_coverage
6. Decide if escalation_needed (critical cases require human advisor)
7. Recommend specific actions to mitigate risks
8. Write results to risk_assessments table
9. Log to agent_logs table

User ID: {user_id}

Please execute this assessment and report the risk level."""

            result = await client.query(prompt)

            print(f"[Risk Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "risk_assessment",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Risk Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "risk_assessment",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the risk assessment agent"""
    agent = RiskAssessmentAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Risk Assessment Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
