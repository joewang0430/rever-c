'''
Router for handling file uploads before the game starts.
'''

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import uuid
import os
import aiofiles
from datetime import datetime

upload_router = APIRouter()

# Response model, corresponds to the "ProcessResponse" at front-end
class ProcessResponse(BaseModel):
    code_id: str

@upload_router.post("/api/upload/candidate")
async def process_candidate(file: UploadFile = File(...)) -> ProcessResponse:
    """
    Upload and process candidate file (temporary code)
    """
    try:
        if not file.filename or not file.filename.endswith('.c'):
            raise HTTPException(status_code=400, detail="Only .c files are allowed")
        
        # Generate a unique ID, new name, and store path for the code
        code_id = str(uuid.uuid4())
        new_filename = f"candidate_{code_id}.c"
        file_path = f"data/c_src/candidates/{new_filename}"

        # Save file, with renaming, write in binary to prevent encoding issues
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        # Return the response in the expected format: ProcessResponse
        return ProcessResponse(code_id=code_id)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")