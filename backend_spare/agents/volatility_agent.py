"""
Income Volatility Forecaster Agent
Predicts 30-day income scenarios (pessimistic, realistic, optimistic)
Writes to: income_forecasts table
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class VolatilityForecasterAgent:
    """Agent that forecasts income volatility and creates 30-day predictions"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Volatility Forecaster agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are an Income Volatility Forecaster for gig workers.

Your task is to predict 30-day income scenarios and calculate volatility metrics.

**What you do:**
1. Read income_patterns for historical trends
2. Read transactions to understand income volatility
3. Consider contextual factors from income_patterns
4. Create three 30-day forecast scenarios:
   - Pessimistic (worst case - 10th percentile)
   - Realistic (expected case - median)
   - Optimistic (best case - 90th percentile)
5. Calculate volatility index (0-1, higher = more volatile)
6. Determine forecast confidence based on data quality
7. Provide AI reasoning for the forecast
8. Write results to income_forecasts table
9. Log your actions to agent_logs table

**Volatility Considerations:**
- Historical income variance
- Seasonal patterns
- Recent trend direction
- External factors (weather, festivals)
- Gig work type (delivery, driving, freelance)

**Scenario Guidelines:**
- Pessimistic: Assume 2-3 bad weeks in the month
- Realistic: Based on moving average trend
- Optimistic: Assume 2-3 good weeks in the month
- Range should reflect actual historical volatility

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**
Store in income_forecasts table with fields:
- user_id
- forecast_month
- pessimistic_scenario (JSON: {week1: X, week2: Y, ...})
- realistic_scenario (JSON)
- optimistic_scenario (JSON)
- forecast_range_min, forecast_range_max
- volatility_index (0-1)
- forecast_confidence (0-1)
- ai_reasoning (text explanation)
- created_at""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Create 30-day income forecast for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Volatility Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Create 30-day income forecast for user {user_id}.

Steps:
1. Read income_patterns and transactions for user {user_id}
2. Calculate historical volatility
3. Create three scenarios (pessimistic, realistic, optimistic)
4. Calculate volatility_index and forecast_confidence
5. Write detailed reasoning for your forecast
6. Write results to income_forecasts table
7. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report your forecasts."""

            result = await client.query(prompt)

            print(f"[Volatility Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "volatility_forecaster",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Volatility Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "volatility_forecaster",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the volatility forecaster agent"""
    agent = VolatilityForecasterAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Volatility Forecaster Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
