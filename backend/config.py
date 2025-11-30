"""
Pixova AI - Configuration Management
Centralized, validated configuration with environment-based overrides
"""
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    Application settings with validation and sensible defaults.
    All values can be overridden via environment variables.
    """
    
    # ===========================================
    # APP CONFIGURATION
    # ===========================================
    app_name: str = "Pixova AI Design API"
    app_version: str = "2.0.0"
    environment: str = Field(default="development", description="development|staging|production")
    debug: bool = Field(default=False, description="Enable debug mode")
    
    # ===========================================
    # SERVER CONFIGURATION
    # ===========================================
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = Field(default=4, ge=1, le=32)
    
    # ===========================================
    # API CONFIGURATION
    # ===========================================
    a4f_api_key: str = Field(..., description="A4F API key (required)")
    a4f_base_url: str = "https://api.a4f.co/v1"
    api_timeout: int = Field(default=120, ge=10, le=300)
    
    # ===========================================
    # RATE LIMITING
    # ===========================================
    rate_limit_requests: int = Field(default=300, description="Requests per window (5/min)")
    rate_limit_window: int = Field(default=3600, description="Window in seconds (1 hour)")
    
    # ===========================================
    # CORS CONFIGURATION
    # ===========================================
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        description="Comma-separated list of allowed CORS origins"
    )
    
    # ===========================================
    # GENERATION DEFAULTS
    # ===========================================
    default_width: int = 1024
    default_height: int = 1024
    max_width: int = 2048
    max_height: int = 2048
    max_prompt_length: int = 2000
    
    # ===========================================
    # RETRY CONFIGURATION
    # ===========================================
    max_retries_per_model: int = Field(default=2, ge=1, le=5)
    retry_base_delay: float = Field(default=1.0, description="Base delay in seconds")
    retry_max_delay: float = Field(default=10.0, description="Max delay in seconds")
    
    # ===========================================
    # MODEL CONFIGURATION
    # ===========================================
    primary_model: str = "provider-5/flux-fast"
    fallback_models: str = Field(
        default="provider-4/flux-schnell,provider-4/imagen-4,provider-4/imagen-3.5,provider-4/qwen-image,provider-5/dall-e-2,provider-5/imagen-4-fast",
        description="Comma-separated list of fallback models"
    )
    
    # ===========================================
    # LOGGING
    # ===========================================
    log_level: str = Field(default="INFO", description="DEBUG|INFO|WARNING|ERROR")
    log_format: str = "json"  # json or text
    
    # ===========================================
    # VALIDATORS
    # ===========================================
    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"environment must be one of {allowed}")
        return v
    
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"log_level must be one of {allowed}")
        return v
    
    # ===========================================
    # COMPUTED PROPERTIES
    # ===========================================
    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        return self.environment == "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def fallback_models_list(self) -> List[str]:
        """Parse fallback models from comma-separated string"""
        return [model.strip() for model in self.fallback_models.split(",") if model.strip()]
    
    @property
    def all_models(self) -> List[str]:
        """Get full model chain (primary + fallbacks)"""
        return [self.primary_model] + self.fallback_models_list
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings loader.
    Settings are loaded once and cached for performance.
    """
    return Settings()


# Quick access alias
settings = get_settings()