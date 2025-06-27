//
// Frontend data sturctures for game-related data.
//

export type Turn = 'B' | 'W';

export interface Move {
    row: number;
    col: number;
    turn: Turn;
}

export interface PlayerStats {
    pieceCount: number;
    mobility: number;
    totalTime?: number; // only used if player type is 'archive' or 'custom'
    maxTime?: number; // only used if player type is 'archive' or 'custom'
    returnValue?: number; // only used if player type is 'archive' or 'custom'
}

export interface MoveHistoryItem {
  index: number;    // how many moves have been made
  color: Turn;      // the color of the piece that was placed
  position: { row: number; col: number };   // the position of the piece that was placed
  pieceCount: { B: number; W: number };     // the number of pieces for each color after this move
  mobility: { B: number; W: number };       // how many legal moves each color has after this move
}

export function createInitialBoard(n: number): string[][] {
    const board = Array.from({ length: n }, () => Array(n).fill('U'));
    const mid = n / 2;
    board[mid - 1][mid - 1] = 'W';
    board[mid - 1][mid] = 'B';
    board[mid][mid - 1] = 'B';
    board[mid][mid] = 'W';
    return board;
}