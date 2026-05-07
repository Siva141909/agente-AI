"""
Agente AI — FastAPI Backend
Frontend → this API → Supabase (user JWT, RLS enforced)
Agents are a separate server and are NOT part of this deployment.
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.transactions import router as transactions_router
from routers.recommendations import router as recommendations_router
from routers.stats import router as stats_router
from routers.budget import router as budget_router
from routers.schemes import router as schemes_router
from routers.tax import router as tax_router
from routers.risk import router as risk_router
from routers.actions import router as actions_router

app = FastAPI(
    title="Agente AI Backend",
    description="CRUD API for gig worker financial app",
    version="2.0.0",
    redirect_slashes=False,
)

_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = (
    [o.strip() for o in _origins_env.split(",") if o.strip()]
    or ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [
    auth_router, users_router, transactions_router, recommendations_router,
    stats_router, budget_router, schemes_router, tax_router, risk_router, actions_router,
]:
    app.include_router(r)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
async def root():
    return {"service": "Agente AI Backend", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
