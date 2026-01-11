//
// Single cell component for the game board.
//

import { BoardValue } from "@/data/types/game";

interface CellProps {
    value: BoardValue;
    isLast: boolean;
    isFlipping: boolean;
    isLegal: boolean;
    canClick: boolean;
    onClick?: () => void;
};

const Cell = ({
    value,
    isLast,
    isFlipping,
    isLegal,
    canClick,
    onClick
}: CellProps) => {
    return (
        <div
            className={`
                rvc-cell relative flex items-center justify-center w-full h-full
                ${canClick ? "cursor-pointer" : "cursor-default"}
                ${isFlipping ? "animate-pulse" : ""}
            `}
            onClick={canClick ? onClick : undefined}
        >
            {/* Piece view */}
            <div className="absolute inset-0 flex items-center justify-center">
                {value !== "U" ? (
                    <div className={value === "B" ? "rvc-piece-b" : "rvc-piece-w"} />
                ) : null}
            </div>

            {/* Legal move hint (subtle) */}
            {isLegal && value === "U" && (
                <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            )}

            {/* Last move marker (unchanged) */}
            {isLast && (
                <div className="absolute w-2 h-2 rounded-full bg-red-500 opacity-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            )}
        </div>
    );
};

export default Cell;
