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
                relative w-8 h-8 border border-gray-400 flex items-center justify-center
                ${isLegal ? "bg-green-100" : "bg-white"}
                ${canClick ? "cursor-pointer" : "cursor-default"}
                ${isFlipping ? "animate-pulse" : ""}
            `}
            onClick={canClick ? onClick : undefined} // Change Back
            // onClick={onClick}
        >
            {value === "B" && <div className="w-5 h-5 rounded-full bg-black" />}
            {value === "W" && <div className="w-5 h-5 rounded-full bg-white border border-black" />}
            {isLast && (
                <div className="absolute w-2 h-2 rounded-full bg-red-500 opacity-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            )}
        </div>
    );
};

export default Cell;
