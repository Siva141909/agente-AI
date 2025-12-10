"""
FastAPI Backend for Spare Backend
Frontend (Windows) ↔ Backend (WSL) HTTP Connection

This backend:
1. Receives user_id from frontend login
2. Triggers all 9 agents for analysis
3. Agents push results to database via MCP
4. Returns status to frontend
5. Frontend fetches results directly from database
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from typing import Optional, Dict, Any
from datetime import datetime
import sys
import os

# Add agents directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'agents'))

# Import all agents
from pattern_agent import PatternRecognitionAgent
from budget_agent import BudgetAnalysisAgent
from context_agent import ContextIntelligenceAgent
from volatility_agent import VolatilityForecasterAgent
from knowledge_agent import KnowledgeIntegrationAgent
from tax_agent import TaxComplianceAgent
from recommendation_agent import RecommendationAgent
from risk_agent import RiskAssessmentAgent
from action_agent import ActionExecutionAgent

# Initialize FastAPI
app = FastAPI(
    title="Agente AI - Spare Backend",
    description="Background financial analysis service for gig workers",
    version="1.0.0"
)

# CORS configuration for Windows frontend ↔ WSL backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React default
        "http://localhost:5173",  # Vite default
        "http://localhost:8080",  # Vue default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class AnalysisRequest(BaseModel):
    user_id: str

class AnalysisResponse(BaseModel):
    status: str
    message: str
    user_id: str
    analysis_started: str
    estimated_completion_minutes: int

class StatusResponse(BaseModel):
    user_id: str
    status: str
    agents_completed: int
    total_agents: int
    last_updated: str

# In-memory status tracking (for MVP)
analysis_status: Dict[str, Dict[str, Any]] = {}


class AgentOrchestrator:
    """Orchestrates all 9 agents for a user"""

    def __init__(self, mcp_servers: str = ".mcp.json"):
        self.mcp_servers = mcp_servers
        self.agents = {
            "pattern": PatternRecognitionAgent(mcp_servers),
            "budget": BudgetAnalysisAgent(mcp_servers),
            "context": ContextIntelligenceAgent(mcp_servers),
            "volatility": VolatilityForecasterAgent(mcp_servers),
            "knowledge": KnowledgeIntegrationAgent(mcp_servers),
            "tax": TaxComplianceAgent(mcp_servers),
            "recommendation": RecommendationAgent(mcp_servers),
            "risk": RiskAssessmentAgent(mcp_servers),
            "action": ActionExecutionAgent(mcp_servers)
        }

    async def run_all_agents(self, user_id: str) -> Dict[str, Any]:
        """Run all 9 agents in sequence"""

        print(f"\n{'='*60}")
        print(f"Starting analysis for user {user_id}")
        print(f"{'='*60}\n")

        results = {
            "user_id": user_id,
            "analysis_started": datetime.now().isoformat(),
            "agents": {}
        }

        # Update status
        analysis_status[user_id] = {
            "status": "in_progress",
            "agents_completed": 0,
            "total_agents": 9,
            "last_updated": datetime.now().isoformat()
        }

        agent_names = [
            ("pattern", "Pattern Recognition"),
            ("context", "Context Intelligence"),
            ("volatility", "Volatility Forecaster"),
            ("budget", "Budget Analysis"),
            ("knowledge", "Knowledge Integration"),
            ("tax", "Tax & Compliance"),
            ("risk", "Risk Assessment"),
            ("recommendation", "Recommendation Engine"),
            ("action", "Action Execution")
        ]

        for idx, (agent_key, agent_name) in enumerate(agent_names, 1):
            print(f"\n[{idx}/9] Running {agent_name} Agent...")

            try:
                result = await self.agents[agent_key].analyze_user(user_id)
                results["agents"][agent_key] = result

                # Update status
                analysis_status[user_id]["agents_completed"] = idx
                analysis_status[user_id]["last_updated"] = datetime.now().isoformat()

                print(f"+ {agent_name} completed")

            except Exception as e:
                print(f"X {agent_name} failed: {str(e)}")
                results["agents"][agent_key] = {
                    "success": False,
                    "error": str(e)
                }

            # Brief pause between agents
            await asyncio.sleep(2)

        results["analysis_completed"] = datetime.now().isoformat()

        # Update final status
        analysis_status[user_id]["status"] = "completed"
        analysis_status[user_id]["last_updated"] = datetime.now().isoformat()

        print(f"\n{'='*60}")
        print(f"Analysis complete for user {user_id}")
        print(f"{'='*60}\n")

        return results


# Global orchestrator instance
orchestrator = AgentOrchestrator()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Agente AI - Spare Backend",
        "status": "running",
        "version": "1.0.0",
        "agents": 9
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def trigger_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Trigger complete financial analysis for a user

    Frontend calls this after login with user_id
    Analysis runs in background
    Frontend fetches results directly from database
    """

    user_id = request.user_id

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    # Check if analysis already in progress
    if user_id in analysis_status and analysis_status[user_id]["status"] == "in_progress":
        raise HTTPException(
            status_code=409,
            detail=f"Analysis already in progress for user {user_id}"
        )

    # Start analysis in background
    background_tasks.add_task(orchestrator.run_all_agents, user_id)

    return AnalysisResponse(
        status="started",
        message=f"Analysis started for user {user_id}. Results will be written to database.",
        user_id=user_id,
        analysis_started=datetime.now().isoformat(),
        estimated_completion_minutes=8
    )


@app.get("/api/status/{user_id}", response_model=StatusResponse)
async def get_analysis_status(user_id: str):
    """
    Get current status of analysis for a user

    Frontend can poll this to show progress
    """

    if user_id not in analysis_status:
        raise HTTPException(
            status_code=404,
            detail=f"No analysis found for user {user_id}"
        )

    status = analysis_status[user_id]

    return StatusResponse(
        user_id=user_id,
        status=status["status"],
        agents_completed=status["agents_completed"],
        total_agents=status["total_agents"],
        last_updated=status["last_updated"]
    )


@app.post("/api/analyze-sync")
async def trigger_analysis_sync(request: AnalysisRequest):
    """
    Trigger analysis and wait for completion (synchronous)

    WARNING: This will take 5-10 minutes
    Use /api/analyze (async) for production
    """

    user_id = request.user_id

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        results = await orchestrator.run_all_agents(user_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Agente AI Spare Backend",
        "agents": {
            "pattern": "ready",
            "budget": "ready",
            "context": "ready",
            "volatility": "ready",
            "knowledge": "ready",
            "tax": "ready",
            "recommendation": "ready",
            "risk": "ready",
            "action": "ready"
        },
        "database": "mcp_connected",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*60)
    print("Starting Agente AI Spare Backend")
    print("="*60)
    print("\nFrontend (Windows) can connect to:")
    print("  > http://localhost:8000")
    print("  > http://127.0.0.1:8000")
    print("\nAPI Endpoints:")
    print("  POST /api/analyze          - Trigger analysis (async)")
    print("  POST /api/analyze-sync     - Trigger analysis (sync)")
    print("  GET  /api/status/{user_id} - Get analysis status")
    print("  GET  /api/health           - Health check")
    print("\nDocs available at:")
    print("  > http://localhost:8000/docs")
    print("="*60 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",  # Accept connections from Windows
        port=8000,
        log_level="info"
    )
