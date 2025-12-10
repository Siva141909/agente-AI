# AGENTE AI - Complete Agent, API & Database Mapping

## Project Status: Phase 1 Complete ✅ | Phase 2-3 Ready to Implement 🔄

---

## PHASE 1 - IMPLEMENTED ✅

### 1. Pattern Recognition Agent (`backend/agents/pattern_agent.py`)

**What It Does:**
- Analyzes transaction history to identify income patterns
- Detects weekday vs weekend earning patterns
- Calculates income volatility (predictability score)
- Identifies spending patterns by category
- Generates confidence scores for predictions

**Input Required:**
```python
{
    "transactions": [
        {
            "transaction_date": "2025-11-15",
            "amount": 1250.50,
            "transaction_type": "income",  # or "expense"
            "category": "Delivery",
            "description": "Daily earnings"
        }
    ],
    "user_profile": {
        "occupation": "food_delivery_driver",
        "city": "Bangalore",
        "monthly_income_min": 25000,
        "monthly_income_max": 45000,
        "dependents": 2
    }
}
```

**Output Generated:**
```python
{
    "success": True,
    "data": {
        "avg_income": 1916.22,
        "min_income": 434.77,
        "max_income": 3560.58,
        "volatility_score": 0.49,  # 0-1 scale
        "confidence_score": 0.60,  # 0-1 scale
        "weekday_income": {
            "monday": 1032.96,
            "tuesday": 1094.78,
            "wednesday": 2257.75,  # Highest day
            "thursday": 1836.86,
            "friday": 1988.47,
            "saturday": 1587.40,
            "sunday": 1633.11
        },
        "monthly_trend": "stable",  # or "increasing", "decreasing"
        "weather_impact": {
            "rain": -0.35,  # -1 to +1 scale
            "clear": 0.12
        },
        "seasonal_factors": {
            "festive": 0.25,
            "monsoon": -0.20
        },
        "insights": [
            "Income volatility is moderate with 49% variation",
            "Wednesday shows highest average income",
            "Maintenance is the largest expense category"
        ],
        "spending_patterns": {
            "top_categories": ["Maintenance", "Food", "Groceries"],
            "avg_daily_spending": 476.59
        }
    },
    "model_used": "gemini/gemini-2.5-pro",
    "execution_time_ms": 30000
}
```

**Database Tables Used:**
- **Read From:** `transactions`, `user_profiles`
- **Write To:** `income_patterns`, `agent_logs`

**Database Fields Saved:**
```sql
income_patterns:
  - pattern_id (UUID)
  - user_id (UUID)
  - avg_income (FLOAT)
  - min_income (FLOAT)
  - max_income (FLOAT)
  - confidence_score (FLOAT)
  - weekday_income (JSONB) ← Stores all 7 days
  - monthly_trend (JSONB)
  - weather_impact (JSONB)
  - seasonal_factors (JSONB)
  - last_calculated (TIMESTAMP)
```

**API Endpoint:** `POST /api/v1/analysis/`

---

### 2. Recommendation Agent (`backend/agents/recommendation_agent.py`)

**What It Does:**
- Generates personalized financial recommendations
- Creates feast/famine budget allocations
- Provides transparent reasoning for each recommendation
- Calculates success probability for each action
- Suggests emergency fund building strategies

**Input Required:**
```python
{
    "income_patterns": {  # Output from Pattern Agent
        "avg_income": 1916.22,
        "volatility_score": 0.49,
        "weekday_income": {...}
    },
    "user_profile": {
        "occupation": "uber_driver",
        "dependents": 2,
        "debt_obligations": {...}
    },
    "current_balance": 12500.00,
    "upcoming_goals": []
}
```

