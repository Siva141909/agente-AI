from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/tax", tags=["tax"])


class TaxRecordCreate(BaseModel):
    financial_year: str
    gross_income: Optional[float] = 0
    total_deductions: Optional[float] = 0
    tax_paid: Optional[float] = 0
    filing_status: Optional[str] = "not_filed"
    filing_date: Optional[str] = None
    acknowledgement_number: Optional[str] = None


@router.get("/")
async def list_records(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    return sb.table("tax_records").select("*").eq("user_id", current.user_id).order("financial_year", desc=True).execute().data or []


@router.get("/{financial_year}")
async def get_record(financial_year: str, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    result = sb.table("tax_records").select("*").eq("user_id", current.user_id).eq("financial_year", financial_year).single().execute()
    return result.data


@router.post("/", status_code=201)
async def create_record(data: TaxRecordCreate, current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    record = {
        "user_id": current.user_id,
        **data.model_dump(),
        "taxable_income": (data.gross_income or 0) - (data.total_deductions or 0),
        "tax_liability": 0,
    }
    return sb.table("tax_records").insert(record).select().single().execute().data
