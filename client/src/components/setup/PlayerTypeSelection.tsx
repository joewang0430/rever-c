//
// Selection component for player types in the setup stage
//

import { PlayerConfig, PlayerType } from '../../data/types/setup';
import { cleanupCandidate } from '../../api/upload';
import { useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';

interface PlayerTypeSelectionProps {
    blackPlayerConfig: PlayerConfig;
    whitePlayerConfig: PlayerConfig;
    onBlackPlayerChange: (config: PlayerConfig) => void;
    onWhitePlayerChange: (config: PlayerConfig) => void;
    isAIAvailable: boolean;
    matchId: string;
}

const PlayerTypeSelection = ({ 
    blackPlayerConfig, 
    whitePlayerConfig, 
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

    const handleTypeSelect = useCallback(async (type: PlayerType, side: 'black' | 'white') => {
        if (type === "ai" && !isAIAvailable) return;

        const currentConfig = side === 'black' ? blackPlayerConfig : whitePlayerConfig;
        const updateFunction = side === 'black' ? onBlackPlayerChange : onWhitePlayerChange;

        // If the selected type is already set, do nothing to preserve existing config
        if (currentConfig.type === type) {
            return;
        }

        // If current player is custom candidate with uploaded file and switching to another type,
        // confirm with user and clean up the temporary file from backend
        if (currentConfig.type === 'custom' && 
            currentConfig.config?.customType === 'candidate' &&
            currentConfig.config?.customName &&
            type !== 'custom') {
            
            const confirmed = window.confirm(
                "You have uploaded a temporary file. Switching player type will delete it from the server. Continue?"
            );
            
            if (!confirmed) return;
            
            // Clean up backend file
            try {
                if (currentConfig.config?.customCodeId) {
                    await cleanupCandidate(currentConfig.config.customCodeId);
                }
            } catch (error) {
                console.error('Cleanup failed:', error);
                // In this case, continue with type switch even if cleanup fails
            }
        }

        // Save the new type to localStorage
        if (type) {
            try {
                storage.setItem(`playerType_${side}`, type);
            } catch (error) {
                console.warn(`Failed to save player type for ${side}:`, error);
            }
        }

        // Initialize config based on the new type
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
                        archiveId: "",
                        archiveGroup: "",
                        archiveName: undefined
                    }
                });
                break;
                
            case "human":
                updateFunction({
                    type: "human",
                    config: {
                        humanName: side === "black" ? "Player B" : "Player W"
                    }
                });
                break;
                
            case "ai":
                updateFunction({
                    type: "ai",
                    config: {
                        aiId: "default",
                        aiName: undefined
                    }
                });
                break;
        }
    }, [blackPlayerConfig, whitePlayerConfig, onBlackPlayerChange, onWhitePlayerChange, isAIAvailable]);

    // Restore player types from localStorage on mount
    useEffect(() => {
        try {
            const savedBlackType = storage.getItem('playerType_black');
            const savedWhiteType = storage.getItem('playerType_white');
            
            if (savedBlackType && savedBlackType !== blackPlayerConfig.type) {
                handleTypeSelect(savedBlackType as PlayerType, 'black');
            }
            
            if (savedWhiteType && savedWhiteType !== whitePlayerConfig.type) {
                handleTypeSelect(savedWhiteType as PlayerType, 'white');
            }
        } catch (error) {
            console.warn('Failed to restore player types from localStorage:', error);
        }
    }, [handleTypeSelect, blackPlayerConfig.type, whitePlayerConfig.type]); 

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
                                ${blackPlayerConfig.type === type
                                    ? 'bg-black border-black text-white' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }
                                ${type === "ai" && !isAIAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {blackPlayerConfig.type === type && '✓'}
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
                                ${whitePlayerConfig.type === type
                                    ? 'bg-gray-700 border-gray-700 text-white' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }
                                ${type === "ai" && !isAIAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {whitePlayerConfig.type === type && '✓'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerTypeSelection;