/**
 * Pixova AI - Text Overlay System
 * 
 * Solves AI text generation issues by overlaying perfect typography
 * on AI-generated icon designs using Canvas API
 */

export interface TextOverlayConfig {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    position: 'top' | 'center' | 'bottom' | 'custom';
    customX?: number;
    customY?: number;
    strokeColor?: string;
    strokeWidth?: number;
    backgroundColor?: string;
    backgroundPadding?: number;
}

/**
 * Style-specific font mappings for professional typography
 */
export const styleFonts: Record<string, string> = {
    modern: 'Inter, system-ui, sans-serif',
    corporate: 'Georgia, serif',
    creative: 'Montserrat, sans-serif',
    minimalist: 'Helvetica Neue, Arial, sans-serif',
    vibrant: 'Poppins, sans-serif',
    elegant: 'Playfair Display, serif'
};

/**
 * Apply text overlay to an image
 * 
 * @param imageUrl - URL or data URL of the base image
 * @param config - Text overlay configuration
 * @returns Promise resolving to data URL of the final image
 */
export async function applyTextToImage(
    imageUrl: string,
    config: TextOverlayConfig
): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create image element
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS for external URLs

        img.onload = () => {
            try {
                // Create canvas matching image dimensions
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }

                // Draw base image
                ctx.drawImage(img, 0, 0);

                // Apply text overlay
                drawText(ctx, canvas, config);

                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}

/**
 * Draw text on canvas with PROFESSIONAL styling AND WIDTH VALIDATION
 * CRITICAL FIX: Ensures text fits within margins, scales down if needed
 * ENHANCED: More padding to prevent edge cutoff
 */
