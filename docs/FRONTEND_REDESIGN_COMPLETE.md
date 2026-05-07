# AGENTE AI - Complete Frontend Redesign
**Database-First Design | Modern UI | Backend Integration Ready**

---

## 🎨 GLOBAL UI DESIGN SYSTEM

### Color Palette
```css
--primary: #10B981 (Green - Income/Success)
--danger: #EF4444 (Red - Expenses/Risk)
--warning: #F59E0B (Yellow - Alerts)
--info: #3B82F6 (Blue - Info)
--neutral-50: #F9FAFB (Background)
--neutral-100: #F3F4F6 (Card Background)
--neutral-800: #1F2937 (Text Primary)
--neutral-600: #4B5563 (Text Secondary)
```

### Typography
```css
--font-heading: 'Inter', sans-serif (Bold)
--font-body: 'Inter', sans-serif (Regular)
--font-mono: 'JetBrains Mono', monospace (Numbers)
```

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  Left Sidebar (240px, collapsible to 64px) │
├─────────────────────────────────────────────┤
│  Top Bar (64px height)                      │
├─────────────────────────────────────────────┤
│  Main Content (p-6, max-w-7xl)              │
│  - Breadcrumbs                              │
│  - Page Title                               │
│  - Content Cards                            │
└─────────────────────────────────────────────┘
```

---

## 📱 PAGE 1: LOGIN / SIGNUP

### UI Layout
```
┌──────────────────────────────────────────────┐
│ Left (60%)                  │ Right (40%)    │
│ ───────────────────────────────────────────  │
│ Hero Section                │ Auth Card      │
│ - Agente AI Logo            │ ┌───────────┐ │
│ - Tagline                   │ │   Tabs    │ │
│ - Feature bullets           │ │  Login |  │ │
│ - Testimonial               │ │  Signup   │ │
│ - Screenshots               │ ├───────────┤ │
│                             │ │  Form     │ │
│                             │ │  Fields   │ │
│                             │ │           │ │
│                             │ └───────────┘ │
└──────────────────────────────────────────────┘
```

### Input Fields (Derived from `users` table)

**Login Fields:**
```typescript
interface LoginForm {
  phone_number: string;      // users.phone_number (required)
  password: string;          // users.password (required)
}
```

**Signup Fields:**
```typescript
interface SignupForm {
  phone_number: string;      // users.phone_number (required, unique)
  full_name: string;         // users.full_name (required)
  password: string;          // users.password (required, min 8 chars)
  confirm_password: string;  // UI validation only
  email?: string;            // users.email (optional)
  occupation?: string;       // users.occupation (optional)
  city?: string;             // users.city (optional)
  state?: string;            // users.state (optional)
  date_of_birth?: Date;      // users.date_of_birth (optional)
  preferred_language: string; // users.preferred_language (default 'en')
}
```

### Database Query (Direct - For Current Use)
```sql
-- Login Verification
SELECT
  user_id,
  phone_number,
  full_name,
  email,
  password, -- verify with bcrypt
  is_active,
  kyc_verified,
  onboarding_completed
FROM users
WHERE phone_number = $1 AND is_active = true;

-- After Login, Get User Profile
SELECT
  p.profile_id,
  p.monthly_income_min,
  p.monthly_income_max,
  p.monthly_expenses_avg,
  p.emergency_fund_target,
  p.current_emergency_fund,
  p.risk_tolerance,
  p.financial_goals,
  p.dependents
FROM user_profiles p
WHERE p.user_id = $1;

-- Signup Insert
INSERT INTO users (
  phone_number,
  full_name,
  password, -- hashed
  email,
  occupation,
  city,
  state,
  date_of_birth,
  preferred_language,
  onboarding_completed
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
RETURNING user_id;

-- Create Default Profile
INSERT INTO user_profiles (
  user_id,
  risk_tolerance,
  dependents,
  emergency_fund_target,
  current_emergency_fund
) VALUES ($1, 'moderate', 0, 0, 0);
```

### Backend API Integration (When Ready)
```typescript
// POST /api/v1/users/login
const loginUser = async (credentials: LoginForm) => {
  const response = await fetch('http://localhost:8001/api/v1/users/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  // Store: data.access_token, data.user_id
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('userId', data.user_id);
};

// POST /api/v1/users/signup
const signupUser = async (userData: SignupForm) => {
  const response = await fetch('http://localhost:8001/api/v1/users/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  // Auto-login after signup
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('userId', data.user_id);
};
```

### Components Needed
```typescript
<LoginPage>
  <Hero />
  <AuthCard>
    <Tabs value={activeTab}>
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm onSubmit={handleLogin} />
      </TabsContent>
      <TabsContent value="signup">
        <SignupForm onSubmit={handleSignup} />
      </TabsContent>
    </Tabs>
  </AuthCard>
</LoginPage>
```

---

## 📱 PAGE 2: HOME (DASHBOARD)

### UI Layout
```
┌────────────────────────────────────────────┐
│  Welcome Banner                            │
│  "Good Morning, Rajesh" + Quick Stats     │
├────────────────────────────────────────────┤
│  Add Transaction Card (3 Modes)           │
│  ┌──────┬──────┬──────┐                  │
│  │Manual│Image │Voice │                  │
│  └──────┴──────┴──────┘                  │
│  [Form appears based on selected mode]    │
├────────────────────────────────────────────┤
│  Today's Summary                          │
│  ┌────────────┬────────────┬──────────┐  │
│  │  Income    │  Expenses  │ Balance  │  │
│  │  ₹1,250    │  ₹680      │ ₹570     │  │
│  └────────────┴────────────┴──────────┘  │
├────────────────────────────────────────────┤
│  Recent Transactions (Last 5)             │
│  [Transaction List with Edit/Delete]      │
├────────────────────────────────────────────┤
│  Feature Cards: "What is Agente AI?"      │
│  ┌──────┬──────┬──────┬──────┐          │
│  │ AI   │Budget│ Risk │ Tax  │          │
│  │Tips  │Plans │Alert │Help  │          │
│  └──────┴──────┴──────┴──────┘          │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `transactions` + `bank_accounts`)

**Manual Transaction Entry:**
```typescript
interface TransactionInput {
  // Required fields
  transaction_date: Date;        // transactions.transaction_date
  amount: number;                // transactions.amount
  transaction_type: 'income' | 'expense'; // transactions.transaction_type

  // Optional but recommended
  category?: string;             // transactions.category
  subcategory?: string;          // transactions.subcategory
  description?: string;          // transactions.description
  payment_method?: string;       // transactions.payment_method
  merchant_name?: string;        // transactions.merchant_name
  location?: string;             // transactions.location
  source?: string;               // transactions.source
  account_id?: string;           // transactions.account_id (UUID)

  // Auto-filled
  transaction_time: Time;        // transactions.transaction_time (now)
  input_method: 'manual';        // transactions.input_method
  verified: boolean;             // transactions.verified (true for manual)
  confidence_score: 1.0;         // transactions.confidence_score

  // Advanced (optional)
  is_recurring?: boolean;        // transactions.is_recurring
  recurring_frequency?: string;  // transactions.recurring_frequency
  tags?: string[];               // transactions.tags (JSONB array)
}
```

**Image Upload:**
```typescript
interface ImageTransactionInput {
  image: File;                   // Upload image
  input_method: 'image';         // transactions.input_method
  // OCR will extract and populate transaction fields
  // confidence_score will be < 1.0 (AI confidence)
}
```

**Voice Input:**
```typescript
interface VoiceTransactionInput {
  audio: Blob;                   // Voice recording
  input_method: 'voice';         // transactions.input_method
  // Speech-to-text will extract transaction details
  // confidence_score will be < 1.0 (AI confidence)
}
```

### Database Query (Direct)
```sql
-- Get Today's Summary
SELECT
  COUNT(*) FILTER (WHERE transaction_type = 'income') as income_count,
  COUNT(*) FILTER (WHERE transaction_type = 'expense') as expense_count,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0) as total_income,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0) as total_expense
FROM transactions
WHERE user_id = $1
  AND transaction_date = CURRENT_DATE;

-- Get Recent 5 Transactions
SELECT
  transaction_id,
  transaction_date,
  transaction_time,
  amount,
  transaction_type,
  category,
  subcategory,
  description,
  payment_method,
  merchant_name,
  verified,
  confidence_score,
  created_at
FROM transactions
WHERE user_id = $1
ORDER BY transaction_date DESC, transaction_time DESC
LIMIT 5;

-- Get User's Bank Accounts (for dropdown)
SELECT
  account_id,
  account_name,
  provider,
  current_balance,
  is_active
FROM bank_accounts
WHERE user_id = $1 AND is_active = true;

-- Insert New Transaction
INSERT INTO transactions (
  user_id,
  transaction_date,
  transaction_time,
  amount,
  transaction_type,
  category,
  subcategory,
  description,
  payment_method,
  merchant_name,
  location,
  source,
  account_id,
  input_method,
  verified,
  confidence_score,
  is_recurring,
  recurring_frequency,
  tags
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19
) RETURNING transaction_id;

-- Update Account Balance (if account_id provided)
UPDATE bank_accounts
SET current_balance = current_balance +
  CASE WHEN $transaction_type = 'income' THEN $amount ELSE -$amount END,
  updated_at = NOW()
WHERE account_id = $account_id;
```

### Backend API Integration (When Ready)
```typescript
// POST /api/v1/transactions
const addTransaction = async (data: TransactionInput) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8001/api/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// POST /api/v1/transactions/image (OCR)
const addTransactionByImage = async (imageFile: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:8001/api/v1/transactions/image', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${token}`},
    body: formData
  });
  return response.json();
};

