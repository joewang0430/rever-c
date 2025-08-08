import { BoardSize } from '../../data/types/setup';
import Image from 'next/image';

interface BoardSizeSelectionProps {
    boardSize: BoardSize;
    onBoardSizeChange: (size: BoardSize) => void;
};

const BoardSizeSelection = ({ boardSize, onBoardSizeChange }: BoardSizeSelectionProps) => {
    const boardSizes: BoardSize[] = [6, 8, 12];
    const handleSizeChange = (size: BoardSize) => {
        onBoardSizeChange(size);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Button Group */}
            <div className="flex gap-2">
                {boardSizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`
                            px-3.5 py-1.5 rounded-md font-medium text-sm transition-colors
                            ${boardSize === size 
                                ? 'bg-rvc-primary-green text-white shadow-sm rvct-theme-500' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300/70 rvct-theme-500'
                            }
                        `}
                    >
                        {size}×{size}
                    </button>
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