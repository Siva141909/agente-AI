"""KnowledgeIntegrationAgent — matches government schemes to user profile."""
import json
from agents.base import BaseAgent


class KnowledgeIntegrationAgent(BaseAgent):
    name = "knowledge_integration"

    async def analyze_user(self, user_id: str) -> dict:
        user = self.get_user(user_id)
        schemes = self.sb.table("government_schemes").select("scheme_id, scheme_name, scheme_type, eligibility_criteria, benefits, government_level").eq("is_active", True).execute().data or []

        data = self.ask_json(
            system="""You are a government welfare schemes advisor for Indian gig workers.
Identify the most relevant schemes for this user. Return JSON.""",
            user=f"""User profile: occupation={user.get('occupation')}, city={user.get('city')}, state={user.get('state')}
Available schemes: {json.dumps(schemes[:20])}

Return JSON:
{{
  "recommended_scheme_ids": ["<scheme_id_1>", "<scheme_id_2>"],
  "reason": "<one sentence why these are relevant>",
  "tips": ["<tip 1>", "<tip 2>"]
}}""",
        )

        # Create scheme application stubs for recommended schemes
        for scheme_id in data.get("recommended_scheme_ids", [])[:3]:
            try:
                self.sb.table("user_scheme_applications").insert({
                    "user_id": user_id,
                    "scheme_id": scheme_id,
                    "application_date": __import__("datetime").datetime.utcnow().strftime("%Y-%m-%d"),
                    "application_status": "identified",
                    "application_notes": "Identified by AI agent",
                }).execute()
            except Exception:
                pass  # scheme may not exist or already applied

        self.log(user_id, "match_schemes", data.get("reason", "Schemes matched"))
        return {"success": True, "agent": self.name, "data": data}
