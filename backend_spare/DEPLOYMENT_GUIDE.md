# Deployment Guide - Spare Backend

**Frontend (Windows) ↔ Backend (WSL) ↔ Database (Supabase)**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Windows (Local)                       │
│                                                  │
│  ┌──────────────┐                               │
│  │   Frontend   │                               │
│  │  (React/Vue) │                               │
│  └──────┬───────┘                               │
│         │                                        │
│         │ 1. Login → Get user_id                │
│         │ 2. POST /api/analyze {user_id}        │
│         │                                        │
└─────────┼────────────────────────────────────────┘
          │
          │ HTTP (localhost:8000)
          │
┌─────────▼────────────────────────────────────────┐
│           WSL Ubuntu                             │
│                                                  │
│  ┌───────────────────────────────────┐          │
│  │    FastAPI Backend (main.py)      │          │
│  │    Port: 8000                     │          │
│  └───────────────┬───────────────────┘          │
│                  │                               │
│  ┌───────────────▼───────────────────┐          │
│  │    Agent Orchestrator             │          │
│  │    Runs 9 agents sequentially     │          │
│  │                                    │          │
│  │  1. Pattern Recognition            │          │
│  │  2. Context Intelligence           │          │
│  │  3. Volatility Forecaster          │          │
│  │  4. Budget Analysis                │          │
│  │  5. Knowledge Integration          │          │
│  │  6. Tax & Compliance (with RAG)   │          │
│  │  7. Risk Assessment                │          │
│  │  8. Recommendation Engine          │          │
│  │  9. Action Execution               │          │
│  └───────────────┬───────────────────┘          │
│                  │                               │
│                  │ MCP (Model Context Protocol)  │
└──────────────────┼───────────────────────────────┘
                   │
                   │
┌──────────────────▼───────────────────────────────┐
│          Supabase PostgreSQL                     │
│                                                  │
│  Tables: income_patterns, budgets,              │
│          income_forecasts, tax_records,         │
│          recommendations, risk_assessments,     │
│          executed_actions, user_schemes, etc.   │
└──────────────────────────────────────────────────┘
          ▲
          │
          │ Direct reads (Supabase JS client)
          │
┌─────────┴────────────────────────────────────────┐
│        Frontend (Windows)                        │
│        Fetches results from database             │
└──────────────────────────────────────────────────┘
```

---

## Prerequisites

### 1. Windows Requirements
- Windows 10/11 with WSL2 installed
- Frontend development environment (Node.js, npm/yarn)

### 2. WSL Ubuntu Requirements
- Ubuntu 20.04+ in WSL
- Python 3.11+
- Node.js 18+
- npm or yarn

---

## Setup Instructions

### Step 1: Setup WSL Backend

#### 1.1 Open WSL Terminal

```bash
# From Windows Command Prompt or PowerShell
wsl -d Ubuntu

# Navigate to project
cd /mnt/c/Users/rasiv/OneDrive/Documents/agente\ AI/backend_spare
```

#### 1.2 Run Setup Script

```bash
# Make scripts executable
chmod +x setup_wsl.sh start_backend.sh run_monitor.sh

# Run setup (installs everything)
./setup_wsl.sh
```

This will install:
- ✅ Node.js 18+
- ✅ Python 3.11+
- ✅ Python virtual environment
- ✅ Claude Agent SDK
- ✅ FastAPI & Uvicorn
- ✅ PostgreSQL MCP server

**Time:** ~3-5 minutes

#### 1.3 Verify Installation

```bash
# Activate venv
source venv/bin/activate

# Check Python packages
python -c "import fastapi, claude_agent_sdk, uvicorn; print('✓ All packages installed')"

# Check MCP server
npx @modelcontextprotocol/server-postgres --version
```

### Step 2: Start Backend Server

```bash
# In WSL terminal
cd /mnt/c/Users/rasiv/OneDrive/Documents/agente\ AI/backend_spare

# Start FastAPI server
./start_backend.sh
```

You should see:

```
╔════════════════════════════════════════════════════════╗
║              Backend Connection Info                   ║
╚════════════════════════════════════════════════════════╝

  Frontend (Windows) can connect to:
    → http://localhost:8000
    → http://127.0.0.1:8000

  API Endpoints:
    POST /api/analyze          - Trigger analysis (async)
    GET  /api/status/{user_id} - Get analysis status
    GET  /api/health           - Health check

  API Documentation:
    → http://localhost:8000/docs

INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Leave this terminal running** - backend is now listening on port 8000.

### Step 3: Frontend Integration (Windows)

#### 3.1 Install Supabase Client

