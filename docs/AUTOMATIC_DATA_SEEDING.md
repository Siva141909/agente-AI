# Automatic Data Seeding on Login

## Overview

Yes, it's **absolutely possible** to automatically populate data when a user logs in via the backend! I've implemented this feature.

## How It Works

When a user logs in (or signs up) via the backend using their **mobile number**, the system now:

1. **Authenticates** the user through the backend API
2. **Gets the user_id** from the login response
3. **Checks if the user has existing data** in the database
4. **Automatically seeds sample data** if no data exists

## What Gets Seeded

The automatic seeding populates:

### 1. **Transactions** (30 days of sample data)
   - Income transactions (every 2-3 days) from gig work platforms
   - Expense transactions (daily) across various categories
   - Realistic amounts and categories

### 2. **Risk Assessment**
   - Overall risk level and score
   - Risk factors (low emergency fund, income volatility, etc.)
   - Recommended actions
   - Financial metrics (debt-to-income ratio, emergency fund coverage, etc.)

### 3. **Executed Actions**
   - Today's actions
   - Upcoming actions (next week)
   - Ongoing actions (monthly/weekly recurring)
   - Completed actions (historical)

### 4. **Recommendations**
   - High-priority recommendations (emergency fund, debt payoff)
   - Medium-priority recommendations (budget optimization)
   - With descriptions, reasoning, and target amounts

## Implementation Details

### Files Created/Modified

1. **`frontend/src/services/dataSeeder.ts`** (NEW)
   - Contains all seeding logic
   - `seedUserData()` - Main function that checks and seeds data
   - `hasUserData()` - Checks if user already has data
   - Individual seed functions for each data type

2. **`frontend/src/contexts/AppContext.tsx`** (MODIFIED)
   - Added import for `seedUserData`
   - Integrated seeding into `login()` function
   - Integrated seeding into `signup()` function

### How It's Triggered

```typescript
// After successful login/signup
const userId = response.user?.user_id || localStorage.getItem('user_id');

if (userId) {
  await seedUserData({ 
    userId: String(userId), 
    phoneNumber: phone_number 
  });
}
```

### Safety Features

1. **Non-blocking**: If seeding fails, it doesn't block the login process
2. **Idempotent**: Only seeds if user has no existing data
3. **Error handling**: All errors are logged but don't crash the app
4. **Performance**: Uses parallel seeding for faster execution

## Usage

### Automatic (Default Behavior)

The seeding happens **automatically** when:
- User logs in via backend
- User signs up via backend
- User has no existing data in the database

**No action needed** - it just works!

### Manual Seeding (For Testing)

If you want to force-seed data (ignoring existing data check):

```typescript
import { forceSeedUserData } from "@/services/dataSeeder";

// Force seed data for a user
await forceSeedUserData({ 
  userId: 'your-user-id',
  phoneNumber: '+919876543210'
});
```

## Example Flow

1. **User logs in** with phone number: `+919876543210`
2. **Backend authenticates** and returns `user_id: "153735c8-b1e3-4fc6-aa4e-7deb6454990b"`
3. **Frontend checks** if user has data:
   - Queries `transactions`, `risk_assessments`, `executed_actions`
   - If no data found → proceeds to seed
4. **Data is seeded**:
   - 30 transactions (income + expenses)
   - 1 risk assessment
   - 7 executed actions (today, upcoming, ongoing, completed)
   - 3 recommendations
5. **User data is loaded** and dashboard shows populated data

## Benefits

✅ **No manual SQL scripts needed** - Data is automatically populated  
✅ **Works for new users** - They get sample data immediately  
✅ **Safe** - Won't overwrite existing data  
✅ **Realistic** - Sample data matches real-world patterns  
✅ **Fast** - Parallel seeding for quick execution  

## Testing

To test this:

1. **Create a new user** via signup
2. **Login** with that user
3. **Check the console** - You should see:
   ```
   [AUTH] Checking if user needs data seeding after login...
   [DataSeeder] User has no data, seeding sample data...
   [DataSeeder] Seeded 30 transactions
   [DataSeeder] Seeded risk assessment
   [DataSeeder] Seeded 7 executed actions
   [DataSeeder] Seeded 3 recommendations
   [DataSeeder] ✅ Data seeding completed successfully
   ```
4. **Navigate to pages**:
   - Dashboard → Should show transactions
   - Risk Analysis → Should show risk assessment
   - Action Plan → Should show actions
   - Tips → Should show recommendations

## Customization

You can customize the seeded data by editing `frontend/src/services/dataSeeder.ts`:

- **Transaction amounts**: Modify `incomeAmounts` and expense amounts
- **Risk assessment**: Change risk level, score, factors
- **Actions**: Modify action types, amounts, schedules
- **Recommendations**: Update recommendation content

## Notes

- Seeding only happens **once per user** (if they have no data)
- If you want to re-seed, you can:
  1. Delete the user's data from database
  2. Use `forceSeedUserData()` function
- The seeding uses the **user_id** from the login response, not the mobile number directly
- Mobile number is passed for potential future use (e.g., phone-based data generation)

