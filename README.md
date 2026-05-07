# Agente AI - AI-Powered Financial Platform for Gig Workers

<div align="center">

[![Frontend](https://img.shields.io/badge/Frontend-React%2BTypeScript-61DAFB)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![AI](https://img.shields.io/badge/AI-Claude%20%2B%20Gemini-4285F4)](https://anthropic.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)

🌐 **Live Demo**: https://kamai-quadrabucks.vercel.app/


**Empowering 230 Million Gig Workers with AI-Driven Financial Stability**

[Quick Start](#quick-start) • [Features](#features) • [Documentation](docs/) • [Architecture](#architecture)

</div>

---

## Overview

Agente AI is a full-stack financial management platform designed specifically for gig workers with variable income. It uses multiple specialized AI agents to provide personalized financial coaching, budget planning, and tax optimization.

### Key Features

- 🤖 **12 Specialized AI Agents** - Pattern recognition, budget planning, tax optimization, risk assessment
- 📊 **16 Feature-Rich Pages** - Dashboard, transactions, budget, tax, benefits, analytics
- 🎤 **Multi-Modal Input** - Text, voice, and image-based transaction entry
- 📈 **Real-Time Analytics** - Income patterns, spending trends, financial forecasts
- 🔒 **Secure & Private** - Row-level security, encrypted data storage
- 📱 **Mobile Responsive** - Works seamlessly on all devices

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL (or Supabase account)
- API Keys: Anthropic Claude, Google Gemini (optional)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd "agente AI"
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Supabase credentials

npm run dev
# Frontend runs at http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend_spare
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

uvicorn main:app --reload
# Backend runs at http://localhost:8000
```

### 4. Transaction Parser (Optional)

```bash
cd backend/transaction_parser

# Option 1: Full ML stack (local models)
pip install -r transaction_parser_requirements.txt
python simple_api_server.py

# Option 2: Lightweight API (cloud-based)
pip install -r requirements_inference_api.txt
python simple_api_server_inference.py

# Parser API runs at http://localhost:8001
```

---

## Project Structure

```
agente-ai/
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/             # 16 route pages
│   │   ├── components/        # 59 UI components
│   │   ├── services/          # API & database clients
│   │   └── contexts/          # Global state management
│   └── package.json
│
├── backend_spare/              # FastAPI + AI Agents
│   ├── agents/                # 12 specialized AI agents
│   ├── configs/               # Agent configuration
│   ├── main.py                # FastAPI application
│   └── requirements.txt
│
├── backend/
│   ├── transaction_parser/    # Multi-modal transaction input
│   └── tests/                 # Test suite
│
├── docs/                       # Documentation
│   ├── INSTALLATION_AND_SETUP.md
│   ├── SECURITY_GUIDE.md
│   └── ... (15+ documentation files)
│
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## Features

### Frontend (React + TypeScript)

- **Dashboard** - Financial overview with real-time stats
- **Transactions** - Transaction history and management
- **Budget** - Dynamic budget planning and tracking
- **Tax** - Tax optimization and ITR filing assistance
- **Benefits** - Government scheme recommendations
- **Analytics** - Income/expense patterns and forecasts
- **Profile** - User settings and preferences

### Backend (AI Agents)

1. **Pattern Recognition Agent** - Identifies income/expense patterns
2. **Budget Analysis Agent** - Creates dynamic budgets
3. **Volatility Forecaster** - Predicts income fluctuations
4. **Tax Planning Agent** - Automates tax calculations
5. **Risk Assessment Agent** - Evaluates financial risks
6. **Recommendation Agent** - Provides actionable advice
7. **Knowledge Integration Agent** - Matches government schemes
8. **Context Intelligence Agent** - Weather & seasonal analysis
9. **Action Planning Agent** - Creates action plans
10. **Financial Agent** - General financial analysis
11. **Monitor Agent** - System monitoring
12. **Scheduler Agent** - Task scheduling

### Transaction Parser

- **Image OCR** - Extract data from receipt photos (TrOCR)
- **Voice Input** - Speak transactions naturally (Whisper AI)
- **Auto-Categorization** - Intelligent category detection
- **Confidence Scores** - Reliability indicators

---

## Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- TanStack Query (data fetching)
- React Router (routing)

**Backend**
- FastAPI (Python web framework)
- Claude Agent SDK (AI orchestration)
- SQLAlchemy (ORM)
- PostgreSQL/Supabase (database)

**AI/ML**
- Anthropic Claude Sonnet (agent orchestration)
- Google Gemini Pro (pattern recognition)
- Hugging Face Transformers (image/voice processing)

### Database Schema

12 core tables:
- `users` - User authentication & profiles
- `transactions` - Financial transactions
- `budgets` - Dynamic budget plans
- `recommendations` - AI-generated advice
- `income_patterns` - Detected patterns
- `outcomes` - Verification & learning
- `government_schemes` - Available schemes
- `tax_records` - Tax calculations
- `agent_logs` - Audit trail
- `notifications` - User alerts
- And 2 more...

See [docs/DATABASE_TABLES_DOCUMENTATION.md](docs/DATABASE_TABLES_DOCUMENTATION.md) for details.

---

## Environment Variables

### Frontend `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8000
```

### Backend `.env`

```env
# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agente_ai

# Authentication
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

See [docs/SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md) for security best practices.

---

## Development

### Run Frontend Dev Server

```bash
cd frontend
npm run dev
```

### Run Backend Dev Server

```bash
cd backend_spare
uvicorn main:app --reload
```

### Run Tests

```bash
# Backend tests
cd backend/tests
python test_backend_quick.py

# Frontend tests (if configured)
cd frontend
npm test
```

---

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
vercel --prod
# or: netlify deploy --prod --dir=dist
```

### Backend (Railway/Render)

```bash
cd backend_spare
railway up
# or use Docker
docker build -t agente-ai-backend .
docker run -p 8000:8000 agente-ai-backend
```

---

## Documentation

- [Installation & Setup](docs/INSTALLATION_AND_SETUP.md)
- [Security Guide](docs/SECURITY_GUIDE.md)
- [Database Documentation](docs/DATABASE_TABLES_DOCUMENTATION.md)
- [Transaction Parser Guide](docs/TRANSACTION_PARSER_README.md)
- [Backend Test Report](docs/BACKEND_TEST_REPORT.md)
- [Frontend Implementation Status](docs/FRONTEND_IMPLEMENTATION_STATUS.md)
- [Agents-API-Database Mapping](docs/AGENTS_API_DATABASE_MAPPING.md)

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Code Style:**
- Python: PEP 8, type hints
- TypeScript: ESLint configuration
- Commits: Conventional commit format

---

## License

This project is for educational and research purposes.

---

## Acknowledgments

- **Anthropic Claude** - AI agent orchestration
- **Google Gemini** - Pattern recognition LLM
- **Supabase** - Database hosting
- **Hugging Face** - ML models & transformers
- **shadcn/ui** - UI component library

---

<div align="center">

**Built for 230 Million Gig Workers**

⭐ Star this repo if you find it helpful

*Version 2.0.0 | Last Updated: December 10, 2025*

</div>
