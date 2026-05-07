# 🔒 Security Guide for Agente AI

**Last Updated**: December 10, 2025
**Severity**: CRITICAL - Read before deploying to production

---

## 📋 Table of Contents

1. [Pre-Deployment Security Checklist](#-pre-deployment-security-checklist)
2. [Credential Management](#-credential-management)
3. [Git Security](#-git-security)
4. [Environment Variables](#-environment-variables)
5. [Database Security](#-database-security)
6. [API Security](#-api-security)
7. [Frontend Security](#-frontend-security)
8. [Incident Response](#-incident-response)

---

## ✅ Pre-Deployment Security Checklist

### BEFORE First Git Push

- [ ] **Review `.gitignore`** - Ensure comprehensive coverage
- [ ] **Audit all committed files** - Check for accidental credential exposure
- [ ] **Move API keys to environment variables** - Remove from `.mcp.json`
- [ ] **Remove cached credentials from git** - Use `git rm --cached`
- [ ] **Check git history** - Search for accidentally committed secrets
- [ ] **Rotate any exposed credentials** - Regenerate all API keys
- [ ] **Remove virtual environments** - Exclude `venv/`, `node_modules/`
- [ ] **Test with dummy credentials** - Ensure app works with env vars
- [ ] **Enable 2FA on GitHub** - Secure your repository
- [ ] **Configure branch protection** - Prevent force pushes to main

### BEFORE Production Deployment

- [ ] **Enable HTTPS only** - No plain HTTP connections
- [ ] **Configure CORS properly** - Restrict origins in production
- [ ] **Set secure cookie flags** - httpOnly, secure, sameSite
- [ ] **Enable rate limiting** - Prevent brute force attacks
- [ ] **Configure CSP headers** - Content Security Policy
- [ ] **Enable database encryption** - At-rest and in-transit
- [ ] **Set up monitoring** - Sentry, LogRocket, or similar
- [ ] **Configure secrets manager** - AWS Secrets Manager, Vault, etc.
- [ ] **Implement audit logging** - Track all sensitive operations
- [ ] **Set up automated backups** - Daily database backups

---

## 🔑 Credential Management

### Current Exposed Credentials (URGENT ACTION REQUIRED)

#### 1. `.mcp.json` in Root Directory

**Status**: 🔴 EXPOSED - Contains Supabase credentials

**Current Content** (example):
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "eyJhbGc..."
      }
    }
  }
}
```

**ACTION REQUIRED**:

1. **Create `.mcp.json.example`** (safe template):
   ```json
   {
     "mcpServers": {
       "postgres": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@host:5432/database"],
         "env": {
           "SUPABASE_URL": "your_supabase_url_here",
           "SUPABASE_KEY": "your_supabase_anon_key_here"
         }
       }
     }
   }
   ```

2. **Move credentials to environment variables**:
   ```bash
   # Create .env file
   echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
   echo "SUPABASE_KEY=your_actual_key" >> .env
   ```

3. **Update `.mcp.json`** to read from env:
   ```json
   {
     "mcpServers": {
       "postgres": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
       }
     }
   }
   ```

4. **Remove from git tracking**:
   ```bash
   git rm --cached .mcp.json
   git add .mcp.json.example
   git commit -m "Security: Remove exposed credentials from .mcp.json"
   ```

#### 2. `frontend/.env`

**Status**: 🟡 PARTIALLY EXPOSED - May contain API keys

**ACTION REQUIRED**:

1. **Create `frontend/.env.example`**:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=http://localhost:8000
   ```

2. **Remove from git**:
   ```bash
   git rm --cached frontend/.env
   git add frontend/.env.example
   ```

#### 3. `backend_spare/configs/agent_config.yaml`

**Status**: 🟢 SAFE - No hardcoded secrets detected

**Best Practice**:
- Keep API key references as `${ANTHROPIC_API_KEY}`
- Never hardcode actual keys in YAML files

---

## 🔍 Git Security

### Removing Secrets from Git History

#### Step 1: Check for Exposed Secrets

```bash
# Search for common secret patterns in all git history
git log --all --full-history -- .mcp.json
git log --all --full-history -- frontend/.env
git log --all --full-history -- '*.key'

# Search for API keys in commit content
git log -S "SUPABASE_KEY" --all
git log -S "ANTHROPIC_API_KEY" --all
```

#### Step 2: Remove Secrets from History

**Option A: Using BFG Repo-Cleaner** (Recommended)

```bash
# Install BFG
brew install bfg  # macOS
# Or download from https://rtyley.github.io/bfg-repo-cleaner/

# Remove specific files from all history
bfg --delete-files .mcp.json
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Rewrites history)
git push --force --all
```

**Option B: Using git-filter-repo**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove files
git filter-repo --path .mcp.json --invert-paths
git filter-repo --path frontend/.env --invert-paths

# Force push
git push --force --all
```

**⚠️ WARNING**: Both methods rewrite git history. Coordinate with team before using.

#### Step 3: Rotate All Exposed Credentials

If secrets were pushed to GitHub, assume they are compromised:

1. **Supabase**:
   - Go to [app.supabase.com](https://app.supabase.com)
   - Settings → API → Regenerate keys
   - Update local `.env` files

2. **Anthropic API**:
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Delete old key
   - Generate new key
   - Update `backend_spare/.env`

3. **Database Passwords**:
   - Connect to Supabase dashboard
   - Settings → Database → Reset password
   - Update connection strings

---

## 🌍 Environment Variables

### Recommended Structure

```
agente-ai/
├── .env.example                    # Safe template (commit this)
├── .env                            # Local dev (NEVER commit)
├── frontend/
│   ├── .env.example               # Frontend template
│   └── .env                       # Frontend secrets (NEVER commit)
└── backend_spare/
    ├── .env.example               # Backend template
    └── .env                       # Backend secrets (NEVER commit)
```

### Root `.env.example`

```env
# ==========================================
# AGENTE AI - Environment Variables Template
# ==========================================
# Copy this to .env and fill in your values

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgresql://user:password@host:5432/database

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google Gemini API
GOOGLE_API_KEY=AIza...

# JWT Authentication
JWT_SECRET_KEY=your-random-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Application Settings
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=INFO

# CORS Settings
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Frontend `.env.example`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
VITE_BACKEND_URL=http://localhost:8000
VITE_BACKEND_WS_URL=ws://localhost:8000

# Feature Flags
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_OCR=true

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Backend `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agente_ai

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...

# Authentication
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Server Settings
HOST=0.0.0.0
PORT=8000
DEBUG=false

# CORS
CORS_ORIGINS=["http://localhost:5173","https://yourdomain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

---

## 🗄️ Database Security

### Supabase Security Configuration

#### Row Level Security (RLS)

**Enable RLS on all tables**:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Database Encryption

```sql
-- Enable encryption for sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE IF NOT EXISTS sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  encrypted_ssn BYTEA,  -- Store encrypted
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to encrypt
CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted, key);
END;
$$ LANGUAGE plpgsql;
```

#### Backup Strategy

```bash
# Automated daily backups
# Add to cron: 0 2 * * * /path/to/backup.sh

#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/agente-ai"
DB_NAME="agente_ai_db"

# Create backup
pg_dump -U postgres $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Encrypt backup
gpg --encrypt --recipient admin@agente-ai.com "$BACKUP_DIR/backup_$DATE.sql.gz"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz.gpg" s3://agente-ai-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz*" -mtime +30 -delete
```

---

## 🛡️ API Security

### FastAPI Security Middleware

#### Enable CORS Securely

```python
# backend_spare/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Production CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)
```

#### Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/analysis/")
@limiter.limit("10/minute")
async def analyze_transactions(request: Request):
    # Your endpoint logic
    pass
```

#### JWT Token Security

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Strong password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Increase for production
)

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Verify token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
```

#### Input Validation

```python
from pydantic import BaseModel, validator, constr
from typing import Optional

