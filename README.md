# 🎨 Pixova - AI-Powered Design Tool

**Professional AI design generation platform** with multi-model fallback, smart storage management, and comprehensive user management.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://www.python.org/)

---

## ✨ Features

### 🚀 **AI Generation**
- **7 AI Model Fallback Chain** - 99.9% uptime with automatic failover
- **Multiple Variations** - Generate up to 5 designs at once
- **6 Style Presets** - Modern, Corporate, Creative, Minimalist, Vibrant, Elegant
- **3 Quality Levels** - Standard (1024px), High (1536px), Ultra (2048px)
- **Text Overlay System** - Add perfect typography with manual or AI-generated text

### 💾 **Smart Storage**
- **Organized Structure** - `userId/prompt_folder/images.png`
- **Auto-Expiry by Plan** - Free (5d), Pro (10d), Enterprise (15d), Admin (20d)
- **Automated Cleanup** - Daily cron job removes expired designs
- **Permanent URLs** - Supabase Storage integration

### 👥 **User Management**
- **4 Plan Tiers** - Free, Pro, Enterprise, Admin
- **Credit System** - Automatic deduction with transaction logging
- **Activity Tracking** - Full audit log of user actions
- **Streak Counter** - Gamified engagement tracking
- **Achievement System** - Unlock badges and milestones

### 📊 **Dashboard**
- **Real-Time Stats** - Designs created, credits remaining, active projects
- **Recent Activity** - Track all user actions
- **Recent Designs** - Quick access to latest creations
- **Plan Management** - Easy upgrade/downgrade

### 🛡️ **Production-Ready**
- **Rate Limiting** - 100 req/hour per IP
- **Request Tracking** - Unique IDs for debugging
- **Structured Logging** - JSON logs with full context
- **Health Checks** - Service monitoring endpoints
- **Error Handling** - Graceful failures with detailed messages
- **CORS Configured** - Secure cross-origin requests

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │  TypeScript, Tailwind CSS, Framer Motion
│   (Frontend)    │  
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│  FastAPI Server │  Python, Pydantic, OpenAI SDK
│   (Backend)     │  Rate Limiting, Model Fallback
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬────────────┐
    │         │              │            │
┌───▼──┐  ┌──▼───┐  ┌───────▼──────┐  ┌─▼────────┐
│ A4F  │  │ FLUX │  │   Imagen-4   │  │ DALL-E 2 │
│ API  │  │      │  │   (Google)   │  │ (OpenAI) │
└──────┘  └──────┘  └──────────────┘  └──────────┘
         
┌─────────────────┐
│   Supabase DB   │  PostgreSQL + Storage + Auth
│   (Database)    │  RLS, Triggers, Cron Jobs
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase Account
- A4F API Key

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd pixova-ai-design-tool
```

### 2. Setup Database
```bash
cd db
# Follow instructions in db/README.md
# Run schema.sql, functions.sql, add_expiry.sql in Supabase SQL Editor
```

### 3. Setup Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your A4F_API_KEY

python main.py
# Server runs on http://localhost:8000
```

### 4. Setup Frontend
```bash
cd frontend
npm install

# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

npm run dev
# App runs on http://localhost:3000
```

### 5. Test the Flow
1. Sign up at `http://localhost:3000/auth/signup`
2. Go to `/generate` and create a design
3. Check dashboard for stats
4. View designs in `/my-designs`

---

## 📁 Project Structure

```
pixova-ai-design-tool/
├── backend/                 # FastAPI server
│   ├── main.py             # API routes
│   ├── logo_generator.py   # AI generation logic
│   ├── config.py           # Environment config
│   ├── models.py           # Pydantic schemas
│   ├── middleware.py       # Rate limiting, tracking
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Next.js app
│   ├── app/               # Pages (App Router)
│   │   ├── dashboard/     # User dashboard
│   │   ├── generate/      # AI generation UI
│   │   ├── my-designs/    # Design library
│   │   └── auth/          # Login/signup
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   │   ├── database.ts   # Supabase queries
│   │   ├── supabase.ts   # Supabase client + storage
│   │   └── textOverlay.ts # Text rendering
│   └── contexts/         # React contexts
│
├── db/                    # Database scripts
│   ├── schema.sql        # Tables, indexes, RLS
│   ├── functions.sql     # DB functions, triggers
│   ├── add_expiry.sql    # Auto-expiry system
│   ├── setup_cleanup_cron.sql  # Daily cleanup job
│   └── create_storage_bucket.sql # Storage policies
│
└── README.md             # This file
```

