"""Pixova AI - Logo Generator with Advanced Prompt Intelligence
Production-grade with focus on prompt accuracy + creative excellence
"""
import asyncio
import time
import base64
import re
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

logger = get_logger(__name__)


class PromptAnalyzer:
    """Intelligent prompt analyzer to extract user intent and enhance accordingly"""
    
    @staticmethod
    def extract_key_elements(prompt: str) -> dict:
        """Parse prompt to understand what user REALLY wants"""
        prompt_lower = prompt.lower()
        
        # Core subject extraction
        subjects = {
            'animal': bool(re.search(r'\b(lion|eagle|wolf|bear|tiger|bird|fish|dragon|phoenix)\b', prompt_lower)),
            'nature': bool(re.search(r'\b(tree|leaf|mountain|wave|sun|moon|flower|forest)\b', prompt_lower)),
            'tech': bool(re.search(r'\b(circuit|code|digital|tech|ai|robot|cyber|data|network)\b', prompt_lower)),
            'abstract': bool(re.search(r'\b(abstract|geometric|shape|circle|triangle|square|pattern)\b', prompt_lower)),
            'food': bool(re.search(r'\b(coffee|food|restaurant|kitchen|chef|pizza|burger)\b', prompt_lower)),
            'medical': bool(re.search(r'\b(medical|health|doctor|hospital|care|wellness|heart)\b', prompt_lower)),
            'finance': bool(re.search(r'\b(finance|money|bank|invest|growth|wealth|dollar)\b', prompt_lower)),
            'education': bool(re.search(r'\b(education|learn|book|school|university|knowledge)\b', prompt_lower)),
        }
        
        # Emotional tone detection
        emotions = {
            'powerful': bool(re.search(r'\b(strong|power|bold|fierce|dominant|mighty)\b', prompt_lower)),
            'friendly': bool(re.search(r'\b(friendly|warm|welcoming|approachable|kind)\b', prompt_lower)),
            'luxury': bool(re.search(r'\b(luxury|premium|elegant|sophisticated|exclusive)\b', prompt_lower)),
            'playful': bool(re.search(r'\b(playful|fun|cheerful|happy|energetic)\b', prompt_lower)),
            'professional': bool(re.search(r'\b(professional|corporate|business|formal|serious)\b', prompt_lower)),
            'innovative': bool(re.search(r'\b(innovative|creative|modern|future|cutting.edge)\b', prompt_lower)),
        }
        
        # Color mentions
        colors = re.findall(r'\b(red|blue|green|yellow|purple|orange|black|white|gold|silver|pink|brown)\b', prompt_lower)
        
        # Specific requests
        has_specific_shape = bool(re.search(r'\b(circle|square|triangle|hexagon|pentagon|star|diamond)\b', prompt_lower))
        has_specific_industry = any(subjects.values())
        wants_text = bool(re.search(r'\b(text|letter|word|name|typography|font)\b', prompt_lower))
        wants_icon_only = bool(re.search(r'\b(icon|symbol|mark|emblem|badge|just.the)\b', prompt_lower))
        
        return {
            'subjects': {k: v for k, v in subjects.items() if v},
            'emotions': {k: v for k, v in emotions.items() if v},
            'colors': colors,
            'has_specific_shape': has_specific_shape,
            'has_specific_industry': has_specific_industry,
            'wants_text': wants_text,
            'wants_icon_only': wants_icon_only,
            'raw_prompt': prompt
        }
    
    @staticmethod
    def build_intelligent_prompt(analysis: dict, style: str, include_text: bool) -> str:
        """Build a laser-focused prompt that delivers EXACTLY what user wants"""
        
        # Start with user's exact request - NEVER lose this
        base = analysis['raw_prompt']
        
        # LAYER 1: Reinforce user's core subject (make it UNMISSABLE)
        subject_boost = ""
        if analysis['subjects']:
            primary_subject = list(analysis['subjects'].keys())[0]
            subject_boost = f"PRIMARY FOCUS: {primary_subject} theme, "
        
        # LAYER 2: Emotional tone amplification
        emotion_boost = ""
        if analysis['emotions']:
            primary_emotion = list(analysis['emotions'].keys())[0]
            emotion_map = {
                'powerful': 'commanding presence, bold visual impact, strength conveyed through design',
                'friendly': 'approachable aesthetic, warm visual language, inviting composition',
                'luxury': 'premium materials feel, refined elegance, exclusive brand positioning',
                'playful': 'dynamic energy, joyful visual rhythm, engaging personality',
                'professional': 'authoritative presence, business credibility, polished execution',
                'innovative': 'forward-thinking design, disruptive visual language, pioneering aesthetic'
            }
            emotion_boost = emotion_map.get(primary_emotion, '')
        
        # LAYER 3: Industry-specific excellence standards
        industry_standards = {
            'tech': 'silicon valley grade, startup-ready, VC-pitch worthy, Apple-level polish',
            'medical': 'healthcare trust signals, FDA-compliant aesthetic, patient-reassuring design',
            'finance': 'wall street credibility, institutional-grade, wealth management quality',
            'food': 'appetite-appealing, restaurant-grade branding, michelin-star presentation',
            'education': 'academic excellence conveyed, institutional trust, knowledge authority',
        }
        
        industry_boost = ""
        for industry in analysis['subjects']:
            if industry in industry_standards:
                industry_boost = industry_standards[industry]
                break
        
        # LAYER 4: Color accuracy (if user specified colors, PRIORITIZE them)
        color_enforcement = ""
        if analysis['colors']:
            color_enforcement = f"MANDATORY COLORS: {', '.join(analysis['colors'])}, exact color matching critical, "
        
        # LAYER 5: Shape precision (if user wants specific geometry)
        shape_enforcement = ""
        if analysis['has_specific_shape']:
            shape_enforcement = "geometric precision required, exact shape adherence, mathematical accuracy, "
        
        # LAYER 6: Text handling intelligence - FIXED to avoid AI adding literal text
        text_strategy = ""
        if include_text and analysis['wants_text']:
            text_strategy = (
                "premium typography integrated, designer-grade font selection, "
                "optical kerning, professional text composition, readable at all sizes, "
            )
        elif analysis['wants_icon_only'] or not include_text:
            text_strategy = (
                "graphic symbol, pictorial mark, abstract shape, visual icon, "
                "geometric symbol, emblematic mark, iconographic design, "
                "clean symbol design, pure graphic element, "
            )
        
        # LAYER 7: Style amplification (but never override user intent)
        style_map = {
            'modern': 'contemporary design language, 2024 trends, current visual aesthetic',
            'corporate': 'fortune 500 caliber, boardroom-ready, institutional quality',
            'creative': 'Behance featured quality, design award winning, portfolio-grade',
            'minimalist': 'Dieter Rams principles, essential elements only, maximum impact minimum means',
            'vibrant': 'color psychology mastery, energetic palette, visual excitement',
            'elegant': 'timeless sophistication, luxury brand aesthetic, refined taste'
        }
        style_boost = style_map.get(style, style_map['modern'])
        
        # QUALITY FOUNDATION (always present but never overshadowing user request)
        quality_base = (
            "professional logo design, vector-perfect execution, scalable from favicon to billboard, "
            "Pantone-accurate colors, production-ready, client-presentation grade"
        )
        
        # CRITICAL NEGATIVES - what to absolutely AVOID
        universal_negatives = (
            "blurry, pixelated, amateur, clipart, watermark, low resolution, "
            "generic stock, placeholder, cheap effects, 3D gimmicks, drop shadows, "
            "bevels, gradients-for-sake-of-gradients, texture overlays, "
            "distorted proportions, misaligned elements, "
        )
        
        # Add text negatives if not wanted - ALL IN NEGATIVE PROMPT to avoid AI rendering them
        if not include_text or analysis['wants_icon_only']:
            universal_negatives += (
                "NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY, "
                "NO ALPHABET CHARACTERS, NO NUMBERS, NO WRITING of any kind, "
                "no readable text, no letter shapes, no typographic elements, "
                "no company name, no tagline, no slogan, no labels, "
            )
        
        # ASSEMBLY: User intent FIRST, enhancements second
        final_prompt = (
            f"{base}, "  # User's request is SACRED
            f"{subject_boost}"  # Reinforce their subject
            f"{emotion_boost}, "  # Amplify their emotion
            f"{color_enforcement}"  # Respect their colors
            f"{shape_enforcement}"  # Honor their shapes
            f"{text_strategy}"  # Handle text correctly
            f"{industry_boost}, "  # Industry excellence
            f"{style_boost}, "  # Style enhancement
            f"{quality_base}, "  # Quality baseline
            f"AVOID: {universal_negatives}"  # What NOT to do
        )
        
        return final_prompt


