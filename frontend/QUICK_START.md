# Quick Start Guide

## ✅ What You Need

1. **Node.js & npm** - ✅ You already have this!
2. **Supabase credentials** - Get from your Supabase project
3. **Backend (optional)** - Only needed for Login/Signup

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `frontend` folder:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Where to find Supabase credentials:**
- Go to your Supabase project: https://app.supabase.com
- Navigate to: Settings → API
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Run the Frontend

```bash
npm run dev
```

The app will start at: `http://localhost:5173`

## 📋 What Works Without Backend?

✅ **All these pages work directly with Supabase (NO backend needed):**
- Transactions (view, edit, delete)
- Tips/Recommendations
- Stats & Analytics
- Budget Management
- Risk Analysis
- Action Plan
- Tax Planning
- Profile Management

## ⚠️ What Needs Backend?

❌ **Login/Signup requires backend** (for password hashing):
- You need to run the backend server for authentication
- Once logged in, everything else works with Supabase directly

### To test Login/Signup:
1. Start your backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. Make sure `VITE_API_BASE_URL` in `.env` points to your backend

## 🧪 Testing Without Backend

If you want to test the UI without backend:

1. **Skip Login**: You can manually set a user_id in localStorage:
   ```javascript
   // Open browser console and run:
   localStorage.setItem('user_id', 'your-user-id-from-database');
   ```
2. **Navigate directly**: Go to any page URL (e.g., `http://localhost:5173/transactions`)
3. **All data pages will work** - they fetch directly from Supabase!

## 📦 Dependencies

All dependencies are already in `package.json`. Just run:
```bash
npm install
```

No additional system requirements needed!

## 🐛 Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env` file exists in `frontend/` folder
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**Error: "Failed to fetch" on Login/Signup**
- Backend is not running
- Check `VITE_API_BASE_URL` in `.env`
- Start backend: `cd backend && uvicorn main:app --reload`

**No data showing on pages**
- Check Supabase credentials are correct
- Verify you have data in your Supabase database
- Check browser console for errors



