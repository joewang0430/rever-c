//
// Setup Section.
//

"use client";

import { useSetupData } from "@/hooks/useSetupData";
import { useRef, useEffect, useMemo } from "react";
import BoardSizeSelection from "@/components/setup/BoardSizeSelection";
import GameStartButton from "@/components/setup/GameStartButton";
import PlayerSetupBlock from "@/components/setup/PlayerSetupBlock";
import PlayerTypeSelection from "@/components/setup/PlayerTypeSelection";
import SetupNameDisplay from "@/components/setup/SetupNameDisplay";
import SetupTitle from "@/components/setup/SetupTitle";
import { CacheProvider } from '@/contexts/CacheContext';
import RateLimitDisplay from "@/components/setup/RateLimitDisplay";

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

    // No cross-page UI banner; errors are alerted by the game page before redirect.

    const memorizedBlackConfig = useMemo(() => setupData.black,[setupData.black]);
    const memorizedWhiteConfig = useMemo(() => setupData.white,[setupData.white]);

    return (
        <main className="h-screen bg-gray-50 p-6">
            
            <CacheProvider>
                <div className="max-w-6xl mx-auto">
                    
                    {/* Responsive Layout */}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        
                        {/* --- Large Screen Layout --- */}
                        
                        {/* Left Column (LG) */}
                        <div className="hidden lg:flex lg:flex-col lg:gap-2">
                            <div className="h-10"></div>
                            <div className="flex justify-center">
                                <SetupNameDisplay 
                                    playerConfig={memorizedBlackConfig}
                                    side="black"
                                />
                            </div>
                            <PlayerSetupBlock 
                                playerConfig={memorizedBlackConfig}
                                onConfigChange={updateBlackPlayer}
                                side="black"
                                isAIAvailable={isAIAvailable()}
                                boardSize={setupData.boardSize}
                            />
                        </div>

                        {/* Middle Column (LG) */}
                        <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-4">
                            <div className="h-3"></div>
                            <SetupTitle context="setup"/>
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
                            <RateLimitDisplay />
                        </div>

                        {/* Right Column (LG) */}
                        <div className="hidden lg:flex lg:flex-col lg:gap-2">
                            <div className="h-10"></div>
                            <div className="flex justify-center">
                                <SetupNameDisplay 
                                    playerConfig={memorizedWhiteConfig}
                                    side="white"
                                />
                            </div>
                            <PlayerSetupBlock 
                                playerConfig={memorizedWhiteConfig}
                                onConfigChange={updateWhitePlayer}
                                side="white"
                                isAIAvailable={isAIAvailable()}
                                boardSize={setupData.boardSize}
                            />
                        </div>

                        {/* --- Small Screen Layout (Single Column) --- */}
                        <div className="flex flex-col gap-6 lg:hidden">
                            <div className="h-10"></div>
                            <PlayerSetupBlock 
                                playerConfig={memorizedBlackConfig}
                                onConfigChange={updateBlackPlayer}
                                side="black"
                                isAIAvailable={isAIAvailable()}
                                boardSize={setupData.boardSize}
                            />
                            <SetupNameDisplay 
                                playerConfig={memorizedBlackConfig}
                                side="black"
                            />
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
                            <RateLimitDisplay />
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
                    {/* {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                            <details>
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">
                                    Debug: Current Setup Data
                                </summary>
                                <pre className="mt-2 text-xs text-gray-800 overflow-x-auto">
                                    {JSON.stringify(setupData, null, 2)}
                                </pre>
                            </details>

                            <div className="mt-4 text-xs text-gray-700">
                                <div>
                                    <strong>blackCandidateRef:</strong> {String(blackCandidateRef.current)}
                                </div>
                                <div>
                                    <strong>whiteCandidateRef:</strong> {String(whiteCandidateRef.current)}
                                </div>
                            </div>
                        </div>
                    )} */}

                </div>
            </CacheProvider>
        </main>
    );
}