**Output Generated:**
```python
{
    "success": True,
    "data": {
        "daily_savings_target": 300.00,
        "feast_budget": {
            "total_daily": 1200,
            "essential": 600,
            "discretionary": 300,
            "savings": 300
        },
        "famine_budget": {
            "total_daily": 600,
            "essential": 450,
            "discretionary": 75,
            "savings": 75
        },
        "emergency_fund_plan": {
            "target_amount": 50000,
            "current_amount": 12500,
            "monthly_contribution": 5000,
            "months_to_goal": 8,
            "rationale": "Cover 2 months of expenses"
        },
        "recommendations": [
            {
                "priority": "high",
                "type": "savings",
                "title": "Automate 'Top-Up' Savings on Peak Days",
                "description": "Set up automatic transfers of ₹200-300 on Wednesdays when income is typically higher",
                "reasoning": "Wednesday shows 17% higher income than average",
                "action_items": [
                    "Enable auto-save feature",
                    "Set transfer amount to ₹250",
                    "Schedule for every Wednesday"
                ],
                "success_probability": 0.85,
                "timeframe_days": 30,
                "target_amount": 3000
            }
        ],
        "overall_reasoning": "Focus on building emergency fund through automated savings on peak income days",
        "risk_assessment": "medium",
        "confidence_score": 0.75
    },
    "model_used": "gemini/gemini-2.5-pro",
    "execution_time_ms": 25000
}
```

**Database Tables Used:**
- **Read From:** `income_patterns`, `user_profiles`
- **Write To:** `recommendations`, `agent_logs`

**Database Fields Saved:**
```sql
recommendations:
  - recommendation_id (UUID)
  - user_id (UUID)
  - recommendation_type (VARCHAR) ← "savings", "budget", "scheme", "tax", "insurance"
  - priority (VARCHAR) ← "high", "medium", "low"
  - title (VARCHAR)
  - description (TEXT)
  - reasoning (TEXT) ← Why this recommendation
  - action_items (JSONB) ← Array of action steps
  - target_amount (FLOAT)
  - confidence_score (FLOAT)
  - success_probability (FLOAT)
  - agent_source (VARCHAR) ← "recommendation_agent"
  - status (VARCHAR) ← "pending", "accepted", "rejected", "completed"
  - created_at (TIMESTAMP)
```

**API Endpoint:** `POST /api/v1/analysis/` (with `include_recommendations: true`)

---

## PHASE 2 - READY TO IMPLEMENT 🔄

### 3. Budget Analysis Agent (`backend/agents/budget_agent.py`)

**What It Does:**
- Calculates dynamic budgets for feast vs famine days
- Distinguishes fixed costs (rent, insurance) from variable costs (food, fuel)
- Generates category-wise spending limits
- Computes budget sustainability scores
- Provides realistic budget allocations based on income volatility

**Input Required:**
```python
{
    "transactions": [...],  # Last 50 transactions
    "income_patterns": {
        "avg_income": 1916.22,
        "min_income": 434.77,
        "max_income": 3560.58,
        "volatility": 0.49
    },
    "user_profile": {
        "monthly_income_min": 25000,
        "monthly_income_max": 45000,
        "monthly_expenses_avg": 22000,
        "dependents": 2
    }
}
```

**Output Generated:**
```python
{
    "feast_budget": {
        "scenario": "high_income",
        "expected_income": 3000.00,
        "fixed_costs": 800.00,
        "variable_costs": 1200.00,
        "savings_target": 700.00,
        "discretionary": 300.00,
        "total_allocation": 3000.00
    },
    "famine_budget": {
        "scenario": "low_income",
        "expected_income": 800.00,
        "fixed_costs": 400.00,
        "variable_costs": 300.00,
        "savings_target": 50.00,
        "discretionary": 50.00,
        "total_allocation": 800.00
    },
    "current_scenario": "feast",  # or "famine", "normal"
    "category_limits": {
        "food": {"daily": 200, "monthly": 6000},
        "fuel": {"daily": 150, "monthly": 4500},
        "utilities": {"monthly": 1500},
        "healthcare": {"monthly": 1000},
        "entertainment": {"weekly": 300, "monthly": 1200}
    },
    "fixed_costs_monthly": 12000,
    "variable_costs_monthly": 10000,
    "savings_target_monthly": 5000,
    "sustainability_score": 75,  # 0-100
    "confidence_score": 0.8,
    "recommendations": [
        "Increase savings on feast days",
        "Cut discretionary spending on famine days"
    ]
}
```

