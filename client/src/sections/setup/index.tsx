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
            <div className="h-15"></div>
            <CacheProvider>
                <div className="max-w-6xl mx-auto">
                    
                    <div className="grid grid-cols-3 gap-8">
                        {/* Left Column: Black Player */}
                        <div className="flex flex-col gap-4">
                            <SetupNameDisplay 
                                playerConfig={memorizedBlackConfig}
                                side="black"
                            />
                            <PlayerSetupBlock 
                                playerConfig={memorizedBlackConfig}
                                onConfigChange={updateBlackPlayer}
                                side="black"
                                isAIAvailable={isAIAvailable()}
                                boardSize={setupData.boardSize}
                            />
                        </div>

                        {/* Middle Column: Game Settings */}
                        <div className="flex flex-col items-center gap-6">
                            <SetupTitle />
                            <BoardSizeSelection 
                                boardSize={setupData.boardSize}
                                onBoardSizeChange={updateBoardSize}
                            />
                            <PlayerTypeSelection 
                                blackPlayerConfig={memorizedBlackConfig}
                                whitePlayerConfig={memorizedWhiteConfig}
                                onBlackPlayerChange={updateBlackPlayer}
                                onWhitePlayerChange={updateWhitePlayer}
                                isAIAvailable={isAIAvailable()}
                            />
                            <GameStartButton 
                                isValid={isValid}
                                setupData={setupData}
                            />
                        </div>

                        {/* Right Column: White Player */}
                        <div className="flex flex-col gap-4">
                            <SetupNameDisplay 
                                playerConfig={memorizedWhiteConfig}
                                side="white"
                            />
                            <PlayerSetupBlock 
                                playerConfig={memorizedWhiteConfig}
                                onConfigChange={updateWhitePlayer}
                                side="white"
                                isAIAvailable={isAIAvailable()}
                                boardSize={setupData.boardSize}
                            />
                        </div>
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
