"""
Pixova AI Design Tool - Main Application
Production-grade FastAPI backend
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from logger import setup_logging, get_logger
from models import (
    GenerateRequest,
    GenerateResponse,
    DesignVariation,
    HealthResponse,
    ServiceHealth,
    ErrorResponse
)
from exceptions import UnsupportedDesignTypeError
from middleware import (
    RequestTrackingMiddleware,
    RateLimitMiddleware,
    ErrorHandlingMiddleware
)
from logo_generator import logo_generator
from utils import proxy_image_download

# Initialize logging
setup_logging(
    level=settings.log_level,
    format_type="text" if settings.is_development else "json"
)

logger = get_logger(__name__)

# Track startup time for health checks
START_TIME = time.time()


# ===========================================
# APPLICATION LIFESPAN
# ===========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    
    # Startup
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting in {settings.environment} mode")
    logger.info(f"🤖 Configured with {len(settings.all_models)} AI models (primary: {settings.primary_model})")
    logger.info(f"🛡️  Rate limit: {settings.rate_limit_requests} requests per {settings.rate_limit_window//60} minutes")
    
    yield
    
    # Shutdown
    logger.info("Application shutting down")


# ===========================================
# APPLICATION SETUP
# ===========================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered design generation API",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# ===========================================
# MIDDLEWARE (order matters - first added = last executed)
# ===========================================

# Error handling (outermost - catches all errors)
app.add_middleware(ErrorHandlingMiddleware)

# Rate limiting
app.add_middleware(RateLimitMiddleware)

# Request tracking
app.add_middleware(RequestTrackingMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=[
        "X-Request-ID",
        "X-Response-Time-Ms",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset"
    ]
)


# ===========================================
# ROUTES
# ===========================================

@app.get("/", tags=["System"])
async def root():
    """API information endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "endpoints": {
            "generate": "POST /api/generate",
            "health": "GET /health"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Comprehensive health check endpoint.
    Checks all dependent services.
    """
    uptime = int(time.time() - START_TIME)
    
    # Check logo generator
    generator_health = await logo_generator.health_check()
    
    # Determine overall status
    services = {
        "logo_generator": ServiceHealth(
            status=generator_health.get("status", "unknown"),
            latency_ms=generator_health.get("latency_ms"),
            message=generator_health.get("error")
        )
    }
    
    all_healthy = all(s.status == "healthy" for s in services.values())
    any_unhealthy = any(s.status == "unhealthy" for s in services.values())
    
    if all_healthy:
        overall_status = "healthy"
    elif any_unhealthy:
        overall_status = "unhealthy"
    else:
        overall_status = "degraded"
    
    return HealthResponse(
        status=overall_status,
        version=settings.app_version,
        environment=settings.environment,
        uptime_seconds=uptime,
        services=services
    )


@app.post(
    "/api/generate",
    response_model=GenerateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Generation failed"}
    },
    tags=["Generation"]
)
async def generate_design(request: GenerateRequest, req: Request):
    """
    Generate an AI-powered design.
    
    Currently supports:
    - **logo**: Company logos and brand marks
    
    Coming soon:
    - social: Social media graphics
    - flyer: Marketing flyers
    - banner: Web banners
    """
    request_id = getattr(req.state, "request_id", "unknown")
    start_time = time.perf_counter()
    
    # DEBUG: Log incoming style to catch frontend/backend mismatch
    logger.info(f"🎨 New {request.design_type.value} request: '{request.prompt[:60]}{'...' if len(request.prompt) > 60 else ''}'")
    logger.info(f"🎨 STYLE SELECTED: {request.style.value} (raw: {request.style})")
    logger.debug(
        "Request details",
        style=request.style.value,
        quality=request.quality.value,
        size=f"{request.width}x{request.height}",
        user_id=request.user_id
    )
    
    # Apply quality preset to dimensions
    quality_sizes = {
        "standard": (1024, 1024),
        "high": (1536, 1536),
        "ultra": (2048, 2048)
    }
    width, height = quality_sizes.get(request.quality.value, (1024, 1024))
    logger.info(f"📐 Quality: {request.quality.value} → {width}x{height} pixels")
    
    # Route to appropriate generator
    if request.design_type.value == "logo":
        result = await logo_generator.generate(
            user_id=request.user_id,
            prompt=request.prompt,
            style=request.style.value,
            width=width,
            height=height,
            num_variations=request.num_variations,
            include_text_in_ai=request.include_text_in_ai
        )
    else:
        # This shouldn't happen due to Pydantic validation, but just in case
        raise UnsupportedDesignTypeError(
            design_type=request.design_type.value,
            supported=["logo"]
        )
    
    total_time_ms = int((time.perf_counter() - start_time) * 1000)
    
    return GenerateResponse(
        success=True,
        request_id=request_id,
        design_type=request.design_type,
        prompt=request.prompt,
        num_generated=result["num_generated"],
        variations=result["variations"],
        total_time_ms=result["total_time_ms"]
    )


@app.get("/api/download", tags=["Utility"])
async def download_image(url: str):
    """
    Proxy endpoint for downloading generated images.
    Adds proper CORS and download headers.
    
    Args:
        url: The image URL to download
        
    Returns:
        Image file with download headers
    """
    return await proxy_image_download(url)


# ===========================================
# ENTRY POINT
# ===========================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
        workers=1 if settings.is_development else settings.workers,
        log_level=settings.log_level.lower(),
        access_log=settings.is_development
    )