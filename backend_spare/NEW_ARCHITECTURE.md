# Spare Backend - NEW Architecture

## What Changed

**OLD (Wrong):**
- Interactive chat agent
- Only 3 agents
- User types queries

**NEW (Correct):**
- Background service
- ALL 9 agents
- Auto-analyze and push to database
- Frontend reads from database

---

## All 9 Agents (From Project Description)

### 1. **Pattern Recognition Engine**
- **What it does**: Analyzes transaction history using LSTM patterns
- **Writes to**: `income_patterns` table
- **Fields**:
  - avg_income, min_income, max_income
  - weekday_income (JSON)
  - monthly_trend
  - weather_impact, seasonal_factors
  - confidence_score

### 2. **Budget Analysis Engine**
- **What it does**: Calculates feast/famine budgets
- **Writes to**: `budgets` table
- **Fields**:
  - budget_type (feast_week, famine_week, monthly)
  - total_income_expected
  - fixed_costs, variable_costs (JSON)
  - savings_target, discretionary_budget
  - category_limits (JSON)

### 3. **Context Intelligence Engine**
- **What it does**: Weather, festivals, external events
- **Writes to**: Enriches existing records with context
- **Fields**:
  - Weather API data
  - Cultural calendar events
  - Seasonal adjustments

### 4. **Income Volatility Forecaster**
- **What it does**: 30-day income predictions
- **Writes to**: `income_forecasts` table
- **Fields**:
  - pessimistic_scenario, realistic_scenario, optimistic_scenario (JSON)
  - forecast_range_min, forecast_range_max
  - volatility_index
  - forecast_confidence
  - ai_reasoning

### 5. **Knowledge Integration**
- **What it does**: Matches 200+ government schemes
- **Writes to**: `government_schemes`, `user_schemes` tables
- **Fields**:
  - scheme_name, scheme_type
  - eligibility_criteria (JSON)
  - benefits_description
  - application_status

### 6. **Tax and Compliance Engine**
- **What it does**: ITR filing, deductions
- **Writes to**: `tax_records` table
- **Fields**:
  - assessment_year, gross_income
  - deductions (JSON)
  - taxable_income, tax_liability
  - itr_form_data (JSON)
  - filing_status

### 7. **Recommendation Engine**
- **What it does**: Personalized guidance
- **Writes to**: `recommendations` table
- **Fields**:
  - recommendation_type (savings/income/debt/budget/risk/tax)
  - priority (high/medium/low)
  - title, description, reasoning
  - action_items (JSON)
  - confidence_score, success_probability

### 8. **Risk Assessment**
- **What it does**: Risk scoring + escalation
- **Writes to**: `risk_assessments` table
- **Fields**:
  - overall_risk_level (low/medium/high)
  - risk_score (0-10)
  - risk_factors (JSON)
  - debt_to_income_ratio
  - emergency_fund_coverage
  - escalation_needed, escalation_priority
  - recommended_actions (JSON)

### 9. **Action Execution**
- **What it does**: Auto-execute + outcome tracking
- **Writes to**: `executed_actions`, `action_outcomes` tables
- **Fields**:
  - action_type, action_description
  - status (scheduled/completed/failed)
  - amount, execution_date
  - schedule (for recurring)
  - next_execution
  - actual_achievement, achievement_percentage

---

## How It Works

### 1. Background Service

```python
# Run periodically (e.g., every hour)
while True:
    users = get_active_users()

    for user in users:
        # Run all 9 agents in parallel
        run_pattern_analysis(user_id)
        run_budget_analysis(user_id)
        run_context_intelligence(user_id)
        run_volatility_forecast(user_id)
        run_knowledge_matching(user_id)
        run_tax_analysis(user_id)
        run_recommendations(user_id)
        run_risk_assessment(user_id)
        run_action_execution(user_id)

    sleep(3600)  # Wait 1 hour
```

### 2. Agents Write to Database via MCP

```python
# Example: Pattern Recognition Agent
async def run_pattern_analysis(user_id):
    # 1. Read transactions via MCP
    transactions = await postgres_query(
        f"SELECT * FROM transactions WHERE user_id = '{user_id}'
         AND transaction_date >= NOW() - INTERVAL '60 days'"
    )

    # 2. Analyze patterns using Claude
    patterns = await claude_analyze(transactions)

    # 3. Write to database via MCP
    await postgres_query(
        f"""INSERT INTO income_patterns
            (user_id, avg_income, weekday_income, confidence_score, ...)
            VALUES ('{user_id}', {patterns.avg}, '{json.dumps(patterns.weekday)}', ...)"""
    )

    # 4. Log what was done
    await postgres_query(
        f"""INSERT INTO agent_logs
            (user_id, agent_name, action, status)
            VALUES ('{user_id}', 'pattern_recognition', 'analyzed', 'success')"""
    )
```

