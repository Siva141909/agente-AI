from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_admin_supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _e164(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    return "+91" + digits[-10:]


class OtpRequest(BaseModel):
    phone: str


class OtpVerify(BaseModel):
    phone: str
    token: str


@router.post("/send-otp")
async def send_otp(req: OtpRequest):
    try:
        get_admin_supabase().auth.sign_in_with_otp({"phone": _e164(req.phone)})
        return {"message": "OTP sent"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-otp")
async def verify_otp(req: OtpVerify):
    try:
        resp = get_admin_supabase().auth.verify_otp(
            {"phone": _e164(req.phone), "token": req.token, "type": "sms"}
        )
        return {
            "access_token": resp.session.access_token,
            "refresh_token": resp.session.refresh_token,
            "user_id": resp.user.id,
        }
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid OTP")