function drawText(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    config: TextOverlayConfig
): void {
    const { text, fontFamily, color, position, strokeColor, strokeWidth, backgroundColor, backgroundPadding } = config;
    let fontSize = config.fontSize;

    // ENHANCED: Increased margin from 8% to 12% for more breathing room
    const margin = canvas.width * 0.12; // 12% margin from edges (prevents cutoff)
    const maxWidth = canvas.width - (2 * margin); // Available width for text

    // Set initial font to measure
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    let textMetrics = ctx.measureText(text);
    let textWidth = textMetrics.width;

    // If text is too wide, scale fontSize down until it fits
    if (textWidth > maxWidth) {
        fontSize = fontSize * (maxWidth / textWidth) * 0.95; // 95% for safety margin
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        textMetrics = ctx.measureText(text);
        textWidth = textMetrics.width;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate position (pass adjusted fontSize for smart positioning)
    const { x, y } = calculateTextPosition(ctx, canvas, text, position, fontSize, config.customX, config.customY);

    // Draw background if specified
    if (backgroundColor) {
        const padding = backgroundPadding || 20;
        const bgWidth = textWidth + (padding * 2);
        const bgHeight = fontSize + (padding * 2);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(
            x - bgWidth / 2,
            y - bgHeight / 2,
            bgWidth,
            bgHeight
        );
    }

    // PROFESSIONAL OUTLINE - subtle, proportional, semi-transparent
    if (strokeColor && strokeWidth) {
        // Calculate proportional outline width (never overwhelming)
        const professionalStrokeWidth = Math.max(fontSize / 25, 0.5);

        ctx.strokeStyle = strokeColor.startsWith('rgba')
            ? strokeColor
            : strokeColor === '#FFFFFF'
                ? 'rgba(0, 0, 0, 0.4)' // Black outline with 40% opacity for white text
                : 'rgba(255, 255, 255, 0.4)'; // White outline with 40% opacity for dark text

        ctx.lineWidth = professionalStrokeWidth;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);
    }

    // Draw main text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

/**
 * Calculate text position based on SMART LAYOUT DETECTION
 * Analyzes icon position and places text in optimal location with proper margins
 * ENHANCED: Increased margin from 8% to 12%
 */
function calculateTextPosition(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    position: TextOverlayConfig['position'],
    fontSize: number,
    customX?: number,
    customY?: number
): { x: number; y: number } {
    const centerX = canvas.width / 2;
    const margin = canvas.height * 0.12; // Increased from 8% to 12% for more padding

    // Custom position takes precedence
    if (position === 'custom' && customX !== undefined && customY !== undefined) {
        return { x: customX, y: customY };
    }

    // Detect where the icon actually is
    const iconBounds = detectIconBounds(ctx, canvas);
    const iconHeight = iconBounds.bottom - iconBounds.top;
    const iconCenterY = iconBounds.centerY;

    // Smart positioning based on icon location
    if (position === 'bottom' || position === 'custom') {
        // Check if there's space below the icon
        const spaceBelow = canvas.height - iconBounds.bottom;
        const spaceAbove = iconBounds.top;

        if (spaceBelow > fontSize * 2) {
            // Plenty of space below - place text there (standard logo layout)
            return {
                x: centerX,
                y: canvas.height - margin - (fontSize * 0.4)
            };
        } else if (spaceAbove > fontSize * 2) {
            // Icon is at bottom, place text above
            return {
                x: centerX,
                y: margin + (fontSize * 0.5)
            };
        } else {
            // Icon fills most of canvas - place at very bottom with smaller margin
            return {
                x: centerX,
                y: canvas.height - (fontSize * 0.8)
            };
        }
    }

    if (position === 'top') {
        return {
            x: centerX,
            y: margin + (fontSize * 0.5)
        };
    }

    if (position === 'center') {
        // Check if center is actually free (not covered by icon)
        const centerIsFree = Math.abs(canvas.height / 2 - iconCenterY) > (iconHeight / 2 + fontSize);

        if (centerIsFree) {
            return { x: centerX, y: canvas.height / 2 };
        } else {
            // Fall back to bottom if center is occupied
            return {
                x: centerX,
                y: canvas.height - margin - (fontSize * 0.4)
            };
        }
    }

    // Default: bottom with proper margin
    return {
        x: centerX,
        y: canvas.height - margin - (fontSize * 0.4)
    };
}

/**
 * Generate preview of text overlay without modifying original image
 * Useful for real-time preview as user adjusts settings
 */
export async function generateTextPreview(
    imageUrl: string,
    config: TextOverlayConfig
): Promise<string> {
    // Same as applyTextToImage but can be optimized for preview
    return applyTextToImage(imageUrl, config);
}

/**
 * Detect icon bounds by analyzing non-transparent pixels
 * Returns the visual bounding box of the actual logo content
 */
function detectIconBounds(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): {
    top: number;
    bottom: number;
    left: number;
    right: number;
    centerY: number;
} {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;

    // Scan for non-transparent/non-background pixels
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const alpha = data[idx + 3];

            // Consider pixel as "content" if it has some opacity
            if (alpha > 50) {
                // Check if it's not just background color
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Skip if it's very close to pure background colors
                const isBackground = (
                    (r > 240 && g > 240 && b > 240) || // White background
                    (r < 20 && g < 20 && b < 20) // Black background
                );

                if (!isBackground) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
    }

    // Fallback if no content detected (shouldn't happen)
    if (minX > maxX || minY > maxY) {
        return {
            top: 0,
            bottom: canvas.height,
            left: 0,
            right: canvas.width,
            centerY: canvas.height / 2
        };
    }

    return {
        top: minY,
        bottom: maxY,
        left: minX,
        right: maxX,
        centerY: (minY + maxY) / 2
    };
}

/**
 * Calculate optimal font size based on PROFESSIONAL logo standards
 * Text should be 10-15% of canvas height, proportional to icon size
 */
export function calculateOptimalFontSize(
    imageWidth: number,
    imageHeight: number,
    textLength: number,
    iconBounds?: { top: number; bottom: number }
): number {
    // Professional standard: text is 10-15% of total height
    const baseTextHeight = imageHeight * 0.12;

    // Adjust for text length - longer text needs to be smaller
    let lengthFactor = 1.0;
    if (textLength > 12) {
        lengthFactor = 0.7; // Much smaller for long text
    } else if (textLength > 8) {
        lengthFactor = 0.85;
    } else if (textLength > 5) {
        lengthFactor = 0.95;
    }

    const adjustedSize = baseTextHeight * lengthFactor;

    // Professional bounds: never too small, never overwhelming
    return Math.max(28, Math.min(adjustedSize, imageHeight * 0.15));
}

/**
 * Suggest text color based on image dominant color for contrast
 * Simple heuristic - can be enhanced with image analysis
 */
export function suggestTextColor(imageBrightness: 'light' | 'dark' | 'mixed'): string {
    switch (imageBrightness) {
        case 'light':
            return '#000000'; // Black on light background
        case 'dark':
            return '#FFFFFF'; // White on dark background
        case 'mixed':
            return '#FFFFFF'; // White with black stroke for safety
        default:
            return '#FFFFFF';
    }
}

/**
 * Batch apply text to multiple images (for variations)
 */
export async function applyTextToVariations(
    imageUrls: string[],
    config: TextOverlayConfig
): Promise<string[]> {
    const promises = imageUrls.map(url => applyTextToImage(url, config));
    return Promise.all(promises);
}

/**
 * Download image with text overlay
 */
export function downloadImageWithText(dataUrl: string, filename: string = 'logo-with-text.png'): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}
