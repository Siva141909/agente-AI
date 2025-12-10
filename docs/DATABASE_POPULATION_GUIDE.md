# Database Population Guide for Risk Analysis & Action Plan

## Overview
The **Risk Analysis** and **Action Plan** pages are empty because the following tables need to be populated with data:

---

## 1. RISK ASSESSMENTS TABLE (`risk_assessments`)

**Used by:** Risk Analysis page (`/risk`)

### Required Columns (from CSV schema):
- `id` (integer, auto-increment) - Primary key
- `user_id` (uuid, NOT NULL) - Foreign key to `users.user_id`
- `overall_risk_level` (varchar, NOT NULL) - Values: `'low'`, `'medium'`, `'high'`
- `risk_score` (double precision, NOT NULL) - Score from 0-10
- `risk_factors` (jsonb, nullable) - Array of risk factors
- `debt_to_income_ratio` (double precision, nullable) - Ratio as decimal (e.g., 0.3 = 30%)
- `income_drop_percentage` (double precision, nullable) - Percentage drop (e.g., 15.5 = 15.5%)
- `expense_spike_factor` (double precision, nullable) - Multiplier (e.g., 1.5 = 1.5x normal)
- `emergency_fund_coverage` (double precision, nullable) - Months of coverage (e.g., 2.5 months)
- `transaction_anomalies` (jsonb, nullable) - Anomaly data
- `escalation_needed` (boolean, nullable) - `true` if high risk
- `escalation_priority` (varchar, nullable) - `'low'`, `'medium'`, `'high'`
- `escalation_reason` (text, nullable) - Reason for escalation
- `recommended_actions` (jsonb, nullable) - Array of recommended actions
- `ai_risk_analysis` (text, nullable) - AI-generated analysis text
- `assessment_date` (timestamp with time zone, default: now())
- `created_at` (timestamp with time zone, default: now())

### Sample INSERT Query:
```sql
INSERT INTO risk_assessments (
  user_id,
  overall_risk_level,
  risk_score,
  risk_factors,
  debt_to_income_ratio,
  income_drop_percentage,
  expense_spike_factor,
  emergency_fund_coverage,
  escalation_needed,
  recommended_actions
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',  -- Your user_id
  'medium',
  5.5,
  '[
    {"factor": "Low emergency fund", "impact": "Only 2.5 months coverage"},
    {"factor": "High expense variability", "impact": "Expenses spike 1.5x during certain periods"}
  ]'::jsonb,
  0.3,        -- 30% debt-to-income
  0,          -- No income drop
  1.5,        -- 1.5x expense spike
  2.5,        -- 2.5 months emergency fund
  false,
  '[
    {"action": "Build emergency fund to 6 months", "description": "Aim to save ₹50,000"},
    {"action": "Reduce discretionary spending", "description": "Cut non-essential expenses by 20%"}
  ]'::jsonb
);
```

---

## 2. EXECUTED ACTIONS TABLE (`executed_actions`)

**Used by:** Action Plan page (`/actions`)

### Required Columns (from CSV schema):
- `id` (integer, auto-increment) - Primary key
- `user_id` (uuid, NOT NULL) - Foreign key to `users.user_id`
- `action_type` (varchar, NOT NULL) - Type of action (e.g., `'savings'`, `'debt'`, `'budget'`, `'risk'`)
- `action_description` (text, nullable) - Description of the action
- `status` (varchar, nullable) - Values: `'pending'`, `'active'`, `'paused'`, `'completed'`
- `amount` (double precision, NOT NULL) - Amount involved
- `target_account` (varchar, nullable) - Target account identifier
- `target_entity` (varchar, nullable) - Target entity
- `user_approved` (boolean, nullable) - Whether user approved
- `approval_date` (timestamp with time zone, nullable)
- `execution_date` (timestamp with time zone, nullable) - When action was executed
- `schedule` (varchar, nullable) - Schedule type (e.g., `'daily'`, `'weekly'`, `'monthly'`, `'once'`)
- `next_execution` (date, nullable) - Next execution date (important for filtering)
- `recurrence_count` (integer, nullable) - Number of times executed
- `is_reversible` (boolean, nullable) - Whether action can be reversed
- `reversal_requested` (boolean, nullable)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, nullable)

### Sample INSERT Queries:

#### Today's Action:
```sql
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Auto-save ₹500 to emergency fund',
  'active',
  500.00,
  'daily',
  CURRENT_DATE,  -- Today
  true
);
```

#### Upcoming Action (next week):
```sql
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'debt',
  'Pay ₹2000 towards credit card debt',
  'pending',
  2000.00,
  'weekly',
  CURRENT_DATE + INTERVAL '3 days',  -- 3 days from now
  false
);
```