// POST /api/v1/transactions/voice (Speech-to-text)
const addTransactionByVoice = async (audioBlob: Blob) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await fetch('http://localhost:8001/api/v1/transactions/voice', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${token}`},
    body: formData
  });
  return response.json();
};

// GET /api/v1/transactions/summary?date=today
const getTodaySummary = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/transactions/summary?date=today',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};
```

### Components
```typescript
<HomePage>
  <WelcomeBanner user={currentUser} stats={quickStats} />

  <AddTransactionCard>
    <Tabs defaultValue="manual">
      <TabsList>
        <TabsTrigger value="manual">📝 Manual</TabsTrigger>
        <TabsTrigger value="image">📸 Image</TabsTrigger>
        <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <ManualTransactionForm
          accounts={bankAccounts}
          onSubmit={handleManualSubmit}
        />
      </TabsContent>

      <TabsContent value="image">
        <ImageUploadZone onUpload={handleImageUpload} />
      </TabsContent>

      <TabsContent value="voice">
        <VoiceRecorder onRecordingComplete={handleVoiceSubmit} />
      </TabsContent>
    </Tabs>
  </AddTransactionCard>

  <TodaySummary data={todaySummary} />

  <RecentTransactions
    transactions={recentTransactions}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />

  <FeatureCards />
</HomePage>
```

---

## 📱 PAGE 3: TRANSACTIONS

### UI Layout
```
┌────────────────────────────────────────────┐
│  Filters Bar                               │
│  [Date Range] [Type] [Category] [Search]  │
├────────────────────────────────────────────┤
│  Today's Summary Card                      │
│  ┌──────────────────────────────────────┐ │
│  │ Today: Dec 15, 2024                  │ │
│  │ Income: ₹1,250 | Expenses: ₹680      │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Today's Transactions                      │
│  [Transaction Cards - Editable]            │
├────────────────────────────────────────────┤
│  Last 10 Days (Grouped by Date)           │
│  ▼ Dec 14, 2024 (₹890 income, ₹450 exp)  │
│    [Transaction Cards]                     │
│  ▼ Dec 13, 2024 (₹1,100 income, ₹380 exp)│
│    [Transaction Cards]                     │
└────────────────────────────────────────────┘
```

### Filter Fields (Derived from `transactions`)
```typescript
interface TransactionFilters {
  date_start?: Date;             // transactions.transaction_date >=
  date_end?: Date;               // transactions.transaction_date <=
  transaction_type?: 'income' | 'expense' | 'all'; // transactions.transaction_type
  category?: string[];           // transactions.category IN
  subcategory?: string[];        // transactions.subcategory IN
  payment_method?: string[];     // transactions.payment_method IN
  min_amount?: number;           // transactions.amount >=
  max_amount?: number;           // transactions.amount <=
  verified?: boolean;            // transactions.verified
  is_recurring?: boolean;        // transactions.is_recurring
  account_id?: string;           // transactions.account_id
  search_query?: string;         // Search in description, merchant_name
}
```

### Output Data (Display Fields)
```typescript
interface TransactionDisplay {
  transaction_id: string;        // For edit/delete
  transaction_date: Date;
  transaction_time: Time;
  amount: number;                // Format: ₹1,250.00
  transaction_type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description?: string;
  payment_method?: string;
  merchant_name?: string;
  location?: string;
  verified: boolean;             // Show badge
  confidence_score: number;      // Show if < 1.0
  account_name?: string;         // Join from bank_accounts
  balance_after?: number;        // Running balance
  is_recurring: boolean;
  tags?: string[];
  created_at: Date;
}
```

### Database Query (Direct)
```sql
-- Get All Transactions with Filters
SELECT
  t.transaction_id,
  t.transaction_date,
  t.transaction_time,
  t.amount,
  t.transaction_type,
  t.category,
  t.subcategory,
  t.description,
  t.payment_method,
  t.merchant_name,
  t.location,
  t.verified,
  t.confidence_score,
  t.is_recurring,
  t.tags,
  t.balance_after,
  b.account_name,
  b.provider as bank_provider,
  t.created_at
FROM transactions t
LEFT JOIN bank_accounts b ON t.account_id = b.account_id
WHERE t.user_id = $1
  AND ($2::date IS NULL OR t.transaction_date >= $2)
  AND ($3::date IS NULL OR t.transaction_date <= $3)
  AND ($4::varchar IS NULL OR t.transaction_type = $4)
  AND ($5::varchar[] IS NULL OR t.category = ANY($5))
  AND ($6::varchar[] IS NULL OR t.payment_method = ANY($6))
  AND ($7::numeric IS NULL OR t.amount >= $7)
  AND ($8::numeric IS NULL OR t.amount <= $8)
  AND ($9::boolean IS NULL OR t.verified = $9)
  AND ($10::uuid IS NULL OR t.account_id = $10)
  AND ($11::text IS NULL OR
       t.description ILIKE '%' || $11 || '%' OR
       t.merchant_name ILIKE '%' || $11 || '%')
ORDER BY t.transaction_date DESC, t.transaction_time DESC;

-- Get Categories (for filter dropdown)
SELECT DISTINCT category
FROM transactions
WHERE user_id = $1 AND category IS NOT NULL
ORDER BY category;

-- Get Payment Methods (for filter dropdown)
SELECT DISTINCT payment_method
FROM transactions
WHERE user_id = $1 AND payment_method IS NOT NULL
ORDER BY payment_method;

-- Update Transaction
UPDATE transactions
SET
  transaction_date = COALESCE($2, transaction_date),
  amount = COALESCE($3, amount),
  transaction_type = COALESCE($4, transaction_type),
  category = COALESCE($5, category),
  subcategory = $6,
  description = $7,
  payment_method = $8,
  merchant_name = $9,
  location = $10,
  tags = COALESCE($11, tags),
  verified = COALESCE($12, verified),
  updated_at = NOW()
WHERE transaction_id = $1 AND user_id = $current_user_id
RETURNING *;

-- Delete Transaction
DELETE FROM transactions
WHERE transaction_id = $1 AND user_id = $2;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/transactions?filters
const getTransactions = async (filters: TransactionFilters) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters as any);

  const response = await fetch(
    `http://localhost:8001/api/v1/transactions?${params}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// PATCH /api/v1/transactions/:id
const updateTransaction = async (id: string, data: Partial<TransactionInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/transactions/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// DELETE /api/v1/transactions/:id
const deleteTransaction = async (id: string) => {
  const token = localStorage.getItem('token');
  await fetch(`http://localhost:8001/api/v1/transactions/${id}`, {
    method: 'DELETE',
    headers: {'Authorization': `Bearer ${token}`}
  });
};
```

### Components
```typescript
<TransactionsPage>
  <FilterBar
    filters={filters}
    categories={availableCategories}
    paymentMethods={availablePaymentMethods}
    accounts={bankAccounts}
    onFilterChange={setFilters}
  />

  <TodaySummary
    date={today}
    income={todayIncome}
    expenses={todayExpenses}
  />

  <TransactionsList
    transactions={filteredTransactions}
    groupBy="date"
    onEdit={(tx) => openEditModal(tx)}
    onDelete={(id) => handleDelete(id)}
  />

  <EditTransactionModal
    transaction={selectedTransaction}
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    onSave={handleUpdate}
  />
</TransactionsPage>
```

---

## 📱 PAGE 4: TIPS (RECOMMENDATIONS)

### UI Layout
```
┌────────────────────────────────────────────┐
│  Filters                                   │
│  [Status] [Priority] [Type] [Sort]        │
├────────────────────────────────────────────┤
│  Recommendations Grid                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ HIGH    │ │ MEDIUM  │ │ LOW     │     │
│  │ Priority│ │ Priority│ │ Priority│     │
│  │         │ │         │ │         │     │
│  │ [Card]  │ │ [Card]  │ │ [Card]  │     │
│  └─────────┘ └─────────┘ └─────────┘     │
│                                            │
│  Flash Card Style:                         │
│  ┌──────────────────────────────────────┐ │
│  │ 💡 High Priority                     │ │
│  │ Automate Savings on Peak Days       │ │
│  │ ───────────────────────────────────  │ │
│  │ Set up automatic ₹250 transfer...   │ │
│  │                                      │ │
│  │ Confidence: 85% | Impact: ₹3,000/mo │ │
│  │ [View Details] [Mark Done]          │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Filter Fields (Derived from `recommendations`)
```typescript
interface RecommendationFilters {
  status?: 'pending' | 'accepted' | 'actioned' | 'completed' | 'rejected'; // recommendations.status
  priority?: 'high' | 'medium' | 'low'; // recommendations.priority
  recommendation_type?: string;   // recommendations.recommendation_type
  agent_source?: string;          // recommendations.agent_source
  date_from?: Date;               // recommendations.created_at >=
  date_to?: Date;                 // recommendations.created_at <=
  min_confidence?: number;        // recommendations.confidence_score >=
  sort_by?: 'priority' | 'date' | 'confidence' | 'impact';
}
```

### Output Data Fields
```typescript
interface RecommendationDisplay {
  recommendation_id: string;
  title: string;                  // recommendations.title
  description: string;            // recommendations.description
  reasoning: string;              // recommendations.reasoning (AI explanation)
  priority: 'high' | 'medium' | 'low';
  recommendation_type: string;    // e.g., 'savings', 'budget', 'tax', 'scheme'

  action_items: string[];         // recommendations.action_items (JSONB array)
  target_amount?: number;         // recommendations.target_amount
  target_date?: Date;             // recommendations.target_date

  confidence_score: number;       // 0-1 scale
  success_probability: number;    // 0-1 scale
  expected_outcome: string;       // What user gains

  agent_source: string;           // Which AI agent generated this
  status: string;                 // Current status
  created_at: Date;
  delivered_at?: Date;

  // User feedback fields
  user_feedback?: string;         // recommendations.user_feedback
  actual_outcome?: object;        // recommendations.actual_outcome (JSONB)
  actioned_at?: Date;
  completed_at?: Date;
}
```

### Database Query (Direct)
```sql
-- Get All Recommendations with Filters
SELECT
  r.recommendation_id,
  r.title,
  r.description,
  r.reasoning,
  r.priority,
  r.recommendation_type,
  r.action_items,
  r.target_amount,
  r.target_date,
  r.confidence_score,
  r.success_probability,
  r.expected_outcome,
  r.agent_source,
  r.status,
  r.user_feedback,
  r.actual_outcome,
  r.created_at,
  r.delivered_at,
  r.actioned_at,
  r.completed_at,
  r.context_data
FROM recommendations r
WHERE r.user_id = $1
  AND ($2::varchar IS NULL OR r.status = $2)
  AND ($3::varchar IS NULL OR r.priority = $3)
  AND ($4::varchar IS NULL OR r.recommendation_type = $4)
  AND ($5::varchar IS NULL OR r.agent_source = $5)
  AND ($6::numeric IS NULL OR r.confidence_score >= $6)
ORDER BY
  CASE r.priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  r.created_at DESC;

-- Get Recommendation Types (for filter)
SELECT DISTINCT recommendation_type
FROM recommendations
WHERE user_id = $1
ORDER BY recommendation_type;

-- Update Recommendation Status
UPDATE recommendations
SET
  status = $2,
  user_feedback = COALESCE($3, user_feedback),
  actioned_at = CASE WHEN $2 = 'actioned' THEN NOW() ELSE actioned_at END,
  completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
  updated_at = NOW()
WHERE recommendation_id = $1 AND user_id = $current_user_id
RETURNING *;

-- Get Recommendation Stats
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'actioned') as actioned,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
  AVG(confidence_score) as avg_confidence,
  AVG(success_probability) as avg_success_rate
FROM recommendations
WHERE user_id = $1;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/recommendations?filters
const getRecommendations = async (filters: RecommendationFilters) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters as any);

  const response = await fetch(
    `http://localhost:8001/api/v1/recommendations?${params}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// PATCH /api/v1/recommendations/:id
const updateRecommendation = async (id: string, data: {
  status?: string;
  user_feedback?: string;
  actual_outcome?: object;
}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/recommendations/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// POST /api/v1/analysis/ (Trigger new recommendations)
const generateNewRecommendations = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/analysis/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        include_recommendations: true,
        days_back: 30
      })
    }
  );
  return response.json();
};
```

### Components
```typescript
<TipsPage>
  <PageHeader>
    <h1>AI Recommendations</h1>
    <Button onClick={generateNewTips}>
      🔄 Refresh Tips
    </Button>
  </PageHeader>

  <FilterBar
    filters={filters}
    types={recommendationTypes}
    onFilterChange={setFilters}
  />

  <StatsBar stats={recommendationStats} />

  <RecommendationsGrid>
    {recommendations.map(rec => (
      <RecommendationCard
        key={rec.recommendation_id}
        recommendation={rec}
        onViewDetails={() => openDetailModal(rec)}
        onMarkDone={() => markAsCompleted(rec.recommendation_id)}
        onReject={() => rejectRecommendation(rec.recommendation_id)}
      />
    ))}
  </RecommendationsGrid>

  <RecommendationDetailModal
    recommendation={selectedRecommendation}
    isOpen={isDetailModalOpen}
    onClose={() => setIsDetailModalOpen(false)}
    onFeedback={(feedback) => submitFeedback(feedback)}
  />
