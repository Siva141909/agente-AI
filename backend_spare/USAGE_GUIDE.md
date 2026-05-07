# Spare Backend Usage Guide

**Background Analysis Service with 9 AI Agents**

---

## What This System Does

This is a **background analysis service** that automatically analyzes user finances and pushes results to the database.

**NO user interaction needed** - agents run periodically and write to database.

---

## All 9 Agents

| # | Agent | Table(s) Written | What It Does |
|---|-------|------------------|--------------|
| 1 | Pattern Recognition | `income_patterns` | Analyzes transaction history, calculates averages, identifies trends |
| 2 | Budget Analysis | `budgets` | Creates feast/famine week budgets based on income volatility |
| 3 | Context Intelligence | (enriches existing) | Adds weather, festival, seasonal context to patterns |
| 4 | Volatility Forecaster | `income_forecasts` | Predicts next 30 days (pessimistic/realistic/optimistic) |
| 5 | Knowledge Integration | `government_schemes`, `user_schemes` | Matches users with 200+ government schemes |
| 6 | Tax & Compliance | `tax_records` | Calculates taxes, prepares ITR filing data |
| 7 | Recommendation Engine | `recommendations` | Generates personalized financial guidance |
| 8 | Risk Assessment | `risk_assessments` | Evaluates risk score, identifies critical issues |
| 9 | Action Execution | `executed_actions`, `action_outcomes` | Creates automated action plans |

**All agents also log to:** `agent_logs` table

---

## Setup (First Time)

### 1. Get Claude API Key

```bash
# Go to https://console.anthropic.com/
# Create an API key
# You get $5 free credit
```

### 2. Set API Key in WSL

```bash
# Open WSL
wsl

# Navigate to project
cd /mnt/c/Users/rasiv/OneDrive/Documents/agente\ AI/backend_spare

# Set API key (REQUIRED)
export ANTHROPIC_API_KEY="your-key-here"

# Optional: Add to .bashrc for persistence
echo 'export ANTHROPIC_API_KEY="your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Run Setup Script

```bash
# Make scripts executable
chmod +x setup_wsl.sh run_service.sh run_monitor.sh

# Run setup (installs everything)
./setup_wsl.sh
```

Wait 2-3 minutes for:
- Node.js installation
- Python 3.11+ installation
- Virtual environment creation
- Claude Agent SDK installation
- PostgreSQL MCP server installation

---

## Running the Service

### Option 1: Run Once (Test)

```bash
./run_service.sh --once
```

This will:
- Run all 9 agents in sequence
- Analyze the test user
- Push results to database
- Exit when done

**Use this to test the system**

### Option 2: Run for Specific User

```bash
./run_service.sh --user 153735c8-b1e3-4fc6-aa4e-7deb6454990b
```

This will:
- Run all 9 agents for this user only
- Push results to database
- Exit when done

**Use this when you want to analyze a specific user**

### Option 3: Run as Background Service

```bash
# Run every hour (3600 seconds)
./run_service.sh --scheduled 3600

# Or run every 30 minutes
./run_service.sh --scheduled 1800

# Or run every 6 hours
./run_service.sh --scheduled 21600
```

This will:
- Run continuously in the background
- Analyze all active users every N seconds
- Keep running until you press Ctrl+C

**Use this for production - agents auto-analyze periodically**

---

## Monitoring What Agents Pushed

### View All Analysis for a User

```bash
./run_monitor.sh --user 153735c8-b1e3-4fc6-aa4e-7deb6454990b
```

Shows:
- Income patterns (averages, trends)
- Budgets (feast/famine/monthly)
- Forecasts (next 30 days)
- Risk assessment (score, level)
- Recommendations (top 5)
- Tax calculations
- Matched schemes
- Scheduled actions

**Use this to see complete analysis results**

### View Agent Activity Logs

```bash
# Last 24 hours (all users)
./run_monitor.sh --logs

# Last 48 hours for specific user
./run_monitor.sh --logs 153735c8-b1e3-4fc6-aa4e-7deb6454990b 48

# Last 12 hours (all users)
./run_monitor.sh --logs "" 12
```

Shows:
- Timestamp
- Agent name
- User ID
- Action performed
- Status (success/failure)

**Use this to see what agents did**

### View Database Summary

```bash
./run_monitor.sh --summary
```

Shows:
- Record count in each table
- Latest update timestamps
- Sample of recent records

**Use this to get overview of all data**

### View Recent Changes

```bash
# Last 60 minutes
./run_monitor.sh --recent 60

# Last 30 minutes
./run_monitor.sh --recent 30

# Last 2 hours (120 minutes)
./run_monitor.sh --recent 120
```

Shows:
- What agents pushed recently
- Which tables were updated
- Chronological order

**Use this to see real-time agent activity**

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│        Background Scheduler              │
│     (runs periodically, e.g., hourly)   │
└──────────────┬──────────────────────────┘
               │
               ├─► Pattern Agent      → income_patterns
               ├─► Context Agent      → enriches data
               ├─► Volatility Agent   → income_forecasts
               ├─► Budget Agent       → budgets
               ├─► Knowledge Agent    → government_schemes
               ├─► Tax Agent          → tax_records
               ├─► Risk Agent         → risk_assessments
               ├─► Recommendation     → recommendations
               └─► Action Agent       → executed_actions
                       │
                       │ All agents use MCP
                       ↓
               ┌──────────────────┐
               │  PostgreSQL DB   │
               │   (Supabase)     │
               └──────────────────┘
                       ↑
                       │ Frontend reads directly
               ┌──────────────────┐
               │     Frontend     │
               │  (React/Vue/etc) │
               └──────────────────┘
```

