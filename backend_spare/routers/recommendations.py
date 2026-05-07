from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class RecommendationUpdate(BaseModel):
    status: Optional[str] = None
    user_feedback: Optional[str] = None


@router.get("")
async def list_recommendations(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(20, le=50),
    current: CurrentUser = Depends(get_current_user),
):
    sb = get_user_supabase(current.token)
    q = (
        sb.table("recommendations").select("*")
        .eq("user_id", current.user_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if status:
        q = q.eq("status", status)
    if priority:
        q = q.eq("priority", priority)
    return q.execute().data or []


@router.put("/{recommendation_id}")
async def update_recommendation(
    recommendation_id: str,
    data: RecommendationUpdate,
    current: CurrentUser = Depends(get_current_user),
):
    sb = get_user_supabase(current.token)
    updates: dict = {"updated_at": datetime.utcnow().isoformat()}
    if data.status:
        updates["status"] = data.status
    if data.user_feedback:
        updates["user_feedback"] = data.user_feedback
    result = (
        sb.table("recommendations").update(updates)
        .eq("recommendation_id", recommendation_id)
        .eq("user_id", current.user_id)
        .select().single().execute()
    )
    return result.data
