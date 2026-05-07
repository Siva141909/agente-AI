from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/users", tags=["users"])


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    email: Optional[str] = None
    preferred_language: Optional[str] = None


@router.get("/me")
async def get_me(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    result = sb.table("users").select("*").eq("user_id", current.user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data


@router.put("/me")
async def update_me(data: UserUpdate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.utcnow().isoformat()
    result = (
        sb.table("users").update(updates)
        .eq("user_id", current.user_id).select().single().execute()
    )
    return result.data


@router.get("/me/profile")
async def get_profile(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    result = (
        sb.table("user_profiles").select("*")
        .eq("user_id", current.user_id).single().execute()
    )
    return result.data or {}
