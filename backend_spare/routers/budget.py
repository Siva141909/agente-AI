from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/budget", tags=["budget"])


class BudgetCreate(BaseModel):
    budget_type: str
    valid_from: str
    valid_until: str
    total_income_expected: float
    fixed_costs: Optional[dict] = {}
    variable_costs: Optional[dict] = {}
    savings_target: Optional[float] = 0
    discretionary_budget: Optional[float] = 0
    category_limits: Optional[dict] = {}
    is_active: Optional[bool] = True


@router.get("/")
async def list_budgets(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    return sb.table("budgets").select("*").eq("user_id", current.user_id).order("created_at", desc=True).execute().data or []


@router.get("/active")
async def get_active(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    result = (
        sb.table("budgets").select("*")
        .eq("user_id", current.user_id).eq("is_active", True)
        .lte("valid_from", today).gte("valid_until", today)
        .order("created_at", desc=True).limit(1).execute()
    )
    return result.data[0] if result.data else None


@router.post("/", status_code=201)
async def create_budget(data: BudgetCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    record = {"user_id": current.user_id, **data.model_dump(), "confidence_score": 0.8}
    return sb.table("budgets").insert(record).select().single().execute().data


@router.put("/{budget_id}")
async def update_budget(budget_id: str, data: BudgetCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    return (
        sb.table("budgets").update(updates)
        .eq("budget_id", budget_id).eq("user_id", current.user_id)
        .select().single().execute().data
    )
