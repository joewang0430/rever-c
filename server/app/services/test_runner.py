# server/app/services/test_runner.py
import sys
import os
import json
import ctypes
from typing import List, Tuple

def build_board() -> Tuple[ctypes.Array, List[Tuple[int, int]]]:
    ArrayType = ctypes.c_char * 26
    board_array = (ArrayType * 26)()
    for i in range(26):
        for j in range(26):
            board_array[i][j] = b'U'
    board_array[3][3] = b'W'
    board_array[3][4] = b'B'
    board_array[4][3] = b'B'
    board_array[4][4] = b'W'
    valid_moves = [(2, 3), (3, 2), (4, 5), (5, 4)]
    return board_array, valid_moves

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing args: code_id file_type"}))
        sys.exit(1)
    code_id, file_type = sys.argv[1], sys.argv[2]
    so_path = f"data/shared_libs/{file_type}s/{file_type}_{code_id}.so"

    if not os.path.exists(so_path):
        print(json.dumps({"error": f"Shared library not found: {so_path}"}))
        sys.exit(1)

    try:
        lib = ctypes.CDLL(so_path)
    except OSError as e:
        print(json.dumps({"error": f"Failed to load shared library: {str(e)}"}))
        sys.exit(1)

    try:
        make_move = lib.makeMove
    except AttributeError:
        print(json.dumps({"error": "Function 'makeMove' not found in shared library"}))
        sys.exit(1)

    Board26x26 = (ctypes.c_char * 26) * 26
    make_move.argtypes = [
        Board26x26, ctypes.c_int, ctypes.c_char,
        ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int)
    ]
    make_move.restype = ctypes.c_int

    board, _ = build_board()
    row = ctypes.c_int()
    col = ctypes.c_int()

    try:
        result = make_move(board, 8, b'B', ctypes.byref(row), ctypes.byref(col))
        move = (row.value, col.value)
        if not (0 <= move[0] < 8 and 0 <= move[1] < 8):
            print(json.dumps({"error": f"Move out of bounds: {move}", "return_value": int(result)}))
            sys.exit(1)
        print(json.dumps({"return_value": int(result)}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": f"Runtime error during makeMove execution: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()