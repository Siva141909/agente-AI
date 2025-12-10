# Create .env File - Quick Instructions

## ✅ Create the file manually

1. **Create a new file** in the `frontend` folder named `.env` (exactly this name, starting with a dot)

2. **Copy and paste this content** into the file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ubjrclaiqqxngfcylbfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVianJjbGFpcXF4bmdmY3lsYmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NzMzOTEsImV4cCI6MjA3OTU0OTM5MX0.Kkp7BV0ZSWq0ZR6YVOzwQwX08u3NOCxClvQWknWJlbA

# Backend API (only needed for login/signup)
VITE_API_BASE_URL=http://localhost:8000/api/v1
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

