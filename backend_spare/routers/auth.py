from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["auth"])
# Auth is handled directly by Supabase JS on the frontend (email+password).
# This router is kept as a placeholder for future backend-mediated auth endpoints.
