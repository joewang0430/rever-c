import { PlayerConfig, PlayerType } from '../../data/types/setup';
import { cleanupCandidate } from '../../api/uploadApi';
import { useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';

const CUSTOM_NAME = "Upload Code";
const ARCHIVE_NAME = "Community Bots";
const HUMAN_NAME = "Human Player";
const AI_NAME = "AI Language Models"

const CUSTOM_DESCRIPTION = "Upload your own .c file with the required makeMove() function and play with it.";
const ARCHIVE_DESCRIPTION = "Play with Bots from the ReverC community, including algorithms written by previous participants.";
const HUMAN_DESCRIPTION = "Real human player like you.";
const AI_DESCRIPTION = "Play with mainstream large language models such as Deepseek, and listen to what they think!"

interface PlayerTypeSelectionProps {
    blackPlayerConfig: PlayerConfig;
    whitePlayerConfig: PlayerConfig;
    onBlackPlayerChange: (config: PlayerConfig) => void;
    onWhitePlayerChange: (config: PlayerConfig) => void;
    isAIAvailable: boolean;
};

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

        if (currentConfig.type === type) {
            return;
        }

        if (currentConfig.type === 'custom' && 
            currentConfig.config?.customType === 'candidate' &&
            currentConfig.config?.customName &&
            type !== 'custom') {
            
            const confirmed = window.confirm(
                "You have uploaded a temporary file. Switching player type will delete it from the server. Continue?"
            );
            
            if (!confirmed) return;
            
            try {
                if (currentConfig.config?.customCodeId) {
                    await cleanupCandidate(currentConfig.config.customCodeId);
                }
            } catch (error) {
                console.error('Cleanup failed:', error);
            }
        }

        if (type) {
            try {
                storage.setItem(`playerType_${side}`, type);
            } catch (error) {
                console.warn(`Failed to save player type for ${side}:`, error);
            }
        }

        switch (type) {
            case "custom":
                updateFunction({
                    type: "custom",
                    config: { customType: "cache", customCodeId: undefined, customName: undefined }
                });
                break;
            case "archive":
                updateFunction({
                    type: "archive",
                    config: { ...currentConfig.config, archiveId: "", archiveGroup: "", archiveName: undefined }
                });
                break;
            case "human":
                updateFunction({
                    type: "human",
                    config: { humanName: side === "black" ? "Player B" : "Player W" }
                });
                break;
            case "ai":
                updateFunction({
                    type: "ai",
                    config: { aiId: "gemma3n:e4b", aiName: "AI Gemma" }
                });
                break;
        }
    }, [blackPlayerConfig, whitePlayerConfig, onBlackPlayerChange, onWhitePlayerChange, isAIAvailable]);

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
        <div className="w-full space-y-2">
            {playerTypes.map(({ type, label, icon }) => {
                const isDisabled = type === "ai" && !isAIAvailable;

                return (
                    <div 
                        key={type} 
                        className={`
                            flex items-center justify-between gap-4 px-3 py-2 rounded-lg transition-all duration-200
                            ${isDisabled 
                                ? 'bg-gray-100 opacity-50' 
                                : 'bg-gray-50 border border-gray-200/90 hover:border-gray-300 hover:bg-gray-100/50'
                            }
                        `}
                    >
                        {/* Left side: Black player selection */}
                        <button
                            onClick={() => handleTypeSelect(type, 'black')}
                            disabled={isDisabled}
                            className={`
                                w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors
                                ${blackPlayerConfig.type === type
                                    ? 'bg-gray-800 border-gray-800 text-white' 
                                    : 'bg-white border-gray-400 hover:border-gray-600'
                                }
                                ${isDisabled ? 'cursor-not-allowed' : ''}
                            `}
                        >
                            {blackPlayerConfig.type === type && '✓'}
                        </button>
                        
                        {/* Center: Type label and icon */}
                        <div className="flex-grow flex items-center gap-3">
                            <span className="text-xl">{icon}</span>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-800">
                                    {label}
                                </span>
                                {isDisabled && (
                                    <span className="text-xs text-red-600 -mt-0.5">Not available</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Right side: White player selection */}
                        <button
                            onClick={() => handleTypeSelect(type, 'white')}
                            disabled={isDisabled}
                            className={`
                                w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors
                                ${whitePlayerConfig.type === type
                                    ? 'bg-gray-800 border-gray-800 text-white' 
                                    : 'bg-white border-gray-400 hover:border-gray-600'
                                }
                                ${isDisabled ? 'cursor-not-allowed' : ''}
                            `}
                        >
                            {whitePlayerConfig.type === type && '✓'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default PlayerTypeSelection;