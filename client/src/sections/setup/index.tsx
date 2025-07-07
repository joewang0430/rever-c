//
// Setup Section.
//

"use client";

import { useSetupData } from "@/hooks/useSetupData";
import { SetupData } from "@/data/types/setup";
import { useRef, useEffect, useMemo } from "react";
import BoardSizeSelection from "@/components/setup/BoardSizeSelection";
import GameStartButton from "@/components/setup/GameStartButton";
import PlayerSetupBlock from "@/components/setup/PlayerSetupBlock";
import PlayerTypeSelection from "@/components/setup/PlayerTypeSelection";
import SetupNameDisplay from "@/components/setup/SetupNameDisplay";
import SetupTitle from "@/components/setup/SetupTitle";
import { CacheProvider } from '@/contexts/CacheContext';

export default function Setup() {
    const {
        setupData,
        updateBoardSize,
        updateBlackPlayer,
        updateWhitePlayer,
        isAIAvailable,
        isValid
    } = useSetupData();

    // Prevent back nav, which causing data leak
    const blackCandidateRef = useRef<string | null>(null);
    const whiteCandidateRef = useRef<string | null>(null);

    useEffect(() => {
        if (setupData.black.type === 'custom' && setupData.black.config?.customType === 'candidate') {
            blackCandidateRef.current = setupData.black.config.customCodeId || null;
        } 
        if (setupData.white.type === 'custom' && setupData.white.config?.customType === 'candidate') {
            whiteCandidateRef.current = setupData.white.config.customCodeId || null;
        }
    }, [setupData.black, setupData.white]);

    // If the user tries to leave the page, send cleanup requests for custom setups, in corresponding apis
    useEffect(() => {
        const handleUnload = () => {
            try {
                if (blackCandidateRef.current) {
                    navigator.sendBeacon(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cleanup/candidate/${blackCandidateRef.current}`,
                    );
                }
                if (whiteCandidateRef.current) {
                    navigator.sendBeacon(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cleanup/candidate/${whiteCandidateRef.current}`,
                    );
                }
            } catch (error) {
                console.error('Cleanup on unload failed:', error);
            }
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, []);

    const memorizedBlackConfig = useMemo(() => setupData.black,[setupData.black]);
    const memorizedWhiteConfig = useMemo(() => setupData.white,[setupData.white]);

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <CacheProvider>
                <div className="max-w-6xl mx-auto">
                    
                    {/* Title */}
                    <div className="flex justify-center mb-8">
                        <SetupTitle />
                    </div>
                    
                    {/* Board Size Selection */}
                    <div className="flex justify-center mb-8">
                        <BoardSizeSelection 
                            boardSize={setupData.boardSize}
                            onBoardSizeChange={updateBoardSize}
                        />
                    </div>
                    
                    {/* Player Name Display */}
                    <div className="flex justify-between items-start mb-4 px-4">
                        <div className="flex-1 flex justify-start">
                            <SetupNameDisplay 
                                playerConfig={memorizedBlackConfig}
                                side="black"
                            />
                        </div>
                        
                        <div className="flex-1 flex justify-end">
                            <SetupNameDisplay 
                                playerConfig={memorizedWhiteConfig}
                                side="white"
                            />
                        </div>
                    </div>
                    
                    {/* Main Content Layout */}
                    <div className="grid grid-cols-3 gap-8 mb-8">
                        
                        {/* Left - Black (first hand) Settings */}
                        <div className="flex flex-col">
                            
                            <PlayerSetupBlock 
                                playerConfig={memorizedBlackConfig}
                                onConfigChange={updateBlackPlayer}
                                side="black"
                                isAIAvailable={isAIAvailable()}
                            />
                        </div>
                        
                        {/* Middle - Player Type Selection */}
                        <div className="flex flex-col items-center">
                            <PlayerTypeSelection 
                                blackPlayerConfig={memorizedBlackConfig}
                                whitePlayerConfig={memorizedWhiteConfig}
                                onBlackPlayerChange={updateBlackPlayer}
                                onWhitePlayerChange={updateWhitePlayer}
                                isAIAvailable={isAIAvailable()}
                            />
                        </div>
                        
                        {/* Right - White (back hand) Settings */}
                        <div className="flex flex-col">
                            
                            <PlayerSetupBlock 
                                playerConfig={memorizedWhiteConfig}
                                onConfigChange={updateWhitePlayer}
                                side="white"
                                isAIAvailable={isAIAvailable()}
                            />
                        </div>
                    </div>
                    
                    {/* Button to Start the Game */}
                    <div className="flex justify-center">
                        <GameStartButton 
                            isValid={isValid}
                            setupData={setupData}
                        />
                    </div>
                    
                    {/* Test Info - Used in Development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                            <details>
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">
                                    Debug: Current Setup Data
                                </summary>
                                <pre className="mt-2 text-xs text-gray-800 overflow-x-auto">
                                    {JSON.stringify(setupData, null, 2)}
                                </pre>
                            </details>
                            {/* Debug candidate refs */}
                            <div className="mt-4 text-xs text-gray-700">
                                <div>
                                    <strong>blackCandidateRef:</strong> {String(blackCandidateRef.current)}
                                </div>
                                <div>
                                    <strong>whiteCandidateRef:</strong> {String(whiteCandidateRef.current)}
                                </div>
                            </div>
                        </div>
                    )}
                    
                </div>
            </CacheProvider>
        </main>
    );
}