---

## 🎯 Key Features Explained

### Multi-Model Fallback
If primary AI model fails, automatically tries 6 backup models:
```
flux-fast → flux-schnell → imagen-4 → imagen-3.5 → qwen-image → dall-e-2 → imagen-4-fast
```

### Auto-Expiry System
Designs automatically expire based on user plan:
- **Free**: 5 days
- **Pro**: 10 days
- **Enterprise**: 15 days
- **Admin**: 20 days

Daily cron job (2 AM UTC) deletes expired designs from both database and storage.

### Credit System
- **Free Plan**: 100 credits
- **Pro Plan**: 2000 credits
- **Enterprise**: 10,000 credits
- **Admin**: Unlimited (999,999)

Each design generation costs 1 credit. Automatic deduction via database trigger.

### Storage Organization
```
designs/
  └── {user_id}/
      └── modern_tech_startup/
          ├── 1732387200000_logo_1.png
          ├── 1732387200000_logo_2.png
          └── 1732387200000_logo_3.png
```

---

## 🔧 Configuration

### Backend (.env)
```env
A4F_API_KEY=your_api_key
A4F_BASE_URL=https://api.a4f.co/v1
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
LOG_LEVEL=INFO
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📊 API Endpoints

### Backend (FastAPI)
- `POST /api/generate` - Generate AI design
- `GET /api/download?url=<url>` - Download image
- `GET /health` - Health check
- `GET /` - API info

### Frontend (Next.js API Routes)
- `POST /api/generate/route.ts` - Generation wrapper (empty)

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm run test
```

### Manual Test
```bash
# Test generation
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","prompt":"modern logo","design_type":"logo"}'
```

---

## 🚢 Deployment

### Backend (Docker)
```bash
cd backend
docker build -t pixova-backend .
docker run -p 8000:8000 pixova-backend
```

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Database (Supabase)
Already hosted! Just run SQL scripts in dashboard.

---

## 🛠️ Maintenance

### Daily Tasks
- ✅ Auto-cleanup runs at 2 AM UTC (setup_cleanup_cron.sql)

### Weekly Tasks
- Check error logs: `backend/logs/`
- Monitor credit usage: See db/README.md
- Review storage usage in Supabase Dashboard

### Monthly Tasks
- Clean old activity logs
- Review user plan distribution
- Check API model performance

---

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `A4F_API_KEY` | A4F API authentication | ✅ Yes | - |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ Yes | - |
| `PORT` | Backend port | ❌ No | 8000 |
| `ENVIRONMENT` | dev/prod | ❌ No | development |
| `RATE_LIMIT_REQUESTS` | Max requests/window | ❌ No | 100 |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

### Documentation
- [Backend README](backend/README.md)
- [Database README](db/README.md)

### Troubleshooting
- Check logs in `backend/logs/`
- View Supabase logs in Dashboard
- Run health check: `http://localhost:8000/health`

### Common Issues
**Port already in use:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

**Database connection failed:**
- Check Supabase URL and anon key in `.env.local`
- Verify RLS policies are enabled

**Image not saving:**
- Check storage bucket exists and is public
- Verify storage policies are applied

---

## 🎉 Acknowledgments

- **Next.js** - React framework
- **FastAPI** - Python web framework
- **Supabase** - Backend as a service
- **A4F** - AI model provider
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS

---

**Built with ❤️ for creators worldwide** 🚀

*Version 2.0.0 - Production Ready*
