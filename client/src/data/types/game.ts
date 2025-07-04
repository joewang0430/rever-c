//
// Frontend data sturctures for game-related data.
//

export const DIRECTIONS = [
        [-1, -1],   [-1, 0],  [-1, 1],
        [0, -1],              [0, 1],
        [1, -1],    [1, 0],   [1, 1]
];

export type Turn = 'B' | 'W';
export type Draw = 'D';
export type BoardValue = 'B' | 'W' | 'U';
export type Board = BoardValue[][];
export type CertificateType = 'IN BLACK' | 'IN WHITE';

export interface Move {
    row: number;
    col: number;
    // turn: Turn;
};

export interface PlayerStats {
    pieceCount: number;
    mobility: number;
    flips: number;
    totalTime: number; // only manipulated if player type is 'archive' or 'custom'
    maxTime: number; // only manipulated if player type is 'archive' or 'custom'
    returnValue: number | null; // only manipulated if player type is 'archive' or 'custom'
};

export const defaultPlayerStats: PlayerStats = {
  pieceCount: 0,
  mobility: 0,
  flips: 0,
  totalTime: 0,
  maxTime: 0,
  returnValue: null,
};

export interface MoveHistoryItem {
  index: number;    // how many moves have been made
  color: Turn;      // the color of the piece that was placed
  position: { row: number; col: number };   // the position of the piece that was placed
  pieceCount: { B: number; W: number };     // the number of pieces for each color after this move
  mobility: { B: number; W: number };       // how many legal moves each color has after this move
};

export function createInitialBoard(n: number): Board {
    const board = Array.from({ length: n }, () => Array(n).fill('U'));
    const mid = n / 2;
    board[mid - 1][mid - 1] = 'W';
    board[mid - 1][mid] = 'B';
    board[mid][mid - 1] = 'B';
    board[mid][mid] = 'W';
    return board;
};