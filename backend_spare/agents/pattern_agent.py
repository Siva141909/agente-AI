"""
Pattern Recognition Engine Agent
Analyzes transaction history to identify income patterns using LSTM-style analysis
Writes to: income_patterns table
"""

import asyncio
import json
from datetime import datetime
from typing import Optional
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class PatternRecognitionAgent:
    """Agent that analyzes transaction patterns and predicts income trends"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Pattern Recognition agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Pattern Recognition Engine for gig worker financial analysis.

Your task is to analyze transaction history and identify income patterns.

**What you do:**
1. Read transactions from the database (last 60 days minimum)
2. Calculate income statistics (average, min, max)
3. Identify weekday patterns (which days have higher income)
4. Detect monthly trends (increasing/decreasing/stable)
5. Analyze seasonal factors and weather impacts if data available
6. Calculate confidence score for predictions
7. Write results to income_patterns table
8. Log your actions to agent_logs table

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Important:**
- Focus on actionable insights for gig workers
- Consider income volatility and irregular patterns
- Identify "feast" and "famine" periods
- Be conservative with confidence scores
- Always log what you did

**Output Format:**
Store in income_patterns table with fields:
- user_id
- avg_income, min_income, max_income
- weekday_income (JSON: {monday: X, tuesday: Y, ...})
- monthly_trend (increasing/decreasing/stable)
- weather_impact (if applicable)
- seasonal_factors (JSON)
- confidence_score (0-1)
- last_updated""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Analyze transaction patterns for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Pattern Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            # Create the analysis prompt
            prompt = f"""Analyze income patterns for user {user_id}.

Steps:
1. Query transactions table for this user (last 60 days)
2. Calculate income statistics
3. Identify weekday patterns
4. Detect trends
5. Write results to income_patterns table
6. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report what you found."""

            # Run the agent
            result = await client.query(prompt)

            print(f"[Pattern Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "pattern_recognition",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Pattern Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "pattern_recognition",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the pattern recognition agent"""
    agent = PatternRecognitionAgent()

    # Test with the example user
    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Pattern Recognition Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
