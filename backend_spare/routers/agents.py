"""Agents router — trigger analysis and poll status."""
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from db import get_supabase
from auth_middleware import get_current_user_id
from agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/agents", tags=["agents"])


def _orchestrator():
    return AgentOrchestrator(get_supabase())


@router.post("/analyze")
async def trigger_analysis(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    status = AgentOrchestrator.get_status(user_id)
    if status and status.get("status") == "in_progress":
        raise HTTPException(status_code=409, detail="Analysis already in progress")

    background_tasks.add_task(_orchestrator().run_all_agents, user_id)

    return {
        "status": "started",
        "user_id": user_id,
        "message": "Analysis started. All 9 agents will run in background.",
        "estimated_minutes": 8,
    }


@router.get("/status")
async def get_status(user_id: str = Depends(get_current_user_id)):
    status = AgentOrchestrator.get_status(user_id)
    if not status:
        return {"status": "not_started", "user_id": user_id}
    return {"user_id": user_id, **status}
