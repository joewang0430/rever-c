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
    

@upload_router.delete("/api/cleanup/candidate/{code_id}")
async def cleanup_candidate(code_id: str):
    """
    Clean up all candidate files (both .c source and .so compiled files)
    """
    try:
        # Delete source file (.c)
        source_file = f"data/c_src/candidates/candidate_{code_id}.c"
        if os.path.exists(source_file):
            os.remove(source_file)
        
        # Delete shared library file after compiled (.so)
        compiled_file = f"data/shared_libs/candidates/candidate_{code_id}.so"
        if os.path.exists(compiled_file):
            os.remove(compiled_file)
        
        return
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
    

@upload_router.delete("/api/cleanup/candidate/{code_id}/code")
async def cleanup_candidate_code(code_id: str):
    """
    Clean up only candidate source code (.c file), keep compiled file (.so)
    """
    try:
        # only delete the source file (.c)
        source_file = f"data/c_src/candidates/candidate_{code_id}.c"
        if os.path.exists(source_file):
            os.remove(source_file)
        
        return 
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code cleanup failed: {str(e)}")