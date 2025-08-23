'''
All data structures for API routers.
'''

from pydantic import BaseModel
from typing import Any, List, Optional, Literal

# ===== play.py models =====
class Move(BaseModel):
    row: int
    col: int

class FetchCodeMoveParams(BaseModel):
    board: List[List[str]]  # Should be 'B', 'W', or 'U' only
    turn: str  # Should be 'B' or 'W' only
    size: int

class FetchAIMoveParams(BaseModel):
    board: List[List[str]]  # Should be 'B', 'W', or 'U' only
    turn: str  # Should be 'B' or 'W' only
    size: int
    availableMoves: List[Move]
    lastMove: Optional[Move]

class AIMoveResult(BaseModel):
    row: int
    col: int
    explanation: str

class CodeMoveResult(BaseModel):
    row: int
    col: int
    elapsed: int
    returnValue: Any

# ===== game.py models =====
class SetupDataRequest(BaseModel):
    matchId: str
    setupData: dict

# ===== upload.py models =====
class ProcessResponse(BaseModel):
    code_id: str

class StatusResponse(BaseModel):
    status: Literal['uploading', 'compiling', 'testing', 'success', 'failed']
    error_message: Optional[str] = None
    failed_stage: Optional[Literal['compiling', 'testing']] = None
    test_return_value: Optional[int] = None
