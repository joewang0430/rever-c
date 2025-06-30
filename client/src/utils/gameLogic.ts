//
// All the functions related handling the reversi logic in the front-end.
//

import { Turn, Move, Board } from "@/data/types/game";

// Issue the window to show the error, and quit the game. This function only used in game stage.
export const raiseGameErrorWindow = (msg: string) => {
    if (window.confirm(msg)) {
        return; //TODO: finish it
    }
};

// Check if current move is valid
export const checkLegalMove = (board: Board, turn: Turn, move: Move) => {
    // Check in bound first
    return true;    // TODO: finish it
};
