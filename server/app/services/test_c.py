'''
Functions to test C code and shared libraries, in setup stage.
'''

import ctypes
import os
import threading
from typing import Dict, Tuple, List


class TimeoutException(Exception):
    pass


def test_code(code_id: str, file_type: str) -> dict:
    """
    Test the uploaded code by sending the testing data to the makeMove function:
    int makeMove(const char board[][26], int n, char turn, int *row, int *col);
    """
    try:
        # Define the path to the shared library
        so_file_path = f"data/shared_libs/{file_type}s/{file_type}_{code_id}.so"
        if not os.path.exists(so_file_path):
            return {
                "success": False,
                "error": f"Shared library not found: {so_file_path}",
                "return_value": None,
                "move": None
            }
        
        # Load the shared library
        try:
            lib = ctypes.CDLL(so_file_path)
        except OSError as e:
            return {
                "success": False,
                "error": f"Failed to load shared library: {str(e)}",
                "return_value": None,
                "move": None
            }
        
        # Get the function makeMove from the library
        try:
            make_move = lib.makeMove
        except AttributeError:
            return {
                "success": False,
                "error": "Function 'makeMove' not found in shared library",
                "return_value": None,
                "move": None
            }
        
        # Define the argument and return types for makeMove
        # int makeMove(const char board[][26], int n, char turn, int *row, int *col)
        Board26x26 = (ctypes.c_char * 26) * 26
        make_move.argtypes = [
            Board26x26,            # board[][26]
            ctypes.c_int,                       # n
            ctypes.c_char,                      # turn
            ctypes.POINTER(ctypes.c_int),       # row*
            ctypes.POINTER(ctypes.c_int)        # col*
        ]
        make_move.restype = ctypes.c_int  # return type is int

        # Prepare the test data
        board, valid_moves = _prepare_test_data()

        # Prepare the output parameters for row and col
        row = ctypes.c_int()
        col = ctypes.c_int()

        # Use threading to realize the timeout mechanism
        result_container = {}
        exception_container = {}
        
        def run_function():
            try:
                result = make_move(board, 8, b'B', ctypes.byref(row), ctypes.byref(col))
                result_container['result'] = result
                result_container['row'] = row.value
                result_container['col'] = col.value
            except Exception as e:
                exception_container['exception'] = e
        
        # Start the thread to run the function
        thread = threading.Thread(target=run_function)
        thread.daemon = True
        thread.start()
        
        # Max wait 60s
        thread.join(timeout=60)
        
        if thread.is_alive():
            # Time out occurred
            return {
                "success": False,
                "error": "Test execution timed out after 1 minute",
                "return_value": None,
                "move": None
            }
        
        # Check if there was an exception during the function execution
        if 'exception' in exception_container:
            return {
                "success": False,
                "error": f"Runtime error during makeMove execution: {str(exception_container['exception'])}",
                "return_value": None,
                "move": None
            }
        
        # Get the result from the result container
        if 'result' not in result_container:
            return {
                "success": False,
                "error": "Function execution failed without exception",
                "return_value": None,
                "move": None
            }
        
        result = result_container['result']
        move_position = (result_container['row'], result_container['col'])
        
        # Check if the result is valid
        if not (0 <= move_position[0] < 8 and 0 <= move_position[1] < 8): # Check if the move is within bounds
            return {
                "success": False,
                "error": f"Move out of bounds: {move_position}",
                "return_value": result,
                "move": move_position
            }
        
        if move_position in valid_moves:    # Check if the move is valid
            return {
                "success": True,
                "error": None,
                "return_value": result,
                "move": move_position
            }
        else:
            return {
                "success": False,
                "error": f"Invalid move: {move_position}. Valid moves are: {valid_moves}",
                "return_value": result,
                "move": move_position
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error during testing: {str(e)}",
            "return_value": None,
            "move": None
        }

def _prepare_test_data() -> Tuple[ctypes.Array, List[Tuple[int, int]]]:
    """
    Prepare the board data and valid positions for the test
    """
    # Create a 26x26 array but only use the first 8x8
    board_data = [
        ['U'] * 26 for _ in range(26)
    ]
    
    # Initialize the 8x8 board with some pieces
    board_data[3][3] = 'W'  # (3,3) = W
    board_data[3][4] = 'B'  # (3,4) = B
    board_data[4][3] = 'B'  # (4,3) = B
    board_data[4][4] = 'W'  # (4,4) = W
    
    # Convert to ctypes array
    ArrayType = ctypes.c_char * 26
    board_array = (ArrayType * 26)()
    
    for i in range(26):
        for j in range(26):
            board_array[i][j] = board_data[i][j].encode('utf-8')
    
    # Define valid moves for the test
    valid_moves = [(2, 3), (3, 2), (4, 5), (5, 4)]
    
    return board_array, valid_moves