**Database Tables Used:**
- **Read From:** `transactions`, `income_patterns`, `user_profiles`
- **Write To:** `budgets` (Phase 2 table - to be created), `agent_logs`

**Database Fields Needed (New Table):**
```sql
budgets:
  - budget_id (UUID)
  - user_id (UUID)
  - budget_type (VARCHAR) ← "feast_week", "famine_week", "normal"
  - valid_from (DATE)
  - valid_until (DATE)
  - total_income_expected (FLOAT)
  - fixed_costs (JSONB)
  - variable_costs (JSONB)
  - savings_target (FLOAT)
  - discretionary_budget (FLOAT)
  - category_limits (JSONB)
  - confidence_score (FLOAT)
  - is_active (BOOLEAN)
```

**API Endpoint:** `POST /api/v1/analysis/budget`

---

### 4. Volatility Forecaster Agent (`backend/agents/volatility_agent.py`)

**What It Does:**
- Predicts 7-day and 30-day income scenarios
- Generates best/expected/worst case probability distributions
- Calculates confidence scores for predictions
- Provides risk-adjusted recommendations
- Identifies income trends and seasonality

**Input Required:**
```python
{
    "transactions": [...],  # Last 60 transactions
    "income_patterns": {
        "avg_income": 1916.22,
        "volatility_score": 0.49,
        "weekday_income": {...},
        "monthly_trend": "stable"
    },
    "user_profile": {
        "occupation": "uber_driver",
        "city": "Bangalore",
        "monthly_income_min": 25000,
        "monthly_income_max": 45000
    }
}
```

**Output Generated:**
```python
{
    "forecast_7day": {
        "total_expected": 13500,
        "daily_breakdown": [1800, 1900, 2100, 1850, 2000, 1900, 1950],
        "confidence": 0.78
    },
    "forecast_30day": {
        "total_expected": 57000,
        "weekly_breakdown": [14000, 14500, 14200, 14300],
        "confidence": 0.65
    },
    "scenarios": {
        "best_case": {
            "7day_total": 16000,
            "30day_total": 70000,
            "probability": 0.2,
            "description": "High demand, no weather issues"
        },
        "expected_case": {
            "7day_total": 13500,
            "30day_total": 57000,
            "probability": 0.6,
            "description": "Normal market conditions"
        },
        "worst_case": {
            "7day_total": 9000,
            "30day_total": 42000,
            "probability": 0.2,
            "description": "Monsoon impact, reduced demand"
        }
    },
    "confidence_score": 0.72,
    "risk_level": "medium",  # low/medium/high
    "volatility_factors": [
        "Weather dependency for delivery work",
        "Weekend vs weekday variations"
    ],
    "recommendations": [
        "Build emergency fund for worst-case weeks",
        "Capitalize on high-income days for savings"
    ],
    "insights": [
        "Income shows 30% weekly variation",
        "Prediction reliability improves with more data"
    ],
    "statistical_backing": {
        "mean_income": 1916.22,
        "std_deviation": 940.50,
        "trend": "stable",
        "data_points_analyzed": 60
    }
}
```

**Database Tables Used:**
- **Read From:** `transactions`, `income_patterns`
- **Write To:** `agent_logs`

**API Endpoint:** `GET /api/v1/analysis/forecast`

---

### 5. Tax Planning Agent (`backend/agents/tax_agent.py`)

