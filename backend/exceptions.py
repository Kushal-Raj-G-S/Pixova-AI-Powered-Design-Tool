"""
Pixova AI - Custom Exceptions
Structured error handling with proper HTTP mapping
"""
from typing import Optional, Dict, Any


class PixovaException(Exception):
    """Base exception for all Pixova errors"""
    
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        original_error: Optional[Exception] = None
    ):
        self.message = message
        self.details = details or {}
        self.original_error = original_error
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": False,
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details
            }
        }


# ===========================================
# CLIENT ERRORS (4xx)
# ===========================================

class ValidationError(PixovaException):
    """Invalid request data"""
    status_code = 400
    error_code = "VALIDATION_ERROR"


class PromptTooLongError(ValidationError):
    """Prompt exceeds maximum length"""
    error_code = "PROMPT_TOO_LONG"
    
    def __init__(self, length: int, max_length: int):
        super().__init__(
            f"Prompt length ({length}) exceeds maximum ({max_length})",
            details={"length": length, "max_length": max_length}
        )


class InvalidDimensionsError(ValidationError):
    """Image dimensions out of allowed range"""
    error_code = "INVALID_DIMENSIONS"
    
    def __init__(self, width: int, height: int, max_width: int, max_height: int):
        super().__init__(
            f"Dimensions {width}x{height} exceed maximum {max_width}x{max_height}",
            details={
                "width": width, "height": height,
                "max_width": max_width, "max_height": max_height
            }
        )


class UnsupportedDesignTypeError(ValidationError):
    """Design type not supported"""
    error_code = "UNSUPPORTED_DESIGN_TYPE"
    
    def __init__(self, design_type: str, supported: list):
        super().__init__(
            f"Design type '{design_type}' not supported",
            details={"requested": design_type, "supported": supported}
        )


class RateLimitError(PixovaException):
    """Rate limit exceeded"""
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"
    
    def __init__(self, retry_after: int = 60):
        super().__init__(
            "Rate limit exceeded. Please slow down.",
            details={"retry_after_seconds": retry_after}
        )
        self.retry_after = retry_after


# ===========================================
# SERVER ERRORS (5xx)
# ===========================================

class GenerationError(PixovaException):
    """Logo generation failed"""
    status_code = 500
    error_code = "GENERATION_FAILED"


class AllModelsFailedError(GenerationError):
    """All models in fallback chain failed"""
    error_code = "ALL_MODELS_FAILED"
    
    def __init__(self, models_tried: int, last_error: str):
        super().__init__(
            f"All {models_tried} models failed to generate image",
            details={"models_tried": models_tried, "last_error": last_error}
        )


class APIConnectionError(GenerationError):
    """Failed to connect to external API"""
    error_code = "API_CONNECTION_ERROR"
    status_code = 502


class APITimeoutError(GenerationError):
    """External API request timed out"""
    error_code = "API_TIMEOUT"
    status_code = 504


class ConfigurationError(PixovaException):
    """Application misconfiguration"""
    status_code = 500
    error_code = "CONFIGURATION_ERROR"