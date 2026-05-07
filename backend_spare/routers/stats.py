from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from db import get_user_supabase
from auth_middleware import get_current_user, CurrentUser

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
async def get_stats(current: CurrentUser = Depends(get_current_user)):
    sb = get_user_supabase(current.token)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    month_start = datetime.utcnow().replace(day=1).strftime("%Y-%m-%d")

    rows = (
        sb.table("transactions")
        .select("amount,transaction_type,transaction_date")
        .eq("user_id", current.user_id)
        .execute().data or []
    )

    total_income = sum(r["amount"] for r in rows if r["transaction_type"] == "income")
    total_expense = sum(r["amount"] for r in rows if r["transaction_type"] == "expense")

    today_rows = [r for r in rows if r["transaction_date"] == today]
    month_rows = [r for r in rows if r["transaction_date"] >= month_start]

    daily: dict[str, dict] = {}
    for i in range(30):
        d = (datetime.utcnow() - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily[d] = {"date": d, "income": 0.0, "expense": 0.0}
    for r in rows:
        if r["transaction_date"] in daily:
            key = "income" if r["transaction_type"] == "income" else "expense"
            daily[r["transaction_date"]][key] += r["amount"]

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "today_income": sum(r["amount"] for r in today_rows if r["transaction_type"] == "income"),
        "today_expense": sum(r["amount"] for r in today_rows if r["transaction_type"] == "expense"),
        "month_income": sum(r["amount"] for r in month_rows if r["transaction_type"] == "income"),
        "month_expense": sum(r["amount"] for r in month_rows if r["transaction_type"] == "expense"),
        "daily_chart": list(daily.values()),
    }
