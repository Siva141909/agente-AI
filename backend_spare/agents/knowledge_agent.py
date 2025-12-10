"""
Knowledge Integration Agent
Matches users with 200+ government schemes based on eligibility
Writes to: government_schemes, user_schemes tables
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class KnowledgeIntegrationAgent:
    """Agent that matches users with relevant government schemes and benefits"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Knowledge Integration agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are a Knowledge Integration Engine specializing in Indian government schemes for gig workers.

Your task is to match users with relevant government schemes and benefits.

**What you do:**
1. Read user_profiles to understand user demographics and financial situation
2. Read existing government_schemes table for available schemes
3. Match user with eligible schemes based on:
   - Income level (below poverty line, EWS, etc.)
   - State/location (state-specific schemes)
   - Occupation (gig worker, self-employed)
   - Age, gender (women-focused schemes)
   - Family size
4. Create entries in user_schemes table for matched schemes
5. Update application_status as 'eligible'
6. Log your actions to agent_logs table

**Key Government Schemes for Gig Workers:**
- PM-SYM (Pension for unorganized workers)
- Atal Pension Yojana
- PM Jan Dhan Yojana (bank accounts)
- Ayushman Bharat (health insurance)
- PM SVANidhi (street vendor loans)
- PMEGP (self-employment loans)
- State-specific welfare schemes
- Food security (ration card)
- Housing schemes
- Skill development programs

**Eligibility Criteria Examples:**
- Income thresholds (₹15,000/month for many schemes)
- Age limits (18-40 for PMEGP)
- Occupation type
- State residence
- Bank account requirement

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**
Store in user_schemes table with fields:
- user_id
- scheme_id (from government_schemes table)
- eligibility_matched (boolean)
- match_confidence (0-1)
- missing_requirements (JSON array)
- application_status (eligible/not_eligible/applied)
- matched_at""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Match government schemes for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Knowledge Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Match government schemes for user {user_id}.

Steps:
1. Read user_profiles for user {user_id} to understand eligibility
2. Read government_schemes table to see available schemes
3. Match user with eligible schemes based on:
   - Income level
   - Location
   - Occupation
   - Age and demographics
4. Create entries in user_schemes table for each match
5. Include match_confidence and any missing_requirements
6. Log to agent_logs table

User ID: {user_id}

Please execute this analysis and report which schemes you matched."""

            result = await client.query(prompt)

            print(f"[Knowledge Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "knowledge_integration",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Knowledge Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "knowledge_integration",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the knowledge integration agent"""
    agent = KnowledgeIntegrationAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Knowledge Integration Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