**What It Does:**
- Calculates gross income and eligible deductions
- Computes taxable income and tax liability
- Identifies tax-saving opportunities (NPS, 80C, etc.)
- Generates ITR filing documents (ITR-3 form)
- Provides compliance checklist and deadlines
- Recommends new vs old tax regime

**Input Required:**
```python
{
    "transactions": [...],  # All transactions for financial year
    "user_profile": {
        "occupation": "food_delivery_driver",
        "city": "Bangalore",
        "dependents": 2,
        "age": 30
    },
    "financial_year": "2024-25"
}
```

**Output Generated:**
```python
{
    "gross_income": 540000.00,
    "income_period": "FY 2024-25",
    "filing_requirement": {
        "is_mandatory": True,
        "reason": "Income exceeds ₹2.5 lakh threshold",
        "itr_form": "ITR-3",
        "filing_deadline": "31-Jul-2025",
        "penalty_for_late_filing": "₹5,000"
    },
    "deductions_recommended": {
        "regime": "new_regime",  # or "old_regime"
        "standard_deduction": 75000,
        "itemized_deductions": [
            {
                "category": "Fuel Expenses",
                "amount": 80000,
                "justification": "Business use - delivery driving",
                "documentation": "Fuel receipts, mileage log"
            },
            {
                "category": "Vehicle Maintenance",
                "amount": 25000,
                "justification": "Repair and servicing",
                "documentation": "Service invoices"
            }
        ],
        "total_deductions": 180000
    },
    "taxable_income": 360000,
    "tax_calculation": {
        "base_tax": 22500,
        "surcharge": 0,
        "cess": 900,  # 4% of base
        "total_tax": 23400,
        "effective_tax_rate": 0.0433  # 4.33%
    },
    "refund_status": {
        "total_tax_liability": 23400,
        "estimated_tds": 5000,
        "estimated_refund": 0,
        "refund_probability": "low"
    },
    "tax_saving_opportunities": [
        {
            "investment_type": "National Pension Scheme (NPS)",
            "max_investment": 50000,
            "tax_benefit": 15000,
            "priority": "high",
            "reason": "Government co-contribution for gig workers"
        }
    ],
    "compliance_checklist": [
        "Organize all income receipts/invoices",
        "Compile fuel expense receipts",
        "Gather vehicle insurance documents",
        "Keep mileage logs",
        "Maintain bank statements"
    ],
    "documents_required": [
        "PAN card",
        "Aadhaar card",
        "Bank statements (12 months)",
        "All income receipts",
        "Expense receipts/invoices"
    ],
    "risk_assessment": {
        "risk_level": "low",
        "areas_of_concern": [],
        "recommendations": ["File on time", "Keep all receipts"]
    },
    "confidence_score": 0.85,
    "next_steps": [
        "Gather all documents",
        "Organize transaction records",
        "File ITR before deadline"
    ]
}
```

**Database Tables Used:**
- **Read From:** `transactions`, `user_profiles`
- **Write To:** `tax_records`, `agent_logs`

**Database Fields Saved:**
```sql
tax_records:
  - tax_record_id (UUID)
  - user_id (UUID)
  - financial_year (VARCHAR) ← "2024-25"
  - gross_income (FLOAT)
  - total_deductions (FLOAT)
  - deduction_details (JSONB)
  - taxable_income (FLOAT)
  - tax_liability (FLOAT)
  - tax_paid (FLOAT)
  - refund_amount (FLOAT)
  - itr_form_type (VARCHAR) ← "ITR-3"
  - filing_status (VARCHAR) ← "pending", "filed", "verified"
  - acknowledgement_number (VARCHAR)
```

**API Endpoints:**
- `POST /api/v1/analysis/tax` - Get tax analysis
- `POST /api/v1/analysis/tax/itr-form` - Generate ITR-3 form

---

## PHASE 3 - READY TO IMPLEMENT 📅

### 6. Context Intelligence Agent (`backend/agents/context_agent.py`)

