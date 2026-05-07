from fastapi import APIRouter, Depends
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("/latest")
async def get_latest(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    result = (
        sb.table("risk_assessments").select("*")
        .eq("user_id", current.user_id)
        .order("assessment_date", desc=True).limit(1).execute()
    )
    return result.data[0] if result.data else None


@router.get("/")
async def list_all(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    return (
        sb.table("risk_assessments").select("*")
        .eq("user_id", current.user_id)
        .order("assessment_date", desc=True).execute().data or []
    )
