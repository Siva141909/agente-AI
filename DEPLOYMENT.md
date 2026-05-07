# Agente AI — Deployment Guide

## Architecture

```
Frontend (React/Vite)  →  Vercel / Netlify
Backend (FastAPI)       →  Railway / Render / VPS
Database               →  Supabase (PostgreSQL)
AI Agents              →  Runs with backend (needs ANTHROPIC_API_KEY)
```

---

## Step 1 — Unpause / Set Up Supabase

Since Supabase pauses free-tier projects after 1 week of inactivity:

1. Go to https://app.supabase.com and log in
2. Find your project and click **Resume project**
3. If you need to recreate the database, run `database/schema.sql` in the SQL editor
4. Get your credentials: **Project Settings → API**
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Configure Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
VITE_SPARE_API_URL=https://your-backend.railway.app/api
```

### Backend (`backend_spare/.env`)
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
DATABASE_URL=postgresql://postgres:password@db.yourproject.supabase.co:5432/postgres
SECRET_KEY=generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://your-app.vercel.app
CLAUDE_MODEL=claude-sonnet-4-5
```

---

## Step 3 — Deploy Backend (Railway — recommended)

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. From `backend_spare/`:
   ```bash
   railway init
   railway up
   ```
4. Set environment variables in Railway dashboard
5. Note your backend URL (e.g. `https://agente-backend.railway.app`)

### Alternative: Docker

```bash
cd backend_spare
docker build -t agente-backend .
docker run -p 8000:8000 --env-file .env agente-backend
```

### Alternative: Render

1. Create a new Web Service pointing to `backend_spare/`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all env vars in Render dashboard

---

## Step 4 — Deploy Frontend (Vercel — recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. From `frontend/`:
   ```bash
   vercel --prod
   ```
3. Or connect GitHub repo in Vercel dashboard:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add all `VITE_*` environment variables in Vercel dashboard

---

## Step 5 — Seed Government Schemes (one-time)

Run this in Supabase SQL Editor to populate the government schemes table (already included at the bottom of `database/schema.sql`).

---

## Step 6 — Configure MCP for AI Agents

The 9 AI agents use Claude's MCP (Model Context Protocol) to read/write the database. Create a `.mcp.json` in `backend_spare/`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-supabase-service-role-key"
      }
    }
  }
}
```

> The service role key is in Supabase: Project Settings → API → service_role (secret)

---

## Step 7 — Verify Deployment

- Frontend loads: https://your-app.vercel.app
- Backend health: https://your-backend.railway.app/api/health
- Signup/login works
- Dashboard shows transactions
- AI analysis triggered on login (runs 9 agents in background)

---

## Local Development

```bash
# Terminal 1: Backend
cd backend_spare
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

---

## Supabase: Preventing Pauses

Free Supabase projects pause after 7 days of inactivity. To prevent this:
1. Upgrade to Supabase Pro ($25/month)
2. Or set up a cron job to ping your DB every 5 days
3. Or use the backend's `/api/health` endpoint as a keepalive (hit it via UptimeRobot)

---

## Checklist Before Going Live

- [ ] Supabase project active (not paused)
- [ ] `database/schema.sql` has been run (all tables exist)
- [ ] All env vars set in both frontend and backend
- [ ] Backend CORS `ALLOWED_ORIGINS` set to your frontend domain
- [ ] `ANTHROPIC_API_KEY` is valid and has credits
- [ ] Frontend `vercel.json` is in place (SPA rewrites)
- [ ] Test signup → dashboard → transaction flow end-to-end
- [ ] Test AI analysis by checking recommendations after login
