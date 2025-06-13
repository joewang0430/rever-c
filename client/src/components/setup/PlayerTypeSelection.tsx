//
// Selection component for player types in the setup stage
//

import { PlayerConfig, PlayerType } from '../../data/types/setup';

interface PlayerTypeSelectionProps {
    blackPlayerType: PlayerType;
    whitePlayerType: PlayerType;
    onBlackPlayerChange: (config: PlayerConfig) => void;
    onWhitePlayerChange: (config: PlayerConfig) => void;
    isAIAvailable: boolean;
    matchId: string;
}

const PlayerTypeSelection = ({ 
    blackPlayerType, 
    whitePlayerType, 
    onBlackPlayerChange, 
    onWhitePlayerChange,
    isAIAvailable 
}: PlayerTypeSelectionProps) => {

    const playerTypes = [
        { type: "custom" as PlayerType, label: "Custom", icon: "⚙️" },
        { type: "archive" as PlayerType, label: "Archive", icon: "📁" },
        { type: "human" as PlayerType, label: "Human", icon: "👤" },
        { type: "ai" as PlayerType, label: "AI", icon: "🤖" }
    ];

    const handleTypeSelect = (type: PlayerType, side: 'black' | 'white') => {
        if (type === "ai" && !isAIAvailable) return;

        const currentPlayerType = side === 'black' ? blackPlayerType : whitePlayerType;
        const updateFunction = side === 'black' ? onBlackPlayerChange : onWhitePlayerChange;

        // if the selected type is already set, do nothing
        if (currentPlayerType === type) {
            return;
        }

        // Provide basic config based on type
        switch (type) {
            case "custom":
                updateFunction({
                    type: "custom",
                    config: {
                        customType: "cache",
                        customCodeId: undefined, 
                        customName: undefined
                    }
                });
                break;
                
            case "archive":
                updateFunction({
                    type: "archive",
                    config: {
                        archiveId: undefined,
                        archiveGroup: "",
                        archiveName: undefined
                    }
                });
                break;
                
            case "human":
                updateFunction({
                    type: "human",
                    config: {
                        humanName: ` Player ${side === 'black' ? 'B' : 'W'} `
                    }
                });
                break;
                
            case "ai":
                updateFunction({
                    type: "ai",
                    config: {
                        aiId: undefined,
                        aiName: undefined
                    }
                });
                break;
        }
    };

    return (
        <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-medium mb-4 text-center">
                Player Types
            </h3>
            <div className="space-y-3">
                {playerTypes.map(({ type, label, icon }) => (
                    <div key={type} className="flex items-center justify-between gap-4">
                        
                        {/* Left side: Black player selection */}
                        <button
                            onClick={() => handleTypeSelect(type, 'black')}
                            disabled={type === "ai" && !isAIAvailable}
                            className={`
                                w-6 h-6 rounded border-2 flex items-center justify-center text-sm font-bold transition-colors
                                ${blackPlayerType === type
                                    ? 'bg-black border-black text-white' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }
                                ${type === "ai" && !isAIAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {blackPlayerType === type && '✓'}
                        </button>
                        
                        {/* Center: Type label */}
                        <div className="flex-1 text-center">
                            <div className="text-xl mb-1">{icon}</div>
                            <div className={`
                                text-sm font-medium
                                ${type === "ai" && !isAIAvailable ? 'text-gray-400' : 'text-gray-700'}
                            `}>
                                {label}
                            </div>
                            {type === "ai" && !isAIAvailable && (
                                <div className="text-xs text-red-500">Not available</div>
                            )}
                        </div>
                        
                        {/* Right side: White player selection */}
                        <button
                            onClick={() => handleTypeSelect(type, 'white')}
                            disabled={type === "ai" && !isAIAvailable}
                            className={`
                                w-6 h-6 rounded border-2 flex items-center justify-center text-sm font-bold transition-colors
                                ${whitePlayerType === type
                                    ? 'bg-gray-700 border-gray-700 text-white' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }
                                ${type === "ai" && !isAIAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {whitePlayerType === type && '✓'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerTypeSelection;