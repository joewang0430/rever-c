'''
Call the .c function to make move decision, during the game.
'''

import ctypes
import os
import time

class CMoveCaller:
    @staticmethod
    def call_make_move_105(board, size, turn, data_path):
        """
        Call makeMove() function in .c file, 
        which extracted from lab 8, APS105, 2022 version, University of Toronto.

        It returns row, col, elapsed, returnValue

        board: list[list[str]]
        size: int
        turn: str ('B' or 'W')
        code_type: 'candidate' | 'cache' | 'archive'
        data_path: .so file path, relative
        """
        # Create .so path
        so_file_path = f"data/shared_libs/{data_path}.so"
        if not os.path.exists(so_file_path):
            raise FileNotFoundError(f"Shared library not found: {so_file_path}")
        
        # Upload .so
        lib = ctypes.CDLL(so_file_path)

        # Get makeMoke function
        try:
            make_move = lib.makeMove
        except AttributeError:
            raise RuntimeError("Function 'makeMove' not found in shared library")
        
        # Set parameter type
        Board26x26 = (ctypes.c_char * 26) * 26
        make_move.argtypes = [
            Board26x26,            # board[][26]
            ctypes.c_int,          # n
            ctypes.c_char,         # turn
            ctypes.POINTER(ctypes.c_int),  # row*
            ctypes.POINTER(ctypes.c_int)   # col*
        ]
        make_move.restype = ctypes.c_int

        # Convert board into ctypes
        board_array = Board26x26()
        for i in range(26):
            for j in range(26):
                if i < len(board) and j < len(board[i]):
                    board_array[i][j] = board[i][j].encode('utf-8')
                else:
                    board_array[i][j] = b'U'

        # row, col output parameter
        row = ctypes.c_int()
        col = ctypes.c_int()

        # Timing and calling
        start = time.time()
        return_value = make_move(board_array, size, turn.encode('utf-8'), ctypes.byref(row), ctypes.byref(col))
        elapsed = int((time.time() - start) * 1000 * 1000) # us

        #  Return
        return {
            "row": row.value,
            "col": col.value,
            "elapsed": elapsed,
            "returnValue": return_value
        }

    