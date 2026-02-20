'''
Routers handling computer move sending.
'''

from fastapi import APIRouter, HTTPException
from app.routers.schemas import Move, FetchCodeMoveParams, FetchAIMoveParams, AIMoveResult, CodeMoveResult
from app.ai.services import PlayAgent
import json
import random

from app.services.call_c import CMoveCaller

play_router = APIRouter()


@play_router.post("/move/custom/{custom_type}/{custom_code_id}", response_model=CodeMoveResult)
async def fetch_custom_move(
    custom_type: str,
    custom_code_id: str,
    params: FetchCodeMoveParams
):
    try:
        # data_path = custom_code_id
        data_path = f"{custom_type}s/{custom_type}_{custom_code_id}"
        move_result = CMoveCaller.call_make_move_105(
            board=params.board,
            size=params.size,
            turn=params.turn,
            data_path=data_path,
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
        data_path = f"archives/{archive_group}/{archive_id}"
        move_result = CMoveCaller.call_make_move_105(
            board=params.board,
            size=params.size,
            turn=params.turn,
            data_path=data_path,
        )
        return CodeMoveResult (
            row=move_result["row"],
            col=move_result["col"],
            elapsed=move_result["elapsed"],
            returnValue=move_result["returnValue"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@play_router.post("/move/ai/{aiId}", response_model=AIMoveResult)
async def fetch_ai_move(
    aiId: str,
    params: FetchAIMoveParams,
): 
    """
    Call corresponding APIs, input game info (board, turn, size ...), 
    return AI move and explanation.
    """
    # If no available moves, normally ReverC won't let it happen
    if not params.availableMoves:
        raise HTTPException(status_code=400, detail="There is no choice for a move")
    
    try:
        ai_response = PlayAgent.get_put(aiId, params)
        
        # Log the AI response for debugging
        print(f"AI {aiId} response: {ai_response}", flush=True)
        
        # Enhanced validation of AI response
        if not isinstance(ai_response, dict):
            raise ValueError(f"AI response is not a dict: {type(ai_response)}")
        
        if "error" in ai_response:
            raise ValueError(f"AI returned error: {ai_response['error']}")
            
        if not all(k in ai_response for k in ("row", "col")):
            raise ValueError(f"AI response missing row/col: {ai_response}")
        
        # Validate move is within board bounds
        if not (0 <= ai_response["row"] < params.size and 0 <= ai_response["col"] < params.size):
            raise ValueError(f"AI move out of bounds: ({ai_response['row']}, {ai_response['col']})")
        
        # Validate move is in available moves
        proposed_move = Move(row=ai_response["row"], col=ai_response["col"])
        if not any(move.row == proposed_move.row and move.col == proposed_move.col for move in params.availableMoves):
            raise ValueError(f"AI move not in available moves: ({proposed_move.row}, {proposed_move.col})")
        
        explanation = ai_response.get("speak", "")
        return AIMoveResult(row=proposed_move.row, col=proposed_move.col, explanation=explanation)
    except Exception as e:
        # Log error for debugging
        print(f"AI move error: {e}", flush=True)
        
        # Fallback: return a random valid move
        try:
            random_move = random.choice(params.availableMoves)
            explanation = f"Failed to get decision from {aiId}, ReverC returned a random move. Error: {str(e)}"
            return AIMoveResult(row=random_move.row, col=random_move.col, explanation=explanation)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}", flush=True)
            raise HTTPException(status_code=500, detail=f"AI call failed and fallback failed: {str(e)}")