**What It Does:**
- Analyzes weather impact on income
- Prepares festival/cultural event context
- Identifies seasonal income patterns
- Provides real-time context for immediate decisions
- Integrates external data (weather, calendars, events)

**Key Functions:**
1. `analyze_weather_impact()` - Weather correlation with income
2. `prepare_festival_context()` - Diwali, Holi, regional festivals
3. `analyze_seasonal_patterns()` - Monsoon, peak season analysis
4. `get_real_time_context()` - Today's opportunities/risks

**Database Tables Used:**
- **Read From:** `transactions`, `user_profiles`
- **Write To:** `agent_logs`

**API Endpoint:** `POST /api/v1/analysis/context-intelligence`

---

### 7. Knowledge Integration Agent (`backend/agents/knowledge_agent.py`)

**What It Does:**
- Matches users with 200+ government schemes
- Recommends insurance products (PMSBY, PMJJBY, health)
- Identifies loan opportunities (PM Mudra, business loans)
- Matches skill development programs
- Provides eligibility checking and application guidance

**Key Functions:**
1. `match_government_schemes()` - PM Mudra, PMSBY, NPS-Traders
2. `recommend_insurance_products()` - Life, accident, health insurance
3. `identify_loan_opportunities()` - Business loans, credit lines
4. `match_skill_development_programs()` - Upskilling opportunities

**Database Tables Used:**
- **Read From:** `user_profiles`, `transactions`, `government_schemes`
- **Write To:** `user_schemes`, `agent_logs`

**API Endpoint:** `POST /api/v1/analysis/knowledge-integration`

---

### 8. Risk Assessment Agent (`backend/agents/risk_agent.py`)

**What It Does:**
- Assesses 7 risk dimensions (income, debt, liquidity, expense, dependency, protection, behavioral)
- Detects crisis indicators (no income, low emergency fund, expenses > income)
- Recommends human advisor escalation
- Provides early warning system
- Routes high-risk cases to financial counselors

**Key Functions:**
1. `assess_financial_risk()` - Comprehensive risk scoring
2. `detect_crisis_indicators()` - Immediate crisis detection
3. `assess_income_decline_risk()` - Trend analysis
4. `recommend_escalation()` - Human advisor routing

**Risk Levels:**
- GREEN: All systems normal
- YELLOW: One risk area needs attention
- ORANGE: Multiple risk areas
- RED: Crisis level, immediate intervention

**Database Tables Used:**
- **Read From:** `transactions`, `user_profiles`, `recommendations`, `income_patterns`
- **Write To:** `agent_logs`

**API Endpoint:** `POST /api/v1/analysis/risk-assessment`

---

### 9. Action Execution Agent (`backend/agents/action_agent.py`)

**What It Does:**
- Auto-executes approved financial actions with user consent
- Tracks outcome verification
- Generates continuous learning reports
- Recommends next optimal actions
- Measures actual results vs predictions

**Key Functions:**
1. `execute_savings_action()` - Automated savings transfers
2. `execute_investment_action()` - Investment allocations
3. `verify_action_outcome()` - Compare predicted vs actual
4. `generate_continuous_learning_report()` - Success pattern analysis
5. `recommend_next_action()` - Data-driven next steps

**Database Tables Used:**
- **Read From:** `recommendations`, `outcomes`
- **Write To:** `outcomes`, `agent_logs`

**API Endpoints:**
- `POST /api/v1/analysis/action-execution` - Execute action
- `GET /api/v1/analysis/continuous-learning` - Learning report

---

## DATABASE SCHEMA ALIGNMENT

### Core Tables (Currently Implemented)

