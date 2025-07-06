//
// UI component for the game board.
//

"use client";

import { useState, useEffect } from "react";
import { Board, Turn, Move } from "@/data/types/game";
import { PlayerType, SetupData } from "@/data/types/setup";
import { getSetupTurnName } from "@/utils/nameConverters";
import { toggleTurn } from "@/utils/gameLogistics";
import Cell from "./ui/Cell";


interface GameBoardProps {
    board: Board;
    size: number;
    turn: Turn | null;
    lastMove: Move | null;
    flipped: Move[];
    legalMoves: Move[];
    setupData: SetupData;
    isEcho: boolean;
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
    isEcho,
    onCellClick
}: GameBoardProps) => {

    // Magage tip show up: for if opponenet has no available move
    const tipMsg = turn 
        ? `No avilable moves for ${getSetupTurnName(toggleTurn(turn))}, still the move for ${getSetupTurnName(turn)}.` 
        : null;
        
    const [showTip, setShowTip] = useState<boolean>(false);

    useEffect(() => {
        if (isEcho) {
            setShowTip(true);
            const timer = setTimeout(() => setShowTip(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowTip(false);
        }
    }, [isEcho, board.flat().join("")]);

    return (
        <div 
        className={`grid border border-black`}
        style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: `${size * 32}px`,
            height: `${size * 32}px`,
        }}
        >
            {showTip && tipMsg && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50 transition-all">
                    {tipMsg}
                </div>
            )}

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
                            onClick={() => canClick && onCellClick({row, col})}
                        />
                    );
                })
            )}
        </div>
    );
};

export default GameBoard;