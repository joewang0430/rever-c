import { PlayerConfig, PlayerType } from '../../data/types/setup';
import { cleanupCandidate } from '../../api/uploadApi';
import { useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { UploadCloud, Bot, CircleUser, BrainCircuit } from 'lucide-react';

const CUSTOM_NAME = "Upload Code";
const ARCHIVE_NAME = "Community Bots";
const HUMAN_NAME = "Human Player";
const AI_NAME = "AI Language Models"

const CUSTOM_DESCRIPTION = "Play with your own .c file with the makeMove function.";
const ARCHIVE_DESCRIPTION = "Play with Bots from the ReverC community.";
const HUMAN_DESCRIPTION = "Real human player like you.";
const AI_DESCRIPTION = "Play with large language models like Deepseek.";

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

    const typeDetails = {
        custom: { type: "custom" as PlayerType, name: CUSTOM_NAME, description: CUSTOM_DESCRIPTION, color: "text-rvc-primary-green", Icon: UploadCloud },
        archive: { type: "archive" as PlayerType, name: ARCHIVE_NAME, description: ARCHIVE_DESCRIPTION, color: "text-rvc-primary-blue", Icon: Bot },
        human: { type: "human" as PlayerType, name: HUMAN_NAME, description: HUMAN_DESCRIPTION, color: "text-rvc-primary-yellow", Icon: CircleUser },
        ai: { type: "ai" as PlayerType, name: AI_NAME, description: AI_DESCRIPTION, color: "text-rvc-primary-purple", Icon: BrainCircuit }
    };

    const playerTypes = Object.values(typeDetails);

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
            {playerTypes.map(({ type, name, description, color, Icon }) => {
                const isDisabled = type === "ai" && !isAIAvailable;

                return (
                    <div 
                        key={type} 
                        className={`
                            flex items-center justify-between gap-4 px-3 py-2 rounded-lg transition-all duration-200
                            ${isDisabled 
                                ? 'bg-gray-100 opacity-60' 
                                : `group bg-white hover:border-gray-300 hover:bg-gray-100/50 border-2`
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
                        
                        {/* Center: Content Switcher */}
                        <div className="flex-grow h-12 relative flex items-center justify-center text-center">
                            {/* Default Content (Icon + Name) */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity duration-300 group-hover:opacity-0">
                                <Icon className={color} size={28} />
                                <span className={`font-semibold text-sm ${color} rvct-theme-700`}>
                                    {name}
                                </span>
                            </div>
                            
                            {/* Hover Content (Description) */}
                            <div className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100`}>
                                <p className={`text-sm leading-snug ${color} rvct-theme-500`}>
                                    {description}
                                </p>
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
