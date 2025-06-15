'''
Router for handling file uploads before the game starts.
'''

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import uuid
import os
import aiofiles
from datetime import datetime
from typing import Optional, Literal
# from concurrent.futures import ThreadPoolExecutor
# import subprocess
import json


upload_router = APIRouter()

# Thread pool executor for running tasks in parallel
# executor = ThreadPoolExecutor(max_workers=4)


# Response model, corresponds to the interface at front-end
class ProcessResponse(BaseModel):
    code_id: str

class StatusResponse(BaseModel):
    status: Literal['uploading', 'compiling', 'testing', 'success', 'failed']
    error_message: Optional[str] = None
    failed_stage: Optional[Literal['compiling', 'testing']] = None
    test_return_value: Optional[int] = None


# Helper functions
def get_status_file_path(code_id: str, file_type: str) -> str:
    """ Generate the file path for the status file """
    return f"data/status/{file_type}s/{file_type}_{code_id}.json"

def save_status(code_id: str, status: str, file_type: str, 
                error_message: str = None, failed_stage: str = None, test_return_value: int = None):
    """Save the status to a file"""
    status_data = {
        "status": status,
        "error_message": error_message,
        "failed_stage": failed_stage,
        "test_return_value": test_return_value,
        "timestamp": datetime.now().isoformat()
    }
    
    status_file = get_status_file_path(code_id, file_type)
    with open(status_file, 'w') as f:
        json.dump(status_data, f)

def load_status(code_id: str, file_type: str) -> dict:
    """Load status from file"""
    status_file = get_status_file_path(code_id, file_type)
    
    if not os.path.exists(status_file):
        return {"status": "not_found"}
    
    try:
        with open(status_file, 'r') as f:
            return json.load(f)
    except Exception:
        return {"status": "error"}
    
def cleanup_status(code_id: str, file_type: str = 'candidate'):
    """clean up status file"""
    status_file = get_status_file_path(code_id, file_type)
    if os.path.exists(status_file):
        os.remove(status_file)

# def compile_candidate(code_id: str) -> dict:
#     pass #TODO:

# def test_candidate(code_id: str) -> dict:
#     pass #TODO:


# Routers
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

        # Set the initial status to "uploading"
        save_status(code_id, "uploading", "candidate")

        # Save file, with renaming, write in binary to prevent encoding issues
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        # TODO: set success status for test
        save_status(code_id, "success", "candidate", test_return_value=42)

        # Return the response in the expected format: ProcessResponse
        return ProcessResponse(code_id=code_id)
    
    except HTTPException:
        raise
    except Exception as e:
        if 'code_id' in locals():
            cleanup_status(code_id, "candidate")    # clean up status file when error occurs
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

        # Delete the status file
        cleanup_status(code_id, "candidate")
        
        return
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
    

@upload_router.get("/api/status/candidate/{code_id}")
async def get_candidate_status(code_id: str) -> StatusResponse:
    """
    Get the processing status of the candidate file
    """
    try:
        # Load the status data
        status_data = load_status(code_id, 'candidate')

        if status_data["status"] == "not_found":
            raise HTTPException(status_code=404, detail="Code ID not found")
        if status_data["status"] == "error":
            raise HTTPException(status_code=500, detail="Status file corrupted")

        # Return the status in the expected format: StatusResponse
        return StatusResponse(
            status=status_data["status"],
            error_message=status_data.get("error_message"),
            failed_stage=status_data.get("failed_stage"),
            test_return_value=status_data.get("test_return_value")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")