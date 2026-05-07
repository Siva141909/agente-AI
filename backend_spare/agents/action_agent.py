"""ActionExecutionAgent — creates prioritised action items in executed_actions."""
import json
from datetime import datetime, timedelta
from agents.base import BaseAgent


class ActionExecutionAgent(BaseAgent):
    name = "action_execution"

    async def analyze_user(self, user_id: str) -> dict:
        user = self.get_user(user_id)
        recs = self.sb.table("recommendations").select("title, description, priority, recommendation_type, target_amount").eq("user_id", user_id).eq("status", "pending").order("created_at", desc=True).limit(10).execute().data or []

        if not recs:
            self.log(user_id, "create_actions", "No pending recommendations")
            return {"success": True, "skipped": True}

        data = self.ask_json(
            system="""You are an action planner for Indian gig workers.
Convert recommendations into concrete scheduled actions. Return JSON.""",
            user=f"""Occupation: {user.get('occupation')}
Pending recommendations: {json.dumps(recs)}

Return JSON:
{{
  "actions": [
    {{
      "action_type": "<save|invest|insure|track|apply>",
      "description": "<what to do specifically>",
      "amount": <float>,
      "schedule": "<once|weekly|monthly>",
      "days_from_now": <int 0-30>
    }}
  ]
}}""",
        )

        today = datetime.utcnow()
        for action in data.get("actions", [])[:5]:
            target = (today + timedelta(days=action.get("days_from_now", 7))).strftime("%Y-%m-%d")
            self.sb.table("executed_actions").insert({
                "user_id": user_id,
                "action_type": action.get("action_type", "save"),
                "action_description": action.get("description", ""),
                "amount": action.get("amount", 0),
                "status": "pending",
                "schedule": action.get("schedule", "once"),
                "next_execution": target,
                "user_approved": False,
                "is_reversible": True,
            }).execute()

        self.log(user_id, "create_actions", f"Created {len(data.get('actions', []))} actions")
        return {"success": True, "agent": self.name, "data": data}
