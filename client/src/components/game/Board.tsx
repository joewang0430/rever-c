//
// UI component for the game board.
//

import { Board, Move } from "@/data/types/game";

interface BoardProps {
    board: Board;
    size: number;
    lastMove: Move | null;
    flipped: Move[];
    
}