**1. users** - Authentication & Basic Profile
```sql
✅ user_id (UUID)
✅ phone_number (VARCHAR)
✅ email (VARCHAR)
✅ password (TEXT) ← Uses hash
✅ full_name (VARCHAR)
✅ occupation (VARCHAR)
✅ city (VARCHAR)
✅ state (VARCHAR)
✅ kyc_verified (BOOLEAN)
✅ onboarding_completed (BOOLEAN)
✅ created_at (TIMESTAMP)
✅ updated_at (TIMESTAMP)
```

**2. user_profiles** - Financial Profile
```sql
✅ profile_id (UUID)
✅ user_id (UUID) → FK to users
✅ monthly_income_min (FLOAT)
✅ monthly_income_max (FLOAT)
✅ monthly_expenses_avg (FLOAT)
✅ emergency_fund_target (FLOAT)
✅ current_emergency_fund (FLOAT)
✅ risk_tolerance (VARCHAR)
✅ financial_goals (JSONB)
✅ income_sources (JSONB)
✅ debt_obligations (JSONB)
✅ dependents (INTEGER)
```

**3. transactions** - Income & Expenses
```sql
✅ transaction_id (UUID)
✅ user_id (UUID) → FK to users
✅ transaction_date (DATE)
✅ transaction_time (VARCHAR)
✅ amount (FLOAT)
✅ transaction_type (VARCHAR) ← "income", "expense"
✅ category (VARCHAR) ← "Delivery", "Groceries", etc.
✅ subcategory (VARCHAR)
✅ source (VARCHAR)
✅ payment_method (VARCHAR)
✅ description (TEXT)
✅ merchant_name (VARCHAR)
✅ location (VARCHAR)
✅ is_recurring (BOOLEAN)
✅ tags (JSONB)
✅ verified (BOOLEAN)
✅ created_at (TIMESTAMP)
```

**4. income_patterns** - Pattern Recognition Results
```sql
✅ pattern_id (UUID)
✅ user_id (UUID) → FK to users
✅ pattern_type (VARCHAR)
✅ avg_income (FLOAT)
✅ min_income (FLOAT)
✅ max_income (FLOAT)
✅ confidence_score (FLOAT)
✅ weekday_income (JSONB)
✅ monthly_trend (JSONB)
✅ peak_hours (JSONB)
✅ weather_impact (JSONB)
✅ seasonal_factors (JSONB)
✅ last_calculated (TIMESTAMP)
✅ valid_until (TIMESTAMP)
```

**5. recommendations** - AI Recommendations
```sql
✅ recommendation_id (UUID)
✅ user_id (UUID) → FK to users
✅ recommendation_type (VARCHAR)
✅ priority (VARCHAR)
✅ title (VARCHAR)
✅ description (TEXT)
✅ reasoning (TEXT)
✅ action_items (JSONB)
✅ target_amount (FLOAT)
✅ target_date (DATE)
✅ confidence_score (FLOAT)
✅ success_probability (FLOAT)
✅ agent_source (VARCHAR)
✅ status (VARCHAR)
✅ user_feedback (TEXT)
✅ actual_outcome (JSONB)
✅ created_at (TIMESTAMP)
```

**6. agent_logs** - Audit Trail
```sql
✅ log_id (UUID)
✅ user_id (UUID) → FK to users
✅ agent_name (VARCHAR)
✅ execution_timestamp (TIMESTAMP)
✅ input_data (JSONB)
✅ output_data (JSONB)
✅ confidence_score (FLOAT)
✅ execution_time_ms (INTEGER)
✅ success (BOOLEAN)
✅ error_message (TEXT)
✅ model_version (VARCHAR)
```

**7. outcomes** - Outcome Verification
```sql
✅ outcome_id (UUID)
✅ recommendation_id (UUID) → FK to recommendations
✅ user_id (UUID) → FK to users
✅ outcome_type (VARCHAR)
✅ baseline_value (FLOAT)
✅ target_value (FLOAT)
✅ actual_value (FLOAT)
✅ achievement_percentage (FLOAT)
✅ success (BOOLEAN)
✅ verification_method (VARCHAR)
✅ notes (TEXT)
✅ measured_at (TIMESTAMP)
```

