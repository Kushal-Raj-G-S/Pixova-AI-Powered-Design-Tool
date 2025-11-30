"""
Utility Functions
Helper functions for image downloads and other utilities
"""
import httpx
from fastapi import HTTPException
from fastapi.responses import Response


async def proxy_image_download(image_url: str) -> Response:
    """
    Proxy image download to add proper CORS headers and enable downloads.
    
    This allows frontend to download images from external URLs by proxying
    through our backend with proper headers.
    
    Args:
        image_url: The external image URL to download
        
    Returns:
        Response with image data and download headers
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            
            # Get content type from source
            content_type = response.headers.get("content-type", "image/png")
            
            # Return image with download headers
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Content-Disposition": "attachment; filename=pixova-design.png",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, max-age=3600"
                }
            )
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download image: {str(e)}"
        )
