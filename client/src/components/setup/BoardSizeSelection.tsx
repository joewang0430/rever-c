// 6.11

import { BoardSize } from '../../data/types/setup';

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
        <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-medium mb-3">Board Size</h3>
            
            <div className="flex gap-3">
                {boardSizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`
                            px-4 py-2 rounded border font-medium
                            ${boardSize === size 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }
                        `}
                    >
                        {size}×{size}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BoardSizeSelection;