class LogoGenerator:
    """Production Logo Generation Engine with Intelligent Prompting"""
    
    def __init__(self):
        self._client: Optional[OpenAI] = None
        self._models = settings.all_models
        self._initialized = False
        self._enable_processing = False
        self._enable_validation = False
        self.analyzer = PromptAnalyzer()
        
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
                "LogoGenerator initialized with intelligent prompting",
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
        Generate logo(s) with intelligent prompt analysis and enhancement
        """
        overall_start = time.perf_counter()
        size = f"{width}x{height}"
        
        # STEP 1: Analyze what user REALLY wants
        logger.info(f"🔍 Analyzing prompt: '{prompt[:60]}...'")
        analysis = self.analyzer.extract_key_elements(prompt)
        
        logger.info(
            f"📊 Detected: {list(analysis['subjects'].keys()) if analysis['subjects'] else 'general'} | "
            f"Tone: {list(analysis['emotions'].keys())[0] if analysis['emotions'] else 'neutral'} | "
            f"Colors: {analysis['colors'] if analysis['colors'] else 'auto'}"
        )
        
        # STEP 2: Build intelligent, focused prompt
        enhanced_prompt = self.analyzer.build_intelligent_prompt(
            analysis, style, include_text_in_ai
        )
        
        logger.debug(f"🎯 Enhanced prompt: {enhanced_prompt[:200]}...")
        logger.info(f"🎨 Generating {num_variations} variation(s)")
        
        # STEP 3: Generate variations with diversity
        variations = []
        for i in range(num_variations):
            if num_variations > 1:
                logger.info(f"🔹 Variation {i + 1}/{num_variations}")
            
            # For multiple variations, add creative diversity WITHOUT losing user intent
            variation_prompt = enhanced_prompt
            if num_variations > 1 and i > 0:
                diversity_angles = [
                    "alternative visual interpretation, different compositional approach",
                    "reimagined concept, fresh creative angle",
                    "distinct aesthetic direction, varied mood",
                    "unique geometric arrangement, alternative symbolism",
                    "different design language, creative reframing"
                ]
                diversity = diversity_angles[i % len(diversity_angles)]
                variation_prompt = f"{enhanced_prompt}, {diversity}, MAINTAIN core concept"
            
            result = await self._generate_single(
                prompt=variation_prompt,
                size=size,
                variation_number=i + 1
            )
            variations.append(result)
        
        total_time = int((time.perf_counter() - overall_start) * 1000)
        
        logger.info(f"✅ Generated {num_variations} logo(s) in {total_time/1000:.1f}s")
        
        return {
            "variations": variations,
            "total_time_ms": total_time,
            "num_generated": len(variations),
            "prompt_analysis": {
                "detected_subject": list(analysis['subjects'].keys())[0] if analysis['subjects'] else None,
                "detected_emotion": list(analysis['emotions'].keys())[0] if analysis['emotions'] else None,
                "colors_requested": analysis['colors']
            }
        }
    
    async def _generate_single(
        self,
        prompt: str,
        size: str,
        variation_number: int = 1
    ) -> dict:
        """Generate single variation with model fallback"""
        start_time = time.perf_counter()
        models_to_try = self._models
        errors: list[dict] = []
        
        for model_idx, model in enumerate(models_to_try):
            model_result = await self._try_model(
                model=model,
                prompt=prompt,
                size=size,
                model_idx=model_idx
            )
            
            if model_result["success"]:
                generation_time = int((time.perf_counter() - start_time) * 1000)
                
                logger.info(f"✅ Generated in {model_result['time_ms']/1000:.1f}s using {model}")
                
                return {
                    "image_url": model_result["image_url"],
                    "model_used": model,
                    "generation_time_ms": model_result["time_ms"],
                    "variation_number": variation_number
                }
            
            errors.append({"model": model, "error": model_result["error"]})
        
        # All models failed
        total_time = int((time.perf_counter() - start_time) * 1000)
        last_error = errors[-1]["error"] if errors else "Unknown error"
        
        logger.error(
            "All models failed",
            models_tried=len(models_to_try),
            last_error=last_error,
            total_time_ms=total_time
        )
        
        raise AllModelsFailedError(
            models_tried=len(models_to_try),
            last_error=last_error
        )
    
    async def _try_model(
        self,
        model: str,
        prompt: str,
        size: str,
        model_idx: int
    ) -> dict:
        """Try single model with retries"""
        max_retries = settings.max_retries_per_model
        
        for retry in range(max_retries):
            try:
                logger.debug(f"Trying {model} (attempt {retry + 1}/{max_retries})")
                
                start = time.perf_counter()
                
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
                
                if not response.data or len(response.data) == 0:
                    logger.warning("Empty response", model=model)
                    return {"success": False, "error": "No image data"}
                
                return {
                    "success": True,
                    "image_url": response.data[0].url,
                    "time_ms": elapsed_ms
                }
                
            except OpenAIRateLimitError as e:
                logger.warning("Rate limited", model=model, retry=retry + 1)
                await self._backoff(retry, multiplier=2.0)
                
            except OpenAIConnectionError as e:
                logger.warning("Connection error", model=model, retry=retry + 1)
                await self._backoff(retry)
                
            except APIError as e:
                error_msg = str(e)
                if "timeout" in error_msg.lower():
                    logger.warning("Timeout", model=model)
                    await self._backoff(retry)
                else:
                    logger.warning("API error", model=model, error=error_msg[:200])
                    return {"success": False, "error": error_msg[:200]}
                    
            except Exception as e:
                logger.error(
                    "Unexpected error",
                    model=model,
                    error_type=type(e).__name__,
                    error=str(e)[:200]
                )
                return {
                    "success": False,
                    "error": f"{type(e).__name__}: {str(e)[:150]}"
                }
        
        return {"success": False, "error": f"Exhausted {max_retries} retries"}
    
    async def _backoff(self, retry: int, multiplier: float = 1.0):
        """Exponential backoff with jitter"""
        import random
        
        delay = min(
            settings.retry_base_delay * (2 ** retry) * multiplier,
            settings.retry_max_delay
        )
        delay = delay * (0.75 + random.random() * 0.5)
        
        logger.debug(f"Backing off for {delay:.2f}s")
        await asyncio.sleep(delay)
    
    async def health_check(self) -> dict:
        """Health check endpoint"""
        try:
            start = time.perf_counter()
            self._get_client()
            latency = int((time.perf_counter() - start) * 1000)
            
            return {
                "status": "healthy",
                "latency_ms": latency,
                "models_available": len(self._models),
                "features": ["intelligent_prompting", "subject_detection", "emotion_analysis"]
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


# Singleton instance
logo_generator = LogoGenerator()
