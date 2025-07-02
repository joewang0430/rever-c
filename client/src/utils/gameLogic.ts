//
// All the functions related handling the reversi logic in the front-end.
//

import { Turn, Move, Board, PlayerStats } from "@/data/types/game";

// Issue the window to show the error, and quit the game. This function only used in game stage.
export const raiseGameErrorWindow = (msg: string) => {
    if (window.confirm(msg)) {
        return; //TODO: finish it: api to get to the setup page and clean the game data original.
    }
};

// ------------------------------------------------------ Check if current move is valid
export const checkLegalMove = (
    board: Board, 
    turn: Turn, 
    move: Move,
    size: number
): {valid: boolean, msg: string} => {
    // Check network? first
    // Check return first
    // Check in bound first
    return {valid: true, msg: 'ok'};    // TODO: finish it
};

const checkDirectionValid = (
    board: Board, 
    row: number, 
    col: number, 
    color: Turn, 
    deltaRow: number,
    deltaCol: number,
    size: number
): boolean => {
    let r = row + deltaRow;
    let c = col + deltaCol;
    const opponent = color === 'B' ? 'W' : 'B';
    let foundOpponent = false;

    while (
        r >= 0 && r < size && 
        c >= 0 && c < size &&
        board[r][c] === opponent
    ) {
        foundOpponent = true;
        r += deltaRow;
        c += deltaCol;
    }
    return (
        foundOpponent &&
        r >= 0 && r < size &&
        c >= 0 && c < size &&
        board[r][c] === color
    );
};

// ------------------------------------------------------ Update the board
export const getUpdatedBoard = (
    board: Board, 
    turn: Turn, 
    move: Move, 
    size: number
): { newBoard: Board, flipsCount: number } => {

    const newBoard = createBoardCopy(board, size);
    newBoard[move.row][move.col] = turn;
    const flipsCount = flipAllDirections(newBoard, move.row, move.col, turn, size);

    return { newBoard, flipsCount};   // TODO: finish it
};

const createBoardCopy = (board: Board, size: number): Board => {
    const newBoard: Board = [];
    for (let row = 0; row < size; row++) {
        newBoard[row] = [...board[row]];
    }
    return newBoard;
};

const flipAllDirections = (
    board: Board,
    row: number,
    col: number,
    color: Turn,
    size: number
): number => {
    const directions = [
        [-1, -1],   [-1, 0],    [-1, 1],
        [0, -1],                [0, 1],
        [1, -1],    [1, 0],     [1, 1]
    ];
    let totalFlips = 0;
    for (const [dr, dc] of directions) {
        totalFlips += flipInDirection(board, row, col, color, dr, dc, size);
    }
    return totalFlips;
};

const flipInDirection = (
    board: Board, 
    row: number,
    col: number,
    color: Turn,
    deltaRow: number,
    deltaCol: number,
    size: number
): number => {
    let r = row + deltaRow;
    let c = col + deltaCol;
    let flips = 0;
    const opponent = color === 'B' ? 'W' : 'B';

    // Collect the can-be-flipped piece locations first
    const toFlip: [number, number][] = [];
    while (
        r >= 0 && r < size &&
        c >= 0 && c < size && 
        board[r][c] === opponent
    ) {
        toFlip.push([r, c]);
        r += deltaRow;
        c += deltaCol;
    }

    // Only valid and flip if self-side are met
    if (
        toFlip.length > 0 && 
        r >= 0 && r < size &&
        c >= 0 && c < size &&
        board[r][c] === color
    ) {
        for (const [fr, fc] of toFlip) {
            board[fr][fc] = color;
            flips ++;
        }
    }
    return flips;
};

// ------------------------------------------------------ Other tool functions

// Switch the player turn
export const toggleTurn = (turn: Turn): Turn => {
    return turn === 'B' ? 'W' : 'B';
};

// Check if game over
export const checkGameOver = (board: Board, size: number): boolean => {
    return false; // TODO: finish it
};

// Get how many pieces certain color in the board
export const getPieceCount = (board: Board, turn: Turn, size: number): number => {
    return -1;  // TODO: finish it
};

// Get how many available moves certain color in the board
export const getMobility = (board: Board, turn: Turn, size: number): number => {
    return -1;  // TODO: finish it 
};