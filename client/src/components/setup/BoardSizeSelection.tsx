import { BoardSize } from '../../data/types/setup';
import Image from 'next/image';

// ============ Feature Flag ============
// Set to true to enable 12x12 board, false to disable
const IS_12X12_ENABLED = false;
// ======================================

interface BoardSizeSelectionProps {
    boardSize: BoardSize;
    onBoardSizeChange: (size: BoardSize) => void;
};

const BoardSizeSelection = ({ boardSize, onBoardSizeChange }: BoardSizeSelectionProps) => {
    const boardSizes: BoardSize[] = [6, 8, 12];
    const handleSizeChange = (size: BoardSize) => {
        // Don't allow selecting 12x12 if disabled
        if (size === 12 && !IS_12X12_ENABLED) return;
        onBoardSizeChange(size);
    };

    const isDisabled = (size: BoardSize) => size === 12 && !IS_12X12_ENABLED;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Button Group */}
            <div className="flex gap-2">
                {boardSizes.map((size) => (
                    <div key={size} className="relative group">
                        <button
                            onClick={() => handleSizeChange(size)}
                            disabled={isDisabled(size)}
                            className={`
                                px-3.5 py-1.5 rounded-md font-medium text-sm transition-colors
                                ${isDisabled(size)
                                    ? 'bg-gray-200 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                                    : boardSize === size 
                                        ? 'bg-rvc-primary-green text-white shadow-sm rvct-theme-500 cursor-pointer' 
                                        : 'bg-white text-gray-600 border-2 border-gray-300 rvct-theme-500 hover:bg-gray-50/70 cursor-pointer'
                                }
                            `}
                        >
                            {size}×{size}
                        </button>
                        {/* Tooltip for disabled 12x12 */}
                        {isDisabled(size) && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 
                                bg-gray-800 text-white text-xs rounded-md whitespace-nowrap
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                pointer-events-none z-10">
                                Sorry, the 12×12 board is currently unavailable.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 
                                    border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Dynamic SVG Image Display */}
            <div className="flex justify-center">
                <Image
                    key={boardSize} // Adding key ensures smooth re-render on change
                    src={`/svgs/setup/board_${boardSize}.svg`}
                    alt={`Board size ${boardSize}x${boardSize}`}
                    width={84}
                    height={84}
                    className="transition-opacity duration-300 ease-in-out"
                />
            </div>
        </div>
    );
};

export default BoardSizeSelection;