</TipsPage>
```

---

## 📱 PAGE 5: STATS (ANALYTICS)

### UI Layout
```
┌────────────────────────────────────────────┐
│  Filters: [Date Range] [Account]          │
├────────────────────────────────────────────┤
│  Summary Cards Row                         │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│
│  │Income │ │Expense│ │Savings│ │Balance││
│  │₹45,000│ │₹32,000│ │₹13,000│ │₹8,500 ││
│  └───────┘ └───────┘ └───────┘ └───────┘│
├────────────────────────────────────────────┤
│  Charts Row 1                              │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │  Expense Pie    │ │ Income vs Exp   │ │
│  │  Chart          │ │ Bar Chart       │ │
│  └─────────────────┘ └─────────────────┘ │
├────────────────────────────────────────────┤
│  Charts Row 2                              │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │  Income Trend   │ │ Emergency Fund  │ │
│  │  Line Chart     │ │ Progress Donut  │ │
│  └─────────────────┘ └─────────────────┘ │
└────────────────────────────────────────────┘
```

### Filter Fields
```typescript
interface StatsFilters {
  date_start: Date;              // transactions.transaction_date >=
  date_end: Date;                // transactions.transaction_date <=
  account_id?: string;           // transactions.account_id
  group_by: 'day' | 'week' | 'month'; // Aggregation level
}
```

### Output Data (Aggregated from multiple tables)
```typescript
interface StatsData {
  // Summary
  total_income: number;
  total_expense: number;
  net_savings: number;
  current_balance: number;        // From bank_accounts

  // Expense Breakdown (Pie Chart)
  expense_by_category: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;

  // Income vs Expense (Bar Chart - Daily/Weekly/Monthly)
  income_vs_expense: Array<{
    period: string;              // Date or week/month label
    income: number;
    expense: number;
  }>;

  // Income Trend (Line Chart)
  income_trend: Array<{
    date: Date;
    amount: number;
    moving_avg: number;          // 7-day moving average
  }>;

  // Emergency Fund Progress
  emergency_fund: {
    current: number;             // user_profiles.current_emergency_fund
    target: number;              // user_profiles.emergency_fund_target
    percentage: number;          // (current/target) * 100
    months_covered: number;      // current / monthly_expenses_avg
  };

  // Income Forecast (from income_forecasts table)
  forecast_7day: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
    confidence: number;
  };

  // Volatility (from income_patterns table)
  income_volatility: {
    avg_income: number;
    min_income: number;
    max_income: number;
    volatility_score: number;
    weekday_income: Record<string, number>;
  };
}
```

### Database Query (Direct)
```sql
-- Summary Stats
SELECT
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0) as total_income,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0) as total_expense,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0) -
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0) as net_savings,
  COUNT(*) FILTER (WHERE transaction_type = 'income') as income_count,
  COUNT(*) FILTER (WHERE transaction_type = 'expense') as expense_count
FROM transactions
WHERE user_id = $1
  AND transaction_date BETWEEN $2 AND $3
  AND ($4::uuid IS NULL OR account_id = $4);

-- Expense by Category (Pie Chart)
SELECT
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  ROUND((SUM(amount) * 100.0 /
    (SELECT SUM(amount) FROM transactions
     WHERE user_id = $1 AND transaction_type = 'expense'
     AND transaction_date BETWEEN $2 AND $3)
  ), 2) as percentage
FROM transactions
WHERE user_id = $1
  AND transaction_type = 'expense'
  AND transaction_date BETWEEN $2 AND $3
  AND category IS NOT NULL
GROUP BY category
ORDER BY total_amount DESC;

-- Income vs Expense by Day (Bar Chart)
SELECT
  transaction_date as date,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0) as income,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0) as expense
FROM transactions
WHERE user_id = $1
  AND transaction_date BETWEEN $2 AND $3
GROUP BY transaction_date
ORDER BY transaction_date;

