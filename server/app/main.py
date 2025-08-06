from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import os
from datetime import datetime, timedelta
from app.utils import call_c, cleanup
from app.routers import upload, game, play

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ——— Startup phase ———
    # TODO: add dump_archives_to_fs() here later
    # — Start TTL cleanup scheduler —
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        cleanup.cleanup_ttl,
        trigger="interval",
        minutes=30,
        id="cleanup_ttl_job",
        replace_existing=True
    )
    scheduler.start()

    yield

    # ——— Shutdown phase ———
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# ---- Cross-domain configuration, convenient for local development ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # TODO: Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Include routers ----
app.include_router(upload.upload_router)
app.include_router(game.game_router, prefix="/api/game")
app.include_router(play.play_router, prefix="/api")

# ---- API Endpoints ----
@app.get("/ping")
async def ping():
    """ simple testing endpoint """
    return {"msg": "pong"}

@app.get("/test")
async def test_c_endpoint():
    """
    This endpoint calls a C function from a shared library and returns the result.
    """
    try:
        result = call_c.call_test_layer1()
    except FileNotFoundError as e:
        # if the shared library is not found, raise a 404 error
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"C function illegal {e}")

    return {"testLayer1_return": result}
