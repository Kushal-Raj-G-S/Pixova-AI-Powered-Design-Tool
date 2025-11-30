"""
Image Post-Processing Pipeline
Fixes AI-generated logo weaknesses: gradients, soft shadows, blurry edges, text artifacts
"""

import io
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import requests
from typing import Optional
from logger import get_logger

logger = get_logger(__name__)


class ImageProcessor:
    """Post-processing pipeline to enforce logo discipline"""
    
    def __init__(self):
        self.gradient_threshold = 15  # Max color distance for "flat" colors (AGGRESSIVE)
        self.edge_strength = 3.0      # Edge sharpening multiplier (MAXIMUM)
        self.color_bits = 4           # Bits per channel for posterization (16 colors per channel)
        self.contrast_boost = 2.5     # Contrast enhancement (EXTREME)
        
    def process_logo(self, image_url: str) -> Optional[bytes]:
        """
        Download and process logo image
        Returns processed image as bytes, or None if processing fails
        """
        try:
            logger.info(f"⚙️ Processing image: {image_url[:60]}...")
            
            # Download image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Apply processing pipeline
            image = self._flatten_gradients(image)
            image = self._binarize_colors(image)
            image = self._sharpen_edges(image)
            image = self._remove_noise(image)
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format='PNG', optimize=True)
            
            logger.info("✅ Image processing complete")
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"❌ Image processing failed: {str(e)}")
            return None
    
    def _flatten_gradients(self, image: Image.Image) -> Image.Image:
        """
        Reduce gradients to solid colors
        Strategy: Aggressive posterization + extreme contrast
        """
        logger.debug("→ Flattening gradients (AGGRESSIVE MODE)...")
        
        # AGGRESSIVE: Posterize to 4-bit per channel (16 levels)
        # This brutally collapses gradients into discrete bands
        posterized = image.quantize(colors=128, method=Image.MEDIANCUT).convert('RGB')
        
        # EXTREME contrast enhancement
        enhancer = ImageEnhance.Contrast(posterized)
        result = enhancer.enhance(self.contrast_boost)  # 2.5x contrast!
        
        return result
    
    def _binarize_colors(self, image: Image.Image) -> Image.Image:
        """
        Force colors toward solid values (eliminate ALL bleeding)
        Strategy: Snap to 16-value color steps (0, 16, 32, 48...240, 255)
        """
        logger.debug("→ Binarizing colors (SNAPPING TO PALETTE)...")
        
        # Convert to numpy for aggressive color quantization
        img_array = np.array(image)
        pixels = img_array.reshape(-1, 3)
        
        # AGGRESSIVE: Snap to 16-value steps (ultra clean)
        # This creates pure, vector-like colors with ZERO bleeding
        quantized = (pixels // 16) * 16
        quantized = np.clip(quantized, 0, 255).astype(np.uint8)
        
        # Reshape back to image
        result_array = quantized.reshape(img_array.shape)
        result = Image.fromarray(result_array)
        
        return result
    
    def _sharpen_edges(self, image: Image.Image) -> Image.Image:
        """
        Enhance edge sharpness for ultra-crisp vector-like appearance
        Strategy: Aggressive unsharp mask + extreme sharpness boost
        """
        logger.debug("→ Sharpening edges (MAXIMUM CRISPNESS)...")
        
        # Apply AGGRESSIVE unsharp mask
        sharpened = image.filter(ImageFilter.UnsharpMask(
            radius=3,      # Larger blur radius for stronger effect
            percent=200,   # EXTREME sharpening (200%)
            threshold=2    # Lower threshold = sharpen more edges
        ))
        
        # MAXIMUM edge enhancement
        enhancer = ImageEnhance.Sharpness(sharpened)
        result = enhancer.enhance(self.edge_strength)  # 3.0x sharpness!
        
        return result
    
    def _remove_noise(self, image: Image.Image) -> Image.Image:
        """
        Remove small artifacts and noise
        Strategy: Median filter to smooth small imperfections
        """
        logger.debug("→ Removing noise...")
        
        # Median filter removes salt-and-pepper noise while preserving edges
        result = image.filter(ImageFilter.MedianFilter(size=3))
        
        return result


# Global processor instance
processor = ImageProcessor()
