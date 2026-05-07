from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    amount: float
    transaction_type: str
    category: Optional[str] = "Other"
    subcategory: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[str] = None
    transaction_time: Optional[str] = None
    payment_method: Optional[str] = "cash"
    merchant_name: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurring_frequency: Optional[str] = None
    tags: Optional[list[str]] = None


@router.get("/")
async def list_transactions(
    limit: int = Query(50, le=200),
    offset: int = 0,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    current: CurrentUser = Depends(get_current_user),
):
    sb = get_user_supabase(current.token)
    q = sb.table("transactions").select("*").eq("user_id", current.user_id)
    if from_date:
        q = q.gte("transaction_date", from_date)
    if to_date:
        q = q.lte("transaction_date", to_date)
    if transaction_type:
        q = q.eq("transaction_type", transaction_type)
    return q.order("transaction_date", desc=True).limit(limit).offset(offset).execute().data or []


@router.post("/", status_code=201)
async def create_transaction(data: TransactionCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    now = datetime.utcnow()
    record = {
        "user_id": current.user_id,
        "amount": data.amount,
        "transaction_type": data.transaction_type,
        "category": data.category or "Other",
        "subcategory": data.subcategory,
        "description": data.description,
        "transaction_date": data.transaction_date or now.strftime("%Y-%m-%d"),
        "transaction_time": data.transaction_time or now.strftime("%H:%M:%S"),
        "payment_method": data.payment_method or "cash",
        "merchant_name": data.merchant_name,
        "location": data.location,
        "source": data.source,
        "is_recurring": data.is_recurring or False,
        "recurring_frequency": data.recurring_frequency,
        "tags": data.tags,
        "verified": True,
        "input_method": "manual",
        "confidence_score": 1.0,
    }
    return sb.table("transactions").insert(record).select().single().execute().data


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: str, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    sb.table("transactions").delete().eq("transaction_id", transaction_id).eq("user_id", current.user_id).execute()


@router.get("/summary")
async def summary(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current: CurrentUser = Depends(get_current_user),
):
    sb = get_user_supabase(current.token)
    q = sb.table("transactions").select("amount,transaction_type").eq("user_id", current.user_id)
    if from_date:
        q = q.gte("transaction_date", from_date)
    if to_date:
        q = q.lte("transaction_date", to_date)
    rows = q.execute().data or []
    income = sum(r["amount"] for r in rows if r["transaction_type"] == "income")
    expense = sum(r["amount"] for r in rows if r["transaction_type"] == "expense")
    return {"income": income, "expense": expense, "count": len(rows)}