```bash
# In your frontend directory (Windows)
npm install @supabase/supabase-js
```

#### 3.2 Create API Service

**File:** `frontend/src/services/spareBackend.js`

```javascript
// Spare Backend API Service
const SPARE_BACKEND_URL = 'http://localhost:8000';

export const spareBackendAPI = {
  /**
   * Trigger complete analysis for a user
   * @param {string} userId - User ID from login
   * @returns {Promise} Analysis trigger response
   */
  async triggerAnalysis(userId) {
    const response = await fetch(`${SPARE_BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return await response.json();
  },

  /**
   * Get analysis status
   * @param {string} userId - User ID
   * @returns {Promise} Status object
   */
  async getAnalysisStatus(userId) {
    const response = await fetch(`${SPARE_BACKEND_URL}/api/status/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { status: 'not_started' };
      }
      throw new Error('Failed to get status');
    }

    return await response.json();
  },

  /**
   * Health check
   * @returns {Promise} Health status
   */
  async healthCheck() {
    const response = await fetch(`${SPARE_BACKEND_URL}/api/health`);
    return await response.json();
  },
};
```

#### 3.3 Integrate in Login Flow

**Example:** After successful login

```javascript
import { supabase } from './supabaseClient';
import { spareBackendAPI } from './spareBackend';

// Login handler
async function handleLogin(email, password) {
  // 1. Login to Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login failed:', error);
    return;
  }

  const userId = data.user.id;

  // 2. Store user_id in localStorage
  localStorage.setItem('user_id', userId);

  // 3. Trigger background analysis
  try {
    const analysisResponse = await spareBackendAPI.triggerAnalysis(userId);
    console.log('Analysis started:', analysisResponse);

    // Show notification to user
    showNotification(
      'Analysis in progress',
      'Your financial analysis is running in the background. Results will appear in 5-10 minutes.'
    );
  } catch (error) {
    console.error('Failed to trigger analysis:', error);
    // Analysis failed, but user is still logged in
  }

  // 4. Navigate to dashboard
  navigate('/dashboard');
}
```

#### 3.4 Fetch Results from Database

**Example:** Dashboard component

```javascript
import { supabase } from './supabaseClient';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [patterns, setPatterns] = useState(null);
  const [budgets, setBudgets] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [risk, setRisk] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');

    // Fetch all analysis results from database
    async function fetchAnalysis() {
      // Income patterns
      const { data: patternsData } = await supabase
        .from('income_patterns')
        .select('*')
        .eq('user_id', userId)
        .single();
      setPatterns(patternsData);

      // Budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
      setBudgets(budgetsData);

      // Income forecasts
      const { data: forecastsData } = await supabase
        .from('income_forecasts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setForecasts(forecastsData);

      // Risk assessment
      const { data: riskData } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();
      setRisk(riskData);

      // Recommendations
      const { data: recsData } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false });
      setRecommendations(recsData);
    }

    fetchAnalysis();

    // Optionally: Set up real-time subscriptions
    const channel = supabase
      .channel('analysis_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New recommendation:', payload.new);
          // Update UI with new data
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h1>Financial Dashboard</h1>

      {/* Income Patterns */}
      {patterns && (
        <div>
          <h2>Income Patterns</h2>
          <p>Average: ₹{patterns.avg_income}</p>
          <p>Monthly Trend: {patterns.monthly_trend}</p>
        </div>
      )}

      {/* Budgets */}
      {budgets && budgets.map((budget) => (
        <div key={budget.budget_id}>
          <h3>{budget.budget_type} Budget</h3>
          <p>Expected Income: ₹{budget.total_income_expected}</p>
        </div>
      ))}

      {/* Risk Assessment */}
      {risk && (
        <div>
          <h2>Risk Level: {risk.overall_risk_level}</h2>
          <p>Score: {risk.risk_score}/10</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2>Recommendations</h2>
          {recommendations.map((rec) => (
            <div key={rec.recommendation_id}>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <span>Priority: {rec.priority}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Testing the Connection

### Test 1: Health Check

**From Windows (PowerShell or Command Prompt):**

```powershell
# Test if backend is accessible
curl http://localhost:8000/api/health

# Or open in browser
start http://localhost:8000/docs
```

Expected response:

```json
{
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
  "timestamp": "2025-01-XX..."
}
```

### Test 2: Trigger Analysis

**From Windows (PowerShell):**

```powershell
# Trigger analysis for test user
$body = @{user_id = "153735c8-b1e3-4fc6-aa4e-7deb6454990b"} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/analyze" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected response:

```json
{
  "status": "started",
  "message": "Analysis started for user 153735c8-b1e3-4fc6-aa4e-7deb6454990b. Results will be written to database.",
  "user_id": "153735c8-b1e3-4fc6-aa4e-7deb6454990b",
  "analysis_started": "2025-01-XX...",
  "estimated_completion_minutes": 8
}
```

### Test 3: Monitor Progress

**In WSL terminal:**

```bash
# Watch analysis progress in backend logs
# (You should see agents running one by one)

# Or use monitor script
./run_monitor.sh --logs
```

### Test 4: Check Database

**After 5-10 minutes, check Supabase:**

```sql
-- Check income_patterns
SELECT * FROM income_patterns
WHERE user_id = '153735c8-b1e3-4fc6-aa4e-7deb6454990b';

-- Check budgets
SELECT * FROM budgets
WHERE user_id = '153735c8-b1e3-4fc6-aa4e-7deb6454990b';

-- Check recommendations
SELECT * FROM recommendations
WHERE user_id = '153735c8-b1e3-4fc6-aa4e-7deb6454990b';

-- Check agent logs
SELECT * FROM agent_logs
WHERE user_id = '153735c8-b1e3-4fc6-aa4e-7deb6454990b'
ORDER BY execution_timestamp DESC;
```

---

## Hackathon Deployment

### Quality of Solution ✅

**Well-Architected Agents:**
- ✅ 9 specialized agents, each with specific responsibility
- ✅ Clear decision logic in each agent's system prompt
- ✅ Tax Agent has comprehensive RAG knowledge (19 pages of tax law)
- ✅ Sequential execution order (dependencies handled)

**Problem-Solving Approach:**
- ✅ Background service (non-blocking for frontend)
- ✅ Direct database access via MCP (no API bottlenecks)
- ✅ Monitoring capability to see what agents pushed

### Technical Implementation ✅

**Appropriate Tech Stack:**
- ✅ Claude Agent SDK (official Anthropic framework)
- ✅ FastAPI (async, high-performance HTTP server)
- ✅ MCP (Model Context Protocol for database access)
- ✅ PostgreSQL/Supabase (robust database)
- ✅ WSL for local development (no API key needed)

**Optimal Usage:**
- ✅ Async processing (background tasks)
- ✅ CORS properly configured
- ✅ Pydantic models for validation
- ✅ Comprehensive error handling
- ✅ Status tracking for progress monitoring

---

## Troubleshooting

### Issue 1: Frontend Cannot Connect to Backend

**Error:** `Failed to fetch` or `CORS error`

**Solution:**

1. Check if backend is running in WSL:
   ```bash
   # In WSL
   curl http://localhost:8000/api/health
   ```

2. Check WSL networking:
   ```powershell
   # In Windows PowerShell
   wsl hostname -I
   # Note the IP address (e.g., 172.x.x.x)

   # Update frontend to use WSL IP
   const SPARE_BACKEND_URL = 'http://172.x.x.x:8000';
   ```

3. Check Windows Firewall:
   - Allow port 8000 inbound connections

### Issue 2: Agents Not Pushing to Database

**Error:** Database connection failed

**Solution:**

1. Check `.mcp.json` has correct Supabase URL
2. Test MCP connection:
   ```bash
   # In WSL
   npx @modelcontextprotocol/server-postgres \
     "postgresql://postgres.ubjrclaiqqxngfcylbfs:siva0912@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```

### Issue 3: Analysis Takes Too Long

**Expected Time:** 5-10 minutes for all 9 agents

**If slower:**
- Check internet connection
- Verify Claude responses in logs
- Consider running agents in parallel (advanced)

---

## Production Deployment

For production (when you need to deploy):

1. **Get Anthropic API Key:**
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```

2. **Deploy to Cloud:**
   - Options: Railway, Render, DigitalOcean, AWS EC2
   - Ensure port 8000 is exposed
   - Set environment variables

3. **Update Frontend:**
   ```javascript
   const SPARE_BACKEND_URL = 'https://your-backend-url.com';
   ```

---

## Summary

✅ **Local Development:** No API key needed (Claude Pro in WSL)
✅ **Frontend-Backend:** HTTP via localhost:8000
✅ **Backend-Database:** MCP direct access
✅ **Frontend-Database:** Supabase JS client (reads)
✅ **All 9 Agents:** Complete implementation with RAG
✅ **Hackathon Ready:** Quality architecture + optimal tech stack

**Next Steps:**
1. Start backend: `./start_backend.sh`
2. Test connection from Windows
3. Integrate with frontend
4. Show to hackathon judges! 🏆
