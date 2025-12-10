"""
Context Intelligence Engine Agent
Enriches data with weather, festivals, and external events
Writes to: Enriches existing records with contextual data
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class ContextIntelligenceAgent:
    """Agent that adds contextual intelligence (weather, festivals, events) to financial data"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Context Intelligence agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Context Intelligence Engine for understanding external factors affecting gig worker income.

Your task is to enrich financial data with contextual information.

**What you do:**
1. Read user location from user_profiles
2. Identify relevant contextual factors:
   - Weather patterns (monsoon, extreme heat affecting outdoor work)
   - Cultural festivals (Diwali, Eid, Christmas - increased spending/earning)
   - Seasonal events (wedding season, holiday season)
   - Economic events (policy changes, fuel price hikes)
3. Update income_patterns table with context fields
4. Update income_forecasts with contextual adjustments
5. Log your actions to agent_logs table

**Contextual Factors for India:**
- Monsoon season (June-September): Reduced outdoor gig work
- Festival seasons: Diwali (Oct/Nov), Holi (Mar), Eid (varies)
- Wedding season (Nov-Feb): Increased catering, decoration work
- Summer (Apr-Jun): Heat affects delivery work
- Harvest seasons: Regional variations

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Important:**
- You may not have access to live weather APIs
- Use general seasonal knowledge for India
- Focus on well-known cultural events
- Be conservative with impact estimates

**Output:**
Enrich existing records by updating:
- income_patterns.weather_impact
- income_patterns.seasonal_factors
- income_forecasts with contextual adjustments""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Add contextual intelligence for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Context Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Add contextual intelligence for user {user_id}.

Steps:
1. Read user_profiles to get location and occupation
2. Identify relevant contextual factors (weather, festivals, seasons)
3. Update income_patterns with weather_impact and seasonal_factors
4. Note any upcoming events that may affect income
5. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report what context you added."""

            result = await client.query(prompt)

            print(f"[Context Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "context_intelligence",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Context Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "context_intelligence",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the context intelligence agent"""
    agent = ContextIntelligenceAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Context Intelligence Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