#### Ongoing Action:
```sql
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved,
  is_reversible
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Monthly SIP of ₹3000',
  'active',
  3000.00,
  'monthly',
  CURRENT_DATE + INTERVAL '15 days',
  true,
  true
);
```

#### Completed Action:
```sql
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  execution_date,
  schedule,
  user_approved
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'budget',
  'Reduced monthly subscription costs',
  'completed',
  500.00,
  CURRENT_DATE - INTERVAL '5 days',  -- 5 days ago
  'once',
  true
);
```

---

## Quick Setup Script

Here's a complete SQL script to populate both tables with sample data:

```sql
-- ============================================
-- RISK ASSESSMENT DATA
-- ============================================
INSERT INTO risk_assessments (
  user_id,
  overall_risk_level,
  risk_score,
  risk_factors,
  debt_to_income_ratio,
  income_drop_percentage,
  expense_spike_factor,
  emergency_fund_coverage,
  escalation_needed,
  escalation_priority,
  escalation_reason,
  recommended_actions,
  ai_risk_analysis
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'medium',
  5.5,
  '[
    {"factor": "Low emergency fund coverage", "impact": "Only 2.5 months of expenses covered"},
    {"factor": "Variable income pattern", "impact": "Income fluctuates significantly week-to-week"},
    {"factor": "High expense variability", "impact": "Expenses can spike 1.5x during peak periods"}
  ]'::jsonb,
  0.3,
  0,
  1.5,
  2.5,
  false,
  NULL,
  NULL,
  '[
    {"action": "Build emergency fund to 6 months", "description": "Target: Save ₹50,000 over next 6 months"},
    {"action": "Reduce discretionary spending", "description": "Cut non-essential expenses by 20%"},
    {"action": "Diversify income sources", "description": "Consider additional gig platforms"}
  ]'::jsonb,
  'Based on your transaction history, your financial risk is moderate. Main concerns are low emergency fund coverage and income volatility. Recommended actions focus on building savings buffer and managing expenses during low-income periods.'
);

-- ============================================
-- EXECUTED ACTIONS DATA
-- ============================================

-- Today's Action
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved,
  is_reversible
) VALUES (
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Auto-save ₹500 to emergency fund',
  'active',
  500.00,
  'daily',
  CURRENT_DATE,
  true,
  true
);

-- Upcoming Actions (next week)
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved,
  is_reversible
) VALUES 
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'debt',
  'Pay ₹2000 towards credit card debt',
  'pending',
  2000.00,
  'weekly',
  CURRENT_DATE + INTERVAL '3 days',
  false,
  false
),
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Transfer ₹1000 to savings account',
  'pending',
  1000.00,
  'weekly',
  CURRENT_DATE + INTERVAL '5 days',
  false,
  true
);

-- Ongoing Actions
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  schedule,
  next_execution,
  user_approved,
  is_reversible,
  recurrence_count
) VALUES 
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Monthly SIP of ₹3000',
  'active',
  3000.00,
  'monthly',
  CURRENT_DATE + INTERVAL '15 days',
  true,
  true,
  3
),
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'budget',
  'Limit food delivery to ₹2000/month',
  'active',
  2000.00,
  'monthly',
  CURRENT_DATE + INTERVAL '20 days',
  true,
  true,
  1
);

-- Completed Actions
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  execution_date,
  schedule,
  user_approved
) VALUES 
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'budget',
  'Reduced monthly subscription costs',
  'completed',
  500.00,
  CURRENT_DATE - INTERVAL '5 days',
  'once',
  true
),
(
  '153735c8-b1e3-4fc6-aa4e-7deb6454990b',
  'savings',
  'Emergency fund contribution of ₹5000',
  'completed',
  5000.00,
  CURRENT_DATE - INTERVAL '10 days',
  'once',
  true
);
```

---

## How to Execute

1. **Open Supabase Dashboard** → Go to your project
2. **Navigate to SQL Editor**
3. **Copy and paste the SQL script above**
4. **Replace `'153735c8-b1e3-4fc6-aa4e-7deb6454990b'` with your actual `user_id`** (if different)
5. **Run the query**

---

## Verification

After running the SQL script:

1. **Check Risk Analysis page** (`/risk`) - Should show:
   - Risk level and score
   - Risk metrics (debt-to-income, emergency fund coverage, etc.)
   - Risk factors list
   - Recommended actions

2. **Check Action Plan page** (`/actions`) - Should show:
   - Today's actions (filter: Today)
   - Upcoming actions (filter: Upcoming)
   - Ongoing actions (filter: Ongoing)
   - Completed actions (filter: Completed)

---

## Notes

- Make sure your `user_id` matches the one in your `users` table
- Dates are relative (using `CURRENT_DATE` and intervals), so they'll work regardless of when you run the script
- You can modify the amounts, descriptions, and dates as needed
- The JSONB fields (`risk_factors`, `recommended_actions`) use JSON array format