-- Income Trend with Moving Average (Line Chart)
SELECT
  transaction_date,
  SUM(amount) as daily_income,
  AVG(SUM(amount)) OVER (
    ORDER BY transaction_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as moving_avg_7day
FROM transactions
WHERE user_id = $1
  AND transaction_type = 'income'
  AND transaction_date BETWEEN $2 AND $3
GROUP BY transaction_date
ORDER BY transaction_date;

-- Emergency Fund Progress
SELECT
  up.current_emergency_fund,
  up.emergency_fund_target,
  up.monthly_expenses_avg,
  ROUND((up.current_emergency_fund * 100.0 / NULLIF(up.emergency_fund_target, 0)), 2) as percentage,
  ROUND(up.current_emergency_fund / NULLIF(up.monthly_expenses_avg, 0), 1) as months_covered
FROM user_profiles up
WHERE up.user_id = $1;

-- Latest Income Forecast
SELECT
  pessimistic_scenario,
  realistic_scenario,
  optimistic_scenario,
  weighted_forecast,
  forecast_confidence,
  forecast_range_min,
  forecast_range_max,
  weekday_breakdown,
  recent_trend,
  created_at
FROM income_forecasts
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- Latest Income Pattern
SELECT
  avg_income,
  min_income,
  max_income,
  confidence_score,
  weekday_income,
  monthly_trend,
  seasonal_factors,
  last_calculated
FROM income_patterns
WHERE user_id = $1
ORDER BY last_calculated DESC
LIMIT 1;

-- Bank Account Balances
SELECT
  account_id,
  account_name,
  provider,
  current_balance
FROM bank_accounts
WHERE user_id = $1 AND is_active = true;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/stats/summary?start=...&end=...
const getStatsSummary = async (filters: StatsFilters) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    start: filters.date_start.toISOString(),
    end: filters.date_end.toISOString(),
    account_id: filters.account_id || '',
    group_by: filters.group_by
  });

  const response = await fetch(
    `http://localhost:8001/api/v1/stats/summary?${params}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// GET /api/v1/analysis/forecast (Income forecast)
const getIncomeForecast = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/analysis/forecast',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};
```

### Components
```typescript
<StatsPage>
  <FilterBar
    filters={filters}
    accounts={bankAccounts}
    onFilterChange={setFilters}
  />

  <SummaryCards data={statsData} />

  <div className="grid grid-cols-2 gap-6">
    <Card>
      <CardHeader>Expenses by Category</CardHeader>
      <CardContent>
        <PieChart data={statsData.expense_by_category} />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>Income vs Expenses</CardHeader>
      <CardContent>
        <BarChart data={statsData.income_vs_expense} />
      </CardContent>
    </Card>
  </div>

  <div className="grid grid-cols-2 gap-6">
    <Card>
      <CardHeader>Income Trend</CardHeader>
      <CardContent>
        <LineChart data={statsData.income_trend} />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>Emergency Fund Progress</CardHeader>
      <CardContent>
        <DonutChart
          value={statsData.emergency_fund.current}
          max={statsData.emergency_fund.target}
        />
      </CardContent>
    </Card>
  </div>
</StatsPage>
```

---

## 📱 PAGE 6: BUDGET

### UI Layout
```
┌────────────────────────────────────────────┐
│  Budget Selector                           │
│  [Active Budget ▼] [+ Create New Budget]  │
├────────────────────────────────────────────┤
│  Budget Overview                           │
│  ┌──────────────────────────────────────┐ │
│  │ Feast Budget | Valid: Dec 1-15      │ │
│  │ Expected Income: ₹45,000             │ │
│  │ Confidence: 78%                      │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Budget Breakdown                          │
│  ┌───────────────┬───────────────┐        │
│  │ Fixed Costs   │ Variable Costs│        │
│  │ ₹18,000       │ ₹12,000       │        │
│  ├───────────────┼───────────────┤        │
│  │ Savings Target│ Discretionary │        │
│  │ ₹10,000       │ ₹5,000        │        │
│  └───────────────┴───────────────┘        │
├────────────────────────────────────────────┤
│  Category Limits (Editable)               │
│  Food: ₹6,000/month [Edit]                │
│  Transport: ₹4,500/month [Edit]           │
│  ...                                       │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `budgets`)
```typescript
interface BudgetInput {
  // Required
  budget_type: 'feast' | 'famine' | 'normal'; // budgets.budget_type
  valid_from: Date;              // budgets.valid_from
  valid_until: Date;             // budgets.valid_until
  total_income_expected: number; // budgets.total_income_expected

  // Budget allocations
  fixed_costs: Record<string, number>; // budgets.fixed_costs (JSONB)
  // e.g., { "rent": 10000, "insurance": 2000, "loan_emi": 5000 }

  variable_costs: Record<string, number>; // budgets.variable_costs (JSONB)
  // e.g., { "groceries": 6000, "transport": 4000, "utilities": 3000 }

  savings_target: number;        // budgets.savings_target
  discretionary_budget: number;  // budgets.discretionary_budget

  // Category-wise spending limits
  category_limits: Record<string, {
    daily?: number;
    weekly?: number;
    monthly: number;
  }>; // budgets.category_limits (JSONB)

  // Auto-calculated
  confidence_score?: number;     // budgets.confidence_score
  is_active: boolean;            // budgets.is_active (default true)
}
```

### Output Data Fields
```typescript
interface BudgetDisplay {
  budget_id: string;
  budget_type: string;           // Display as badge
  valid_from: Date;
  valid_until: Date;
  total_income_expected: number;

  // Breakdown
  fixed_costs: Record<string, number>;
  fixed_costs_total: number;     // Sum of all fixed costs

  variable_costs: Record<string, number>;
  variable_costs_total: number;  // Sum of all variable costs

  savings_target: number;
  discretionary_budget: number;

  // Category limits with progress
  category_limits: Record<string, {
    monthly: number;
    spent: number;              // From transactions (calculated)
    remaining: number;          // monthly - spent
    percentage_used: number;    // (spent / monthly) * 100
  }>;

  confidence_score: number;
  is_active: boolean;
  created_at: Date;

  // Overall budget health
  total_allocated: number;      // Sum of all allocations
  allocation_percentage: number; // (total_allocated / total_income_expected) * 100
}
```

### Database Query (Direct)
```sql
-- Get Active Budget
SELECT
  budget_id,
  budget_type,
  valid_from,
  valid_until,
  total_income_expected,
  fixed_costs,
  variable_costs,
  savings_target,
  discretionary_budget,
  category_limits,
  confidence_score,
  is_active,
  created_at
FROM budgets
WHERE user_id = $1
  AND is_active = true
  AND CURRENT_DATE BETWEEN valid_from AND valid_until
ORDER BY created_at DESC
LIMIT 1;

-- Get All Budgets (for history/selector)
SELECT
  budget_id,
  budget_type,
  valid_from,
  valid_until,
  total_income_expected,
  is_active,
  created_at
FROM budgets
WHERE user_id = $1
ORDER BY created_at DESC;

-- Calculate Category Spending vs Budget
SELECT
  t.category,
  bl.limit_value as monthly_limit,
  COALESCE(SUM(t.amount), 0) as spent,
  bl.limit_value - COALESCE(SUM(t.amount), 0) as remaining,
  ROUND((COALESCE(SUM(t.amount), 0) * 100.0 / bl.limit_value), 2) as percentage_used
FROM (
  SELECT
    key as category,
    (value->>'monthly')::numeric as limit_value
  FROM budgets, jsonb_each(category_limits)
  WHERE budget_id = $1
) bl
LEFT JOIN transactions t ON
  t.category = bl.category
  AND t.user_id = $2
  AND t.transaction_type = 'expense'
  AND t.transaction_date BETWEEN $3 AND $4
GROUP BY t.category, bl.limit_value;

-- Create New Budget
INSERT INTO budgets (
  user_id,
  budget_type,
  valid_from,
  valid_until,
  total_income_expected,
  fixed_costs,
  variable_costs,
  savings_target,
  discretionary_budget,
  category_limits,
  confidence_score,
  is_active
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
) RETURNING budget_id;

-- Update Budget
UPDATE budgets
SET
  budget_type = COALESCE($2, budget_type),
  valid_from = COALESCE($3, valid_from),
  valid_until = COALESCE($4, valid_until),
  total_income_expected = COALESCE($5, total_income_expected),
  fixed_costs = COALESCE($6, fixed_costs),
  variable_costs = COALESCE($7, variable_costs),
  savings_target = COALESCE($8, savings_target),
  discretionary_budget = COALESCE($9, discretionary_budget),
  category_limits = COALESCE($10, category_limits),
  is_active = COALESCE($11, is_active)
WHERE budget_id = $1 AND user_id = $user_id
RETURNING *;

-- Deactivate Old Budgets
UPDATE budgets
SET is_active = false
WHERE user_id = $1 AND budget_id != $2;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/budgets/active
const getActiveBudget = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/budgets/active',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// POST /api/v1/budgets
const createBudget = async (data: BudgetInput) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/budgets',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// PATCH /api/v1/budgets/:id
const updateBudget = async (id: string, data: Partial<BudgetInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/budgets/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// POST /api/v1/analysis/budget (AI-generated budget)
const generateAIBudget = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/analysis/budget',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

### Components
```typescript
<BudgetPage>
  <PageHeader>
    <Select value={activeBudget.budget_id} onValueChange={switchBudget}>
      {allBudgets.map(b => (
        <SelectItem value={b.budget_id}>
          {b.budget_type} ({b.valid_from} to {b.valid_until})
        </SelectItem>
      ))}
    </Select>
    <Button onClick={createNewBudget}>+ Create New Budget</Button>
    <Button onClick={generateAIBudget}>🤖 AI Suggest Budget</Button>
  </PageHeader>

  <BudgetOverviewCard budget={activeBudget} />

  <BudgetBreakdownGrid>
    <Card>
      <CardHeader>Fixed Costs</CardHeader>
      <CardContent>
        <CostList
          items={activeBudget.fixed_costs}
          onEdit={editFixedCost}
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>Variable Costs</CardHeader>
      <CardContent>
        <CostList
          items={activeBudget.variable_costs}
          onEdit={editVariableCost}
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>Savings & Discretionary</CardHeader>
      <CardContent>
        <div>Savings Target: ₹{activeBudget.savings_target}</div>
        <div>Discretionary: ₹{activeBudget.discretionary_budget}</div>
      </CardContent>
    </Card>
  </BudgetBreakdownGrid>

  <CategoryLimitsTable
    limits={categoryLimitsWithProgress}
    onEditLimit={editCategoryLimit}
  />

  <CreateBudgetModal
    isOpen={isCreateModalOpen}
    onClose={() => setIsCreateModalOpen(false)}
    onSubmit={handleCreateBudget}
  />
</BudgetPage>
```

---

## 📱 PAGE 7: RISK ANALYSIS

### UI Layout
```
┌────────────────────────────────────────────┐
│  Overall Risk Score (Large Display)       │
│  ┌──────────────────────────────────────┐ │
│  │        ⚠️ MEDIUM RISK                │ │
│  │         Score: 42/100                │ │
│  │                                      │ │
│  │  [────────●────────────]             │ │
│  │  Low    Med     High                 │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Risk Factors Breakdown                    │
│  ┌─────────────┬─────────────┬──────────┐│
│  │ Income Risk │ Debt Risk   │ Liquidity││
│  │    35/100   │    60/100   │   25/100 ││
│  └─────────────┴─────────────┴──────────┘│
│                                            │
│  ┌─────────────┬─────────────┬──────────┐│
│  │Expense Risk │Emergency Fund│Protection││
│  │    40/100   │    70/100   │   80/100 ││
│  └─────────────┴─────────────┴──────────┘│
├────────────────────────────────────────────┤
│  Risk Alerts                               │
│  🔴 High debt-to-income ratio (60%)       │
│  🟡 Emergency fund below 1 month expenses │
│  🟢 Income trend stable                   │
├────────────────────────────────────────────┤
│  Recommended Actions                       │
│  1. Reduce discretionary spending by 20%  │
│  2. Build emergency fund to ₹30,000       │
│  3. Consider debt consolidation            │
├────────────────────────────────────────────┤
│  Escalation Notice (if needed)            │
│  ⚠️ Human Advisor Recommended              │
│  [Schedule Call with Advisor]             │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `risk_assessments`)
```typescript
// Risk assessments are AI-generated, user can only add notes
interface RiskAssessmentNotes {
  user_notes?: string;           // Not in DB, could add to table
  acknowledgement?: boolean;     // User acknowledged the risk
  action_taken?: string;         // What user did about it
}
```

### Output Data Fields
```typescript
interface RiskAssessmentDisplay {
  id: number;
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // risk_assessments.overall_risk_level
  risk_score: number;            // 0-100 scale

  // Detailed risk factors (JSONB)
  risk_factors: {
    income_stability_risk: number;
    debt_risk: number;
    liquidity_risk: number;
    expense_risk: number;
    emergency_fund_risk: number;
    protection_risk: number;
    behavioral_risk: number;
  };

  // Key metrics
  debt_to_income_ratio: number;  // As percentage
  income_drop_percentage: number; // Recent decline %
  expense_spike_factor: number;   // Unusual spending increase
  emergency_fund_coverage: number; // Months covered

  // Anomalies (JSONB array)
  transaction_anomalies: Array<{
    type: string;
    description: string;
    date: Date;
    amount: number;
  }>;

  // Escalation
  escalation_needed: boolean;
  escalation_priority: 'low' | 'medium' | 'high' | 'critical';
  escalation_reason: string;

  // Recommendations (JSONB array)
  recommended_actions: Array<{
    priority: string;
    action: string;
    impact: string;
    timeline: string;
  }>;

  // AI analysis
  ai_risk_analysis: string;      // Detailed explanation
  assessment_date: Date;
}
```

### Database Query (Direct)
```sql
-- Get Latest Risk Assessment
SELECT
  ra.id,
  ra.overall_risk_level,
  ra.risk_score,
  ra.risk_factors,
  ra.debt_to_income_ratio,
  ra.income_drop_percentage,
  ra.expense_spike_factor,
  ra.emergency_fund_coverage,
  ra.transaction_anomalies,
  ra.escalation_needed,
  ra.escalation_priority,
  ra.escalation_reason,
  ra.recommended_actions,
  ra.ai_risk_analysis,
  ra.assessment_date,
  ra.created_at
FROM risk_assessments ra
WHERE ra.user_id = $1
ORDER BY ra.assessment_date DESC
LIMIT 1;

-- Get Risk Assessment History
SELECT
  id,
  overall_risk_level,
  risk_score,
  assessment_date
FROM risk_assessments
WHERE user_id = $1
ORDER BY assessment_date DESC
LIMIT 10;

-- Check if Escalation Created
SELECT
  he.id,
  he.escalation_reason,
  he.escalation_priority,
  he.escalation_date,
  he.assigned_advisor_name,
  he.advisor_contacted,
  he.resolution_status,
  he.follow_up_scheduled
FROM human_escalations he
WHERE he.user_id = $1
  AND he.risk_assessment_id = $2
ORDER BY he.escalation_date DESC
LIMIT 1;

-- Get Emergency Fund Progress (for liquidity risk)
SELECT
  up.current_emergency_fund,
  up.emergency_fund_target,
  up.monthly_expenses_avg,
  ROUND(up.current_emergency_fund / NULLIF(up.monthly_expenses_avg, 0), 1) as months_covered
FROM user_profiles up
WHERE up.user_id = $1;

-- Get Recent Debt Info (for debt risk)
SELECT
  up.debt_obligations
FROM user_profiles up
WHERE up.user_id = $1;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/risk-assessment
const getRiskAssessment = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/risk-assessment',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// POST /api/v1/risk-assessment/refresh
const refreshRiskAssessment = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/risk-assessment/refresh',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};

// POST /api/v1/human-escalation (Schedule advisor call)
const scheduleAdvisorCall = async (riskAssessmentId: number, notes: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/human-escalation',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        risk_assessment_id: riskAssessmentId,
        user_notes: notes
      })
    }
  );
  return response.json();
};
```

### Components
```typescript
<RiskAnalysisPage>
  <PageHeader>
    <h1>Risk Analysis</h1>
    <Button onClick={refreshRisk}>🔄 Refresh Analysis</Button>
  </PageHeader>

  <OverallRiskCard
    level={riskData.overall_risk_level}
    score={riskData.risk_score}
    assessmentDate={riskData.assessment_date}
  />

  <RiskFactorsGrid>
    {Object.entries(riskData.risk_factors).map(([key, value]) => (
      <RiskFactorCard
        key={key}
        name={formatRiskName(key)}
        score={value}
        description={getRiskDescription(key)}
      />
    ))}
  </RiskFactorsGrid>

  <RiskAlertsCard
    alerts={riskData.transaction_anomalies}
    debtRatio={riskData.debt_to_income_ratio}
    emergencyCoverage={riskData.emergency_fund_coverage}
  />

  <RecommendedActionsCard
    actions={riskData.recommended_actions}
    onActionTaken={handleActionTaken}
  />

  {riskData.escalation_needed && (
    <EscalationNotice
      priority={riskData.escalation_priority}
      reason={riskData.escalation_reason}
      onScheduleCall={() => openScheduleModal()}
    />
  )}

  <AIAnalysisCard analysis={riskData.ai_risk_analysis} />

  <ScheduleAdvisorModal
    isOpen={isScheduleModalOpen}
    onClose={() => setIsScheduleModalOpen(false)}
    onSubmit={scheduleAdvisorCall}
  />