### 3. Frontend Reads from Database

```javascript
// Frontend (React)
const patterns = await supabase
  .from('income_patterns')
  .select('*')
  .eq('user_id', userId)
  .single();

// Display what Pattern Agent pushed
console.log("Average income:", patterns.avg_income);
console.log("Weekday pattern:", patterns.weekday_income);
```

### 4. Monitoring Script

```bash
# monitor.sh
python agents/monitor.py --user-id 153735c8-b1e3-4fc6-aa4e-7deb6454990b

# Output:
# [2025-01-15 10:30] Pattern Recognition: Analyzed 50 transactions → income_patterns
# [2025-01-15 10:31] Budget Analysis: Created feast_week budget → budgets
# [2025-01-15 10:32] Volatility Forecast: Predicted next 30 days → income_forecasts
# ...
```

---

## Database Tables (What Each Agent Writes To)

| Agent | Table(s) | Key Fields |
|-------|----------|-----------|
| Pattern Recognition | `income_patterns` | avg_income, weekday_income, confidence |
| Budget Analysis | `budgets` | feast/famine budgets, category_limits |
| Context Intelligence | (enriches existing) | weather, festivals |
| Volatility Forecaster | `income_forecasts` | scenarios, volatility_index |
| Knowledge Integration | `government_schemes`, `user_schemes` | matched schemes |
| Tax Engine | `tax_records` | gross_income, deductions, ITR data |
| Recommendation Engine | `recommendations` | type, priority, actions |
| Risk Assessment | `risk_assessments` | risk_score, factors, escalation |
| Action Execution | `executed_actions`, `action_outcomes` | status, results |

**All agents also write to:** `agent_logs` (for monitoring)

---

## File Structure (NEW)

```
backend_spare/
├── agents/
│   ├── pattern_agent.py          ← Agent 1
│   ├── budget_agent.py            ← Agent 2
│   ├── context_agent.py           ← Agent 3
│   ├── volatility_agent.py        ← Agent 4
│   ├── knowledge_agent.py         ← Agent 5
│   ├── tax_agent.py               ← Agent 6
│   ├── recommendation_agent.py    ← Agent 7
│   ├── risk_agent.py              ← Agent 8
│   ├── action_agent.py            ← Agent 9
│   ├── scheduler.py               ← Background service
│   └── monitor.py                 ← View what agents pushed
├── configs/
│   └── agent_config.yaml          ← All 9 agent configs
├── .mcp.json                      ← PostgreSQL MCP
├── requirements.txt
├── setup_wsl.sh
└── run_service.sh                 ← Start background service
```

---

## Usage

### 1. Start Background Service
```bash
# In WSL
cd backend_spare
export ANTHROPIC_API_KEY="your-key"
./setup_wsl.sh
./run_service.sh
```

### 2. Agents Run Automatically
- Every hour (or configured interval)
- Analyze all active users
- Write results to database
- Log all actions

### 3. Monitor What Happened
```bash
# See what agents pushed for a user
python agents/monitor.py --user 153735c8-b1e3-4fc6-aa4e-7deb6454990b

# See all agent activity
python agents/monitor.py --all --last 24h
```

### 4. Frontend Reads Data
```javascript
// Just read from database
const patterns = await supabase.from('income_patterns').select('*');
const budgets = await supabase.from('budgets').select('*');
const forecasts = await supabase.from('income_forecasts').select('*');
const recommendations = await supabase.from('recommendations').select('*');
const risks = await supabase.from('risk_assessments').select('*');
```

---

## Comparison: Interactive vs Background

| Feature | Interactive (OLD) | Background (NEW) |
|---------|------------------|------------------|
| **User interaction** | Types queries | None - automatic |
| **Trigger** | User request | Scheduled (hourly) |
| **Agent count** | 3 agents | 9 agents |
| **Output** | Chat response | Database writes |
| **Frontend** | Not integrated | Reads from DB directly |
| **Monitoring** | Terminal output | Logs + monitoring script |
| **Use case** | Demo/testing | Production |

---

## Next Steps

I will now create:
1. ✅ All 9 agent files (pattern, budget, context, volatility, knowledge, tax, recommendation, risk, action)
2. ✅ Scheduler service (background runner)
3. ✅ Monitoring script (see what was pushed)
4. ✅ Updated configuration
5. ✅ Run scripts

This will be a **background analysis service** that automatically:
- Analyzes all users periodically
- Pushes results to database
- Logs all activity
- Frontend just reads the results

**Estimated time to complete: 30-40 minutes**

Ready to proceed?
