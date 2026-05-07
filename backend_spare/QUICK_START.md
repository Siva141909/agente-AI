# Quick Start Guide - Spare Backend

## Setup (First Time Only)

### 1. Get Claude API Key
```bash
# Go to https://console.anthropic.com/
# Create an API key
# Copy it
```

### 2. Open WSL Terminal
```bash
# From Windows, open WSL
wsl

# Navigate to the project
cd /mnt/c/Users/rasiv/OneDrive/Documents/agente\ AI/backend_spare
```

### 3. Set API Key
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 4. Run Setup
```bash
chmod +x setup_wsl.sh run.sh
./setup_wsl.sh
```

Wait 2-3 minutes for installation to complete.

---

## Running the Agent

### Start Agent
```bash
./run.sh
```

### Example Queries
```
Analyze the financial situation for user 153735c8-b1e3-4fc6-aa4e-7deb6454990b

What are the income patterns?

Give me financial recommendations

Assess financial risks
```

### Exit
Type `exit` or `quit`

---

## Accessing from Windows

The spare backend runs in WSL but can be accessed from Windows:

- **Frontend**: Runs on Windows (localhost:8080)
- **Backend**: Runs in WSL (localhost:8001)
- **Database**: Supabase (cloud)

To make the agent accessible via HTTP (for frontend), we can add FastAPI wrapper if needed.

---

## Common Commands

```bash
# Start interactive session
./run.sh

# Run single query (non-interactive)
source venv/bin/activate
python agents/financial_agent.py

# Check if everything is installed
which node
which python3
npm list -g @modelcontextprotocol/server-postgres
```

---

## Troubleshooting

**"Command not found: wsl"**
- Enable WSL: `wsl --install` in PowerShell (admin)

**"ANTHROPIC_API_KEY not set"**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**"PostgreSQL connection failed"**
- Check `.mcp.json` has correct database URL
- Ensure Supabase database is accessible

---

## Next Steps

1. Run the agent and test with sample queries
2. If it works, we can add FastAPI wrapper for frontend integration
3. Or keep it as standalone analysis tool

---

That's it! The spare backend is ready to use.