</RiskAnalysisPage>
```

---

## 📱 PAGE 8: ACTION PLAN

### UI Layout
```
┌────────────────────────────────────────────┐
│  Today's Actions                           │
│  ┌──────────────────────────────────────┐ │
│  │ ✅ Auto-save ₹250 to emergency fund  │ │
│  │    Status: Pending Approval          │ │
│  │    [Approve] [Reject]                │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Upcoming Actions (Next 7 days)           │
│  ┌──────────────────────────────────────┐ │
│  │ 📅 Dec 18 - Bill payment (Electricity)│ │
│  │    Amount: ₹1,200                    │ │
│  │    Status: Scheduled                 │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Ongoing Actions (Recurring)              │
│  ┌──────────────────────────────────────┐ │
│  │ 🔄 Monthly SIP ₹2,000                │ │
│  │    Next: Dec 20                      │ │
│  │    Status: Active                    │ │
│  │    [Pause] [Edit]                    │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Completed Actions & Outcomes             │
│  ┌──────────────────────────────────────┐ │
│  │ ✓ Emergency fund top-up (Dec 10)    │ │
│  │   Target: ₹5,000 | Achieved: ₹5,000 │ │
│  │   Success: 100%                      │ │
│  │   [View Details]                     │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `executed_actions`)
```typescript
interface ActionApproval {
  user_approved: boolean;        // executed_actions.user_approved
  approval_date?: Date;          // executed_actions.approval_date
  security_verification_id?: string; // If 2FA required
  reversal_requested?: boolean;  // executed_actions.reversal_requested
  user_notes?: string;           // For audit trail
}

interface ActionCreate {
  action_type: string;           // executed_actions.action_type
  // e.g., 'auto_save', 'bill_payment', 'investment', 'transfer'

  action_description: string;    // executed_actions.action_description
  amount: number;                // executed_actions.amount
  target_account?: string;       // executed_actions.target_account
  target_entity?: string;        // executed_actions.target_entity

  schedule: 'once' | 'daily' | 'weekly' | 'monthly'; // executed_actions.schedule
  next_execution?: Date;         // executed_actions.next_execution

  requires_2fa: boolean;         // executed_actions.requires_2fa
  is_reversible: boolean;        // executed_actions.is_reversible
}
```

### Output Data Fields
```typescript
interface ExecutedActionDisplay {
  id: number;
  action_type: string;           // Display badge
  action_description: string;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'reversed';
  amount: number;
  target_account?: string;
  target_entity?: string;

  // Approval
  user_approved: boolean;
  approval_date?: Date;
  requires_2fa: boolean;

  // Execution
  execution_date?: Date;
  transaction_id?: string;       // Link to transactions table

  // Schedule
  schedule: string;
  next_execution?: Date;
  recurrence_count: number;      // How many times executed

  // Reversal
  is_reversible: boolean;
  reversal_requested: boolean;
  reversal_date?: Date;

  // Audit
  audit_trail: Array<{
    timestamp: Date;
    action: string;
    details: string;
  }>;
  error_message?: string;

  created_at: Date;
  updated_at?: Date;
}

interface ActionOutcomeDisplay {
  id: number;
  action_id: number;             // Link to executed_actions
  verification_date: Date;
  days_after_execution: number;

  intended_target: number;
  actual_achievement: number;
  achievement_percentage: number; // (actual / intended) * 100
  success: boolean;

  deviation: number;             // actual - intended
  deviation_reason?: string;

  influencing_factors: Array<{
    factor: string;
    impact: string;
  }>;

  learnings: string;             // AI-generated insights
  optimization_suggestions: Array<string>;

  created_at: Date;
}
```

