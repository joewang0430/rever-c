'''
Routers for game statistics.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import fcntl
from datetime import datetime

stats_router = APIRouter()

STATS_FILE = "data/stats/game_stats.json"

class StatsResponse(BaseModel):
    total_games: int
    last_updated: str


def _ensure_stats_file():
    """Ensure stats directory and file exist with initial data"""
    os.makedirs(os.path.dirname(STATS_FILE), exist_ok=True)
    if not os.path.exists(STATS_FILE):
        with open(STATS_FILE, 'w') as f:
            json.dump({
                "total_games": 0,
                "last_updated": datetime.now().isoformat()
            }, f)


def _read_stats() -> dict:
    """Read stats from file"""
    _ensure_stats_file()
    with open(STATS_FILE, 'r') as f:
        return json.load(f)


def _increment_stats():
    """Increment game count with file locking for concurrency safety"""
    _ensure_stats_file()
    with open(STATS_FILE, 'r+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)  # Exclusive lock
        try:
            data = json.load(f)
            data["total_games"] += 1
            data["last_updated"] = datetime.now().isoformat()
            f.seek(0)
            json.dump(data, f)
            f.truncate()
        finally:
            fcntl.flock(f, fcntl.LOCK_UN)  # Release lock
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
