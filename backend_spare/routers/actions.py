from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/actions", tags=["actions"])


class ActionCreate(BaseModel):
    action_type: str
    action_description: str
    amount: float
    target_date: Optional[str] = None
    schedule: Optional[str] = "once"
    status: Optional[str] = "pending"


@router.get("")
async def list_actions(
    status: Optional[str] = None,
    current: CurrentUser = Depends(get_current_user),
):
    sb = get_user_supabase(current.token)
    q = sb.table("executed_actions").select("*").eq("user_id", current.user_id).order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return q.execute().data or []


@router.post("", status_code=201)
async def create_action(data: ActionCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    record = {
        "user_id": current.user_id,
        "action_type": data.action_type,
        "action_description": data.action_description,
        "amount": data.amount,
        "status": data.status or "pending",
        "schedule": data.schedule or "once",
        "next_execution": data.target_date or today,
        "user_approved": False,
        "is_reversible": True,
    }
    return sb.table("executed_actions").insert(record).select().single().execute().data


@router.put("/{action_id}/complete")
async def complete_action(action_id: str, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    return (
        sb.table("executed_actions")
        .update({"status": "completed", "user_approved": True})
        .eq("id", action_id).eq("user_id", current.user_id)
        .select().single().execute().data
    )