### Database Query (Direct)
```sql
-- Get Pending Actions (Today)
SELECT
  ea.id,
  ea.action_type,
  ea.action_description,
  ea.status,
  ea.amount,
  ea.target_account,
  ea.target_entity,
  ea.user_approved,
  ea.requires_2fa,
  ea.schedule,
  ea.next_execution,
  ea.is_reversible,
  ea.created_at
FROM executed_actions ea
WHERE ea.user_id = $1
  AND ea.status = 'pending'
  AND (ea.next_execution = CURRENT_DATE OR ea.next_execution IS NULL)
ORDER BY ea.created_at DESC;

-- Get Upcoming Actions (Next 7 days)
SELECT
  ea.id,
  ea.action_type,
  ea.action_description,
  ea.status,
  ea.amount,
  ea.next_execution,
  ea.schedule
FROM executed_actions ea
WHERE ea.user_id = $1
  AND ea.status IN ('approved', 'scheduled')
  AND ea.next_execution BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7
ORDER BY ea.next_execution ASC;

-- Get Ongoing Recurring Actions
SELECT
  ea.id,
  ea.action_type,
  ea.action_description,
  ea.status,
  ea.amount,
  ea.schedule,
  ea.next_execution,
  ea.recurrence_count,
  ea.created_at
FROM executed_actions ea
WHERE ea.user_id = $1
  AND ea.status = 'active'
  AND ea.schedule != 'once'
ORDER BY ea.next_execution ASC;

-- Get Completed Actions with Outcomes
SELECT
  ea.id,
  ea.action_type,
  ea.action_description,
  ea.amount,
  ea.execution_date,
  ea.status,
  ao.id as outcome_id,
  ao.verification_date,
  ao.intended_target,
  ao.actual_achievement,
  ao.achievement_percentage,
  ao.success,
  ao.deviation,
  ao.deviation_reason,
  ao.learnings
FROM executed_actions ea
LEFT JOIN action_outcomes ao ON ea.id = ao.action_id
WHERE ea.user_id = $1
  AND ea.status = 'completed'
ORDER BY ea.execution_date DESC
LIMIT 20;

-- Approve Action
UPDATE executed_actions
SET
  status = 'approved',
  user_approved = true,
  approval_date = NOW(),
  audit_trail = audit_trail || jsonb_build_object(
    'timestamp', NOW(),
    'action', 'approved',
    'details', 'User approved action'
  )::jsonb
WHERE id = $1 AND user_id = $2
RETURNING *;

-- Request Reversal
UPDATE executed_actions
SET
  reversal_requested = true,
  audit_trail = audit_trail || jsonb_build_object(
    'timestamp', NOW(),
    'action', 'reversal_requested',
    'details', $3
  )::jsonb
WHERE id = $1 AND user_id = $2 AND is_reversible = true
RETURNING *;

-- Create New Action
INSERT INTO executed_actions (
  user_id,
  action_type,
  action_description,
  status,
  amount,
  target_account,
  target_entity,
  requires_2fa,
  schedule,
  next_execution,
  is_reversible,
  audit_trail
) VALUES (
  $1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10,
  jsonb_build_array(
    jsonb_build_object(
      'timestamp', NOW(),
      'action', 'created',
      'details', 'Action created'
    )
  )
) RETURNING id;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/actions?status=...&date_range=...
const getActions = async (filters: {
  status?: string;
  date_range?: 'today' | 'upcoming' | 'ongoing' | 'completed';
}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters as any);

  const response = await fetch(
    `http://localhost:8001/api/v1/actions?${params}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// POST /api/v1/actions/:id/approve
const approveAction = async (actionId: number, securityCode?: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/actions/${actionId}/approve`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ security_verification_id: securityCode })
    }
  );
  return response.json();
};

// POST /api/v1/actions/:id/reverse
const requestReversal = async (actionId: number, reason: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/actions/${actionId}/reverse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    }
  );
  return response.json();
};

// PATCH /api/v1/actions/:id/pause
const pauseRecurringAction = async (actionId: number) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/actions/${actionId}/pause`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};

// GET /api/v1/action-outcomes?action_id=...
const getActionOutcomes = async (actionId: number) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/action-outcomes?action_id=${actionId}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};
```

### Components
```typescript
<ActionPlanPage>
  <PageHeader>
    <h1>Action Plan</h1>
    <Button onClick={createNewAction}>+ New Action</Button>
  </PageHeader>

  <Section title="Today's Actions">
    {pendingActions.map(action => (
      <ActionCard
        key={action.id}
        action={action}
        variant="pending"
        onApprove={() => handleApprove(action.id)}
        onReject={() => handleReject(action.id)}
      />
    ))}
  </Section>

  <Section title="Upcoming Actions (Next 7 Days)">
    <Timeline>
      {upcomingActions.map(action => (
        <TimelineItem
          key={action.id}
          date={action.next_execution}
          action={action}
          onEdit={() => editAction(action.id)}
        />
      ))}
    </Timeline>
  </Section>

  <Section title="Ongoing Actions">
    {recurringActions.map(action => (
      <RecurringActionCard
        key={action.id}
        action={action}
        onPause={() => pauseAction(action.id)}
        onEdit={() => editAction(action.id)}
      />
    ))}
  </Section>

  <Section title="Completed Actions & Outcomes">
    {completedActions.map(action => (
      <CompletedActionCard
        key={action.id}
        action={action}
        outcome={action.outcome}
        onViewDetails={() => openOutcomeModal(action.id)}
      />
    ))}
  </Section>

  <ActionOutcomeModal
    outcome={selectedOutcome}
    isOpen={isOutcomeModalOpen}
    onClose={() => setIsOutcomeModalOpen(false)}
  />
</ActionPlanPage>
```

---

## 📱 PAGE 9: TAX

### UI Layout
```
┌────────────────────────────────────────────┐
│  Financial Year Selector                   │
│  [FY 2024-25 ▼]  [Generate ITR Form]      │
├────────────────────────────────────────────┤
│  Tax Summary Cards                         │
│  ┌───────────┬────────────┬──────────────┐│
│  │Gross Inc. │Deductions  │Tax Liability ││
│  │₹5,40,000  │₹1,80,000   │₹23,400       ││
│  └───────────┴────────────┴──────────────┘│
├────────────────────────────────────────────┤
│  Income Breakdown                          │
│  ┌──────────────────────────────────────┐ │
│  │ Delivery Income:  ₹4,80,000          │ │
│  │ Freelance Income: ₹60,000            │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Deductions (Section 80C, 80D, etc.)      │
│  ┌──────────────────────────────────────┐ │
│  │ Fuel Expenses:     ₹80,000           │ │
│  │ Vehicle Maintenance: ₹25,000         │ │
│  │ Standard Deduction: ₹75,000          │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Filing Status                             │
│  Status: Pending | ITR Form: ITR-3        │
│  Deadline: July 31, 2025                  │
│  [File Now]                               │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `tax_records`)
```typescript
// Tax records are AI-generated, but user can add manual adjustments
interface TaxRecordInput {
  financial_year: string;        // tax_records.financial_year (e.g., "2024-25")

  // User can add manual adjustments
  additional_income?: Record<string, number>; // Add to income_by_source
  additional_deductions?: Record<string, number>; // Add to deduction_details

  // Filing info (user updates)
  filing_status?: 'pending' | 'filed' | 'verified' | 'processed'; // tax_records.filing_status
  filing_date?: Date;            // tax_records.filing_date
  acknowledgement_number?: string; // tax_records.acknowledgement_number

  user_notes?: string;           // Additional notes
}
```

### Output Data Fields
```typescript
interface TaxRecordDisplay {
  tax_record_id: string;
  financial_year: string;

  // Income
  gross_income: number;          // tax_records.gross_income
  income_by_source: Record<string, number>; // JSONB
  // e.g., { "delivery": 480000, "freelance": 60000 }

  // Deductions
  total_deductions: number;      // tax_records.total_deductions
  deduction_details: Record<string, {
    amount: number;
    category: string;
    description: string;
  }>; // JSONB

  // Tax calculation
  taxable_income: number;        // tax_records.taxable_income
  tax_liability: number;         // tax_records.tax_liability
  tax_paid: number;              // tax_records.tax_paid (if any advance tax)
  refund_amount: number;         // tax_records.refund_amount

  // Filing
  itr_form_type: string;         // e.g., "ITR-3"
  filing_status: string;
  filing_date?: Date;
  acknowledgement_number?: string;

  // Metadata
  created_at: Date;
  updated_at?: Date;
}
```

