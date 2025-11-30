# Pixova AI Backend - FastAPI Server

Production-grade AI design generation API with automatic failover, rate limiting, and comprehensive logging.

## 🚀 Quick Start

### 1. Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Or Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment
Create `.env` file with:
```env
# API Configuration
A4F_API_KEY=your_a4f_api_key_here
A4F_BASE_URL=https://api.a4f.co/v1

# Server Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development  # or production
WORKERS=4

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600  # seconds

# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

### 4. Run Server
```powershell
# Development (auto-reload)
python main.py

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Server starts at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## 📡 API Endpoints

### POST /api/generate
Generate AI-powered design with automatic model fallback

**Request Body:**
```json
{
  "user_id": "uuid-here",
  "prompt": "A modern tech startup logo with blue and purple gradient",
  "design_type": "logo",
  "style": "modern",
  "quality": "high",
  "num_variations": 3,
  "include_text_in_ai": false
}
```

**Query Parameters:**
- `design_type`: `logo` (more coming soon)
- `style`: `modern`, `corporate`, `creative`, `minimalist`, `vibrant`, `elegant`
- `quality`: `standard` (1024px), `high` (1536px), `ultra` (2048px)
- `num_variations`: 1-5 (generates multiple options)

**Response:**
```json
{
  "success": true,
  "request_id": "req_abc123",
  "design_type": "logo",
  "prompt": "A modern tech startup logo...",
  "num_generated": 3,
  "variations": [
    {
      "variation_number": 1,
      "success": true,
      "image_url": "https://...",
      "prompt": "Enhanced prompt",
      "model_used": "provider-5/flux-fast",
      "generation_time_ms": 2341
    }
  ],
  "total_time_ms": 7023
}
```

### GET /api/download?url=<image_url>
Proxy endpoint for downloading images with CORS headers

### GET /health
Comprehensive health check with service status

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "environment": "development",
  "uptime_seconds": 3600,
  "services": {
    "logo_generator": {
      "status": "healthy",
      "latency_ms": 45
    }
  }
}
```

## 🤖 AI Model Fallback Chain

Automatic failover ensures 99.9% uptime:

1. **Primary**: `provider-5/flux-fast` (Fastest, best quality)
2. **Fallback 1**: `provider-4/flux-schnell` (Fast alternative)
3. **Fallback 2**: `provider-4/imagen-4` (Google's latest)
4. **Fallback 3**: `provider-4/imagen-3.5` (Stable fallback)
5. **Fallback 4**: `provider-4/qwen-image` (Asian market specialist)
6. **Fallback 5**: `provider-5/dall-e-2` (OpenAI classic)
7. **Fallback 6**: `provider-5/imagen-4-fast` (Speed backup)

If primary fails → automatically tries next model → ensures generation success

## 🛡️ Features

- **Rate Limiting**: 100 req/hour per IP (configurable)
- **Request Tracking**: Unique request IDs for debugging
- **Error Handling**: Structured error responses with details
- **CORS**: Configured for frontend integration
- **Logging**: JSON/text logs with request tracing
- **Health Checks**: Monitor service status
- **Style Presets**: 6 curated design styles
- **Multi-Generation**: Create up to 5 variations per request

## 🧪 Testing

### Test with curl (PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/generate" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"user_id":"test","prompt":"minimalist tech logo","design_type":"logo","style":"modern","num_variations":1}'
```

### Test with Python
```python
import requests

response = requests.post('http://localhost:8000/api/generate', json={
    'user_id': 'test',
    'prompt': 'elegant coffee shop logo',
    'design_type': 'logo',
    'style': 'elegant',
    'quality': 'high',
    'num_variations': 3
})

print(response.json())
```

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI app + routes
├── config.py            # Environment configuration
├── models.py            # Pydantic data models
├── logo_generator.py    # AI generation logic
├── middleware.py        # Rate limiting, tracking, errors
├── exceptions.py        # Custom exceptions
├── logger.py            # Structured logging
├── utils.py             # Helper functions
├── quality_validator.py # Output validation
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (production)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📊 Monitoring

- **Logs**: Check `logs/` directory for JSON logs
- **Health**: `GET /health` returns service status
- **Metrics**: Request IDs tracked in headers (`X-Request-ID`)

## 🔧 Troubleshooting

**Port already in use:**
```powershell
# Find process on port 8000
netstat -ano | findstr :8000
# Kill process
taskkill /PID <pid> /F
```

**Module not found:**
```powershell
pip install -r requirements.txt --upgrade
```

**API key invalid:**
Check `.env` file has correct `A4F_API_KEY`

---

Built with ❤️ using FastAPI • Production-ready • Highly scalable 🚀
