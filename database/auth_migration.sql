-- ============================================================
-- Agente AI — Auth Migration (Phone OTP)
-- Run this ONCE in Supabase SQL Editor after schema.sql
-- Uses Supabase phone OTP — no password needed
-- ============================================================

-- 1. Clean up any previous auth entries for demo users
DELETE FROM auth.identities WHERE provider_id LIKE '%@agente.local' OR provider = 'phone';
DELETE FROM auth.users WHERE email LIKE '%@agente.local' OR phone IN ('+919951778715','+917207364460','+919790958879');

-- 2. Drop old RPC auth functions
DROP FUNCTION IF EXISTS verify_user_login(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_user_account(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR);

-- ============================================================
-- 3. Pre-create email+password accounts for demo users
--    Login: phone@agente.local / Demo@1234!
--    Same UUIDs as seed data so all FK relationships work
-- ============================================================
-- pgcrypto must be enabled: CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO auth.users (
  id, email, email_confirmed_at,
  encrypted_password,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '9951778715@agente.local',
  NOW(),
  crypt('Demo@1234!', gen_salt('bf', 10)),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Rajesh Kumar","phone_number":"9951778715","occupation":"Cab Driver","city":"Mumbai"}',
  NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000002',
  '7207364460@agente.local',
  NOW(),
  crypt('Demo@1234!', gen_salt('bf', 10)),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Priya Sharma","phone_number":"7207364460","occupation":"Food Delivery","city":"Bengaluru"}',
  NOW(), NOW()
),
(
  '30000000-0000-0000-0000-000000000003',
  '9790958879@agente.local',
  NOW(),
  crypt('Demo@1234!', gen_salt('bf', 10)),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sunita Devi","phone_number":"9790958879","occupation":"Home Services","city":"Delhi"}',
  NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email              = EXCLUDED.email,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at         = NOW();

-- 4. Create email identity records
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
(
  '9951778715@agente.local',
  '10000000-0000-0000-0000-000000000001',
  '{"sub":"10000000-0000-0000-0000-000000000001","email":"9951778715@agente.local"}',
  'email', NOW(), NOW()
),
(
  '7207364460@agente.local',
  '20000000-0000-0000-0000-000000000002',
  '{"sub":"20000000-0000-0000-0000-000000000002","email":"7207364460@agente.local"}',
  'email', NOW(), NOW()
),
(
  '9790958879@agente.local',
  '30000000-0000-0000-0000-000000000003',
  '{"sub":"30000000-0000-0000-0000-000000000003","email":"9790958879@agente.local"}',
  'email', NOW(), NOW()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ============================================================
-- 5. Trigger: auto-create public.users row on new phone signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone TEXT;
BEGIN
  -- Extract 10-digit phone from +91XXXXXXXXXX
  v_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone_number',
    regexp_replace(COALESCE(NEW.phone, ''), '^\+91', ''),
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  INSERT INTO public.users (
    user_id, phone_number, email, full_name, password,
    occupation, city, state, preferred_language,
    user_type, is_active, onboarding_completed
  ) VALUES (
    NEW.id,
    v_phone,
    COALESCE(NEW.email, v_phone || '@agente.local'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'SUPABASE_AUTH',
    NEW.raw_user_meta_data->>'occupation',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    'gig_worker', true, false
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- 6. Secure RLS policies using auth.uid()
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
DROP POLICY IF EXISTS "users_own"                    ON users;
DROP POLICY IF EXISTS "user_profiles_own"            ON user_profiles;
DROP POLICY IF EXISTS "bank_accounts_own"            ON bank_accounts;
DROP POLICY IF EXISTS "transactions_own"             ON transactions;
DROP POLICY IF EXISTS "budgets_own"                  ON budgets;
DROP POLICY IF EXISTS "income_patterns_own"          ON income_patterns;
DROP POLICY IF EXISTS "income_forecasts_own"         ON income_forecasts;
DROP POLICY IF EXISTS "risk_assessments_own"         ON risk_assessments;
DROP POLICY IF EXISTS "recommendations_own"          ON recommendations;
DROP POLICY IF EXISTS "executed_actions_own"         ON executed_actions;
DROP POLICY IF EXISTS "action_outcomes_own"          ON action_outcomes;
DROP POLICY IF EXISTS "tax_records_own"              ON tax_records;
DROP POLICY IF EXISTS "user_scheme_applications_own" ON user_scheme_applications;
DROP POLICY IF EXISTS "user_scheme_apps_own"         ON user_scheme_applications;
DROP POLICY IF EXISTS "notifications_own"            ON notifications;
DROP POLICY IF EXISTS "agent_logs_own"               ON agent_logs;

CREATE POLICY "users_own"             ON users             FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_own"     ON user_profiles     FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bank_accounts_own"     ON bank_accounts     FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_own"      ON transactions      FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budgets_own"           ON budgets           FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "income_patterns_own"   ON income_patterns   FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "income_forecasts_own"  ON income_forecasts  FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_assessments_own"  ON risk_assessments  FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recommendations_own"   ON recommendations   FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "executed_actions_own"  ON executed_actions  FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tax_records_own"       ON tax_records       FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_own"     ON notifications     FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agent_logs_own"        ON agent_logs        FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_scheme_apps_own"  ON user_scheme_applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "action_outcomes_own"   ON action_outcomes   FOR ALL
  USING (EXISTS (SELECT 1 FROM executed_actions ea WHERE ea.id = action_outcomes.action_id AND ea.user_id = auth.uid()));
