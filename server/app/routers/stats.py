'''
Routers for game statistics.
Uses Google Cloud Storage for persistent data storage.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
from datetime import datetime
from google.cloud import storage
import threading

stats_router = APIRouter()

# GCS configuration
GCS_BUCKET = os.environ.get("GCS_STATS_BUCKET", "reverc-stats")
GCS_BLOB_NAME = "game_stats.json"

# Thread lock for concurrent access
_stats_lock = threading.Lock()

class StatsResponse(BaseModel):
    total_games: int
    last_updated: str


def _get_gcs_client():
    """Get GCS client (uses default credentials in Cloud Run)"""
    return storage.Client()


def _read_stats_from_gcs() -> dict:
    """Read stats from GCS bucket"""
    try:
        client = _get_gcs_client()
        bucket = client.bucket(GCS_BUCKET)
        blob = bucket.blob(GCS_BLOB_NAME)
        
        if not blob.exists():
            # Initialize with default data if blob doesn't exist
            initial_data = {
                "total_games": 0,
                "last_updated": datetime.now().isoformat()
            }
            blob.upload_from_string(json.dumps(initial_data), content_type="application/json")
            return initial_data
        
        content = blob.download_as_string()
        return json.loads(content)
    except Exception as e:
        print(f"Error reading from GCS: {e}")
        # Return default data on error
        return {
            "total_games": 0,
            "last_updated": datetime.now().isoformat()
        }


def _write_stats_to_gcs(data: dict):
    """Write stats to GCS bucket"""
    client = _get_gcs_client()
    bucket = client.bucket(GCS_BUCKET)
    blob = bucket.blob(GCS_BLOB_NAME)
    blob.upload_from_string(json.dumps(data), content_type="application/json")


def _read_stats() -> dict:
    """Read stats from GCS"""
    return _read_stats_from_gcs()


def _increment_stats():
    """Increment game count with thread locking for concurrency safety"""
    with _stats_lock:
        data = _read_stats_from_gcs()
        data["total_games"] += 1
        data["last_updated"] = datetime.now().isoformat()
        _write_stats_to_gcs(data)
    return data


@stats_router.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get current game statistics"""
    try:
        data = _read_stats()
        return StatsResponse(
            total_games=data["total_games"],
            last_updated=data["last_updated"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read stats: {str(e)}")


@stats_router.post("/api/stats/increment", response_model=StatsResponse)
async def increment_stats():
    """Increment the total games count"""
    try:
        data = _increment_stats()
        return StatsResponse(
            total_games=data["total_games"],
            last_updated=data["last_updated"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to increment stats: {str(e)}")
