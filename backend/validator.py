import os
from fastapi import UploadFile, HTTPException

def validate_file(file: UploadFile) -> dict:
    # 1. Extension Check
    ext = os.path.splitext(file.filename)[1].lower()
    
    IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
    VIDEO_EXTS = {'.mp4', '.avi', '.mov', '.mkv'}
    
    is_video = ext in VIDEO_EXTS
    is_image = ext in IMAGE_EXTS
    
    if not is_video and not is_image:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {ext}. Allowed: JPG, PNG, WEBP, MP4, AVI, MOV, MKV"
        )

    # 2. Size Check (Image 10MB, Video 50MB)
    MAX_IMAGE = int(os.getenv("MAX_IMAGE_MB", 10)) * 1024 * 1024
    MAX_VIDEO = int(os.getenv("MAX_VIDEO_MB", 50)) * 1024 * 1024
    limit = MAX_VIDEO if is_video else MAX_IMAGE
    
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > limit:
        type_str = "Video" if is_video else "Image"
        limit_mb = limit / (1024 * 1024)
        raise HTTPException(
            status_code=400, 
            detail=f"{type_str} exceeds size limit of {limit_mb}MB"
        )

    return {"is_video": is_video, "extension": ext}
