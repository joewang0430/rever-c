//
// All the functions related handling the reversi logic in the front-end.
//

import { Turn, Move, Board, PlayerStats, DIRECTIONS } from "@/data/types/game";
import { getRowName, getColName } from "./nameConverters";

// Issue the window to show the error, and quit the game. This function only used in game stage.
export const raiseGameErrorWindow = (msg: string) => {
    if (window.confirm(msg)) {
        return; //TODO: finish it: api to get to the setup page and clean the game data original.
    }
};

// ------------------------------------------------------ Check if current move is valid
export const checkLegalMove = (
    board: Board, 
    color: Turn, 
    move: Move,
    size: number
): {valid: boolean, msg: string} => {
    // Check network? first
    // Check return first
    // Check in bound first
    const rowName = getRowName(move.row);
    const colName = getColName(move.col);
    if (!isInBound(move, size)) {
        return {valid: false, msg: `The move at position "${rowName}${colName}" is out of bound.`}
    } else if (isCellOccupied(board, move, size)) {
        return {valid: false, msg: `There is already a piece on position "${rowName}${colName}".`}
    } else if (!isLegalMove(board, move.row, move.col, color, size)) {
        return {valid: false, msg: `The move at position "${rowName}${colName}" has no flips.`}
    }
    return {valid: true, msg: ""};
};

const isInBound = (move: Move, size: number): boolean => {
    return (
        move.row >= 0 && move.row < size &&
        move.col >=0 && move.col < size
    );
};

const isCellOccupied = (board: Board, move: Move, size: number): boolean => {
    const cellColor = board[move.row][move.col];
    if (cellColor !== 'U' && isInBound(move, size)) {
        return true;
    }
    return false;
}

const isLegalMove = (
    board: Board,
    row: number,
    col: number,
    color: Turn,
    size: number,
): boolean => {
    for (const [dr, dc] of DIRECTIONS) {
        if (checkDirectionValid(board, row, col, color, dr, dc, size)) {
            return true;
        }
    }
    return false;
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
    color: Turn, 
    move: Move, 
    size: number
): { newBoard: Board, flipsCount: number, flippedPositions: Move[] } => {

    const newBoard = createBoardCopy(board, size);
    newBoard[move.row][move.col] = color;
    const { flipsCount, flippedPositions } = flipAllDirections(newBoard, move.row, move.col, color, size);

    return { newBoard, flipsCount, flippedPositions }; 
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
): { flipsCount: number, flippedPositions: Move[] } => {
    let totalFlips = 0;
    let flippedPositions: Move[] = [];

    for (const [dr, dc] of DIRECTIONS) {
        const { flips, positions } = flipInDirection(board, row, col, color, dr, dc, size);
        totalFlips += flips;
        flippedPositions.push(...positions);
    }
    return { flipsCount: totalFlips, flippedPositions }; 
};

const flipInDirection = (
    board: Board, 
    row: number,
    col: number,
    color: Turn,
    deltaRow: number,
    deltaCol: number,
    size: number
): { flips: number, positions: Move[] } => {
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
    let flipped: Move[] = [];
    if (
        toFlip.length > 0 && 
        r >= 0 && r < size &&
        c >= 0 && c < size &&
        board[r][c] === color
    ) {
        for (const [fr, fc] of toFlip) {
            board[fr][fc] = color;
            flips ++;
            flipped.push({ row: fr, col: fc });
        }
    }
    return { flips, positions: flipped };
};

// ------------------------------------------------------ Switch sides
export const toggleTurn = (turn: Turn): Turn => {
    return turn === 'B' ? 'W' : 'B';
};

// ------------------------------------------------------ Check if game over
export const checkGameOver = (board: Board, size: number): boolean => {
    return (
        isFull(board, size) || 
        (!canMove(board, 'B', size) && !canMove(board, 'W', size))
    );
};

export const canMove = (board: Board, color: Turn, size: number): boolean => {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {

            if (board[row][col] === 'U') {
                if (isLegalMove(board, row, col, color, size)) {
                    return true;
                }
            }
        }
    }
    return false;
};

const isFull = (board: Board, size: number) => {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {

            if (board[row][col] === 'U') {
                return false;
            }
        }
    }
    return true;
};

// ------------------------------------------------------ Get piece number
export const getPieceCount = (board: Board, color: Turn, size: number): number => {
    let count = 0;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {

            if (board[row][col] === color) {
                count++;
            }
        }
    }
    return count;
};

// ------------------------------------------------------ Get how many avaible moves
export const getMobility = (
    board: Board, 
    color: Turn, 
    size: number
): {mobility: number, availableMoves: Move[]} => {
    let count = 0;
    let availableMoves: Move[] = [];

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] !== 'U') continue;
            if (isLegalMove(board, row, col, color, size)) {
                count++;
                availableMoves.push({ row: row, col: col })
            }
        }
    }
    return{ mobility: count, availableMoves};
};
