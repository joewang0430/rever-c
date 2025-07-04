//
// UI component for the game board.
//

import { Board, Turn, Move } from "@/data/types/game";
import { PlayerType, SetupData } from "@/data/types/setup";
import { getSetupTurnName } from "@/utils/nameConverters";
import Cell from "./ui/Cell";


interface GameBoardProps {
    board: Board;
    size: number;
    turn: Turn | null;
    lastMove: Move | null;
    flipped: Move[];
    legalMoves: Move[];
    setupData: SetupData;
    onCellClick: (move: Move)  => void;
};

const GameBoard = ({
    board, 
    size,
    turn,
    lastMove,
    flipped,
    legalMoves,
    setupData,
    onCellClick
}: GameBoardProps) => {
    return (
        <div 
        className={`grid border border-black`}
        style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: `${size * 32}px`,
            height: `${size * 32}px`,
        }}
        >

            {board.map((rowArr, row) => 
                rowArr.map((cell, col) => {
                    const isLegal = legalMoves.some(m => m.row === row && m.col === col);

                    const isFlipping = flipped.some(f => f.row === row && f.col === col);
                    const isLast = lastMove && lastMove.row === row && lastMove.col === col;
                    const canClick = turn && setupData[getSetupTurnName(turn)].type === 'human' && isLegal;

                    return (
                        <Cell key={`${row}-${col}`}
                            value={cell}
                            isLast={!!isLast}  
                            isFlipping={isFlipping}
                            isLegal={isLegal}
                            canClick={!!canClick}
                            onClick={() => canClick && onCellClick({row, col})}  // Change Back
                            // onClick={() => onCellClick({row, col})}
                        />
                    );
                })
            )}
        </div>
    );
};

export default GameBoard;