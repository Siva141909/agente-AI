# Supabase Setup Guide

## ❌ Current Error
You're getting "Invalid API key" because the Supabase credentials are missing or incorrect.

## ✅ Fix Steps

### 1. Create `.env` file in `frontend/` folder

Create a file named `.env` (not `.env.example`) in the `frontend` folder:

```env
VITE_SUPABASE_URL=https://ubjrclaiqqxngfcylbfs.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Get Your Supabase Anon Key

1. Go to your Supabase project: https://app.supabase.com
2. Select your project (the one with URL: `ubjrclaiqqxngfcylbfs.supabase.co`)
3. Go to: **Settings** → **API**
4. Under **Project API keys**, find the **`anon` `public`** key
5. Copy it and paste it in your `.env` file

**Important:** Use the **anon/public** key, NOT the **service_role** key!

### 3. Restart Dev Server

After creating/updating `.env`:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Vite needs to be restarted to load new environment variables.

### 4. Verify It's Working

Check browser console - you should see:
- ✅ No "Invalid API key" errors
- ✅ Data loading from database
- ✅ No "Missing Supabase environment variables" errors

## 🔍 Troubleshooting

### Still getting "Invalid API key"?

1. **Check .env file location:**
   - Must be in `frontend/` folder (same level as `package.json`)
   - File name must be exactly `.env` (not `.env.local` or `.env.example`)

2. **Check .env file format:**
   ```env
   # ✅ Correct format:
   VITE_SUPABASE_URL=https://ubjrclaiqqxngfcylbfs.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ❌ Wrong - no quotes needed:
   VITE_SUPABASE_URL="https://..."
   ```

3. **Check you're using the right key:**
   - ✅ Use: **anon public** key (starts with `eyJ`)
   - ❌ Don't use: **service_role** key (secret, starts with `eyJ` but different)

4. **Restart dev server:**
   - Environment variables are loaded at startup
   - Changes to `.env` require server restart

### Check Current Values

In browser console, you can check what's loaded:
```javascript
// This won't work (env vars are not exposed to browser)
// But you can check the error message to see what's missing
```

### Test Connection

After setting up, the app should:
- Load user data from `users` table
- Load transactions from `transactions` table
- Load recommendations from `recommendations` table
- All without backend (except login/signup)

## 📝 Example .env File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ubjrclaiqqxngfcylbfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVianJjbGFpcXF4bmdmY3lsYmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2ODk2MDAsImV4cCI6MjA0ODI2NTYwMH0.your-actual-key-here

# Backend API (only needed for login/signup)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🚨 Security Note

- ✅ The **anon/public** key is safe to use in frontend
- ❌ Never use **service_role** key in frontend (it has admin access)
- ✅ Add `.env` to `.gitignore` (don't commit your keys)



