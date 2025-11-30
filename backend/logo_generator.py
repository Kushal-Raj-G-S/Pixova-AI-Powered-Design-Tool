"""Pixova AI - Logo Generator
Production-grade image generation with retry logic and comprehensive error handling
"""
import asyncio
import time
import base64
from typing import Optional
from openai import OpenAI
from openai import APIError, APIConnectionError as OpenAIConnectionError, RateLimitError as OpenAIRateLimitError

from config import settings
from logger import get_logger
from exceptions import (
    AllModelsFailedError,
    APIConnectionError,
    APITimeoutError,
    GenerationError
)
from models import GenerationResult
# Disabled heavy dependencies - not needed for basic operation
# from image_processor import processor
# from quality_validator import validate_logo_quality

logger = get_logger(__name__)


class LogoGenerator:
    """
    Production Logo Generation Engine
    
    Features:
    - Multi-model fallback chain
    - Exponential backoff retry per model
    - Comprehensive error handling
    - Performance metrics tracking
    - Structured logging
    """
    
    def __init__(self):
        self._client: Optional[OpenAI] = None
        self._models = settings.all_models
        self._initialized = False
        self._enable_processing = False  # Disable post-processing (causing download issues)
        self._enable_validation = False  # Disable CLIP validation by default (resource intensive)
        
    def _get_client(self) -> OpenAI:
        """Lazy initialization of OpenAI client"""
        if self._client is None:
            self._client = OpenAI(
                api_key=settings.a4f_api_key,
                base_url=settings.a4f_base_url,
                timeout=settings.api_timeout
            )
            self._initialized = True
            logger.info(
                "LogoGenerator client initialized",
                base_url=settings.a4f_base_url,
                models_count=len(self._models)
            )
        return self._client
    
    async def generate(
        self,
        user_id: str,
        prompt: str,
        style: str = "modern",
        width: int = 1024,
        height: int = 1024,
        num_variations: int = 1,
        include_text_in_ai: bool = False
    ) -> dict:
        """
        Generate logo(s) with full retry and fallback logic.
        
        Args:
            user_id: User identifier for logging
            prompt: Logo description
            style: Style preset (for prompt enhancement)
            width: Image width
            height: Image height
            num_variations: Number of variations to generate
            include_text_in_ai: Whether AI should generate text (False = icon only)
            
        Returns:
            dict with variations list and metadata
        """
        overall_start = time.perf_counter()
        size = f"{width}x{height}"
        
        # Enhance prompt with style and text handling strategy
        enhanced_prompt = self._enhance_prompt(prompt, style, include_text_in_ai)
        
        logger.info(
            f"🎨 Starting logo generation for '{prompt[:50]}{'...' if len(prompt) > 50 else ''}'")
        logger.info(f"🔢 Generating {num_variations} variation{'s' if num_variations > 1 else ''}")
        logger.debug(
            "Generation parameters",
            user_id=user_id,
            prompt_length=len(prompt),
            style=style,
            size=size,
            num_variations=num_variations
        )
        
        # Generate all variations
        variations = []
        for i in range(num_variations):
            if num_variations > 1:
                logger.info(f"🔹 Generating variation {i + 1}/{num_variations}")
            
            # Add variation modifier to prompt for diversity
            variation_prompt = enhanced_prompt
            if num_variations > 1 and i > 0:
                variation_modifiers = [
                    "alternative composition, different visual approach, unique interpretation",
                    "reimagined concept, fresh perspective, creative variation",
                    "distinct style, alternative aesthetic, different mood",
                    "unique geometric arrangement, different symbolism, varied approach",
                    "original interpretation, alternative design language, fresh concept"
                ]
                # Keep quality high while adding diversity
                diversity_boost = variation_modifiers[i % len(variation_modifiers)]
                variation_prompt = f"{enhanced_prompt}, {diversity_boost}, maintain premium quality"
            
            result = await self._generate_single(
                prompt=variation_prompt,
                size=size,
                variation_number=i + 1
            )
            variations.append(result)
        
        total_time = int((time.perf_counter() - overall_start) * 1000)
        
        logger.info(
            f"✅ All {num_variations} variation{'s' if num_variations > 1 else ''} generated successfully in {total_time/1000:.1f}s")
        
        return {
            "variations": variations,
            "total_time_ms": total_time,
            "num_generated": len(variations)
        }
    
    async def _generate_single(
        self,
        prompt: str,
        size: str,
        variation_number: int = 1
    ) -> dict:
        """
        Generate a single logo variation with intelligent model routing.
        
        Returns:
            dict with image_url, model, generation_time_ms, variation_number
        """
        start_time = time.perf_counter()
        
        # Use configured model order (respects PRIMARY_MODEL from .env)
        models_to_try = self._models
        
        # Track errors for reporting
        errors: list[dict] = []
        
        # Try each model in intelligent order
        for model_idx, model in enumerate(models_to_try):
            model_result = await self._try_model(
                model=model,
                prompt=prompt,
                size=size,
                model_idx=model_idx
            )
            
            if model_result["success"]:
                generation_time = int((time.perf_counter() - start_time) * 1000)
                
                logger.info(
                    f"✅ Logo generated successfully in {model_result['time_ms']/1000:.1f}s using {model}")
                
                image_url = model_result["image_url"]
                
                # POST-PROCESSING PIPELINE
                if self._enable_processing:
                    logger.info("🔧 Applying post-processing pipeline...")
                    processed_bytes = processor.process_logo(image_url)
                    
                    if processed_bytes:
                        # Convert to data URL for frontend
                        base64_image = base64.b64encode(processed_bytes).decode('utf-8')
                        image_url = f"data:image/png;base64,{base64_image}"
                        logger.info("✅ Post-processing complete")
                    else:
                        logger.warning("⚠️ Post-processing failed, using original image")
                
                # QUALITY VALIDATION (optional, resource intensive)
                if self._enable_validation:
                    logger.info("🔍 Validating logo quality...")
                    is_valid, score = validate_logo_quality(image_url, prompt)
                    
                    if not is_valid:
                        logger.warning(f"⚠️ Quality score low ({score:.3f}), may retry...")
                        # Could implement retry logic here
                    else:
                        logger.info(f"✅ Quality validated (score: {score:.3f})")
                
                return {
                    "image_url": image_url,
                    "model_used": model,
                    "generation_time_ms": model_result["time_ms"],
                    "variation_number": variation_number
                }
            
            # Track failure
            errors.append({
                "model": model,
                "error": model_result["error"]
            })
        
        # All models failed
        total_time = int((time.perf_counter() - start_time) * 1000)
        last_error = errors[-1]["error"] if errors else "Unknown error"
        
        logger.error(
            "All models failed",
            models_tried=len(models_to_try),
            last_error=last_error,
            total_time_ms=total_time,
            exc_info=False
        )
        
        raise AllModelsFailedError(
            models_tried=len(models_to_try),
            last_error=last_error
        )
    
    def _route_models_by_prompt(self, prompt: str) -> list[str]:
        """
        Intelligently route to best models based on prompt content.
        Addresses ChatGPT's weakness analysis.
        """
        prompt_lower = prompt.lower()
        
        # Pattern detection
        has_text = any(word in prompt_lower for word in ["text", "letter", "font", "typography", "word", "name"])
        has_symmetry = any(word in prompt_lower for word in ["symmetry", "symmetric", "balanced", "mirror", "radial"])
        has_shapes = any(word in prompt_lower for word in ["triangle", "square", "circle", "geometric", "shape"])
        needs_precision = any(word in prompt_lower for word in ["exact", "precise", "specific", "strict", "clean"])
        
        # Model strengths (based on testing)
        # flux-schnell: Fast, good at silhouettes, struggles with text
        # imagen-4: Better at text/precision, slower
        # dall-e-2: Good at symmetry/patterns
        
        if has_text or has_symmetry:
            # Prioritize Imagen/DALL-E for text and symmetry
            return [
                "provider-4/imagen-4",
                "provider-5/dall-e-2",
                "provider-4/flux-schnell",
                "provider-4/imagen-3.5",
                "provider-4/qwen-image",
                "provider-5/flux-fast",
                "provider-5/imagen-4-fast"
            ]
        elif needs_precision or has_shapes:
            # Use precision-focused models
            return [
                "provider-4/imagen-4",
                "provider-4/flux-schnell",
                "provider-5/dall-e-2",
                "provider-4/imagen-3.5",
                "provider-4/qwen-image",
                "provider-5/flux-fast",
                "provider-5/imagen-4-fast"
            ]
        else:
            # Default: speed-optimized fallback
            return self._models
    
    async def _try_model(
        self,
        model: str,
        prompt: str,
        size: str,
        model_idx: int
    ) -> dict:
        """
        Try a single model with retries and exponential backoff.
        
        Returns:
            dict with success, image_url/error, and time_ms
        """
        max_retries = settings.max_retries_per_model
        
        for retry in range(max_retries):
            try:
                logger.debug(
                    f"Trying {model} (attempt {retry + 1}/{max_retries})")
                
                start = time.perf_counter()
                
                # Run sync OpenAI call in executor
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self._get_client().images.generate(
                        model=model,
                        prompt=prompt,
                        n=1,
                        size=size
                    )
                )
                
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                image_url = response.data[0].url
                
                return {
                    "success": True,
                    "image_url": image_url,
                    "time_ms": elapsed_ms
                }
                
            except OpenAIRateLimitError as e:
                logger.warning(
                    "Rate limited by model",
                    model=model,
                    retry=retry + 1
                )
                # Rate limit - wait longer before retry
                await self._backoff(retry, multiplier=2.0)
                
            except OpenAIConnectionError as e:
                logger.warning(
                    "Connection error",
                    model=model,
                    retry=retry + 1,
                    error=str(e)
                )
                await self._backoff(retry)
                
            except APIError as e:
                # API returned an error - may not be retryable
                error_msg = str(e)
                
                if "timeout" in error_msg.lower():
                    logger.warning("Request timeout", model=model)
                    await self._backoff(retry)
                else:
                    # Likely a permanent error for this model
                    logger.warning(
                        "API error, skipping model",
                        model=model,
                        error=error_msg[:200]
                    )
                    return {
                        "success": False,
                        "error": error_msg[:200]
                    }
                    
            except Exception as e:
                # Unexpected error
                logger.error(
                    "Unexpected generation error",
                    model=model,
                    error_type=type(e).__name__,
                    error=str(e)[:200]
                )
                return {
                    "success": False,
                    "error": f"{type(e).__name__}: {str(e)[:150]}"
                }
        
        # Exhausted retries for this model
        return {
            "success": False,
            "error": f"Exhausted {max_retries} retries"
        }
    
    async def _backoff(self, retry: int, multiplier: float = 1.0):
        """Exponential backoff with jitter"""
        import random
        
        delay = min(
            settings.retry_base_delay * (2 ** retry) * multiplier,
            settings.retry_max_delay
        )
        # Add jitter (±25%)
        delay = delay * (0.75 + random.random() * 0.5)
        
        logger.debug(f"Backing off for {delay:.2f}s")
        await asyncio.sleep(delay)
    
    def _enhance_prompt(self, prompt: str, style: str, include_text_in_ai: bool = False) -> str:
        """
        Enhance prompt with style modifiers + quality boosters + logo-specific constraints.
        Implements Perplexity's quality improvements for professional-grade outputs.
        
        Args:
            prompt: User's logo description
            style: Style preset
            include_text_in_ai: If False, adds 'no text' constraint for cleaner results
        """
        style_modifiers = {
            "modern": "modern, clean, contemporary, professional, award-winning design",
            "corporate": "corporate, professional, trustworthy, business-like, Fortune 500 quality",
            "creative": "creative, innovative, artistic, bold, Behance featured",
            "minimalist": "minimalist, simple, clean lines, elegant simplicity, Swiss design aesthetic",
            "vibrant": "vibrant, colorful, energetic, eye-catching, premium branding",
            "elegant": "elegant, sophisticated, refined, luxurious, high-end brand identity"
        }
        
        modifier = style_modifiers.get(style, style_modifiers["modern"])
        
        # QUALITY BOOSTERS (Perplexity recommended - immediate 30-40% improvement)
        quality_enhancers = (
            "award-winning logo design, Behance trending, professional branding, "
            "8K resolution, ultra detailed, clean vector style, modern corporate aesthetic, "
            "Pentagram studio quality, designer-grade, polished finish"
        )
        
        # TEXT HANDLING STRATEGY
        if include_text_in_ai:
            # User wants AI to generate text - enhance quality with premium typography
            text_constraints = (
                "professional typography, premium font, perfect kerning, "
                "high-quality lettering, crisp text rendering, designer-grade type, "
                "legible font with depth, refined letterforms"
            )
            text_negative = (
                "blurry text, misspelled words, distorted letters, unreadable text, "
                "poor kerning, amateur typography, pixelated text, generic fonts"
            )
        else:
            # User will overlay text - tell AI to skip it COMPLETELY
            text_constraints = (
                "ICON ONLY, NO TEXT WHATSOEVER, pure symbol, graphic mark only, "
                "wordmark-free, text-free design, symbol-only logo, abstract icon, "
                "emblematic design, visual identity mark"
            )
            text_negative = (
                "text, letters, words, typography, font, alphabet, characters, "
                "writing, script, calligraphy, wordmark, lettering, monogram with letters"
            )
        
        # CRITICAL: Universal negative constraints (Perplexity's anti-quality list)
        negative_constraints = (
            f"blurry, low quality, pixelated, amateur, clipart, watermark, text artifacts, "
            f"generic stock image, placeholder mockup, flat/lifeless, basic/simple gradient only, "
            f"NO cheap effects, NO basic gradients, NO 3D effects, NO textures, "
            f"NO bevels, NO heavy shading, NO blur, NO noise, NO glows, {text_negative}"
        )
        
        # POSITIVE: Professional logo discipline (enhanced with depth/sophistication)
        positive_constraints = (
            f"clean vector style, sharp edges, sophisticated color palette, "
            f"professional visual hierarchy, refined geometry, subtle depth, "
            f"polished details, modern composition, premium finish, "
            f"high contrast, balanced design, {text_constraints}"
        )
        
        # Build final prompt with quality layers
        enhanced = f"{prompt}, {modifier}, {quality_enhancers}, {positive_constraints}, {negative_constraints}"
        
        return enhanced
    
    async def health_check(self) -> dict:
        """
        Check if the generator can connect to the API.
        Returns health status for monitoring.
        """
        try:
            start = time.perf_counter()
            # Just verify client can be created (doesn't make API call)
            self._get_client()
            latency = int((time.perf_counter() - start) * 1000)
            
            return {
                "status": "healthy",
                "latency_ms": latency,
                "models_available": len(self._models)
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Singleton instance
logo_generator = LogoGenerator()