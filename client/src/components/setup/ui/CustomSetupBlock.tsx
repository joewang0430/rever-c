import { useState, useEffect} from "react";
import { PlayerConfig } from "@/data/types/setup";
import CacheUpload from "./CacheUpload";
import CandidateUpload from "./CandidateUpload";

interface CustomSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const CustomSetupBlock = ({ playerConfig, onConfigChange, side }: CustomSetupBlockProps) => {
    const [selectedType, setSelectedType] = useState<'cache' | 'candidate'>('cache');

    // keep the selected type
    useEffect(() => {
        if (playerConfig.config?.customType) {
            setSelectedType(playerConfig.config.customType);
        }
    }, [playerConfig.config?.customType]);

    const handleTypeChange = (type: 'cache' | 'candidate') => {
        setSelectedType(type);
        
        // update customType in playerConfig
        const updatedConfig: PlayerConfig = {
            ...playerConfig,
            config: {
                ...playerConfig.config,
                customType: type,
                // reset related fields, as the type changed
                customCodeId: undefined,
                customName: undefined
            }
        };
        
        onConfigChange(updatedConfig);
    };

    return (
        <div>
            {/* Top Option Switch */}
            <div className="mb-4">
                <div className="flex border rounded">
                    <button
                        onClick={() => handleTypeChange('candidate')}
                        className={`flex-1 px-4 py-2 ${
                            selectedType === 'candidate' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Temporary Code
                    </button>
                    <button
                        onClick={() => handleTypeChange('cache')}
                        className={`flex-1 px-4 py-2 ${
                            selectedType === 'cache' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Stored Code
                    </button>
                </div>
            </div>

            {/* Corresponding Components */}
            <div>
                {selectedType === 'candidate' ? (
                    <CandidateUpload 
                        playerConfig={playerConfig}
                        onConfigChange={onConfigChange}
                        side={side}
                    />
                ) : (
                    <CacheUpload 
                        playerConfig={playerConfig}
                        onConfigChange={onConfigChange}
                        side={side}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomSetupBlock;