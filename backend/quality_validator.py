"""
Quality Validation using CLIP
Validates that generated images match logo criteria (professional, clean, minimal text artifacts)
"""

import io
import torch
import requests
from PIL import Image
from typing import Tuple, Optional
from logger import get_logger

logger = get_logger(__name__)

# Lazy imports to avoid slow startup
_clip_model = None
_clip_processor = None


def _load_clip():
    """Lazy load CLIP model (only when needed)"""
    global _clip_model, _clip_processor
    
    if _clip_model is None:
        logger.info("⏳ Loading CLIP model for quality validation...")
        try:
            from transformers import CLIPProcessor, CLIPModel
            
            _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            
            logger.info("✅ CLIP model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load CLIP model: {e}")
            raise
    
    return _clip_model, _clip_processor


def validate_logo_quality(image_url: str, prompt: str, threshold: float = 0.28) -> Tuple[bool, float]:
    """
    Validate logo quality using CLIP similarity score
    
    Args:
        image_url: URL of generated image
        prompt: Original user prompt
        threshold: Minimum similarity score (0-1) to pass validation
    
    Returns:
        (is_valid, score): Boolean validity and actual score
    """
    try:
        logger.debug(f"→ Validating quality for: {image_url[:60]}...")
        
        # Load CLIP model
        model, processor = _load_clip()
        
        # Download image
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))
        
        # Create validation prompts
        positive_prompt = f"professional logo design for {prompt}, clean, minimal, vector style"
        negative_prompts = [
            "blurry image, low quality, gradient shadows",
            "3D render, realistic photo, complex illustration",
            "text heavy design, word art, typography poster"
        ]
        
        # Calculate similarity scores
        inputs = processor(
            text=[positive_prompt] + negative_prompts,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Score is probability of positive prompt
        positive_score = probs[0][0].item()
        
        # Check against threshold
        is_valid = positive_score >= threshold
        
        if is_valid:
            logger.info(f"✅ Quality validation passed (score: {positive_score:.3f})")
        else:
            logger.warning(f"⚠️ Quality validation failed (score: {positive_score:.3f} < {threshold})")
        
        return is_valid, positive_score
        
    except Exception as e:
        logger.error(f"❌ Quality validation error: {str(e)}")
        # On error, assume valid to not block generation
        return True, 0.0


def validate_batch(image_urls: list[str], prompt: str, threshold: float = 0.28) -> list[Tuple[bool, float]]:
    """
    Validate multiple images in batch
    Returns list of (is_valid, score) tuples
    """
    results = []
    for url in image_urls:
        result = validate_logo_quality(url, prompt, threshold)
        results.append(result)
    
    return results