class TransactionCreate(BaseModel):
    amount: float
    description: constr(max_length=500)  # Limit input length
    category: Optional[str] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 10000000:  # 1 crore limit
            raise ValueError('Amount exceeds maximum allowed')
        return v

    @validator('description')
    def sanitize_description(cls, v):
        # Remove potential XSS attempts
        return v.replace('<', '').replace('>', '')
```

---

## 🌐 Frontend Security

### Content Security Policy (CSP)

Add to `frontend/index.html`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://your-project.supabase.co https://api.anthropic.com;">
```

### XSS Prevention

```typescript
// frontend/src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// Usage in components
import { sanitizeHTML } from '@/utils/sanitize';

function TransactionNote({ note }: { note: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(note) }} />;
}
```

### Secure Local Storage

```typescript
// frontend/src/utils/secureStorage.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_ENCRYPTION_KEY;

export const secureStorage = {
  setItem(key: string, value: any) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      ENCRYPTION_KEY
    ).toString();
    localStorage.setItem(key, encrypted);
  },

  getItem(key: string) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  },

  removeItem(key: string) {
    localStorage.removeItem(key);
  }
};
```

---

## 🚨 Incident Response

### If Credentials Are Compromised

#### Immediate Actions (Within 1 hour)

1. **Rotate all API keys**:
   ```bash
   # Script: rotate_keys.sh
   echo "🔴 INCIDENT RESPONSE: Rotating all credentials"

   # 1. Supabase
   echo "Rotating Supabase keys..."
   # Visit https://app.supabase.com → Settings → API → Regenerate

   # 2. Anthropic
   echo "Rotating Anthropic keys..."
   # Visit https://console.anthropic.com → Delete old, create new

   # 3. Database password
   echo "Changing database password..."
   # Supabase dashboard → Settings → Database → Reset password
   ```

