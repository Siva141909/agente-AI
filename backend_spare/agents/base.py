"""
Base agent: fetches real data from Supabase, calls Claude API, writes results back.
No MCP, no custom SDKs — just anthropic + supabase-py.
"""

import os
import json
import logging
from datetime import datetime
from typing import Any
import anthropic
from supabase import Client

logger = logging.getLogger(__name__)

_claude: anthropic.Anthropic | None = None


def get_claude() -> anthropic.Anthropic:
    global _claude
    if _claude is None:
        _claude = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _claude


def _model() -> str:
    return os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")


class BaseAgent:
    name: str = "base"

    def __init__(self, supabase: Client):
        self.sb = supabase

    def ask(self, system: str, user: str, max_tokens: int = 2048) -> str:
        msg = get_claude().messages.create(
            model=_model(),
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text

    def ask_json(self, system: str, user: str, max_tokens: int = 2048) -> Any:
        raw = self.ask(system, user + "\n\nRespond with valid JSON only. No markdown, no explanation.", max_tokens)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())

    def log(self, user_id: str, action: str, result: str):
        try:
            self.sb.table("agent_logs").insert({
                "user_id": user_id,
                "agent_type": self.name,
                "action_taken": action,
                "result_summary": result[:500],
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            logger.warning(f"[{self.name}] log failed: {e}")

    def get_transactions(self, user_id: str, days: int = 90) -> list[dict]:
        from datetime import timedelta
        since = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        result = (
            self.sb.table("transactions").select(
                "transaction_date, amount, transaction_type, category, description, payment_method"
            ).eq("user_id", user_id).gte("transaction_date", since)
            .order("transaction_date", desc=True).execute()
        )
        return result.data or []

    def get_user(self, user_id: str) -> dict:
        result = self.sb.table("users").select("*").eq("user_id", user_id).single().execute()
        return result.data or {}

    async def analyze_user(self, user_id: str) -> dict:
        raise NotImplementedError
