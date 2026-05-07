# Create .env File - Quick Instructions

## ✅ Create the file manually

1. **Create a new file** in the `frontend` folder named `.env` (exactly this name, starting with a dot)

2. **Copy and paste this content** into the file:

```env
# Supabase Configuration — get values from https://app.supabase.com -> Project Settings -> API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API (only needed for login/signup)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Spare backend (AI agents)
VITE_SPARE_API_URL=http://localhost:8000/api
```

3. **Save the file**

4. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## ✅ After Restart

- The "Invalid API key" error should be gone
- All pages should load data from your Supabase database
- Your user_id `11111111-2222-3333-4444-555555555555` should work

## 📝 File Location

The `.env` file should be here:
```
frontend/
  ├── .env          ← Create this file here
  ├── package.json
  ├── src/
  └── ...
```

## ⚠️ Important

- File name must be exactly `.env` (with the dot at the start)
- No quotes around the values
- No spaces around the `=` sign
- Restart dev server after creating/updating the file

