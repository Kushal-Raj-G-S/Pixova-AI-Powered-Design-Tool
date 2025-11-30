# ===========================================
# Pixova AI - Production Dockerfile
# Multi-stage build for minimal image size
# ===========================================

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Stage 2: Production
FROM python:3.11-slim as production

WORKDIR /app

# Create non-root user for security
RUN groupadd -r pixova && useradd -r -g pixova pixova

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=pixova:pixova . .

# Remove unnecessary files
RUN rm -rf tests/ .git/ .env.example Dockerfile .dockerignore

# Switch to non-root user
USER pixova

# Environment defaults
ENV ENVIRONMENT=production \
    HOST=0.0.0.0 \
    WORKERS=2 \
    LOG_LEVEL=INFO \
    LOG_FORMAT=json \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Expose port (Heroku will override with $PORT)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health', timeout=5).raise_for_status()"

# Run with gunicorn for production
# Note: Heroku will override the port with $PORT environment variable
# Reduced workers and timeout to work within Heroku's 30s limit
CMD gunicorn main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WORKERS:-1} \
    --timeout 300 \
    --graceful-timeout 300 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -