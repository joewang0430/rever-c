'''
Single game start/delete management routers.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from app.core.redis import redis_client


game_router = APIRouter()


class SetupDataRequest(BaseModel):
    matchId: str
    setupData: dict


@game_router.post("/setup")
async def save_setup_data(req: SetupDataRequest):
    key = f"game:{req.matchId}:setup"
    try:
        await redis_client.set(key, json.dumps(req.setupData), ex=14400)  # Set expiration to 4 hours
        return {"success": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@game_router.get("/setup/{match_id}")
async def get_setup_data(match_id: str):
    key = f"game:{match_id}:setup"
    data = await redis_client.get(key)
    if not data:
        raise HTTPException(status_code=404, detail="Setup data not found")
    return {"setupData": json.loads(data)}