### Additional Tables (Schema Created, Not Yet Fully Used)

**8. budgets** - Dynamic Budget Plans
```sql
🔄 budget_id (UUID)
🔄 user_id (UUID)
🔄 budget_type (VARCHAR) ← feast/famine/normal
🔄 valid_from (DATE)
🔄 valid_until (DATE)
🔄 total_income_expected (FLOAT)
🔄 fixed_costs (JSONB)
🔄 variable_costs (JSONB)
🔄 savings_target (FLOAT)
🔄 discretionary_budget (FLOAT)
🔄 category_limits (JSONB)
🔄 confidence_score (FLOAT)
🔄 is_active (BOOLEAN)
```

**9. tax_records** - Tax Planning
```sql
🔄 tax_record_id (UUID)
🔄 user_id (UUID)
🔄 financial_year (VARCHAR)
🔄 gross_income (FLOAT)
🔄 total_deductions (FLOAT)
🔄 deduction_details (JSONB)
🔄 taxable_income (FLOAT)
🔄 tax_liability (FLOAT)
🔄 tax_paid (FLOAT)
🔄 refund_amount (FLOAT)
🔄 itr_form_type (VARCHAR)
🔄 filing_status (VARCHAR)
🔄 acknowledgement_number (VARCHAR)
```

**10. government_schemes** - Scheme Database
```sql
📅 scheme_id (UUID)
📅 scheme_name (VARCHAR)
📅 scheme_code (VARCHAR)
📅 description (TEXT)
📅 eligibility_criteria (JSONB)
📅 benefits (TEXT)
📅 application_process (TEXT)
📅 max_benefit_amount (FLOAT)
📅 interest_rate (FLOAT)
📅 government_level (VARCHAR)
📅 state_applicable (VARCHAR)
📅 valid_from (DATE)
📅 valid_until (DATE)
📅 is_active (BOOLEAN)
```

**11. user_schemes** - Scheme Applications
```sql
📅 user_scheme_id (UUID)
📅 user_id (UUID)
📅 scheme_id (UUID)
📅 application_date (DATE)
📅 application_status (VARCHAR)
📅 approval_date (DATE)
📅 benefit_received (FLOAT)
📅 documents_submitted (JSONB)
```

**12. notifications** - User Alerts
```sql
📅 notification_id (UUID)
📅 user_id (UUID)
📅 notification_type (VARCHAR)
📅 channel (VARCHAR)
📅 title (VARCHAR)
📅 message (TEXT)
📅 priority (VARCHAR)
📅 status (VARCHAR)
📅 scheduled_at (TIMESTAMP)
📅 sent_at (TIMESTAMP)
📅 read_at (TIMESTAMP)
📅 action_taken (BOOLEAN)
```

---

## API ENDPOINTS SUMMARY

### Phase 1 - Implemented ✅
| Endpoint | Method | Agent | Input | Output |
|----------|--------|-------|-------|--------|
| `/users/signup` | POST | - | phone, password, name, occupation, city | JWT token |
| `/users/login` | POST | - | phone, password | JWT token |
| `/users/me` | GET | - | JWT token | User info |
| `/users/me/profile` | GET | - | JWT token | User profile |
| `/users/me/transactions` | GET | - | JWT token, days_back | Transaction list |
| `/analysis/` | POST | Pattern + Recommendation | JWT token, include_recommendations | Pattern + Recommendations |
| `/analysis/recommendations` | GET | - | JWT token, status filter | Saved recommendations |

### Phase 2 - Ready 🔄
| Endpoint | Method | Agent | Input | Output |
|----------|--------|-------|-------|--------|
| `/analysis/budget` | POST | Budget | JWT token | Feast/Famine budgets |
| `/analysis/forecast` | GET | Volatility | JWT token | 7/30-day forecasts |
| `/analysis/tax` | POST | Tax | JWT token | Tax analysis |
| `/analysis/tax/itr-form` | POST | Tax | JWT token | ITR-3 form |