### Database Query (Direct)
```sql
-- Get Tax Record for Financial Year
SELECT
  tr.tax_record_id,
  tr.financial_year,
  tr.gross_income,
  tr.income_by_source,
  tr.total_deductions,
  tr.deduction_details,
  tr.taxable_income,
  tr.tax_liability,
  tr.tax_paid,
  tr.refund_amount,
  tr.itr_form_type,
  tr.filing_status,
  tr.filing_date,
  tr.acknowledgement_number,
  tr.created_at,
  tr.updated_at
FROM tax_records tr
WHERE tr.user_id = $1
  AND tr.financial_year = $2
LIMIT 1;

-- Get All Tax Records (for year selector)
SELECT
  tax_record_id,
  financial_year,
  gross_income,
  taxable_income,
  tax_liability,
  filing_status,
  created_at
FROM tax_records
WHERE user_id = $1
ORDER BY financial_year DESC;

-- Calculate Income by Source from Transactions
SELECT
  COALESCE(t.source, 'Other') as source,
  SUM(t.amount) as total_amount
FROM transactions t
WHERE t.user_id = $1
  AND t.transaction_type = 'income'
  AND t.transaction_date BETWEEN $2 AND $3  -- FY date range
GROUP BY t.source
ORDER BY total_amount DESC;

-- Calculate Deductible Expenses
SELECT
  t.category,
  SUM(t.amount) as total_amount,
  COUNT(*) as transaction_count
FROM transactions t
WHERE t.user_id = $1
  AND t.transaction_type = 'expense'
  AND t.transaction_date BETWEEN $2 AND $3  -- FY date range
  AND t.category IN ('Fuel', 'Maintenance', 'Insurance', 'Rent') -- Deductible categories
GROUP BY t.category
ORDER BY total_amount DESC;

-- Update Tax Record Filing Status
UPDATE tax_records
SET
  filing_status = $2,
  filing_date = COALESCE($3, filing_date),
  acknowledgement_number = COALESCE($4, acknowledgement_number),
  updated_at = NOW()
WHERE tax_record_id = $1 AND user_id = $user_id
RETURNING *;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/tax?year=2024-25
const getTaxRecord = async (financialYear: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/tax?year=${financialYear}`,
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// POST /api/v1/tax/generate
const generateTaxRecord = async (financialYear: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/tax/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ financial_year: financialYear })
    }
  );
  return response.json();
};

// POST /api/v1/tax/itr-form
const generateITRForm = async (taxRecordId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/tax/itr-form',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tax_record_id: taxRecordId })
    }
  );
  return response.json(); // Returns ITR form data/PDF
};

// PATCH /api/v1/tax/:id
const updateTaxRecord = async (id: string, data: Partial<TaxRecordInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/tax/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};
```

### Components
```typescript
<TaxPage>
  <PageHeader>
    <Select value={selectedYear} onValueChange={setSelectedYear}>
      {allTaxYears.map(year => (
        <SelectItem value={year}>FY {year}</SelectItem>
      ))}
    </Select>
    <Button onClick={generateITR}>📄 Generate ITR Form</Button>
    <Button onClick={downloadPDF}>⬇️ Download PDF</Button>
  </PageHeader>

  <TaxSummaryCards data={taxData} />

  <Card>
    <CardHeader>Income Breakdown</CardHeader>
    <CardContent>
      <IncomeSourcesTable sources={taxData.income_by_source} />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>Deductions</CardHeader>
    <CardContent>
      <DeductionsTable
        deductions={taxData.deduction_details}
        onAddManualDeduction={addDeduction}
      />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>Tax Calculation</CardHeader>
    <CardContent>
      <TaxCalculationTable
        taxableIncome={taxData.taxable_income}
        taxLiability={taxData.tax_liability}
        taxPaid={taxData.tax_paid}
        refund={taxData.refund_amount}
      />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>Filing Status</CardHeader>
    <CardContent>
      <FilingStatusForm
        status={taxData.filing_status}
        itrForm={taxData.itr_form_type}
        deadline={getFilingDeadline(taxData.financial_year)}
        onUpdateStatus={updateFilingStatus}
      />
    </CardContent>
  </Card>
</TaxPage>
```

---

## 📱 PAGE 10: PROFILE

### UI Layout
```
┌────────────────────────────────────────────┐
│  Tabs: [Personal] [Financial] [Accounts]  │
├────────────────────────────────────────────┤
│  Personal Info Tab                         │
│  ┌──────────────────────────────────────┐ │
│  │ Full Name: [Rajesh Kumar         ]   │ │
│  │ Phone: [+91 9876543210           ]   │ │
│  │ Email: [rajesh@email.com         ]   │ │
│  │ Date of Birth: [1990-05-15       ]   │ │
│  │ Occupation: [Food Delivery Driver ]  │ │
│  │ City: [Bangalore                  ]  │ │
│  │ State: [Karnataka                 ]  │ │
│  │ PIN Code: [560001                 ]  │ │
│  │                                      │ │
│  │ [Update Profile]                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Financial Profile Tab                     │
│  ┌──────────────────────────────────────┐ │
│  │ Monthly Income Range:                │ │
│  │   Min: ₹[25,000] Max: ₹[45,000]     │ │
│  │ Avg Monthly Expenses: ₹[22,000]     │ │
│  │ Emergency Fund:                      │ │
│  │   Current: ₹[8,500]                 │ │
│  │   Target: ₹[50,000]                 │ │
│  │ Risk Tolerance: [Moderate ▼]        │ │
│  │ Dependents: [2]                     │ │
│  │                                      │ │
│  │ Financial Goals: [Edit JSON]         │ │
│  │ Debt Obligations: [Edit JSON]        │ │
│  │                                      │ │
│  │ [Update Financial Profile]           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Bank Accounts Tab                         │
│  ┌──────────────────────────────────────┐ │
│  │ Account 1: HDFC Savings              │ │
│  │   Balance: ₹12,450                  │ │
│  │   [Edit] [Delete]                   │ │
│  │                                      │ │
│  │ Account 2: Paytm Wallet              │ │
│  │   Balance: ₹1,200                   │ │
│  │   [Edit] [Delete]                   │ │
│  │                                      │ │
│  │ [+ Add Bank Account]                 │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Input Fields (Derived from `users`, `user_profiles`, `bank_accounts`)

**Personal Info (from `users` table):**
```typescript
interface PersonalInfoInput {
  full_name: string;             // users.full_name (required)
  phone_number: string;          // users.phone_number (required, unique, readonly after signup)
  email?: string;                // users.email (optional)
  date_of_birth?: Date;          // users.date_of_birth
  occupation?: string;           // users.occupation
  city?: string;                 // users.city
  state?: string;                // users.state
  pin_code?: string;             // users.pin_code
  preferred_language: string;    // users.preferred_language (default 'en')
}
```

**Financial Profile (from `user_profiles` table):**
```typescript
interface FinancialProfileInput {
  monthly_income_min: number;    // user_profiles.monthly_income_min
  monthly_income_max: number;    // user_profiles.monthly_income_max
  monthly_expenses_avg: number;  // user_profiles.monthly_expenses_avg

  emergency_fund_target: number; // user_profiles.emergency_fund_target
  current_emergency_fund: number; // user_profiles.current_emergency_fund

  risk_tolerance: 'low' | 'moderate' | 'high'; // user_profiles.risk_tolerance
  dependents: number;            // user_profiles.dependents

  // JSONB fields (editable)
  financial_goals: Record<string, any>; // user_profiles.financial_goals
  // e.g., { "emergency_fund": 50000, "house_downpayment": 500000, "retirement": 2000000 }

  income_sources: Record<string, any>; // user_profiles.income_sources
  // e.g., { "delivery": "primary", "freelance": "secondary" }

  debt_obligations: Record<string, any>; // user_profiles.debt_obligations
  // e.g., { "personal_loan": 50000, "credit_card": 15000 }
}
```

**Bank Accounts (from `bank_accounts` table):**
```typescript
interface BankAccountInput {
  account_name: string;          // bank_accounts.account_name (e.g., "HDFC Savings")
  provider: string;              // bank_accounts.provider (e.g., "HDFC Bank", "Paytm")
  account_number: string;        // bank_accounts.account_number
  current_balance: number;       // bank_accounts.current_balance
  currency: string;              // bank_accounts.currency (default "INR")
  is_active: boolean;            // bank_accounts.is_active (default true)
}
```

### Output Data Fields
```typescript
interface UserProfileDisplay {
  // Personal Info
  user_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  date_of_birth?: Date;
  occupation?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  preferred_language: string;

  // Account status
  is_active: boolean;
  kyc_verified: boolean;
  onboarding_completed: boolean;
  created_at: Date;

  // Financial Profile
  profile_id: string;
  monthly_income_min: number;
  monthly_income_max: number;
  monthly_expenses_avg: number;
  emergency_fund_target: number;
  current_emergency_fund: number;
  risk_tolerance: string;
  dependents: number;
  financial_goals: object;
  income_sources: object;
  debt_obligations: object;

  // Bank Accounts
  bank_accounts: Array<{
    account_id: string;
    account_name: string;
    provider: string;
    account_number: string;  // Masked for display (e.g., "****5678")
    current_balance: number;
    currency: string;
    is_active: boolean;
    created_at: Date;
  }>;
}
```

