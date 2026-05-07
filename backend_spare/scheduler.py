"""Monthly agent scheduler — runs all agents for every active user on the 1st at 2 AM."""
import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)
_scheduler = AsyncIOScheduler()


async def _monthly_run():
    from db import get_supabase
    from agents.orchestrator import AgentOrchestrator

    sb = get_supabase()
    users = sb.table("users").select("user_id").eq("is_active", True).execute().data or []
    logger.info(f"Monthly analysis starting for {len(users)} users")

    orchestrator = AgentOrchestrator(sb)
    for row in users:
        uid = row["user_id"]
        try:
            await orchestrator.run_all_agents(uid)
            logger.info(f"Monthly analysis done: {uid}")
        except Exception as e:
            logger.error(f"Monthly analysis failed for {uid}: {e}")


def start_scheduler():
    _scheduler.add_job(
        _monthly_run,
        CronTrigger(day=1, hour=2, minute=0),
        id="monthly_agent_run",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    _scheduler.start()
    logger.info("Scheduler started: agents will run on 1st of every month at 02:00 UTC")


def stop_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
