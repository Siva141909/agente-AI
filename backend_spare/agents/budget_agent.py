"""
Budget Analysis Engine Agent
Calculates feast/famine budgets based on income patterns
Writes to: budgets table
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class BudgetAnalysisAgent:
    """Agent that creates feast/famine week budgets for gig workers"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Budget Analysis agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Budget Analysis Engine for gig worker financial planning.

Your task is to create realistic feast/famine budgets based on income volatility.

**What you do:**
1. Read income_patterns table for the user
2. Read user_profiles for fixed costs and financial obligations
3. Calculate feast_week budget (high income periods)
4. Calculate famine_week budget (low income periods)
5. Calculate monthly budget (averaged)
6. Determine category-wise spending limits
7. Set savings targets based on income variability
8. Write results to budgets table
9. Log your actions to agent_logs table

**Feast/Famine Budgeting:**
- Feast week: When income > average, allocate more to savings/debt
- Famine week: When income < average, focus on essentials only
- Monthly: Balanced budget assuming average income

**Budget Categories:**
- Fixed costs: Rent, EMIs, subscriptions (from user_profile)
- Variable costs: Food, transportation, utilities
- Discretionary: Entertainment, dining out
- Savings: Emergency fund, goals
- Debt repayment: Credit cards, loans

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**
Store in budgets table with fields:
- user_id
- budget_type (feast_week/famine_week/monthly)
- total_income_expected
- fixed_costs (JSON)
- variable_costs (JSON)
- savings_target
- discretionary_budget
- category_limits (JSON)
- created_at""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Create budget plans for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Budget Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Create feast/famine budgets for user {user_id}.

Steps:
1. Read income_patterns for user {user_id}
2. Read user_profiles for fixed costs
3. Create three budgets:
   - feast_week (high income period)
   - famine_week (low income period)
   - monthly (averaged)
4. Write all three budgets to budgets table
5. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report the budgets created."""

            result = await client.query(prompt)

            print(f"[Budget Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "budget_analysis",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Budget Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "budget_analysis",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the budget analysis agent"""
    agent = BudgetAnalysisAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Budget Analysis Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
