"""
Recommendation Engine Agent
Generates personalized financial guidance based on all available data
Writes to: recommendations table
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class RecommendationAgent:
    """Agent that generates personalized financial recommendations"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Recommendation agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Recommendation Engine providing personalized financial guidance to gig workers.

Your task is to analyze all available data and generate actionable recommendations.

**What you do:**
1. Read multiple data sources:
   - income_patterns (income trends)
   - budgets (spending capacity)
   - income_forecasts (future predictions)
   - risk_assessments (risk factors)
   - user_profiles (goals, debts)
   - transactions (recent behavior)
2. Identify opportunities for improvement in:
   - Savings (emergency fund, goals)
   - Income optimization (timing, diversification)
   - Debt management (prioritization, consolidation)
   - Budget optimization (reduce waste)
   - Risk mitigation (insurance, diversification)
   - Tax efficiency (deductions, regime choice)
3. Create 3-7 prioritized recommendations
4. For each recommendation:
   - Clear title and description
   - AI reasoning (why this matters)
   - Action items (concrete steps)
   - Expected impact (confidence score, success probability)
5. Write results to recommendations table
6. Log your actions to agent_logs table

**Recommendation Types:**
- savings: Build emergency fund, increase savings rate
- income: Diversify income sources, optimize timing
- debt: Pay off high-interest debt, consolidate loans
- budget: Reduce discretionary spending, optimize categories
- risk: Get insurance, build emergency fund
- tax: Maximize deductions, choose optimal regime

**Priority Levels:**
- high: Critical issues (high debt, no emergency fund)
- medium: Important improvements (increase savings)
- low: Nice-to-have optimizations (minor budget tweaks)

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**
Store in recommendations table with fields:
- user_id
- recommendation_type (savings/income/debt/budget/risk/tax)
- priority (high/medium/low)
- title (short summary)
- description (detailed explanation)
- reasoning (AI explanation)
- action_items (JSON array of concrete steps)
- confidence_score (0-1)
- success_probability (0-1)
- created_at""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Generate recommendations for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Recommendation Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Generate personalized recommendations for user {user_id}.

Steps:
1. Read all available data:
   - income_patterns
   - budgets
   - income_forecasts
   - risk_assessments
   - user_profiles
   - Recent transactions
2. Identify 3-7 key recommendations across different types
3. Prioritize by impact and urgency
4. For each recommendation:
   - Write clear title and description
   - Explain AI reasoning
   - Provide actionable steps
   - Estimate confidence and success probability
5. Write all recommendations to recommendations table
6. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report the recommendations created."""

            result = await client.query(prompt)

            print(f"[Recommendation Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "recommendation_engine",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Recommendation Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "recommendation_engine",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the recommendation agent"""
    agent = RecommendationAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Recommendation Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
