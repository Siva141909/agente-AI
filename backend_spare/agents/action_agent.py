"""
Action Execution Agent
Executes automated actions and tracks outcomes
Writes to: executed_actions, action_outcomes tables
"""

import asyncio
import json
from datetime import datetime
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


class ActionExecutionAgent:
    """Agent that executes automated financial actions and tracks their outcomes"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agent_options = self._create_agent_options()

    def _create_agent_options(self) -> ClaudeAgentOptions:
        """Configure the Action Execution agent"""
        return ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt="""You are an Action Execution Engine that automates and tracks financial actions.

Your task is to identify actionable recommendations and create execution plans.

**What you do:**
1. Read recommendations table for high-priority items
2. Identify actions that can be automated or scheduled:
   - Budget allocations (auto-save on payday)
   - Debt payments (schedule EMI reminders)
   - Savings transfers (move to savings account)
   - Bill payments (set up auto-pay)
   - Investment SIPs (systematic investment plans)
3. Create entries in executed_actions table
4. For each action:
   - Define action_type and description
   - Set schedule (one-time/daily/weekly/monthly)
   - Determine amount and execution_date
   - Set status (scheduled/completed/failed)
5. Track outcomes in action_outcomes table:
   - Did user follow through?
   - What was actual achievement vs target?
   - Calculate achievement_percentage
6. Log your actions to agent_logs table

**Action Types:**
- auto_save: Automatically move money to savings
- debt_payment: Schedule loan/EMI payments
- budget_allocation: Allocate budget to categories
- bill_payment: Utility, rent, subscription payments
- investment: SIP, mutual funds, recurring deposits
- reminder: Remind user to take action

**Execution Status:**
- scheduled: Action is planned
- completed: Successfully executed
- failed: Could not execute
- cancelled: User cancelled

**Important:**
- NEVER execute actual money transfers (read-only for MVP)
- Create scheduled actions that user can approve
- Track user behavior to measure success
- Learn from failed actions

**Available MCP Tools:**
- mcp__supabase-postgres__postgrestRequest: Execute database queries
- mcp__supabase-postgres__sqlToRest: Convert SQL to REST API calls

**Output Format:**

executed_actions table:
- user_id
- action_type (auto_save/debt_payment/etc.)
- action_description
- status (scheduled/completed/failed)
- amount
- execution_date
- schedule (JSON: {frequency: 'monthly', day_of_month: 5})
- next_execution
- created_at

action_outcomes table:
- action_id (foreign key)
- target_amount
- actual_achievement
- achievement_percentage
- outcome_notes
- recorded_at""",
            mcp_servers=self.mcp_servers
        )

    async def analyze_user(self, user_id: str) -> dict:
        """
        Create automated actions for a specific user

        Args:
            user_id: UUID of the user to analyze

        Returns:
            dict with analysis results and success status
        """
        print(f"[Action Agent] Starting analysis for user {user_id}")

        client = ClaudeSDKClient(self.agent_options)

        try:
            # Connect to MCP servers
            await client.connect()

            prompt = f"""Create automated actions for user {user_id}.

Steps:
1. Read recommendations table for high-priority items
2. Read budgets to understand financial capacity
3. Read user_profiles for payday and account info
4. Identify 3-5 actions that can be automated:
   - Auto-save on payday
   - Debt payment reminders
   - Budget allocations
   - Bill payment schedules
5. Create entries in executed_actions table with:
   - Clear action description
   - Appropriate schedule (frequency)
   - Realistic amounts
   - Status as 'scheduled'
6. Set next_execution dates
7. Log to agent_logs table

User ID: {user_id}

Please execute this and report what actions you scheduled."""

            result = await client.query(prompt)

            print(f"[Action Agent] Analysis complete for user {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "agent": "action_execution",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[Action Agent] Error analyzing user {user_id}: {str(e)}")
            return {
                "success": False,
                "user_id": user_id,
                "agent": "action_execution",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


async def main():
    """Test the action execution agent"""
    agent = ActionExecutionAgent()

    test_user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"

    print(f"Testing Action Execution Agent with user {test_user_id}")
    result = await agent.analyze_user(test_user_id)

    print("\nResult:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
