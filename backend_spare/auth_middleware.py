from typing import NamedTuple
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db import get_admin_supabase

_bearer = HTTPBearer()


class CurrentUser(NamedTuple):
    user_id: str
    token: str   # original JWT, passed to get_user_supabase()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser:
    token = credentials.credentials
    try:
        resp = get_admin_supabase().auth.get_user(token)
        return CurrentUser(user_id=resp.user.id, token=token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