### Phase 3 - Ready 📅
| Endpoint | Method | Agent | Input | Output |
|----------|--------|-------|-------|--------|
| `/analysis/context-intelligence` | POST | Context | JWT token | Weather/seasonal/festival context |
| `/analysis/knowledge-integration` | POST | Knowledge | JWT token | Schemes/loans/insurance/skills |
| `/analysis/risk-assessment` | POST | Risk | JWT token | Risk scores + crisis alerts |
| `/analysis/action-execution` | POST | Action | JWT token, action_type, amount, consent | Execution result |
| `/analysis/continuous-learning` | GET | Action | JWT token | Learning report |

---

## AGENT ORCHESTRATION FLOW

```
User Request → API Endpoint → Authentication Check → Database Query → Agent Execution → Database Write → Response
```

**Example: Pattern + Recommendation Analysis**
```
1. POST /api/v1/analysis/ with JWT token
2. Auth: Validate JWT, get user_id
3. DB Read: Fetch user_profile, last 50 transactions
4. Agent 1: Pattern Recognition Agent
   - Input: transactions + user_profile
   - LLM Call: Gemini Pro (30s)
   - Output: Pattern data (avg_income, volatility, etc.)
   - DB Write: Save to income_patterns table
   - DB Write: Log to agent_logs table
5. Agent 2: Recommendation Agent (if requested)
   - Input: pattern_data + user_profile + current_balance
   - LLM Call: Gemini Pro (25s)
   - Output: Recommendations (3-5 items)
   - DB Write: Save each recommendation to recommendations table
   - DB Write: Log to agent_logs table
6. Response: Combined pattern + recommendation JSON
```

---

## KEY INSIGHTS & DISCREPANCIES FOUND

### ✅ GOOD ALIGNMENT:
1. All Phase 1 agents work correctly with database
2. API schemas match database fields well
3. JSONB fields provide flexibility for complex data
4. Agent logging is comprehensive

### ⚠️ POTENTIAL ISSUES:
1. **Field Name Mismatch:**
   - Schema uses `action_items` (JSONB) in recommendations
   - Database has same field, but API returns as List[str]
   - **Resolution:** JSONB can store arrays, so compatible ✅

2. **Missing Indexes:**
   - `transaction_date` is indexed ✅
   - `user_id` FK columns are indexed ✅
   - Consider adding index on `recommendations.status` for filtering

3. **Phase 2 Agents Ready But Not Fully Wired:**
   - Budget agent code complete ✅
   - Volatility agent code complete ✅
   - Tax agent code complete ✅
   - API endpoints created ✅
   - **Just need testing!**

4. **Phase 3 Agents:**
   - All agent code written ✅
   - All API endpoints created ✅
   - Need database seeding for `government_schemes` table
   - Need external API integrations (OpenWeather)

---

## NEXT STEPS FOR COMPLETION

### Phase 2 (Immediate):
1. Test budget endpoint: `POST /api/v1/analysis/budget`
2. Test forecast endpoint: `GET /api/v1/analysis/forecast`
3. Test tax endpoints: `POST /api/v1/analysis/tax` and `/tax/itr-form`
4. Verify budget/tax data saves to database correctly

### Phase 3 (Future):
1. Seed `government_schemes` table with 200+ schemes
2. Integrate OpenWeather API for context agent
3. Test all Phase 3 endpoints
4. Connect frontend to all backend APIs
5. Implement action execution with real UPI/banking integration

---

**Legend:**
- ✅ Fully Implemented & Working
- 🔄 Code Complete, Ready to Test
- 📅 Code Complete, Needs External Data/Integration

---

*Generated: 2025-11-26*
*Project: AGENTE AI - Autonomous Financial Coaching Agent*
