//
// This infcludes two modes: "Temporary Code" and "Stored Code".
// Both modes allow users to upload code, but they differ in how the code is stored and managed.
//

"use client";

import { useState, useEffect } from "react";
import { PlayerConfig } from "@/data/types/setup";
import { cleanupCandidate } from "@/api/uploadApi";
import CacheUpload from "./CacheUpload";
import CandidateUpload from "./CandidateUpload";

interface CustomSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const CustomSetupBlock = ({ playerConfig, onConfigChange, side }: CustomSetupBlockProps) => {
    // Determine initial type based on playerConfig
    const [selectedType, setSelectedType] = useState<'cache' | 'candidate'>(
        playerConfig.config?.customType || 'cache'
    );

    // Update selectedType if playerConfig changes, seems impossible, but to be safe
    useEffect(() => {
        if (playerConfig.config?.customType && playerConfig.config.customType !== selectedType) {
            setSelectedType(playerConfig.config.customType);
        }
    }, [playerConfig.config?.customType, selectedType]);

    const handleTypeChange = async (type: 'cache' | 'candidate') => {
        // If already selected, do nothing
        if (selectedType === type) return;

        // If switching from candidate to cache and has uploaded temporary file,
        // confirm with user and clean up the temporary file from backend
        if (selectedType === 'candidate' && 
            type === 'cache' &&
            playerConfig.config?.customType === 'candidate' &&
            playerConfig.config?.customName) {
            
            const confirmed = window.confirm(
                "You have uploaded a temporary file. Switching to stored code will delete it from the server. Continue?"
            );
            
            if (!confirmed) return;
            
            // Clean up backend file
            try {
                if (playerConfig.config?.customCodeId) {
                    await cleanupCandidate(playerConfig.config.customCodeId);
                }
            } catch (error) {
                console.error('Cleanup failed:', error);
                // Continue with type switch even if cleanup fails
            }
        }

        setSelectedType(type);
        
        // Update customType in playerConfig
        const updatedConfig: PlayerConfig = {
            ...playerConfig,
            config: {
                ...playerConfig.config,
                customType: type,
                // Reset related fields, as the type changed
                customCodeId: undefined,
                customName: undefined
            }
        };
        
        onConfigChange(updatedConfig);
    };

    return (
        <div className="h-[26.5rem] bg-gray-100 rounded-sm flex flex-col items-center overflow-auto p-0">
            {/* Top Option Switch */}
            <div className="w-full flex justify-center">
                {/* <div className="flex rounded w-[20rem]"> */}
                    <button
                        onClick={() => handleTypeChange('candidate')}
                        className={`flex-1 px-4 py-2 ${
                            selectedType === 'candidate' 
                                ? 'bg-white text-rvc-primary-green rvct-theme-500' 
                                : 'bg-gray-100 text-gray-700 rvct-theme'
                        }`}
                    >
                        Temporary Code
                    </button>
                    <button
                        onClick={() => handleTypeChange('cache')}
                        className={`flex-1 px-4 py-2 ${
                            selectedType === 'cache' 
                                ? 'bg-white text-rvc-primary-green rvct-theme-500' 
                                : 'bg-gray-100 text-gray-700 rvct-theme'
                        }`}
                    >
                        Stored Code
                    </button>
                {/* </div> */}
            </div>

            {/* Corresponding Components - 占满剩余空间 */}
            <div className="w-full flex-1 flex justify-center items-stretch min-h-0">
                {selectedType === 'candidate' ? (
                    <div className="w-full max-w-[28rem] h-full flex flex-col">
                        <CandidateUpload 
                            playerConfig={playerConfig}
                            onConfigChange={onConfigChange}
                            side={side}
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-[28rem] h-full flex flex-col">
                        <CacheUpload 
                            playerConfig={playerConfig}
                            onConfigChange={onConfigChange}
                            side={side}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSetupBlock;