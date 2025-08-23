from app.routers.schemas import Move, FetchAIMoveParams, AIMoveResult
import json

class Prompt:
    @staticmethod
    def get_put_prompt_normal(params: FetchAIMoveParams) -> str:
        '''
        Prompt for getting AI answer in playing Reversi.
        '''
        # Build player names
        turn_name = ""
        opponentTurnName = ""
        if params.turn == "B":
            turn_name = "black"
            opponentTurnName = "white"
        elif params.turn == "W":
            turn_name = "white"
            opponentTurnName = "black"
        else:
            turn_name = params.turn

        board_size = params.size
        if board_size == 8:
            board_size_msg = "The board size is classic 8x8."
        else:
            board_size_msg = f"Notice that the board size here is {board_size}x{board_size}."

        previous_move_msg = ""
        if params.lastMove:
            previous_move_msg = f"Your opponent made the previous move as {opponentTurnName} on {params.lastMove.model_dump()}. "

        # Improved coordinate explanation
        coord_msg = f"The positions are represented by 'row' and 'col'. 'row' is the vertical index (0 to {board_size-1} from top to bottom), and 'col' is the horizontal index (0 to {board_size-1} from left to right)."

        prompt = (
            "This is a Reversi (Othello) game. You are required to make the next move and say something, and return them in a strict JSON format.\n"
            f"{board_size_msg} With letters representation: (B=black, W=white, U=empty). Here is the current board:\n"
            f"{json.dumps(params.board, ensure_ascii=False)}\n"
            f"{coord_msg}\n"
            f"{previous_move_msg}Now you are playing {turn_name} ({params.turn}), and you must select one move from your current available moves: {json.dumps([move.model_dump() for move in params.availableMoves])}\n"
            'Also, use the "speak" field to add a short comment (up to 40 words) about the game, which can be either humorous or serious.\n'
            "Your final response must be in the following JSON format (do not output anything else):\n"
            '{"row": Your row number (example: 0), "col": Your col number (example: 0), "speak": "Your words here."}\n'
        )

        # Debug print for prompt
        # print("** the prompt is: ", prompt) 
        return prompt