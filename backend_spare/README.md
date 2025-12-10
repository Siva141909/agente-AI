# Financial Coaching Agent - Spare Backend

**Multi-agent AI system built with Claude Agent SDK for gig worker financial analysis**

---

## Architecture

```
Main Orchestrator Agent (Sonnet)
├── Pattern Recognition Agent (PostgreSQL access)
│   └── Analyzes income patterns, spending, volatility
├── Recommendation Agent (PostgreSQL access)
│   └── Generates personalized financial advice
└── Risk Assessment Agent (PostgreSQL access)
    └── Evaluates financial risks and health
```

**Database Access:**
- Direct PostgreSQL access via Model Context Protocol (MCP)
- Connects to Supabase database
- No REST API layer - agents query database directly

---

## Setup Instructions

### Prerequisites
- WSL 2 (Windows Subsystem for Linux)
- Anthropic API key (Claude)

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com/
2. Create API key
3. Copy the key

### Step 2: Set Environment Variable in WSL
```bash
# Open WSL terminal
export ANTHROPIC_API_KEY="your-api-key-here"

# Or add to ~/.bashrc for persistence:
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Run Setup Script
```bash
cd backend_spare
chmod +x setup_wsl.sh
./setup_wsl.sh
```

This will:
- Install Node.js (for MCP server)
- Install Python 3.11+
- Create virtual environment
- Install Python dependencies (Claude Agent SDK, etc.)
- Install PostgreSQL MCP server

---

## Usage

### Interactive Mode (Recommended)
```bash
chmod +x run.sh
./run.sh
```

Or manually:
```bash
source venv/bin/activate
python agents/financial_agent.py --interactive
```

### Example Queries
Try these commands in interactive mode:

```
Analyze the financial situation for user 153735c8-b1e3-4fc6-aa4e-7deb6454990b

What are the income patterns for this user?

Give me financial recommendations based on current data

Assess the financial risks for this user
```

### Single Query Mode
```bash
source venv/bin/activate
python agents/financial_agent.py
```

---

## How It Works

### 1. Main Orchestrator
- Receives user query
- Determines which sub-agent(s) to call
- Coordinates multi-agent workflow
- Synthesizes final response

### 2. Pattern Recognition Agent
- Queries `transactions` table
- Calculates income statistics
- Identifies spending patterns
- Stores results in `income_patterns` table

**Example SQL it runs:**
```sql
SELECT * FROM transactions
WHERE user_id = 'user-uuid'
AND transaction_date >= NOW() - INTERVAL '60 days'
ORDER BY transaction_date DESC;
```

### 3. Recommendation Agent
- Reads from `income_patterns` and `user_profiles`
- Generates personalized advice
- Stores in `recommendations` table

**Recommendations include:**
- Emergency fund targets
- Debt management strategies
- Savings goals
- Budget optimization

### 4. Risk Assessment Agent
- Evaluates 7 risk dimensions
- Calculates composite risk score
- Identifies critical issues
- Stores in `risk_assessments` table

**Risk Dimensions:**
1. Income volatility
2. Debt-to-income ratio
3. Emergency fund coverage
4. Expense spikes
5. Income drops
6. Transaction anomalies
7. Overall financial health

---

## Database Schema

The agents access these Supabase tables:

- **users**: User account info
- **user_profiles**: Financial profile (income range, debt, etc.)
- **transactions**: All income/expense transactions
- **income_patterns**: Computed patterns from analysis
- **recommendations**: AI-generated recommendations
- **risk_assessments**: Risk analysis results

---

## Configuration

### Agent Config (`configs/agent_config.yaml`)
- Define agent models (sonnet, opus, haiku)
- Customize system prompts
- Configure allowed tools

### MCP Config (`.mcp.json`)
- PostgreSQL connection string
- Database credentials
- Already configured for your Supabase database

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
export ANTHROPIC_API_KEY="your-key"
```

### "PostgreSQL MCP server not found"
```bash
npm install -g @modelcontextprotocol/server-postgres
```

### "Permission denied: setup_wsl.sh"
```bash
chmod +x setup_wsl.sh run.sh
```

### "Module not found: claude_agent_sdk"
```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

## Comparison with Original Backend

| Feature | Original Backend | Spare Backend |
|---------|-----------------|---------------|
| **Framework** | FastAPI + LiteLLM | Claude Agent SDK |
| **Architecture** | REST API endpoints | Multi-agent orchestration |
| **Database Access** | SQLAlchemy ORM | Direct SQL via MCP |
| **LLM Calls** | Manual orchestrator | Agent SDK handles it |
| **Agent Communication** | Internal Python | Task tool (agent-to-agent) |
| **Complexity** | Higher (more files) | Lower (simpler structure) |
| **Use Case** | Production API | Research/prototyping |

**When to use Spare Backend:**
- Claude API is working well
- Need multi-turn conversations
- Want simpler architecture
- Research/experimentation

**When to use Original Backend:**
- Need REST API endpoints
- Multiple LLM providers
- Production deployment
- More control over flow

---

## File Structure

```
backend_spare/
├── agents/
│   ├── __init__.py
│   └── financial_agent.py       # Main orchestrator + sub-agents
├── configs/
│   └── agent_config.yaml        # Agent configuration
├── .mcp.json                    # PostgreSQL MCP config
├── requirements.txt             # Python dependencies
├── setup_wsl.sh                 # WSL setup script
├── run.sh                       # Quick run script
└── README.md                    # This file
```

---

## Performance

- **First query**: ~20-30s (agent initialization)
- **Subsequent queries**: ~5-15s (depending on complexity)
- **Cost**: ~$0.01-0.05 per analysis (using Sonnet)

---

## Next Steps

1. ✅ Run `setup_wsl.sh`
2. ✅ Set `ANTHROPIC_API_KEY`
3. ✅ Run `./run.sh`
4. Try example queries
5. Integrate with frontend if needed

---

## Support

For issues or questions:
1. Check logs in terminal output
2. Verify API key is set
3. Ensure PostgreSQL MCP is installed
4. Check database connection string in `.mcp.json`

---

**Built with Claude Agent SDK**
**Direct PostgreSQL access via Model Context Protocol**
**Multi-agent orchestration for intelligent financial coaching**
