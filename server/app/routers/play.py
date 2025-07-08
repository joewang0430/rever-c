'''
Routers handling computer move sending.
'''

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import time
import os
import requests
import json
import random
import re

from app.services.call_c import CMoveCaller

play_router = APIRouter()

class Move(BaseModel):
    row: int
    col: int

class FetchCodeMoveParams(BaseModel):
    board: list[list[str]]
    turn: str   # 'B' or 'W'
    size: int

class FetchAIMoveParams(BaseModel):
    board: list[list[str]]
    turn: str   # 'B' or 'W'
    size: int
    availableMoves: list[Move]
    lastMove: Move | None

class AIMoveResult(BaseModel):
    row: int
    col: int
    explanation: str

class CodeMoveResult(BaseModel):
    row: int
    col: int
    elapsed: int
    returnValue: Any


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
    Call Ollama native models, input game info (board, turn, size ...), 
    return AI move and explanation.
    """

    # If no available moves, but ReverC won't let it happen
    if not params.availableMoves:
        raise HTTPException(status_code=400, detail="无可选落子")
    
    # Get Ollama base url
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434") # TODO: change back 
    # ollama_base_url = "http://localhost:11434"
    model_name = aiId

    # Construct prompt
    # prompt = (
    #     f"当前是黑白棋游戏，请你作为AI帮我选择下一步。\n"
    #     f"棋盘大小: {params.size}。\n"
    #     f"当前棋盘（B=黑，W=白，U=空）:\n{json.dumps(params.board, ensure_ascii=False)}\n"
    #     f"当前轮到: {params.turn}\n"
    #     f"可选落子: {json.dumps([move.dict() for move in params.availableMoves])}\n"
    #     f"上一步: {params.lastMove.dict() if params.lastMove else None}\n"
    #     f"请只从可选落子中选择一步，并用如下JSON格式返回：\n"
    #     f'{{"row": 行号, "col": 列号, "speak": "你的理由"}}'
    # )

    turnName = ""
    opponentTurnName = ""
    if params.turn == "B":
        turn_name = "black"
        opponentTurnName = "white"
    elif params.turn == "W":
        turn_name = "white"
        opponentTurnName = "black"
    else:
        turn_name = params.turn
    # prompt = (
    #     f"This is a reversi board during a reversi game. You are required to make the next move, and say something, and return them in a strict JSON format.\n"
    #     f"The board size is {params.size}, letters representation: (B=black, W=white, U=empty). Here is the current board:\n"
    #     f"\n{json.dumps(params.board, ensure_ascii=False)}\n"
    #     f"The postion are represented by row and col. row: (0 to {params.size} form left to right); col: (0 to {params.size} from top to bottom).\n"
    #     f"Your opponent made the prevous move in {opponentTurnName} on {params.lastMove.dict() if params.lastMove else None}, now you are playing {turnName}({params.turn}), and you must select one choice of row and col form your current available moves: {json.dumps([move.dict() for move in params.availableMoves])}\n"
    #     f"Also, you are required to say something based on the current game situation, less than 40 words.\n"
    #     f"Your final response must in the JSON format: \n"
    #     f'{{"row": row number, "col": column number, "speak": something you said}}\n'
    # )

    prompt = (
        "This is a Reversi (Othello) game. You are required to make the next move and say something, and return them in a strict JSON format.\n"
        f"The board size is {params.size}, with letters representation: (B=black, W=white, U=empty). Here is the current board:\n"
        f"{json.dumps(params.board, ensure_ascii=False)}\n"
        f"The positions are represented by row and col. Row: 0 to {params.size} from left to right; Col: 0 to {params.size} from top to bottom.\n"
        f"Your opponent made the previous move as {opponentTurnName} on {params.lastMove.model_dump() if params.lastMove else None}. Now you are playing {turn_name} ({params.turn}), and you must select one move from your current available moves: {json.dumps([move.model_dump() for move in params.availableMoves])}\n"
        'Also, use the "speak" field to add a short comment (up to 40 words) about the game, which can be either humorous or serious.\n'
        "Your final response must be in the following JSON format (do not output anything else):\n"
        '{"row": 0, "col": 0, "speak": "Your words here."}\n'
    )

    # Call Ollama API
    try: 
        resp = requests.post(
            f"{ollama_base_url}/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        resp.raise_for_status()
        result = resp.json()

        # Resolve Ollama return value 
        raw_response_str = result.get("response", "")
        try:
            ai_response = json.loads(raw_response_str)
        except Exception:
            try:
                ai_response = json.loads(raw_response_str.strip())
            except Exception:
                # Use re to extract the first {...}
                match = re.search(r'\{.*\}', raw_response_str, re.DOTALL)
                if match:
                    try:
                        ai_response = json.loads(match.group(0))
                        print("Ollama raw response:", raw_response_str, flush=True)
                        move = Move(row=ai_response["row"], col=ai_response["col"])
                        explanation = ai_response.get("speak", "")
                        return AIMoveResult(row=move.row, col=move.col, explanation=explanation)
                    except Exception:
                        print("Ollama raw response repr:", repr(raw_response_str), flush=True)
                        random_move = random.choice(params.availableMoves)
                        move = Move(row=random_move.row, col=random_move.col)
                        explanation = f"Failed to get decision from {aiId}, ReverC returned a random move."
                        return AIMoveResult(row=move.row, col=move.col, explanation=explanation)
                else:
                    print("Ollama raw response:", raw_response_str, flush=True)
                    print("Ollama raw response repr:", repr(raw_response_str), flush=True)
                    random_move = random.choice(params.availableMoves)
                    move = Move(row=random_move.row, col=random_move.col)
                    explanation = f"Failed to get decision from {aiId}, ReverC returned a random move."
                    return AIMoveResult(row=move.row, col=move.col, explanation=explanation)
                
        # If the firstmost try/except can resolve directly，then if needs return as well
        move = Move(row=ai_response["row"], col=ai_response["col"])
        explanation = ai_response.get("speak", "")
        return AIMoveResult(row=move.row, col=move.col, explanation=explanation)
    except Exception as e:
        print("AI move error:", e, flush=True)  # tbdl
        raise HTTPException(status_code=500, detail=f"Call Ollama failed: {str(e)}")