### Workflow

1. **Scheduler starts** (every hour or configured interval)
2. **Gets active users** (currently hardcoded test user)
3. **Runs 9 agents in sequence** for each user:
   - Pattern Agent analyzes transactions
   - Context Agent adds seasonal/weather context
   - Volatility Agent predicts next 30 days
   - Budget Agent creates budgets
   - Knowledge Agent matches schemes
   - Tax Agent calculates taxes
   - Risk Agent evaluates risks
   - Recommendation Agent generates advice
   - Action Agent creates action plans
4. **All agents write to database** via MCP
5. **All agents log to agent_logs** table
6. **Scheduler sleeps** until next cycle
7. **Frontend reads** from database (no API needed)

---

## Database Tables

### What Frontend Reads

```javascript
// Frontend just reads from Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Get income patterns
const patterns = await supabase
  .from('income_patterns')
  .select('*')
  .eq('user_id', userId)
  .single()

// Get budgets
const budgets = await supabase
  .from('budgets')
  .select('*')
  .eq('user_id', userId)

// Get forecasts
const forecasts = await supabase
  .from('income_forecasts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)

// Get recommendations
const recommendations = await supabase
  .from('recommendations')
  .select('*')
  .eq('user_id', userId)
  .order('priority', { ascending: false })

// Get risk assessment
const risk = await supabase
  .from('risk_assessments')
  .select('*')
  .eq('user_id', userId)
  .order('assessment_date', { ascending: false })
  .limit(1)
```

### All Tables Written by Agents

| Table | Written By | Fields |
|-------|------------|--------|
| `income_patterns` | Pattern Agent | avg_income, volatility_score, weekday_income, trend |
| `budgets` | Budget Agent | feast_week, famine_week, monthly, category_limits |
| `income_forecasts` | Volatility Agent | pessimistic/realistic/optimistic scenarios |
| `government_schemes` | Knowledge Agent | scheme details, eligibility |
| `user_schemes` | Knowledge Agent | matched schemes for user |
| `tax_records` | Tax Agent | gross_income, deductions, tax_liability |
| `recommendations` | Recommendation Agent | type, priority, action_items |
| `risk_assessments` | Risk Agent | risk_score, risk_level, factors |
| `executed_actions` | Action Agent | scheduled actions, status |
| `action_outcomes` | Action Agent | achievement tracking |
| `agent_logs` | ALL agents | activity logs |

---

## Performance

- **First run**: ~5-10 minutes (all 9 agents)
- **Subsequent runs**: ~3-8 minutes
- **Per agent**: ~30-60 seconds
- **Cost**: ~$0.10-0.30 per complete analysis (Claude Sonnet)

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### "PostgreSQL MCP server not found"

```bash
npm install -g @modelcontextprotocol/server-postgres
```

### "Module not found: claude_agent_sdk"

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Agents running slow

- Normal for first run (initialization)
- Subsequent runs should be faster
- Check your internet connection
- Verify Claude API key has credits

### Database connection failed

- Check `.mcp.json` has correct Supabase URL
- Verify database is accessible
- Check Supabase credentials

---

## Production Deployment

### 1. Update Active Users List

Edit `agents/scheduler.py`:

```python
# Replace hardcoded list with database query
async def get_active_users(self):
    """Query database for active users"""
    agent = Agent(AgentOptions(
        model="claude-sonnet-4-5",
        mcp_config_path=self.mcp_config_path
    ))

    result = await agent.run("""
        Query the users table and return list of user_ids
        where last_active >= NOW() - INTERVAL '7 days'
    """)

    return result  # List of user IDs
```

### 2. Set Up Systemd Service (Linux)

Create `/etc/systemd/system/agente-ai.service`:

```ini
[Unit]
Description=Agente AI Background Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend_spare
Environment="ANTHROPIC_API_KEY=your-key"
ExecStart=/path/to/backend_spare/run_service.sh --scheduled 3600
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable agente-ai
sudo systemctl start agente-ai
sudo systemctl status agente-ai
```

### 3. Monitor Logs

```bash
# View service logs
sudo journalctl -u agente-ai -f

# Or use monitoring script
./run_monitor.sh --recent 60
```

---

## Comparison: Interactive vs Background

| Feature | Interactive (OLD) | Background (NEW) |
|---------|------------------|------------------|
| **User interaction** | Types queries in chat | None - automatic |
| **Trigger** | User sends message | Scheduled (hourly) |
| **Agent count** | 3 agents | 9 agents |
| **Output** | Chat response | Database writes |
| **Frontend** | Not integrated | Reads from DB directly |
| **Monitoring** | Terminal output | monitor.py script |
| **Use case** | Demo/testing | Production |
| **Architecture** | Orchestrator pattern | Independent workers |

---

## Quick Command Reference

```bash
# Setup (first time)
./setup_wsl.sh
export ANTHROPIC_API_KEY="your-key"

# Run once (test)
./run_service.sh --once

# Run for specific user
./run_service.sh --user <user-id>

# Run as background service (every hour)
./run_service.sh --scheduled 3600

# View user analysis
./run_monitor.sh --user <user-id>

# View agent logs
./run_monitor.sh --logs

# View recent changes
./run_monitor.sh --recent 60

# View database summary
./run_monitor.sh --summary
```

---

## Summary

✅ **Background service** - runs automatically, no user interaction
✅ **All 9 agents** - complete financial analysis
✅ **Direct database writes** - via PostgreSQL MCP
✅ **Monitoring tools** - see what agents pushed
✅ **Frontend integration** - just read from database
✅ **Scheduled execution** - periodic analysis

**The spare backend is ready to run!**
