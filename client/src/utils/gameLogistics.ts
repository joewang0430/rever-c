//
// All the functions related handling the reversi logic in the front-end.
//

"use client";

import { useRouter } from "next/navigation"
import { Turn, Move, Board, PlayerStats, DIRECTIONS, MoveHistoryItem, FetchAIMoveResult } from "@/data/types/game";
import { getRowName, getColName } from "./nameConverters";
import { cleanupCandidate } from "@/api/uploadApi";
import { SetupData } from '@/data/types/setup';

// ------------------------------------------------------ Game error quit
// No Redis cleanup needed in pure-frontend flow

// Handles the general cleanup of updated candidate, when game over / quit
export const clearCandidate = async(setupData: SetupData) => {
    try {
        if (setupData.black.config?.customType === 'candidate' && setupData.black.config.customCodeId) {
            await cleanupCandidate(setupData.black.config.customCodeId);
        }
        if (setupData.white.config?.customType === 'candidate' && setupData.white.config.customCodeId) {
            await cleanupCandidate(setupData.white.config.customCodeId);
        }
    } catch (error) {
        console.error("Cleanup failed when quiting the game: ", error);
    }
};

// Issue the window to show the error, and quit the game. This function only used in game stage.
export const raiseGameErrorWindow = async(
    setupData: SetupData, 
    msg: string,
    onQuit?: () => void
) => {
    window.confirm(msg)

    clearCandidate(setupData);

    if (onQuit) onQuit();
};

// ------------------------------------------------------ Initial available moves
// Initial available moves for black for the start of the game
export const getInitialAvailableMoves = (size: number): Move[] => {
    const mid = size / 2;
    return [
        { row: mid - 2, col: mid - 1 },
        { row: mid - 1, col: mid - 2 }, 
        { row: mid,     col: mid + 1 }, 
        { row: mid + 1, col: mid }      
    ];
}

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
        return {valid: false, msg: `The move at position "${colName}${rowName}" is out of bound.`}
    } else if (isCellOccupied(board, move, size)) {
        return {valid: false, msg: `There is already a piece on position "${colName}${rowName}".`}
    } else if (!isLegalMove(board, move.row, move.col, color, size)) {
        return {valid: false, msg: `The move at position "${colName}${rowName}" has no flips.`}
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

// ------------------------------------------------------ Get board after n setups
export const generateBoardFromHistory = (
    history: MoveHistoryItem[],
    step: number,
    size: number
): Board => {
    let board = createInitialBoard(size);
    for (let i = 0; i < step; i++) {
        const item = history[i];
        const { newBoard } = getUpdatedBoard(board, item.color, item.position, size);
        board = newBoard;
    }
    return board;
};

// ------------------------------------------------------ Get initial board settings
export function createInitialBoard(n: number): Board {
    const board = Array.from({ length: n }, () => Array(n).fill('U'));
    const mid = n / 2;
    board[mid - 1][mid - 1] = 'W';
    board[mid - 1][mid] = 'B';
    board[mid][mid - 1] = 'B';
    board[mid][mid] = 'W';
    return board;
};

// ------------------------------------------------------ Check if the return result is from AI
export function isFetchAIMoveResult(obj: any): obj is FetchAIMoveResult {
    return obj && typeof obj === 'object' && 'explanation' in obj;
};

// ------------------------------------------------------ Generate randomized mid-game board
// Produce a plausible mid-game board by applying a number of random legal moves.
// This is used for homepage preview. It avoids illegal states by sampling only legal moves.
export function generateRandomBoardState(size: number, maxMoves: number = 24): Board {
    let board = createInitialBoard(size);
    let turn: Turn = 'B';

    // Random but bounded number of moves
    const movesToPlay = Math.max(4, Math.min(maxMoves, size * size));

    for (let i = 0; i < movesToPlay; i++) {
        const { availableMoves } = getMobility(board, turn, size);

        if (availableMoves.length === 0) {
            // Try the other side; if both cannot move, stop.
            const altTurn = toggleTurn(turn);
            const { availableMoves: altMoves } = getMobility(board, altTurn, size);
            if (altMoves.length === 0) {
                break;
            } else {
                turn = altTurn;
            }
        }

        const { availableMoves: mv } = getMobility(board, turn, size);
        if (mv.length === 0) break;
        const pick = mv[Math.floor(Math.random() * mv.length)];
        const { newBoard } = getUpdatedBoard(board, turn, pick, size);
        board = newBoard;
        turn = toggleTurn(turn);
    }

    return board;
}