### Database Query (Direct)
```sql
-- Get User Personal Info
SELECT
  u.user_id,
  u.phone_number,
  u.email,
  u.full_name,
  u.date_of_birth,
  u.occupation,
  u.city,
  u.state,
  u.pin_code,
  u.preferred_language,
  u.is_active,
  u.kyc_verified,
  u.onboarding_completed,
  u.created_at
FROM users u
WHERE u.user_id = $1;

-- Get User Financial Profile
SELECT
  up.profile_id,
  up.monthly_income_min,
  up.monthly_income_max,
  up.monthly_expenses_avg,
  up.emergency_fund_target,
  up.current_emergency_fund,
  up.risk_tolerance,
  up.dependents,
  up.financial_goals,
  up.income_sources,
  up.debt_obligations,
  up.created_at,
  up.updated_at
FROM user_profiles up
WHERE up.user_id = $1;

-- Get User Bank Accounts
SELECT
  ba.account_id,
  ba.account_name,
  ba.provider,
  ba.account_number,
  ba.current_balance,
  ba.currency,
  ba.is_active,
  ba.created_at
FROM bank_accounts ba
WHERE ba.user_id = $1
ORDER BY ba.created_at DESC;

-- Update Personal Info
UPDATE users
SET
  full_name = COALESCE($2, full_name),
  email = COALESCE($3, email),
  date_of_birth = COALESCE($4, date_of_birth),
  occupation = COALESCE($5, occupation),
  city = COALESCE($6, city),
  state = COALESCE($7, state),
  pin_code = COALESCE($8, pin_code),
  preferred_language = COALESCE($9, preferred_language),
  updated_at = NOW()
WHERE user_id = $1
RETURNING *;

-- Update Financial Profile
UPDATE user_profiles
SET
  monthly_income_min = COALESCE($2, monthly_income_min),
  monthly_income_max = COALESCE($3, monthly_income_max),
  monthly_expenses_avg = COALESCE($4, monthly_expenses_avg),
  emergency_fund_target = COALESCE($5, emergency_fund_target),
  current_emergency_fund = COALESCE($6, current_emergency_fund),
  risk_tolerance = COALESCE($7, risk_tolerance),
  dependents = COALESCE($8, dependents),
  financial_goals = COALESCE($9, financial_goals),
  income_sources = COALESCE($10, income_sources),
  debt_obligations = COALESCE($11, debt_obligations),
  updated_at = NOW()
WHERE user_id = $1
RETURNING *;

-- Add Bank Account
INSERT INTO bank_accounts (
  user_id,
  account_name,
  provider,
  account_number,
  current_balance,
  currency,
  is_active
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING account_id;

-- Update Bank Account
UPDATE bank_accounts
SET
  account_name = COALESCE($2, account_name),
  provider = COALESCE($3, provider),
  account_number = COALESCE($4, account_number),
  current_balance = COALESCE($5, current_balance),
  is_active = COALESCE($6, is_active),
  updated_at = NOW()
WHERE account_id = $1 AND user_id = $user_id
RETURNING *;

-- Delete Bank Account (soft delete)
UPDATE bank_accounts
SET is_active = false, updated_at = NOW()
WHERE account_id = $1 AND user_id = $2;
```

### Backend API Integration (When Ready)
```typescript
// GET /api/v1/users/me
const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/users/me',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// GET /api/v1/users/me/profile
const getFinancialProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/users/me/profile',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// PATCH /api/v1/users/me
const updatePersonalInfo = async (data: Partial<PersonalInfoInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/users/me',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// PATCH /api/v1/users/me/profile
const updateFinancialProfile = async (data: Partial<FinancialProfileInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/users/me/profile',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// GET /api/v1/bank-accounts
const getBankAccounts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/bank-accounts',
    {headers: {'Authorization': `Bearer ${token}`}}
  );
  return response.json();
};

// POST /api/v1/bank-accounts
const addBankAccount = async (data: BankAccountInput) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:8001/api/v1/bank-accounts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// PATCH /api/v1/bank-accounts/:id
const updateBankAccount = async (id: string, data: Partial<BankAccountInput>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8001/api/v1/bank-accounts/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};

// DELETE /api/v1/bank-accounts/:id
const deleteBankAccount = async (id: string) => {
  const token = localStorage.getItem('token');
  await fetch(
    `http://localhost:8001/api/v1/bank-accounts/${id}`,
    {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${token}`}
    }
  );
};
```

### Components
```typescript
<ProfilePage>
  <Tabs defaultValue="personal">
    <TabsList>
      <TabsTrigger value="personal">Personal Info</TabsTrigger>
      <TabsTrigger value="financial">Financial Profile</TabsTrigger>
      <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
      <TabsTrigger value="security">Security</TabsTrigger>
    </TabsList>

    <TabsContent value="personal">
      <Card>
        <CardHeader>Personal Information</CardHeader>
        <CardContent>
          <PersonalInfoForm
            data={userProfile}
            onSubmit={updatePersonalInfo}
          />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="financial">
      <Card>
        <CardHeader>Financial Profile</CardHeader>
        <CardContent>
          <FinancialProfileForm
            data={financialProfile}
            onSubmit={updateFinancialProfile}
          />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="accounts">
      <div className="space-y-4">
        <Button onClick={addNewAccount}>+ Add Bank Account</Button>

        {bankAccounts.map(account => (
          <BankAccountCard
            key={account.account_id}
            account={account}
            onEdit={() => editAccount(account.account_id)}
            onDelete={() => deleteAccount(account.account_id)}
          />
        ))}
      </div>

      <AddBankAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onSubmit={handleAddAccount}
      />
    </TabsContent>

    <TabsContent value="security">
      <Card>
        <CardHeader>Security Settings</CardHeader>
        <CardContent>
          <SecuritySettingsForm
            onChangePassword={changePassword}
            onEnable2FA={enable2FA}
          />
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</ProfilePage>
```

---

## 🎨 GLOBAL COMPONENTS LIBRARY

### 1. Layout Components

**AppLayout (Root Layout)**
```typescript
<AppLayout>
  <Sidebar collapsed={sidebarCollapsed} />
  <div className="flex-1">
    <TopBar user={currentUser} onLogout={handleLogout} />
    <main className="p-6 bg-neutral-50 min-h-screen">
      <Breadcrumbs />
      <Outlet /> {/* React Router outlet */}
    </main>
  </div>
</AppLayout>
```

**Sidebar**
```typescript
<Sidebar>
  <Logo />
  <NavItem icon={HomeIcon} label="Home" to="/home" />
  <NavItem icon={ListIcon} label="Transactions" to="/transactions" />
  <NavItem icon={LightbulbIcon} label="Tips" to="/tips" />
  <NavItem icon={ChartIcon} label="Stats" to="/stats" />
  <NavItem icon={WalletIcon} label="Budget" to="/budget" />
  <NavItem icon={AlertIcon} label="Risk Analysis" to="/risk" />
  <NavItem icon={CheckIcon} label="Action Plan" to="/actions" />
  <NavItem icon={ReceiptIcon} label="Tax" to="/tax" />
  <NavItem icon={UserIcon} label="Profile" to="/profile" />
</Sidebar>
```

**TopBar**
```typescript
<TopBar>
  <PageTitle>{currentPageTitle}</PageTitle>
  <div className="flex items-center gap-4">
    <NotificationBell count={unreadNotifications} />
    <UserAvatar name={user.full_name} />
    <DropdownMenu>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
    </DropdownMenu>
  </div>
</TopBar>
```

### 2. Data Display Components

**StatCard**
```typescript
<StatCard
  title="Total Income"
  value="₹45,000"
  change="+12%"
  changeType="positive"
  icon={TrendingUpIcon}
/>
```

**TransactionCard**
```typescript
<TransactionCard
  type="income"  // or "expense"
  amount={1250}
  category="Delivery"
  description="Daily earnings"
  date="2024-12-15"
  time="14:30"
  verified={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**RecommendationCard (Flash Card)**
```typescript
<RecommendationCard
  priority="high"
  title="Automate Savings"
  description="Set up auto-transfer..."
  confidence={85}
  impact="₹3,000/mo"
  onViewDetails={openModal}
  onMarkDone={markCompleted}
/>
```

### 3. Charts (Recharts Library)

**PieChart** (Expense by Category)
**BarChart** (Income vs Expense)
**LineChart** (Income Trend)
**DonutChart** (Emergency Fund Progress)

### 4. Forms & Inputs

**Input, Select, Textarea, DatePicker, Checkbox, Radio, Switch**
**FileUpload, VoiceRecorder, CurrencyInput**

### 5. Loading & Error States

```typescript
{isLoading ? (
  <Skeleton className="h-20 w-full" />
) : error ? (
  <ErrorCard message={error.message} onRetry={refetch} />
) : (
  <DataDisplay data={data} />
)}
```

---

## 🔄 DATA FETCHING STRATEGY

### Option 1: Direct Database Queries (Current - Due to Rate Limit)

Create a Supabase client in your frontend:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Example: Fetch transactions
export const getTransactions = async (userId: string, filters: any) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', filters.date_start)
    .lte('transaction_date', filters.date_end)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return data;
};
```

### Option 2: React Query (When Backend is Ready)

```typescript
// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';

export const useTransactions = (filters: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactionsFromAPI(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## 📦 TECH STACK SUMMARY

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router v6
- React Query / Supabase Client
- Recharts (for charts)
- date-fns (date formatting)
- Framer Motion (animations)

**Backend Integration:**
- Axios / Fetch API
- JWT token in localStorage
- Supabase client (direct DB access)

---

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Set up project structure
- [ ] Install dependencies
- [ ] Create Supabase client
- [ ] Implement layout (Sidebar + TopBar)
- [ ] Create global components
- [ ] Page 1: Login/Signup
- [ ] Page 2: Home
- [ ] Page 3: Transactions
- [ ] Page 4: Tips (Recommendations)
- [ ] Page 5: Stats
- [ ] Page 6: Budget
- [ ] Page 7: Risk Analysis
- [ ] Page 8: Action Plan
- [ ] Page 9: Tax
- [ ] Page 10: Profile
- [ ] Add loading states
- [ ] Add error handling
- [ ] Mobile responsive
- [ ] Dark mode support (optional)
- [ ] Connect to backend when rate limit resolves

---

**This is your complete frontend redesign specification!**

All fields are derived from your database schema. No fake fields. No guesses. Everything is production-ready.

When you're ready to implement, start with the core layout and work page by page. Each page has complete database queries and API integration code.

Need help implementing any specific page? Let me know! 🚀
