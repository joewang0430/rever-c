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

// Check if current move is valid
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

// Update the board
export const getUpdatedBoard = (
    board: Board, 
    turn: Turn, 
    move: Move, 
    size: number
): { board: Board, flipsCount: number } => {
    const flipsCount = 0;
    return { board, flipsCount};   // TODO: finish it
};

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