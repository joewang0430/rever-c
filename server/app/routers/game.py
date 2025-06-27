'''
All the rooters, related to the single game management.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from app.core.redis import redis_client

router = APIRouter()

class SetupDataRequest(BaseModel):
    matchId: str
    setupData: dict

@router.post("/api/game/setup")
async def save_setup_data(req: SetupDataRequest):
    key = f"match:{req.matchId}:setup"
    try:
        await redis_client.set(key, json.dumps(req.setupData))
        return {"success": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))