"""
Pixova AI - Pydantic Models
Request/Response schemas with validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


# ===========================================
# ENUMS
# ===========================================

class DesignType(str, Enum):
    LOGO = "logo"
    # Future: SOCIAL = "social", FLYER = "flyer", etc.


class StylePreset(str, Enum):
    MODERN = "modern"
    CORPORATE = "corporate"
    CREATIVE = "creative"
    MINIMALIST = "minimalist"
    VIBRANT = "vibrant"
    ELEGANT = "elegant"


class ImageQuality(str, Enum):
    """Image quality/resolution presets"""
    STANDARD = "standard"      # 1024x1024
    HIGH = "high"              # 1536x1536  
    ULTRA = "ultra"            # 2048x2048


class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ===========================================
# REQUEST MODELS
# ===========================================

class GenerateRequest(BaseModel):
    """Logo generation request"""
    
    user_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Unique user identifier"
    )
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Logo description"
    )
    design_type: DesignType = Field(
        default=DesignType.LOGO,
        description="Type of design to generate"
    )
    style: StylePreset = Field(
        ...,  # Required - no default to ensure frontend sends correct value
        description="Style preset (modern, corporate, creative, minimalist, vibrant, elegant)"
    )
    width: int = Field(
        default=1024,
        ge=512,
        le=2048,
        description="Image width in pixels (auto-set by quality field)"
    )
    height: int = Field(
        default=1024,
        ge=512,
        le=2048,
        description="Image height in pixels (auto-set by quality field)"
    )
    num_variations: int = Field(
        default=1,
        ge=1,
        le=5,
        description="Number of design variations to generate"
    )
    quality: ImageQuality = Field(
        default=ImageQuality.HIGH,
        description="Image quality: standard (1024), high (1536), ultra (2048)"
    )
    brand_text: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Brand text to overlay on logo (optional, for client-side text rendering)"
    )
    include_text_in_ai: bool = Field(
        default=False,
        description="Whether to let AI generate text (False = cleaner results, use brand_text overlay instead)"
    )
    
    @field_validator("prompt")
    @classmethod
    def sanitize_prompt(cls, v: str) -> str:
        # Strip whitespace
        v = v.strip()
        # Remove excessive whitespace
        v = " ".join(v.split())
        return v
    
    @field_validator("width", "height")
    @classmethod
    def validate_dimensions(cls, v: int) -> int:
        # Ensure dimensions are multiples of 64 (common requirement)
        return (v // 64) * 64 if v % 64 != 0 else v
    
    # This is just for API documentation (/docs endpoint)
    # Shows example request when testing API
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "user_id": "user_abc123",
                "prompt": "Modern tech startup logo",
                "design_type": "logo",
                "style": "modern",
                "num_variations": 3,
                "quality": "high"
            }]
        }
    }


# ===========================================
# RESPONSE MODELS
# ===========================================

class ErrorDetail(BaseModel):
    """Error details structure"""
    code: str
    message: str
    details: dict = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: Literal[False] = False
    error: ErrorDetail
    request_id: Optional[str] = None


class GenerationMetrics(BaseModel):
    """Generation performance metrics"""
    model_used: str
    attempts: int
    generation_time_ms: int
    total_time_ms: int


class DesignVariation(BaseModel):
    """Single design variation"""
    image_url: str = Field(..., description="Generated image URL")
    variation_number: int = Field(..., description="Variation number (1, 2, 3, etc.)")
    model_used: str = Field(..., description="AI model that generated this")
    generation_time_ms: int = Field(..., description="Time taken to generate")


class GenerateResponse(BaseModel):
    """Successful generation response"""
    success: Literal[True] = True
    request_id: str
    design_type: DesignType
    prompt: str
    num_generated: int = Field(..., description="Number of variations generated")
    variations: List[DesignVariation] = Field(..., description="Generated design variations")
    total_time_ms: int = Field(..., description="Total generation time")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # API documentation example - shows what response looks like
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "success": True,
                "request_id": "req_abc123",
                "design_type": "logo",
                "prompt": "Modern tech logo",
                "num_generated": 2,
                "variations": [
                    {"image_url": "https://...", "variation_number": 1, "model_used": "flux-schnell", "generation_time_ms": 2500},
                    {"image_url": "https://...", "variation_number": 2, "model_used": "flux-schnell", "generation_time_ms": 2300}
                ],
                "total_time_ms": 5000
            }]
        }
    }


# ===========================================
# INTERNAL MODELS
# ===========================================

class GenerationResult(BaseModel):
    """Internal generation result from LogoGenerator"""
    success: bool
    image_url: Optional[str] = None
    model: str
    attempt: int
    generation_time_ms: int
    error: Optional[str] = None


# ===========================================
# HEALTH CHECK MODELS
# ===========================================

class ServiceHealth(BaseModel):
    """Individual service health status"""
    status: Literal["healthy", "degraded", "unhealthy"]
    latency_ms: Optional[int] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    environment: str
    uptime_seconds: int
    services: dict[str, ServiceHealth]