'''
Routers handling computer move sending.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import time

from app.services.call_c import CMoveCaller

play_router = APIRouter()

class FetchCodeMoveParams(BaseModel):
    board: list[list[str]]
    turn: str   # 'B' or 'W'
    size: int

class CodeMoveResult(BaseModel):
    row: int
    col: int
    elapsed: int
    returnValue: Any


@play_router.post("/move/{custom_type}/{custom_code_id}", response_model=CodeMoveResult)
async def fetch_custom_move(
    custom_type: str,
    custom_code_id: str,
    params: FetchCodeMoveParams
):
    try:
        file_path = custom_code_id
        move_result = CMoveCaller.call_make_move_105(
            board=params.board,
            size=params.size,
            turn=params.turn,
            code_type=custom_type,
            file_path=file_path,
        )
        return CodeMoveResult (
            row=move_result["row"],
            col=move_result["col"],
            elapsed=move_result["elapsed"],
            returnValue=move_result["returnValue"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@play_router.post("/move/archive/{archive_group}/{archive_id}", response_model=CodeMoveResult)
async def fetch_archive_move(
    archive_group: str,
    archive_id: str,
    params: FetchCodeMoveParams
):
    try:
        file_path = f"{archive_group}/{archive_id}"
        move_result = CMoveCaller.call_make_move_105(
            board=params.board,
            size=params.size,
            turn=params.turn,
            code_type="archive",
            file_path=file_path,
        )
        return CodeMoveResult (
            row=move_result["row"],
            col=move_result["col"],
            elapsed=move_result["elapsed"],
            returnValue=move_result["returnValue"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))