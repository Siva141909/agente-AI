from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase, get_admin_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


class ApplicationCreate(BaseModel):
    scheme_id: str
    application_date: str
    application_status: Optional[str] = "submitted"
    documents_submitted: Optional[dict] = None
    application_notes: Optional[str] = None


@router.get("/")
async def list_schemes(current: CurrentUser = Depends(get_current_user)):
    # Schemes are public — use admin client (no RLS restriction on this table)
    return get_admin_supabase().table("government_schemes").select("*").eq("is_active", True).order("scheme_name").execute().data or []


@router.get("/applications")
async def list_applications(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    return (
        sb.table("user_scheme_applications")
        .select("*, government_schemes(scheme_name,scheme_code,scheme_type,benefits)")
        .eq("user_id", current.user_id)
        .order("application_date", desc=True)
        .execute().data or []
    )


@router.post("/applications", status_code=201)
async def apply(data: ApplicationCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    record = {"user_id": current.user_id, **data.model_dump()}
    return sb.table("user_scheme_applications").insert(record).select().single().execute().data
