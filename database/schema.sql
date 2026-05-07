-- ============================================================
-- Agente AI - Complete Database Schema
-- Run this in Supabase SQL Editor on a fresh project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  occupation VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  date_of_birth DATE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  user_type VARCHAR(50) DEFAULT 'gig_worker',
  is_active BOOLEAN DEFAULT true,
  kyc_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER PROFILES (extended financial profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  monthly_income_min NUMERIC(12,2) DEFAULT 0,
  monthly_income_max NUMERIC(12,2) DEFAULT 0,
  monthly_expenses_avg NUMERIC(12,2) DEFAULT 0,
  emergency_fund_target NUMERIC(12,2) DEFAULT 0,
  current_emergency_fund NUMERIC(12,2) DEFAULT 0,
  risk_tolerance VARCHAR(10) DEFAULT 'moderate',
  financial_goals JSONB DEFAULT '{}',
  income_sources JSONB DEFAULT '[]',
  debt_obligations JSONB DEFAULT '[]',
  dependents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BANK ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  provider VARCHAR(100),
  account_number VARCHAR(50),
  current_balance NUMERIC(12,2) DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  amount NUMERIC(12,2) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  description TEXT,
  payment_method VARCHAR(50),
  merchant_name VARCHAR(255),
  location VARCHAR(255),
  source VARCHAR(100),
  account_id UUID REFERENCES bank_accounts(account_id) ON DELETE SET NULL,
  input_method VARCHAR(20) DEFAULT 'manual',
  verified BOOLEAN DEFAULT true,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20),
  tags TEXT[],
  balance_after NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  budget_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  budget_type VARCHAR(50) DEFAULT 'monthly',
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  total_income_expected NUMERIC(12,2) DEFAULT 0,
  fixed_costs JSONB DEFAULT '{}',
  variable_costs JSONB DEFAULT '{}',
  savings_target NUMERIC(12,2) DEFAULT 0,
  discretionary_budget NUMERIC(12,2) DEFAULT 0,
  category_limits JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCOME PATTERNS (AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS income_patterns (
  pattern_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  pattern_type VARCHAR(50),
  avg_income NUMERIC(12,2),
  min_income NUMERIC(12,2),
  max_income NUMERIC(12,2),
  confidence_score NUMERIC(3,2),
  weekday_income JSONB DEFAULT '{}',
  monthly_trend JSONB DEFAULT '{}',
  peak_hours JSONB DEFAULT '[]',
  weather_impact JSONB DEFAULT '{}',
  seasonal_factors JSONB DEFAULT '{}',
  last_calculated TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCOME FORECASTS (AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS income_forecasts (
  forecast_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  forecast_start_date DATE,
  forecast_end_date DATE,
  historical_days INTEGER,
  historical_total_income NUMERIC(12,2),
  historical_avg_daily NUMERIC(12,2),
  historical_std_dev NUMERIC(12,2),
  volatility_index NUMERIC(5,4),
  pessimistic_scenario JSONB DEFAULT '{}',
  realistic_scenario JSONB DEFAULT '{}',
  optimistic_scenario JSONB DEFAULT '{}',
  weighted_forecast NUMERIC(12,2),
  forecast_range_min NUMERIC(12,2),
  forecast_range_max NUMERIC(12,2),
  weekday_breakdown JSONB DEFAULT '{}',
  recent_trend VARCHAR(20),
  forecast_confidence NUMERIC(3,2),
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RISK ASSESSMENTS (AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  risk_assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  overall_risk_level VARCHAR(10) DEFAULT 'medium',
  risk_score NUMERIC(4,2),
  risk_factors JSONB DEFAULT '[]',
  debt_to_income_ratio NUMERIC(5,4),
  income_drop_percentage NUMERIC(5,2),
  expense_spike_factor NUMERIC(5,2),
  emergency_fund_coverage NUMERIC(5,2),
  transaction_anomalies JSONB DEFAULT '[]',
  escalation_needed BOOLEAN DEFAULT false,
  escalation_priority VARCHAR(10),
  escalation_reason TEXT,
  recommended_actions JSONB DEFAULT '[]',
  ai_risk_analysis TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECOMMENDATIONS (AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50),
  priority VARCHAR(10) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reasoning TEXT,
  action_items JSONB DEFAULT '[]',
  target_amount NUMERIC(12,2),
  target_date DATE,
  confidence_score NUMERIC(3,2),
  success_probability NUMERIC(3,2),
  agent_source VARCHAR(50),
  context_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  user_feedback TEXT,
  actual_outcome JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXECUTED ACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS executed_actions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  amount NUMERIC(12,2),
  target_account VARCHAR(255),
  target_entity VARCHAR(255),
  user_approved BOOLEAN DEFAULT false,
  approval_date TIMESTAMPTZ,
  requires_2fa BOOLEAN DEFAULT false,
  execution_date TIMESTAMPTZ,
  transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE SET NULL,
  schedule VARCHAR(20) DEFAULT 'once',
  next_execution DATE,
  recurrence_count INTEGER DEFAULT 0,
  is_reversible BOOLEAN DEFAULT true,
  reversal_requested BOOLEAN DEFAULT false,
  reversal_date TIMESTAMPTZ,
  audit_trail JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTION OUTCOMES
-- ============================================================
CREATE TABLE IF NOT EXISTS action_outcomes (
  outcome_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id INTEGER REFERENCES executed_actions(id) ON DELETE CASCADE,
  verification_date DATE,
  days_after_execution INTEGER,
  intended_target NUMERIC(12,2),
  actual_achievement NUMERIC(12,2),
  achievement_percentage NUMERIC(5,2),
  success BOOLEAN,
  deviation NUMERIC(12,2),
  deviation_reason TEXT,
  influencing_factors JSONB DEFAULT '{}',
  learnings TEXT,
  optimization_suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TAX RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_records (
  tax_record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,
  gross_income NUMERIC(12,2) DEFAULT 0,
  income_by_source JSONB DEFAULT '{}',
  total_deductions NUMERIC(12,2) DEFAULT 0,
  deduction_details JSONB DEFAULT '{}',
  taxable_income NUMERIC(12,2) DEFAULT 0,
  tax_liability NUMERIC(12,2) DEFAULT 0,
  tax_paid NUMERIC(12,2) DEFAULT 0,
  refund_amount NUMERIC(12,2) DEFAULT 0,
  itr_form_type VARCHAR(20),
  filing_status VARCHAR(20) DEFAULT 'not_filed',
  filing_date DATE,
  acknowledgement_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOVERNMENT SCHEMES (master data — public, no RLS)
-- ============================================================
CREATE TABLE IF NOT EXISTS government_schemes (
  scheme_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(50) UNIQUE,
  description TEXT,
  eligibility_criteria JSONB DEFAULT '{}',
  benefits TEXT,
  application_process TEXT,
  required_documents JSONB DEFAULT '[]',
  scheme_type VARCHAR(50),
  max_benefit_amount NUMERIC(12,2),
  interest_rate NUMERIC(5,2),
  government_level VARCHAR(20) DEFAULT 'central',
  state_applicable VARCHAR(100),
  valid_from DATE,
  valid_until DATE,
  official_url TEXT,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER SCHEME APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_scheme_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES government_schemes(scheme_id) ON DELETE CASCADE,
  application_date DATE NOT NULL,
  application_status VARCHAR(30) DEFAULT 'submitted',
  benefit_received NUMERIC(12,2),
  benefit_currency VARCHAR(5) DEFAULT 'INR',
  documents_submitted JSONB,
  documents_verified JSONB,
  approval_date DATE,
  disbursement_date DATE,
  application_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  notification_type VARCHAR(50),
  channel VARCHAR(20) DEFAULT 'in_app',
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  action_taken BOOLEAN DEFAULT false,
  action_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AGENT LOGS (system table — backend writes)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  agent_name VARCHAR(100),
  execution_timestamp TIMESTAMPTZ DEFAULT NOW(),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2),
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (query performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date   ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type   ON transactions(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_user     ON recommendations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_executed_actions_user    ON executed_actions(user_id, next_execution);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active      ON budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user    ON risk_assessments(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_tax_records_user         ON tax_records(user_id, financial_year);
CREATE INDEX IF NOT EXISTS idx_gov_schemes_type         ON government_schemes(scheme_type, is_active);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_patterns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_forecasts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE executed_actions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_outcomes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs             ENABLE ROW LEVEL SECURITY;
-- government_schemes is public — no RLS

-- ============================================================
-- RLS POLICIES (idempotent — drops before creates so re-runs work)
-- Temporary open policies; auth_migration.sql tightens these to
-- auth.uid() = user_id once Supabase Auth is configured.
-- ============================================================

DROP POLICY IF EXISTS "users_all"                    ON users;
DROP POLICY IF EXISTS "user_profiles_all"            ON user_profiles;
DROP POLICY IF EXISTS "bank_accounts_all"            ON bank_accounts;
DROP POLICY IF EXISTS "transactions_all"             ON transactions;
DROP POLICY IF EXISTS "budgets_all"                  ON budgets;
DROP POLICY IF EXISTS "income_patterns_all"          ON income_patterns;
DROP POLICY IF EXISTS "income_forecasts_all"         ON income_forecasts;
DROP POLICY IF EXISTS "risk_assessments_all"         ON risk_assessments;
DROP POLICY IF EXISTS "recommendations_all"          ON recommendations;
DROP POLICY IF EXISTS "executed_actions_all"         ON executed_actions;
DROP POLICY IF EXISTS "action_outcomes_all"          ON action_outcomes;
DROP POLICY IF EXISTS "tax_records_all"              ON tax_records;
DROP POLICY IF EXISTS "user_scheme_applications_all" ON user_scheme_applications;
DROP POLICY IF EXISTS "notifications_all"            ON notifications;
DROP POLICY IF EXISTS "agent_logs_all"               ON agent_logs;

CREATE POLICY "users_all"                   ON users                    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_profiles_all"           ON user_profiles            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bank_accounts_all"           ON bank_accounts            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "transactions_all"            ON transactions             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "budgets_all"                 ON budgets                  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "income_patterns_all"         ON income_patterns          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "income_forecasts_all"        ON income_forecasts         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "risk_assessments_all"        ON risk_assessments         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "recommendations_all"         ON recommendations          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "executed_actions_all"        ON executed_actions         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "action_outcomes_all"         ON action_outcomes          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tax_records_all"             ON tax_records              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_scheme_applications_all" ON user_scheme_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all"           ON notifications            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "agent_logs_all"              ON agent_logs               FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- GOVERNMENT SCHEMES — SEED DATA
-- 6 major central government schemes for gig workers
-- ============================================================
INSERT INTO government_schemes (
  scheme_name, scheme_code, description, scheme_type,
  government_level, benefits, max_benefit_amount,
  eligibility_criteria, required_documents, official_url, is_active
) VALUES
(
  'PM Jeevan Jyoti Bima Yojana', 'PMJJBY',
  'Life insurance scheme providing coverage of ₹2 lakh in case of death due to any reason.',
  'insurance', 'central',
  'Life cover of ₹2,00,000 on death due to any reason. Annual premium of just ₹436.',
  200000,
  '{"age": "18-50 years", "bank_account": "Required", "aadhaar": "Required"}',
  '["Aadhaar Card", "Bank Account Details", "Mobile Number"]',
  'https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana',
  true
),
(
  'PM Suraksha Bima Yojana', 'PMSBY',
  'Accidental insurance scheme providing coverage for accidental death and disability.',
  'insurance', 'central',
  'Accidental death/permanent disability: ₹2 lakh. Partial disability: ₹1 lakh. Annual premium: ₹20.',
  200000,
  '{"age": "18-70 years", "bank_account": "Required", "aadhaar": "Required"}',
  '["Aadhaar Card", "Bank Account Details"]',
  'https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Suraksha-Bima-Yojana',
  true
),
(
  'Atal Pension Yojana', 'APY',
  'Pension scheme for unorganised sector workers providing guaranteed monthly pension after age 60.',
  'pension', 'central',
  'Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60, based on contribution.',
  60000,
  '{"age": "18-40 years", "bank_account": "Required", "not_income_tax_payer": "Preferred"}',
  '["Aadhaar Card", "Bank Account", "Mobile Number"]',
  'https://npscra.nsdl.co.in/scheme-details.php',
  true
),
(
  'e-Shram Card', 'ESHRAM',
  'National database for unorganised workers. Register to access social security benefits and schemes.',
  'social_security', 'central',
  'One-time registration. Access to social security schemes. Accidental insurance of ₹2 lakh under PMSBY.',
  200000,
  '{"age": "16-59 years", "not_EPFO_ESIC_member": "Required", "aadhaar": "Required"}',
  '["Aadhaar Card", "Mobile Number linked to Aadhaar", "Bank Account"]',
  'https://eshram.gov.in',
  true
),
(
  'Ayushman Bharat PM-JAY', 'PMJAY',
  'Health insurance scheme providing ₹5 lakh per family per year for hospitalisation at empanelled hospitals.',
  'health', 'central',
  'Cashless hospitalisation up to ₹5 lakh/year. Covers pre-hospitalisation (3 days) and post-hospitalisation (15 days).',
  500000,
  '{"socioeconomic_criteria": "SECC 2011 database eligible families", "family_size": "No cap on family size"}',
  '["Aadhaar Card", "Ration Card or SECC identification document"]',
  'https://pmjay.gov.in',
  true
),
(
  'PM Mudra Yojana', 'PMMY',
  'Micro finance scheme providing collateral-free loans up to ₹10 lakh for small business and self-employment.',
  'employment', 'central',
  'Shishu: up to ₹50,000 | Kishore: ₹50,000–₹5 lakh | Tarun: ₹5 lakh–₹10 lakh. No collateral required.',
  1000000,
  '{"purpose": "Non-farm income generating business/self-employment", "credit_history": "Good repayment record preferred"}',
  '["Aadhaar Card", "PAN Card", "Business Plan or description", "Address Proof", "Identity Proof"]',
  'https://mudra.org.in',
  true
)
ON CONFLICT (scheme_code) DO NOTHING;

-- ============================================================
-- DEMO SEED DATA
-- 3 realistic Indian gig worker profiles
-- Login: phone + password "Demo@1234"
-- ============================================================

-- ============================================================
-- USERS (3 demo gig workers)
-- ============================================================
INSERT INTO users (
  user_id, phone_number, email, full_name, password,
  occupation, city, state, pin_code, date_of_birth,
  preferred_language, user_type, is_active, kyc_verified, onboarding_completed
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '9951778715', 'rajesh.kumar@gmail.com', 'Rajesh Kumar',
  crypt('Demo@1234', gen_salt('bf', 10)),
  'Cab Driver', 'Mumbai', 'Maharashtra', '400001',
  '1988-06-15', 'hi', 'gig_worker', true, true, true
),
(
  '20000000-0000-0000-0000-000000000002',
  '7207364460', 'priya.sharma@gmail.com', 'Priya Sharma',
  crypt('Demo@1234', gen_salt('bf', 10)),
  'Food Delivery', 'Bengaluru', 'Karnataka', '560001',
  '1995-11-22', 'kn', 'gig_worker', true, true, true
),
(
  '30000000-0000-0000-0000-000000000003',
  '9790958879', 'sunita.devi@gmail.com', 'Sunita Devi',
  crypt('Demo@1234', gen_salt('bf', 10)),
  'Home Services', 'Delhi', 'Delhi', '110001',
  '1990-03-08', 'hi', 'gig_worker', true, false, true
);

-- ============================================================
-- USER PROFILES
-- ============================================================
INSERT INTO user_profiles (
  user_id, monthly_income_min, monthly_income_max, monthly_expenses_avg,
  emergency_fund_target, current_emergency_fund, risk_tolerance,
  financial_goals, income_sources, debt_obligations, dependents
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  14000, 22000, 9500,
  57000, 18500, 'moderate',
  '{"goal1": "Emergency fund 6 months", "goal2": "Buy own cab by 2028", "goal3": "Children education fund"}',
  '[{"source": "Ola", "pct": 60}, {"source": "Uber", "pct": 40}]',
  '[{"type": "vehicle_loan", "emi": 4500, "outstanding": 85000}]',
  3
),
(
  '20000000-0000-0000-0000-000000000002',
  9000, 15000, 7200,
  43200, 12000, 'low',
  '{"goal1": "Pay off scooter loan", "goal2": "Build 3-month emergency fund", "goal3": "Online course to upskill"}',
  '[{"source": "Zomato", "pct": 55}, {"source": "Swiggy", "pct": 45}]',
  '[{"type": "two_wheeler_loan", "emi": 2200, "outstanding": 28000}]',
  1
),
(
  '30000000-0000-0000-0000-000000000003',
  6000, 10000, 5800,
  34800, 6500, 'low',
  '{"goal1": "Enroll in PMJJBY insurance", "goal2": "Save for daughters school fees", "goal3": "Register e-Shram card"}',
  '[{"source": "UrbanCompany", "pct": 70}, {"source": "Direct clients", "pct": 30}]',
  '[]',
  2
);

-- ============================================================
-- BANK ACCOUNTS
-- ============================================================
INSERT INTO bank_accounts (
  account_id, user_id, account_name, provider,
  account_number, current_balance, currency, is_active
) VALUES
(
  '10000000-ba00-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'SBI Savings Account', 'State Bank of India',
  'XXXX4521', 18500.00, 'INR', true
),
(
  '10000000-ba00-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'PhonePe Wallet', 'PhonePe',
  NULL, 3200.00, 'INR', true
),
(
  '20000000-ba00-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'HDFC Savings Account', 'HDFC Bank',
  'XXXX8872', 12000.00, 'INR', true
),
(
  '20000000-ba00-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Paytm Wallet', 'Paytm',
  NULL, 1800.00, 'INR', true
),
(
  '30000000-ba00-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000003',
  'PNB Savings Account', 'Punjab National Bank',
  'XXXX2291', 6500.00, 'INR', true
);

-- ============================================================
-- TRANSACTIONS
-- Rajesh: a0..., Priya: b0..., Sunita: c0...
-- ============================================================
INSERT INTO transactions (
  transaction_id, user_id, transaction_date, transaction_time,
  amount, transaction_type, category, subcategory,
  description, payment_method, source, account_id,
  verified, is_recurring
) VALUES
-- Rajesh Kumar (cab driver, Mumbai)
('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','2026-04-01','09:15:00',2150.00,'income','Gig Work','Cab Rides','Ola earnings – morning shift Apr 1','UPI','Ola','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','2026-04-02','18:30:00',450.00,'expense','Transport','Fuel','CNG refill – Mahanagar Gas','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','2026-04-03','20:00:00',1850.00,'income','Gig Work','Cab Rides','Uber earnings – evening shift','UPI','Uber','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','2026-04-05','13:00:00',120.00,'expense','Food','Meals','Lunch – dhaba near BKC','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','2026-04-07','22:00:00',2400.00,'income','Gig Work','Cab Rides','Ola earnings – Sunday full day','UPI','Ola','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','2026-04-09','17:00:00',500.00,'expense','Transport','Fuel','CNG refill – Andheri station','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','2026-04-10','21:30:00',1650.00,'income','Gig Work','Cab Rides','Uber earnings – weekday night','UPI','Uber','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','2026-04-12','10:00:00',299.00,'expense','Utilities','Mobile Recharge','Jio prepaid recharge 84-day plan','UPI',NULL,'10000000-ba00-0000-0000-000000000002',true,true),
('a0000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','2026-04-15','22:15:00',2100.00,'income','Gig Work','Cab Rides','Ola earnings – mid-month','UPI','Ola','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','2026-04-18','14:30:00',200.00,'expense','Food','Meals','Meals for two days','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','2026-04-20','20:45:00',1900.00,'income','Gig Work','Cab Rides','Uber earnings – Sunday','UPI','Uber','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001','2026-04-22','16:00:00',480.00,'expense','Transport','Fuel','CNG refill – Powai','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000001','2026-04-25','22:00:00',2200.00,'income','Gig Work','Cab Rides','Ola earnings – Friday night surge','UPI','Ola','10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000001','2026-04-28','12:00:00',150.00,'expense','Food','Meals','Lunch roadside – Dadar','Cash',NULL,'10000000-ba00-0000-0000-000000000001',true,false),
('a0000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000001','2026-05-01','21:00:00',2350.00,'income','Gig Work','Cab Rides','Ola earnings – Labour Day weekend','UPI','Ola','10000000-ba00-0000-0000-000000000001',true,false),

-- Priya Sharma (food delivery, Bengaluru)
('b0000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','2026-04-01','12:30:00',1100.00,'income','Gig Work','Food Delivery','Zomato earnings – lunch rush','UPI','Zomato','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','2026-04-02','18:00:00',350.00,'expense','Transport','Fuel','Petrol refill – Honda Activa','UPI',NULL,'20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','2026-04-04','21:00:00',950.00,'income','Gig Work','Food Delivery','Swiggy earnings – dinner orders','UPI','Swiggy','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','2026-04-06','14:00:00',180.00,'expense','Food','Meals','Quick meals between deliveries','Cash',NULL,'20000000-ba00-0000-0000-000000000002',true,false),
('b0000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000002','2026-04-08','22:30:00',1300.00,'income','Gig Work','Food Delivery','Zomato earnings – Saturday peak','UPI','Zomato','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000002','2026-04-10','10:00:00',199.00,'expense','Utilities','Mobile Recharge','Airtel 28-day recharge','UPI',NULL,'20000000-ba00-0000-0000-000000000002',true,true),
('b0000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002','2026-04-11','20:45:00',880.00,'income','Gig Work','Food Delivery','Swiggy earnings – weekday','UPI','Swiggy','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000002','2026-04-14','17:00:00',400.00,'expense','Transport','Fuel','Petrol refill – Koramangala','UPI',NULL,'20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000002','2026-04-16','21:15:00',1050.00,'income','Gig Work','Food Delivery','Zomato earnings – mid month','UPI','Zomato','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000002','2026-04-19','11:00:00',800.00,'expense','Food','Groceries','Monthly groceries – DMart','UPI',NULL,'20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000002','2026-04-21','22:00:00',1200.00,'income','Gig Work','Food Delivery','Swiggy earnings – Sunday peak','UPI','Swiggy','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000002','2026-04-24','14:30:00',250.00,'expense','Food','Meals','Meals for the week','Cash',NULL,'20000000-ba00-0000-0000-000000000002',true,false),
('b0000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000002','2026-04-26','20:30:00',1150.00,'income','Gig Work','Food Delivery','Zomato earnings – Saturday','UPI','Zomato','20000000-ba00-0000-0000-000000000001',true,false),
('b0000000-0000-0000-0000-000000000014','20000000-0000-0000-0000-000000000002','2026-04-29','09:00:00',1500.00,'expense','Housing','Rent','Room rent – PG Koramangala','UPI',NULL,'20000000-ba00-0000-0000-000000000001',true,true),
('b0000000-0000-0000-0000-000000000015','20000000-0000-0000-0000-000000000002','2026-05-01','21:30:00',1250.00,'income','Gig Work','Food Delivery','Swiggy earnings – May Day','UPI','Swiggy','20000000-ba00-0000-0000-000000000001',true,false),

-- Sunita Devi (home services, Delhi)
('c0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000003','2026-04-02','10:00:00',800.00,'income','Gig Work','Home Services','UrbanCompany – deep cleaning job','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','2026-04-03','08:30:00',80.00,'expense','Transport','Bus','DTC bus pass – weekly','Cash',NULL,'30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','2026-04-05','14:00:00',650.00,'income','Gig Work','Home Services','UrbanCompany – bathroom cleaning','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000003','2026-04-07','10:00:00',299.00,'expense','Utilities','Mobile Recharge','Vi prepaid recharge','UPI',NULL,'30000000-ba00-0000-0000-000000000001',true,true),
('c0000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000003','2026-04-09','11:30:00',1000.00,'income','Gig Work','Home Services','UrbanCompany – full house cleaning','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000003','2026-04-11','09:00:00',600.00,'expense','Food','Groceries','Groceries – local sabzi mandi','Cash',NULL,'30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000003','2026-04-14','15:00:00',750.00,'income','Gig Work','Home Services','Direct client – Laxmi Nagar house','Cash','Direct Client','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000003','2026-04-19','11:00:00',900.00,'income','Gig Work','Home Services','UrbanCompany – sofa cleaning job','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000003','2026-04-20','08:00:00',100.00,'expense','Transport','Bus','DTC bus pass – weekly','Cash',NULL,'30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000003','2026-04-24','14:30:00',850.00,'income','Gig Work','Home Services','UrbanCompany – kitchen cleaning','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000003','2026-04-29','13:00:00',700.00,'income','Gig Work','Home Services','Direct client – Dwarka client','Cash','Direct Client','30000000-ba00-0000-0000-000000000001',true,false),
('c0000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000003','2026-05-01','10:30:00',600.00,'income','Gig Work','Home Services','UrbanCompany – May Day booking','UPI','UrbanCompany','30000000-ba00-0000-0000-000000000001',true,false);

-- ============================================================
-- BUDGETS (April 2026)
-- ============================================================
INSERT INTO budgets (
  user_id, budget_type, valid_from, valid_until,
  total_income_expected, fixed_costs, variable_costs,
  savings_target, discretionary_budget, category_limits,
  confidence_score, is_active
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'monthly', '2026-04-01', '2026-04-30',
  18000.00,
  '{"vehicle_emi": 4500, "rent": 6000, "mobile": 299}',
  '{"fuel": 2000, "food": 1500, "misc": 500}',
  2000.00, 1201.00,
  '{"Transport": 2000, "Food": 1500, "Utilities": 400}',
  0.78, true
),
(
  '20000000-0000-0000-0000-000000000002',
  'monthly', '2026-04-01', '2026-04-30',
  12000.00,
  '{"scooter_emi": 2200, "rent": 1500, "mobile": 199}',
  '{"fuel": 1500, "food": 1200, "groceries": 800}',
  1500.00, 1101.00,
  '{"Transport": 1500, "Food": 2000, "Housing": 1500}',
  0.72, true
),
(
  '30000000-0000-0000-0000-000000000003',
  'monthly', '2026-04-01', '2026-04-30',
  8000.00,
  '{"rent": 2000, "mobile": 299, "children_school": 1200}',
  '{"transport": 400, "food": 1500, "groceries": 600}',
  1000.00, 1001.00,
  '{"Transport": 400, "Food": 2100, "Utilities": 300}',
  0.65, true
);

-- ============================================================
-- INCOME PATTERNS
-- ============================================================
INSERT INTO income_patterns (
  user_id, pattern_type, avg_income, min_income, max_income,
  confidence_score, weekday_income, monthly_trend,
  peak_hours, weather_impact, seasonal_factors,
  last_calculated, valid_until
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'weekly', 16000.00, 12000.00, 22000.00, 0.82,
  '{"Monday": 2200, "Tuesday": 1800, "Wednesday": 1900, "Thursday": 2000, "Friday": 2500, "Saturday": 2800, "Sunday": 2800}',
  '{"Jan": 14000, "Feb": 15500, "Mar": 17000, "Apr": 16000}',
  '[{"hour": "07:00-09:00", "demand": "high"}, {"hour": "17:00-20:00", "demand": "peak"}, {"hour": "22:00-00:00", "demand": "high"}]',
  '{"rain": -0.25, "heat_wave": -0.10, "fog": -0.30}',
  '{"diwali": 1.4, "new_year": 1.5, "ipl_season": 1.2}',
  '2026-04-28 00:00:00+05:30', '2026-05-28 00:00:00+05:30'
),
(
  '20000000-0000-0000-0000-000000000002',
  'weekly', 10500.00, 7500.00, 14000.00, 0.76,
  '{"Monday": 1000, "Tuesday": 900, "Wednesday": 1100, "Thursday": 1050, "Friday": 1400, "Saturday": 1600, "Sunday": 1650}',
  '{"Jan": 9000, "Feb": 10000, "Mar": 11000, "Apr": 10500}',
  '[{"hour": "12:00-14:00", "demand": "peak"}, {"hour": "19:00-22:00", "demand": "peak"}]',
  '{"rain": -0.15, "storm": -0.40}',
  '{"diwali": 1.3, "cricket_match_days": 1.5, "holiday_season": 1.25}',
  '2026-04-28 00:00:00+05:30', '2026-05-28 00:00:00+05:30'
),
(
  '30000000-0000-0000-0000-000000000003',
  'weekly', 7500.00, 5500.00, 10500.00, 0.68,
  '{"Monday": 1100, "Tuesday": 900, "Wednesday": 1000, "Thursday": 1200, "Friday": 1000, "Saturday": 1300, "Sunday": 1000}',
  '{"Jan": 6500, "Feb": 7000, "Mar": 8000, "Apr": 7500}',
  '[{"hour": "09:00-13:00", "demand": "peak"}]',
  '{"rain": -0.20, "extreme_heat": -0.15}',
  '{"festive_cleaning": 1.6, "new_year": 1.3}',
  '2026-04-28 00:00:00+05:30', '2026-05-28 00:00:00+05:30'
);

-- ============================================================
-- INCOME FORECASTS (next 30 days from May 2026)
-- ============================================================
INSERT INTO income_forecasts (
  user_id, forecast_start_date, forecast_end_date,
  historical_days, historical_total_income, historical_avg_daily,
  historical_std_dev, volatility_index,
  pessimistic_scenario, realistic_scenario, optimistic_scenario,
  weighted_forecast, forecast_range_min, forecast_range_max,
  weekday_breakdown, recent_trend, forecast_confidence, ai_reasoning
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '2026-05-01', '2026-05-31',
  30, 14850.00, 545.00, 180.00, 0.3300,
  '{"total": 12000, "daily_avg": 440}',
  '{"total": 16500, "daily_avg": 600}',
  '{"total": 20000, "daily_avg": 730}',
  16200.00, 11500.00, 20500.00,
  '{"weekday": 545, "weekend": 720}',
  'stable', 0.78,
  'Rajesh''s income shows stable pattern with weekend peaks. Uber/Ola combined average ₹545/day. May typically 5% higher than April due to summer travel demand. Vehicle EMI and fuel remain major cost anchors.'
),
(
  '20000000-0000-0000-0000-000000000002',
  '2026-05-01', '2026-05-31',
  30, 9880.00, 362.00, 145.00, 0.4008,
  '{"total": 7500, "daily_avg": 275}',
  '{"total": 10800, "daily_avg": 395}',
  '{"total": 13500, "daily_avg": 495}',
  10600.00, 7000.00, 13800.00,
  '{"weekday": 330, "weekend": 490}',
  'slightly_up', 0.72,
  'Priya''s income is heavily weekend-weighted with lunch/dinner peaks. Swiggy+Zomato combined average ₹362/day. May IPL season may boost evening orders. Scooter loan EMI ₹2200 is significant fixed cost.'
),
(
  '30000000-0000-0000-0000-000000000003',
  '2026-05-01', '2026-05-31',
  30, 6300.00, 231.00, 120.00, 0.5195,
  '{"total": 5000, "daily_avg": 183}',
  '{"total": 7000, "daily_avg": 257}',
  '{"total": 9000, "daily_avg": 330}',
  6800.00, 4800.00, 9200.00,
  '{"weekday": 250, "weekend": 190}',
  'stable', 0.63,
  'Sunita''s income is highly volatile with no reliable weekly pattern. UrbanCompany bookings depend on customer demand. Summer may see drop in heavy cleaning jobs. Recommend diversifying to include cooking/elderly care services.'
);

-- ============================================================
-- RISK ASSESSMENTS
-- ============================================================
INSERT INTO risk_assessments (
  user_id, overall_risk_level, risk_score,
  risk_factors, debt_to_income_ratio, income_drop_percentage,
  expense_spike_factor, emergency_fund_coverage,
  escalation_needed, recommended_actions, ai_risk_analysis, assessment_date
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'medium', 4.5,
  '[{"factor": "Vehicle loan EMI burden", "impact": "₹4500/month EMI is 25% of avg income"}, {"factor": "Income variance", "impact": "Can drop 35% in monsoon – Jun to Sep"}, {"factor": "Low emergency fund", "impact": "Only 1.1 months expenses covered"}]',
  0.2500, 35.00, 1.35, 1.10,
  false,
  '[{"action": "Increase emergency fund to 3 months", "target": "₹28500"}, {"action": "Negotiate lower EMI or prepay vehicle loan"}, {"action": "Enroll in PMJJBY life insurance at ₹436/year"}]',
  'Rajesh has moderate risk. Vehicle EMI eats 25% of income and monsoon can cut cab rides by 35%. Emergency fund covers barely 1 month. Recommend building buffer before monsoon (June). PMJJBY insurance is a must given 3 dependents.',
  '2026-04-30'
),
(
  '20000000-0000-0000-0000-000000000002',
  'medium', 6.2,
  '[{"factor": "Scooter loan outstanding", "impact": "₹28000 outstanding at high interest"}, {"factor": "Low emergency fund", "impact": "Covers less than 2 months expenses"}, {"factor": "Rain dependency", "impact": "Income drops 15-40% during heavy rain weeks"}, {"factor": "PG rent fixed cost", "impact": "Rent is 15% of average income"}]',
  0.1833, 40.00, 1.55, 1.67,
  false,
  '[{"action": "Prepay scooter loan EMI to reduce interest"}, {"action": "Build emergency fund to ₹21600 (3 months)"}, {"action": "Get PMSBY accidental insurance at ₹20/year"}]',
  'Priya has moderate-high risk. Rain is a major income disruptor – zero income possible during heavy rain. Fixed PG rent + scooter EMI = ₹3700/month regardless of earnings. Strongly recommend PMSBY given two-wheeler riding risk.',
  '2026-04-30'
),
(
  '30000000-0000-0000-0000-000000000003',
  'high', 7.8,
  '[{"factor": "No insurance coverage", "impact": "Any illness means zero income and medical bills"}, {"factor": "Very low emergency fund", "impact": "Only 1.1 months covered"}, {"factor": "High income volatility", "impact": "Bookings can be zero for 1-2 weeks"}, {"factor": "No formal documentation", "impact": "Cannot prove income for loans or schemes"}, {"factor": "2 dependents on single income", "impact": "School fees + household expenses fixed"}]',
  0.0000, 50.00, 1.80, 1.12,
  true,
  '[{"action": "Register on e-Shram portal immediately – free"}, {"action": "Enroll PMJJBY (₹436/yr) and PMSBY (₹20/yr)"}, {"action": "Open recurring deposit of ₹500/month"}, {"action": "Seek Mudra Shishu loan for equipment"}]',
  'Sunita is in the high-risk category. Zero insurance, 2 dependents, no formal income proof. Any health emergency would be financially devastating. Immediate priority: e-Shram registration unlocks PMSBY insurance automatically. Second priority: PMJJBY life cover for family security.',
  '2026-04-30'
);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================
INSERT INTO recommendations (
  user_id, recommendation_type, priority, title, description,
  reasoning, action_items, target_amount, target_date,
  confidence_score, success_probability, agent_source, status
) VALUES
-- Rajesh recommendations
(
  '10000000-0000-0000-0000-000000000001',
  'savings', 'high', 'Build Emergency Fund Before Monsoon',
  'Save ₹28,500 in next 3 months to cover 3 months of expenses before June monsoon.',
  'Cab income drops 30-35% in Mumbai monsoon (Jun-Sep). Having 3-month buffer prevents loan default.',
  '[{"step": "Auto-save ₹800/day on high-earning days"}, {"step": "Open separate FD account for emergency fund"}, {"step": "Target ₹9500/month savings for 3 months"}]',
  28500.00, '2026-06-01', 0.85, 0.78, 'RecommendationAgent', 'pending'
),
(
  '10000000-0000-0000-0000-000000000001',
  'insurance', 'high', 'Enroll in PMJJBY Life Insurance',
  'Get ₹2 lakh life cover for just ₹436/year – essential with 3 dependents and vehicle loan.',
  'PMJJBY provides life cover at ₹1.19/day. With 3 dependents and ₹85K vehicle loan, this is critical protection.',
  '[{"step": "Visit SBI branch with Aadhaar + passbook"}, {"step": "Fill Form 3 for PMJJBY auto-debit"}, {"step": "Annual premium ₹436 debited on June 1"}]',
  200000.00, '2026-05-15', 0.95, 0.92, 'KnowledgeIntegrationAgent', 'pending'
),
(
  '10000000-0000-0000-0000-000000000001',
  'tax', 'medium', 'File ITR-4 for FY 2025-26',
  'Declare gig income under Presumptive Taxation Scheme (Section 44ADA) – 50% of receipts as profit.',
  'Gig workers can use ITR-4 with Section 44ADA to declare income without maintaining books. Saves tax legally.',
  '[{"step": "Collect Form 26AS from TRACES"}, {"step": "Use Ola/Uber annual earnings report"}, {"step": "File ITR-4 before July 31, 2026"}]',
  NULL, '2026-07-31', 0.88, 0.85, 'TaxComplianceAgent', 'pending'
),
-- Priya recommendations
(
  '20000000-0000-0000-0000-000000000002',
  'debt', 'high', 'Prepay Scooter Loan to Save Interest',
  'Pay ₹5000 extra toward loan principal to save ~₹3200 in interest over remaining tenure.',
  'Current outstanding ₹28000 at ~16% pa. Extra ₹5000 reduces interest by ₹3200 over remaining 13 months.',
  '[{"step": "Call HDFC or lender for prepayment procedure"}, {"step": "Pay ₹5000 lump sum from April surplus"}, {"step": "Confirm no prepayment penalty for partial payment"}]',
  5000.00, '2026-05-31', 0.82, 0.88, 'BudgetAnalysisAgent', 'accepted'
),
(
  '20000000-0000-0000-0000-000000000002',
  'insurance', 'high', 'Get PMSBY Accident Insurance',
  'Two-wheeler riders are 3x more likely to have accidents. PMSBY covers ₹2 lakh for just ₹20/year.',
  'Priya rides daily in Bengaluru traffic. An accident without insurance means zero income + medical bills + no family support.',
  '[{"step": "Log in to HDFC net banking"}, {"step": "Enroll in PMSBY under government schemes"}, {"step": "Auto-debit ₹20 from account annually"}]',
  200000.00, '2026-05-10', 0.97, 0.95, 'KnowledgeIntegrationAgent', 'pending'
),
(
  '20000000-0000-0000-0000-000000000002',
  'savings', 'medium', 'Open Recurring Deposit ₹1000/month',
  'Start ₹1000/month RD at HDFC to build disciplined savings habit and emergency corpus.',
  'Priya spends impulsively on food delivery apps (ironic). A forced RD of ₹1000/month will build ₹12000 + interest in a year.',
  '[{"step": "Visit HDFC branch or app"}, {"step": "Open 12-month RD for ₹1000/month"}, {"step": "Link to salary account for auto-debit"}]',
  12000.00, '2026-04-30', 0.75, 0.70, 'RecommendationAgent', 'pending'
),
-- Sunita recommendations
(
  '30000000-0000-0000-0000-000000000003',
  'social_security', 'high', 'Register on e-Shram Portal Immediately',
  'Free registration at eshram.gov.in gives Aadhaar-linked worker ID and auto-enrolls in PMSBY (₹2L accident cover).',
  'Sunita has no formal worker registration. e-Shram is free and provides accident insurance, social security access, and identity proof.',
  '[{"step": "Visit eshram.gov.in or Common Service Centre"}, {"step": "Enter Aadhaar + mobile OTP"}, {"step": "Complete registration – takes 10 minutes"}, {"step": "Download e-Shram card as PDF"}]',
  NULL, '2026-05-10', 0.99, 0.97, 'KnowledgeIntegrationAgent', 'pending'
),
(
  '30000000-0000-0000-0000-000000000003',
  'insurance', 'high', 'Enroll in PMJJBY Life Insurance',
  '₹2 lakh life cover for ₹436/year from PNB – critical for 2 dependent children.',
  'Sunita is sole breadwinner for 2 children. PMJJBY provides ₹2L to family on death, costing just ₹1.19/day. This is non-negotiable.',
  '[{"step": "Visit PNB branch with Aadhaar"}, {"step": "Fill PMJJBY enrollment form"}, {"step": "Premium ₹436 auto-debited from account annually"}]',
  200000.00, '2026-05-15', 0.96, 0.94, 'KnowledgeIntegrationAgent', 'pending'
),
(
  '30000000-0000-0000-0000-000000000003',
  'income', 'medium', 'Apply for PM Mudra Shishu Loan',
  'Get up to ₹50,000 collateral-free loan to buy professional cleaning equipment and grow business.',
  'Sunita uses rented equipment reducing earnings. Own equipment via Mudra loan (no collateral) will increase job capacity and earnings.',
  '[{"step": "Collect last 6 months bank statements"}, {"step": "Write 1-page business plan (equipment purchase)"}, {"step": "Apply at PNB branch or mudra.org.in"}, {"step": "Loan disbursed in 7-10 working days"}]',
  50000.00, '2026-06-30', 0.72, 0.65, 'RecommendationAgent', 'pending'
);

-- ============================================================
-- EXECUTED ACTIONS (3 per user: active/pending/completed)
-- NOTE: id is SERIAL — inserted in a specific order so we can
-- reference them by subquery in action_outcomes below.
-- ============================================================
INSERT INTO executed_actions (
  user_id, action_type, action_description, status,
  amount, target_account, user_approved, approval_date,
  execution_date, schedule, next_execution, recurrence_count,
  is_reversible, audit_trail
) VALUES
-- Rajesh – Active
(
  '10000000-0000-0000-0000-000000000001',
  'savings', 'Auto-save ₹500/day to emergency fund on shifts earning >₹1500',
  'active', 500.00, 'SBI Emergency Fund FD',
  true, '2026-04-10 10:00:00+05:30',
  NULL, 'daily', '2026-05-02', 18,
  true, '[{"event": "created", "ts": "2026-04-10T10:00:00+05:30"}, {"event": "approved", "ts": "2026-04-10T10:05:00+05:30"}]'
),
-- Rajesh – Pending
(
  '10000000-0000-0000-0000-000000000001',
  'insurance', 'Enroll in PMJJBY – ₹436 annual premium auto-debit from SBI',
  'pending', 436.00, 'SBI PMJJBY Insurance',
  false, NULL,
  NULL, 'once', '2026-05-15', 0,
  false, '[{"event": "created", "ts": "2026-04-30T18:00:00+05:30"}]'
),
-- Rajesh – Completed
(
  '10000000-0000-0000-0000-000000000001',
  'budget', 'Limit CNG fuel spend to ₹2000/month – track via PhonePe',
  'completed', 2000.00, NULL,
  true, '2026-04-01 09:00:00+05:30',
  '2026-04-30 23:59:00+05:30', 'monthly', NULL, 1,
  true, '[{"event": "created", "ts": "2026-04-01T09:00:00+05:30"}, {"event": "completed", "ts": "2026-04-30T23:59:00+05:30", "note": "Spent ₹1430 – under budget"}]'
),
-- Priya – Active
(
  '20000000-0000-0000-0000-000000000002',
  'debt', 'Pay ₹2200 scooter EMI every month via HDFC auto-debit',
  'active', 2200.00, 'HDFC Vehicle Loan Account',
  true, '2026-03-20 10:00:00+05:30',
  NULL, 'monthly', '2026-05-05', 3,
  false, '[{"event": "created", "ts": "2026-03-20T10:00:00+05:30"}, {"event": "executed", "ts": "2026-04-05T09:00:00+05:30"}]'
),
-- Priya – Pending
(
  '20000000-0000-0000-0000-000000000002',
  'savings', 'Transfer ₹1000 to HDFC RD at month end',
  'pending', 1000.00, 'HDFC Recurring Deposit',
  false, NULL,
  NULL, 'monthly', '2026-05-31', 0,
  true, '[{"event": "created", "ts": "2026-04-28T20:00:00+05:30"}]'
),
-- Priya – Completed
(
  '20000000-0000-0000-0000-000000000002',
  'insurance', 'Enroll in PMSBY accident insurance – ₹20 premium from HDFC',
  'completed', 20.00, 'HDFC PMSBY Insurance',
  true, '2026-04-15 11:00:00+05:30',
  '2026-04-15 11:30:00+05:30', 'once', NULL, 1,
  false, '[{"event": "created", "ts": "2026-04-14T19:00:00+05:30"}, {"event": "approved", "ts": "2026-04-15T11:00:00+05:30"}, {"event": "executed", "ts": "2026-04-15T11:30:00+05:30", "note": "PMSBY enrolled successfully"}]'
),
-- Sunita – Active
(
  '30000000-0000-0000-0000-000000000003',
  'savings', 'Save ₹300 on every UrbanCompany payout day',
  'active', 300.00, 'PNB Piggy Savings',
  true, '2026-04-05 14:00:00+05:30',
  NULL, 'weekly', '2026-05-02', 4,
  true, '[{"event": "created", "ts": "2026-04-05T14:00:00+05:30"}, {"event": "approved", "ts": "2026-04-05T14:10:00+05:30"}]'
),
-- Sunita – Pending
(
  '30000000-0000-0000-0000-000000000003',
  'social_security', 'Complete e-Shram registration at nearest Common Service Centre',
  'pending', 0.00, NULL,
  false, NULL,
  NULL, 'once', '2026-05-10', 0,
  true, '[{"event": "created", "ts": "2026-04-30T18:00:00+05:30"}]'
),
-- Sunita – Completed
(
  '30000000-0000-0000-0000-000000000003',
  'budget', 'Reduce mobile data usage – switch to Vi ₹299 plan from ₹499',
  'completed', 200.00, NULL,
  true, '2026-04-07 10:00:00+05:30',
  '2026-04-07 10:30:00+05:30', 'once', NULL, 1,
  true, '[{"event": "created", "ts": "2026-04-06T18:00:00+05:30"}, {"event": "approved", "ts": "2026-04-07T10:00:00+05:30"}, {"event": "executed", "ts": "2026-04-07T10:30:00+05:30", "note": "Saved ₹200/month on recharge"}]'
);

-- ============================================================
-- ACTION OUTCOMES (for completed actions only)
-- References executed_actions.id via subquery (SERIAL)
-- ============================================================
INSERT INTO action_outcomes (
  action_id, verification_date, days_after_execution,
  intended_target, actual_achievement, achievement_percentage,
  success, deviation, deviation_reason,
  influencing_factors, learnings, optimization_suggestions
)
SELECT id, '2026-04-30', 0,
  2000.00, 1430.00, 71.50,
  true, -570.00, 'Saved more than intended – drove fewer long trips in last week of April',
  '{"rain_days": 3, "low_demand_days": 2}',
  'Tracking daily fuel via PhonePe works well for Rajesh. Visual cap helped control spending.',
  '[{"suggestion": "Set ₹1500 monthly cap in May for even higher savings"}]'
FROM executed_actions
WHERE user_id = '10000000-0000-0000-0000-000000000001' AND status = 'completed'
LIMIT 1;

INSERT INTO action_outcomes (
  action_id, verification_date, days_after_execution,
  intended_target, actual_achievement, achievement_percentage,
  success, deviation, deviation_reason,
  influencing_factors, learnings, optimization_suggestions
)
SELECT id, '2026-04-15', 0,
  20.00, 20.00, 100.00,
  true, 0.00, NULL,
  '{"hdfc_netbanking": "smooth", "otp_received": true}',
  'PMSBY enrollment via HDFC app took only 5 minutes. User confirmed happy with outcome.',
  '[{"suggestion": "Remind user to check PMSBY coverage certificate in July"}]'
FROM executed_actions
WHERE user_id = '20000000-0000-0000-0000-000000000002' AND status = 'completed'
LIMIT 1;

INSERT INTO action_outcomes (
  action_id, verification_date, days_after_execution,
  intended_target, actual_achievement, achievement_percentage,
  success, deviation, deviation_reason,
  influencing_factors, learnings, optimization_suggestions
)
SELECT id, '2026-04-07', 0,
  200.00, 200.00, 100.00,
  true, 0.00, NULL,
  '{"vi_store_visit": true, "new_plan_activated": true}',
  'Sunita successfully switched to Vi ₹299 plan. ₹200/month saved going forward. Simple action, high impact.',
  '[{"suggestion": "Check if Jio ₹299 plan has better data before next recharge"}]'
FROM executed_actions
WHERE user_id = '30000000-0000-0000-0000-000000000003' AND status = 'completed'
LIMIT 1;

-- ============================================================
-- TAX RECORDS (FY 2024-25, filed / in-progress)
-- ============================================================
INSERT INTO tax_records (
  user_id, financial_year, gross_income, income_by_source,
  total_deductions, deduction_details, taxable_income,
  tax_liability, tax_paid, refund_amount,
  itr_form_type, filing_status, filing_date, acknowledgement_number
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '2024-25', 196000.00,
  '{"Ola": 117600, "Uber": 78400}',
  50000.00,
  '{"standard_deduction": 50000}',
  146000.00, 0.00, 0.00, 0.00,
  'ITR-4', 'filed', '2025-07-28',
  'AY202425MH8874321'
),
(
  '20000000-0000-0000-0000-000000000002',
  '2024-25', 128000.00,
  '{"Zomato": 70400, "Swiggy": 57600}',
  50000.00,
  '{"standard_deduction": 50000}',
  78000.00, 0.00, 0.00, 0.00,
  'ITR-4', 'filed', '2025-07-30',
  'AY202425KA3312087'
),
(
  '30000000-0000-0000-0000-000000000003',
  '2024-25', 91500.00,
  '{"UrbanCompany": 64050, "Direct clients": 27450}',
  50000.00,
  '{"standard_deduction": 50000}',
  41500.00, 0.00, 0.00, 0.00,
  'ITR-4', 'not_filed', NULL, NULL
);

-- ============================================================
-- USER SCHEME APPLICATIONS
-- References government_schemes via subquery on scheme_code
-- ============================================================
INSERT INTO user_scheme_applications (
  user_id, scheme_id, application_date, application_status,
  benefit_received, documents_submitted, approval_date, application_notes
) VALUES
-- Rajesh applied for APY (Atal Pension Yojana)
(
  '10000000-0000-0000-0000-000000000001',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'APY'),
  '2024-08-12', 'approved',
  NULL,
  '["Aadhaar Card", "SBI Account Details", "Mobile Number"]',
  '2024-08-15',
  'Enrolled in APY with ₹1000/month pension target. SBI auto-debit ₹210/month set up.'
),
-- Rajesh applied for PMJJBY
(
  '10000000-0000-0000-0000-000000000001',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'PMJJBY'),
  '2023-06-01', 'approved',
  NULL,
  '["Aadhaar Card", "SBI Passbook"]',
  '2023-06-01',
  'Auto-enrolled via SBI branch. Annual premium ₹436 auto-debited June 1 every year.'
),
-- Priya applied for PMSBY
(
  '20000000-0000-0000-0000-000000000002',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'PMSBY'),
  '2026-04-15', 'approved',
  NULL,
  '["Aadhaar Card", "HDFC Account Details"]',
  '2026-04-15',
  'Enrolled via HDFC net banking. Annual premium ₹20 auto-debited.'
),
-- Priya applied for APY
(
  '20000000-0000-0000-0000-000000000002',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'APY'),
  '2025-02-10', 'approved',
  NULL,
  '["Aadhaar Card", "HDFC Account Details", "Mobile"]',
  '2025-02-12',
  'Enrolled with ₹3000/month pension target. HDFC auto-debit ₹577/month.'
),
-- Sunita applied for e-Shram (pending)
(
  '30000000-0000-0000-0000-000000000003',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'ESHRAM'),
  '2026-04-30', 'submitted',
  NULL,
  '["Aadhaar Card"]',
  NULL,
  'Application initiated at Common Service Centre, Dwarka. Pending verification.'
),
-- Sunita applied for PMJAY
(
  '30000000-0000-0000-0000-000000000003',
  (SELECT scheme_id FROM government_schemes WHERE scheme_code = 'PMJAY'),
  '2024-11-05', 'approved',
  500000.00,
  '["Aadhaar Card", "Ration Card"]',
  '2024-11-20',
  'Enrolled under Ayushman Bharat. Used for ₹12000 hospitalisation in Jan 2025 – cashless.'
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (
  user_id, notification_type, channel, title, message,
  priority, status, scheduled_at, sent_at, delivered_at, read_at, action_taken
) VALUES
-- Rajesh
('10000000-0000-0000-0000-000000000001','income_alert','in_app','Good earning day!','You earned ₹2,400 today – 44% above your daily average of ₹1,667. Great work!','low','read','2026-04-07 22:30:00+05:30','2026-04-07 22:30:00+05:30','2026-04-07 22:31:00+05:30','2026-04-07 23:00:00+05:30',false),
('10000000-0000-0000-0000-000000000001','savings_reminder','in_app','Emergency Fund Check','Your emergency fund covers 1.1 months. Target is 3 months before June monsoon. Save ₹9,500 more this month.','high','read','2026-04-28 09:00:00+05:30','2026-04-28 09:00:00+05:30','2026-04-28 09:01:00+05:30','2026-04-28 10:30:00+05:30',true),
('10000000-0000-0000-0000-000000000001','tax_reminder','in_app','ITR Filing Reminder','FY 2025-26 ITR-4 filing opens July 1. Start collecting your Ola/Uber annual income statements now.','medium','delivered','2026-04-30 10:00:00+05:30','2026-04-30 10:00:00+05:30','2026-04-30 10:01:00+05:30',NULL,false),
('10000000-0000-0000-0000-000000000001','budget_alert','in_app','Fuel Budget On Track','April fuel spend ₹1,430 vs ₹2,000 budget. You are ₹570 under budget – great discipline!','low','read','2026-04-30 20:00:00+05:30','2026-04-30 20:00:00+05:30','2026-04-30 20:01:00+05:30','2026-04-30 21:00:00+05:30',false),
-- Priya
('20000000-0000-0000-0000-000000000002','insurance_confirm','in_app','PMSBY Insurance Active','Congratulations! Your PMSBY accidental insurance of ₹2 lakh is now active. Premium ₹20 paid from HDFC.','high','read','2026-04-15 12:00:00+05:30','2026-04-15 12:00:00+05:30','2026-04-15 12:01:00+05:30','2026-04-15 13:00:00+05:30',false),
('20000000-0000-0000-0000-000000000002','low_income_alert','in_app','Low Earnings Week Ahead','Weather forecast shows heavy rain in Bengaluru Apr 16-18. Delivery orders may drop 30-40%. Plan expenses accordingly.','high','read','2026-04-15 18:00:00+05:30','2026-04-15 18:00:00+05:30','2026-04-15 18:01:00+05:30','2026-04-15 19:00:00+05:30',true),
('20000000-0000-0000-0000-000000000002','recommendation','in_app','Prepay Scooter Loan','Use April surplus ₹1,200 toward loan prepayment. This saves ₹3,200 interest over loan life.','medium','delivered','2026-04-30 09:00:00+05:30','2026-04-30 09:00:00+05:30','2026-04-30 09:01:00+05:30',NULL,false),
-- Sunita
('30000000-0000-0000-0000-000000000003','risk_alert','in_app','High Risk: No Insurance Coverage','You have no life or accident insurance. With 2 dependents, this is urgent. PMJJBY costs only ₹436/year.','high','read','2026-04-30 10:00:00+05:30','2026-04-30 10:00:00+05:30','2026-04-30 10:01:00+05:30','2026-04-30 11:30:00+05:30',false),
('30000000-0000-0000-0000-000000000003','scheme_reminder','in_app','Complete e-Shram Registration','Your e-Shram registration is in progress. Complete it at CSC to get your worker ID and automatic PMSBY cover.','high','delivered','2026-05-01 09:00:00+05:30','2026-05-01 09:00:00+05:30','2026-05-01 09:01:00+05:30',NULL,false),
('30000000-0000-0000-0000-000000000003','savings_milestone','in_app','Savings Goal Progress','You have saved ₹1,200 this month. You are 12% toward your 3-month emergency fund goal of ₹10,000. Keep going!','medium','read','2026-04-29 20:00:00+05:30','2026-04-29 20:00:00+05:30','2026-04-29 20:01:00+05:30','2026-04-29 21:00:00+05:30',false);

-- ============================================================
-- AGENT LOGS (system logs from AI agents)
-- ============================================================
INSERT INTO agent_logs (
  user_id, agent_name, execution_timestamp,
  input_data, output_data, confidence_score,
  execution_time_ms, success, model_version
) VALUES
('10000000-0000-0000-0000-000000000001','PatternRecognitionAgent','2026-04-28 02:00:00+05:30',
 '{"days_analyzed": 90, "user_id": "10000000-0000-0000-0000-000000000001"}',
 '{"pattern": "stable_gig", "weekend_premium": 1.32, "avg_daily": 545, "peak_hours": ["07-09", "17-20"]}',
 0.82, 1230, true, 'claude-sonnet-4-5'),
('10000000-0000-0000-0000-000000000001','RiskAssessmentAgent','2026-04-30 03:00:00+05:30',
 '{"user_id": "10000000-0000-0000-0000-000000000001", "include_loans": true}',
 '{"risk_level": "medium", "risk_score": 4.5, "top_risk": "monsoon_income_drop"}',
 0.85, 1875, true, 'claude-sonnet-4-5'),
('10000000-0000-0000-0000-000000000001','TaxComplianceAgent','2026-04-30 03:30:00+05:30',
 '{"user_id": "10000000-0000-0000-0000-000000000001", "fy": "2025-26"}',
 '{"itr_form": "ITR-4", "section": "44ADA", "estimated_tax": 0, "action": "file_by_july_31"}',
 0.90, 980, true, 'claude-sonnet-4-5'),
('20000000-0000-0000-0000-000000000002','PatternRecognitionAgent','2026-04-28 02:05:00+05:30',
 '{"days_analyzed": 90, "user_id": "20000000-0000-0000-0000-000000000002"}',
 '{"pattern": "weekend_peak", "rain_sensitivity": -0.40, "avg_daily": 362, "peak_slots": ["12-14", "19-22"]}',
 0.76, 1105, true, 'claude-sonnet-4-5'),
('20000000-0000-0000-0000-000000000002','VolatilityForecasterAgent','2026-04-28 02:10:00+05:30',
 '{"user_id": "20000000-0000-0000-0000-000000000002", "forecast_days": 30}',
 '{"weighted_forecast": 10600, "volatility_index": 0.40, "risk": "rain_disruption_may"}',
 0.72, 2100, true, 'claude-sonnet-4-5'),
('20000000-0000-0000-0000-000000000002','KnowledgeIntegrationAgent','2026-04-14 18:00:00+05:30',
 '{"user_id": "20000000-0000-0000-0000-000000000002", "query": "accident_insurance_options"}',
 '{"scheme": "PMSBY", "premium": 20, "cover": 200000, "enroll_via": "HDFC netbanking", "priority": "urgent"}',
 0.97, 650, true, 'claude-sonnet-4-5'),
('30000000-0000-0000-0000-000000000003','RiskAssessmentAgent','2026-04-30 03:15:00+05:30',
 '{"user_id": "30000000-0000-0000-0000-000000000003", "include_family": true}',
 '{"risk_level": "high", "risk_score": 7.8, "escalation_needed": true, "top_risk": "no_insurance_2_dependents"}',
 0.88, 2240, true, 'claude-sonnet-4-5'),
('30000000-0000-0000-0000-000000000003','KnowledgeIntegrationAgent','2026-04-30 03:20:00+05:30',
 '{"user_id": "30000000-0000-0000-0000-000000000003", "query": "unorganised_worker_schemes"}',
 '{"schemes": ["ESHRAM", "PMJJBY", "PMSBY", "PMMY"], "priority_order": ["ESHRAM", "PMJJBY"], "estimated_annual_premium": 456}',
 0.96, 720, true, 'claude-sonnet-4-5'),
('30000000-0000-0000-0000-000000000003','BudgetAnalysisAgent','2026-04-30 03:25:00+05:30',
 '{"user_id": "30000000-0000-0000-0000-000000000003", "month": "2026-04"}',
 '{"income": 6300, "expenses": 1079, "savings": 1200, "savings_rate": 0.19, "top_expense": "groceries"}',
 0.80, 890, true, 'claude-sonnet-4-5'),
('10000000-0000-0000-0000-000000000001','RecommendationAgent','2026-04-30 04:00:00+05:30',
 '{"user_id": "10000000-0000-0000-0000-000000000001", "context": "post_risk_assessment"}',
 '{"recommendations_generated": 3, "top_priority": "emergency_fund_before_monsoon"}',
 0.85, 1560, true, 'claude-sonnet-4-5'),
('20000000-0000-0000-0000-000000000002','ActionExecutionAgent','2026-04-15 11:25:00+05:30',
 '{"user_id": "20000000-0000-0000-0000-000000000002", "action": "enroll_pmsby"}',
 '{"status": "success", "scheme": "PMSBY", "amount_debited": 20, "confirmation": "HDFC_PMSBY_20260415"}',
 0.99, 3200, true, 'claude-sonnet-4-5'),
('30000000-0000-0000-0000-000000000003','ContextIntelligenceAgent','2026-04-30 03:10:00+05:30',
 '{"user_id": "30000000-0000-0000-0000-000000000003", "event": "monthly_review"}',
 '{"context": "sole_breadwinner_2_kids_no_insurance", "urgency": "critical", "next_action": "eshram_registration"}',
 0.91, 1100, true, 'claude-sonnet-4-5');

-- ============================================================
-- AUTH HELPER FUNCTIONS (called via supabase.rpc from frontend)
-- No backend needed — bcrypt runs inside Postgres via pgcrypto
-- ============================================================

-- Login: verify phone + password, return safe user fields
CREATE OR REPLACE FUNCTION verify_user_login(p_phone VARCHAR, p_password VARCHAR)
RETURNS TABLE(
  user_id        UUID,
  full_name      VARCHAR,
  email          VARCHAR,
  phone_number   VARCHAR,
  occupation     VARCHAR,
  city           VARCHAR,
  state          VARCHAR,
  created_at     TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT u.user_id, u.full_name, u.email, u.phone_number,
         u.occupation, u.city, u.state, u.created_at
  FROM   users u
  WHERE  u.phone_number = p_phone
    AND  u.password = crypt(p_password, u.password);
END;
$$;

-- Signup: hash password with bcrypt, insert user, return safe fields
CREATE OR REPLACE FUNCTION create_user_account(
  p_phone      VARCHAR,
  p_full_name  VARCHAR,
  p_password   VARCHAR,
  p_email      VARCHAR  DEFAULT NULL,
  p_occupation VARCHAR  DEFAULT NULL,
  p_city       VARCHAR  DEFAULT NULL,
  p_state      VARCHAR  DEFAULT NULL,
  p_dob        DATE     DEFAULT NULL,
  p_lang       VARCHAR  DEFAULT 'en'
)
RETURNS TABLE(
  user_id        UUID,
  full_name      VARCHAR,
  email          VARCHAR,
  phone_number   VARCHAR,
  occupation     VARCHAR,
  city           VARCHAR,
  state          VARCHAR,
  created_at     TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (
    phone_number, full_name, password, email,
    occupation, city, state, date_of_birth, preferred_language
  ) VALUES (
    p_phone, p_full_name, crypt(p_password, gen_salt('bf', 10)),
    p_email, p_occupation, p_city, p_state, p_dob, p_lang
  )
  RETURNING users.user_id INTO v_user_id;

  RETURN QUERY
  SELECT u.user_id, u.full_name, u.email, u.phone_number,
         u.occupation, u.city, u.state, u.created_at
  FROM   users u
  WHERE  u.user_id = v_user_id;
END;
$$;