2. **Revoke compromised tokens**:
   ```sql
   -- Invalidate all active sessions
   DELETE FROM user_sessions WHERE created_at < NOW();

   -- Force password reset for all users (if user data exposed)
   UPDATE users SET password_reset_required = true;
   ```

3. **Enable monitoring**:
   ```bash
   # Check for unauthorized access
   SELECT * FROM agent_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;

   # Check for suspicious transactions
   SELECT * FROM transactions
   WHERE created_at > NOW() - INTERVAL '1 hour'
   AND verified = false;
   ```

#### Within 24 Hours

1. **Audit all access logs**
2. **Review database for unauthorized changes**
3. **Notify affected users** (if personal data exposed)
4. **Update security documentation**
5. **Implement additional safeguards**

#### Within 1 Week

1. **Complete security audit**
2. **Update all dependencies**
3. **Implement automated secret scanning**
4. **Set up alerts for future incidents**

### Automated Secret Scanning

Add to `.github/workflows/security.yml`:

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

---

## 📞 Security Contacts

- **Security Issues**: security@agente-ai.com
- **Emergency**: Use GitHub Security Advisory
- **Bug Bounty**: Coming soon

---

## ✅ Security Checklist Summary

### Pre-Deployment
- [ ] All credentials in environment variables
- [ ] `.gitignore` configured correctly
- [ ] Git history cleaned of secrets
- [ ] All API keys rotated
- [ ] HTTPS enabled
- [ ] CORS properly configured

### Database
- [ ] Row Level Security enabled
- [ ] Encrypted backups configured
- [ ] Connection pooling enabled
- [ ] Sensitive data encrypted

### API
- [ ] Rate limiting enabled
- [ ] JWT tokens expire appropriately
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak information

### Frontend
- [ ] CSP headers configured
- [ ] XSS prevention implemented
- [ ] Sensitive data encrypted in localStorage
- [ ] No API keys in client-side code

### Monitoring
- [ ] Logging configured
- [ ] Alerts set up for security events
- [ ] Automated backups tested
- [ ] Incident response plan documented

---

**Last Updated**: December 10, 2025
**Next Review**: Monthly

*Remember: Security is not a one-time task, but an ongoing process.*
