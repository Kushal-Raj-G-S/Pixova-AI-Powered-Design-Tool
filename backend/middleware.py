"""
Pixova AI - Middleware
Request tracking, rate limiting, and error handling
"""
import time
from typing import Callable, Dict
from collections import defaultdict
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config import settings
from logger import (
    get_logger, 
    generate_request_id, 
    set_request_context, 
    clear_request_context
)
from exceptions import PixovaException, RateLimitError

logger = get_logger(__name__)


class RequestTrackingMiddleware(BaseHTTPMiddleware):
    """
    Adds request ID tracking and logging to all requests.
    Sets up logging context for the entire request lifecycle.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = request.headers.get("X-Request-ID", generate_request_id())
        
        # Extract user ID if present
        user_id = request.headers.get("X-User-ID", "anonymous")
        
        # Set logging context
        set_request_context(request_id, user_id)
        
        # Store on request state for access in routes
        request.state.request_id = request_id
        request.state.start_time = time.perf_counter()
        
        # Log incoming request
        logger.info(
            f"📥 {request.method} {request.url.path}")
        logger.debug(
            "Request details",
            client_ip=request.client.host if request.client else "unknown",
            request_id=request_id
        )
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = int((time.perf_counter() - request.state.start_time) * 1000)
            
            # Add tracking headers to response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time-Ms"] = str(duration_ms)
            
            # Log completion
            status_emoji = "✅" if response.status_code < 400 else "⚠️" if response.status_code < 500 else "❌"
            logger.info(
                f"{status_emoji} Completed in {duration_ms}ms (Status: {response.status_code})")
            
            return response
            
        except Exception as e:
            duration_ms = int((time.perf_counter() - request.state.start_time) * 1000)
            logger.error(
                "Request failed with unhandled exception",
                duration_ms=duration_ms,
                error_type=type(e).__name__
            )
            raise
        finally:
            clear_request_context()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting.
    For production, use Redis-based rate limiting.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self._requests: Dict[str, list] = defaultdict(list)
        self._limit = settings.rate_limit_requests
        self._window = settings.rate_limit_window
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP or user ID)
        client_id = request.headers.get(
            "X-User-ID",
            request.client.host if request.client else "unknown"
        )
        
        current_time = time.time()
        window_start = current_time - self._window
        
        # Clean old requests
        self._requests[client_id] = [
            t for t in self._requests[client_id] if t > window_start
        ]
        
        # Check limit
        if len(self._requests[client_id]) >= self._limit:
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                requests_in_window=len(self._requests[client_id])
            )
            
            retry_after = int(self._requests[client_id][0] - window_start) + 1
            error = RateLimitError(retry_after=retry_after)
            
            return JSONResponse(
                status_code=error.status_code,
                content=error.to_dict(),
                headers={"Retry-After": str(retry_after)}
            )
        
        # Record request
        self._requests[client_id].append(current_time)
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = self._limit - len(self._requests[client_id])
        response.headers["X-RateLimit-Limit"] = str(self._limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(window_start + self._window))
        
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Catches all exceptions and converts to proper JSON responses.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
            
        except PixovaException as e:
            # Our custom exceptions
            logger.warning(
                "Handled exception",
                error_code=e.error_code,
                message=e.message
            )
            
            response_data = e.to_dict()
            response_data["request_id"] = getattr(request.state, "request_id", None)
            
            return JSONResponse(
                status_code=e.status_code,
                content=response_data
            )
            
        except Exception as e:
            # Unexpected exceptions
            logger.error(
                "Unhandled exception",
                error_type=type(e).__name__,
                error=str(e)
            )
            
            # Don't expose internal errors in production
            message = str(e) if settings.is_development else "An unexpected error occurred"
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": message,
                        "details": {}
                    },
                    "request_id": getattr(request.state, "request_id", None)
                }
            )