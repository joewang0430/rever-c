'''
Routers for handling file uploads before the game starts.
'''

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
import uuid
import os
import aiofiles
from datetime import datetime
from typing import Optional, Literal
import json
import subprocess
import asyncio
from concurrent.futures import ThreadPoolExecutor
import resource
from app.services import test_c


upload_router = APIRouter()

# Thread pool executor for running tasks in parallel
executor = ThreadPoolExecutor(max_workers=4)


# Response model, corresponds to the interface at front-end
class ProcessResponse(BaseModel):
    code_id: str

class StatusResponse(BaseModel):
    status: Literal['uploading', 'compiling', 'testing', 'success', 'failed']
    error_message: Optional[str] = None
    failed_stage: Optional[Literal['compiling', 'testing']] = None
    test_return_value: Optional[int] = None


# Tool functions
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

def set_memory_limits():
    """ Set memory limits for the process to prevent excessive memory usage """
    resource.setrlimit(resource.RLIMIT_AS, (100*1024*1024, 100*1024*1024))

def validate_c_code(file_path: str) -> bool:
    """
    Validate the C code by checking malicious code and line number restrictions
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
    except Exception:
        return False
    
    # Check for forbidden keywords
    forbidden_keywords = [
        '#include <unistd.h>',    # system calls
        '#include <sys/',         # system headers
        'system(',                # execute system commands
        'exec(',                  # execute external programs
        'fork(',                  # process operations
        'while(1)',               # infinite loop
        'for(;;)',                # infinite loop as well
        '__asm__',                # no way to do ece243 here
        'asm(',                   # same
        '#include <signal.h>',    # signal handling
        'kill(',                  # kill processes
        'exit(',                  # exit the program
    ]

    # Check if any forbidden keyword is in the code
    for keyword in forbidden_keywords:
        if keyword in code:
            return False

    # NO MORE THAN 5000 lines of code
    if len(code.splitlines()) > 5000:
        return False
    
    # Check if the function 'make_move' is defined
    if 'makeMove' not in code:
        return False
    
    return True

def compile_code(code_id: str, file_type: str) -> dict:
    """
    Compile the .c file into .so shared library
    """
    try:
        source_file = f"data/c_src/{file_type}s/{file_type}_{code_id}.c"
        output_file = f"data/shared_libs/{file_type}s/{file_type}_{code_id}.so"

        # Validate the C code before compilation
        if not validate_c_code(source_file):
            return {
                "success": False, 
                "error": "Code validation failed: contains forbidden operations, exceeds line limit, or missing make_move function"
            }
        
        # Run the gcc command to compile
        compile_command = [
            "gcc", 
            "-shared",           # generate a shared library
            "-fPIC",            # position-independent code
            "-o", output_file,   # output file
            source_file,         # src file
            "-Wall",            # show all warnings
            "-Wextra",          # additional warnings
            "-std=c99"          # use C99 standard
        ]

        result = subprocess.run(
            compile_command,
            capture_output=True, 
            text=True, 
            timeout=30,
            preexec_fn=set_memory_limits
        )

        # check compilation result
        if result.returncode == 0:
            return {"success": True}
        else:
            error_message = result.stderr if result.stderr else "Compilation failed with no error message"
            return {"success": False, "error": error_message}
        
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Compilation timeout (exceeded 30 seconds)"}
    except Exception as e:
        return {"success": False, "error": f"Compilation error: {str(e)}"}


# ==================== CANDIDATE ROUTES ====================

async def process_candidate_async(code_id: str):
    """
    Asynchronous processing of candidate files: 
    compilation & testing.
    """
    try:
        # Update status to "compiling"
        save_status(code_id, "compiling", "candidate")
        
        # Run the compile_code function in a thread pool
        loop = asyncio.get_event_loop()
        compile_result = await loop.run_in_executor(
            executor, 
            compile_code, 
            code_id, 
            "candidate"
        )
        
        if compile_result["success"]:
            save_status(code_id, "testing", "candidate")

            # Compile succeeded, now run the test_code function in the thread pool
            test_result = await loop.run_in_executor(
                executor,
                test_c.test_code,
                code_id,
                "candidate"
            )

            if test_result["success"]:
                # if test passed, save the success result
                save_status(
                    code_id, 
                    "success", 
                    "candidate", 
                    test_return_value=test_result["return_value"]
                )
            else:
                # if failed, save the error
                save_status(
                    code_id, 
                    "failed", 
                    "candidate", 
                    test_result["error"], 
                    "testing"
                )
        else:
            # Compilation failed, save the error
            save_status(
                code_id, 
                "failed", 
                "candidate", 
                compile_result["error"], 
                "compiling"
            )
            
    except Exception as e:
        # Error during processing
        save_status(code_id, "failed", "candidate", 
                   f"Processing error: {str(e)}")


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

        # Start background compilation process
        asyncio.create_task(process_candidate_async(code_id))

        # Return the response in the expected format: ProcessResponse
        return ProcessResponse(code_id=code_id)
    
    except HTTPException:
        raise
    except Exception as e:
        if 'code_id' in locals():
            cleanup_status(code_id, "candidate")    # clean up status file when error occurs
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    

@upload_router.post("/api/cleanup/candidate/{code_id}")
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
    

# ==================== CACHE ROUTES ====================

async def process_cache_async(code_id: str):
    """
    Asyncly process cache files: compilation and testing
    """
    try: 
        # Update status: begin compiling
        save_status(code_id, "compiling", "cache")

        # Compile the code in a thread pool
        loop = asyncio.get_event_loop()
        compile_result = await loop.run_in_executor(
            executor, 
            compile_code, 
            code_id, 
            "cache"
        )

        if compile_result["success"]:
            # Compilation succeeded, begin testing
            save_status(code_id, "testing", "cache")
            
            # Run the test_code function in the thread pool
            test_result = await loop.run_in_executor(
                executor,
                test_c.test_code,
                code_id,
                "cache"
            )
            
            if test_result["success"]:
                # Test passed, save the success result
                save_status(
                    code_id, 
                    "success", 
                    "cache", 
                    test_return_value=test_result["return_value"]
                )
            else:
                # Test failed, save the error
                save_status(
                    code_id, 
                    "failed", 
                    "cache", 
                    test_result["error"], 
                    "testing"
                )
        else:
            # Compilation failed, save the error
            save_status(
                code_id, 
                "failed", 
                "cache", 
                compile_result["error"], 
                "compiling"
            )

    except Exception as e:
        # Error during processing
        save_status(
            code_id, 
            "failed", 
            "cache", 
            f"Processing error: {str(e)}"
        )
    

@upload_router.post("/api/upload/cache")
async def process_cache(file: UploadFile = File(...)) -> ProcessResponse:
    """
    upload and process cache file (reuse within 36 hs)
    """
    try:
        if not file.filename or not file.filename.endswith('.c'):
            raise HTTPException(status_code=400, detail="Only .c files are allowed")
        
        # Generate a unique ID, new name, and store path for the code
        code_id = str(uuid.uuid4())
        new_filename = f"cache_{code_id}.c"
        file_path = f"data/c_src/caches/{new_filename}"

        # Set the initial status to "uploading"
        save_status(code_id, "uploading", "cache")

        # Save file, with renaming, write in binary to prevent encoding issues
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        # Start background processing task
        asyncio.create_task(process_cache_async(code_id))

        # Return the response in ProcessResponse
        return ProcessResponse(code_id=code_id)

    except HTTPException:
        raise
    except Exception as e:
        if 'code_id' in locals():
            cleanup_status(code_id, "cache")
        raise HTTPException(status_code=500, detail=f"Cache upload failed: {str(e)}")
    

@upload_router.get("/api/status/cache/{code_id}")
async def get_cache_status(code_id: str) -> StatusResponse:
    """
    Get the processing status of the cache file
    """
    try:
        # Load the status data
        status_data = load_status(code_id, 'cache')
        if status_data["status"] == "not_found":
            raise HTTPException(status_code=404, detail="Cache ID not found")
        if status_data["status"] == "error":
            raise HTTPException(status_code=500, detail="Status file corrupted")
        
        # Return the status in StatusResponse
        return StatusResponse(
            status=status_data["status"],
            error_message=status_data.get("error_message"),
            failed_stage=status_data.get("failed_stage"),
            test_return_value=status_data.get("test_return_value")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cache status: {str(e)}")
    

@upload_router.post("/api/cleanup/cache/{code_id}")
async def cleanup_cache(code_id: str):
    """
    Clean up all cache files (both .c source and .so compiled files) in this id
    """
    try:
        # delete .c
        source_file = f"data/c_src/caches/cache_{code_id}.c"
        if os.path.exists(source_file):
            os.remove(source_file)

        # delete .so
        compiled_file = f"data/shared_libs/caches/cache_{code_id}.so"
        if os.path.exists(compiled_file):
            os.remove(compiled_file)

        # delete status file
        cleanup_status(code_id, "cache")

        return {"message": "Cache files cleaned up successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache cleanup failed: {str(e)}")
    

@upload_router.get("/api/status/archive/{archive_group}/{archive_id}")
async def check_archive_exists(archive_group: str, archive_id: str):
    """
    Check if the archive code exists in the specified group and ID.
    """
    c_path = f"data/c_src/archives/{archive_group}/{archive_id}.c"
    so_path = f"data/shared_libs/archives/{archive_group}/{archive_id}.so"
    
    if os.path.exists(c_path) and os.path.exists(so_path):
        return {"status": "exists"}
    else:
        raise HTTPException(status_code=404, detail="Archive not found")