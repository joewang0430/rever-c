'''
All the rooters, related to the single game management.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from app.core.redis import redis_client

