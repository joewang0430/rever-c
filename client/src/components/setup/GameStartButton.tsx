//
// This is the start button, leading to the game page, in the setup page.
//

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SetupData } from '../../data/types/setup';
import { getCandidateStatus, getCacheStatus, cleanupCandidate, cleanupCache } from "@/api/upload";
import { v4 as uuid } from "uuid";

interface GameStartButtonProps {
    isValid: boolean;
    setupData: SetupData;
    matchId: string;
}

const GameStartButton = ({ isValid, setupData, matchId }: GameStartButtonProps) => {
    const router = useRouter();

    // Check if custom file exists in backend, if not, game cannot start, we need to reconfigure the game
    const checkCustomFileExists = async (type: "candidate" | "cache", codeId: string) => {
        try {
            if (type === "candidate") {
                await getCandidateStatus(codeId);
            } else {
                await getCacheStatus(codeId);
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    // When there is error, need to nav a new match setup: then clean up existing custom files
    const cleanupExistingCandidates = async () => {
        if (setupData.black.type === "custom" && setupData.black.config?.customType === "candidate") {
            const codeId = setupData.black.config.customCodeId;
            if (codeId) {
                await cleanupCandidate(codeId);
            }
        }
        if (setupData.white.type === "custom" && setupData.white.config?.customType === "candidate") {
            const codeId = setupData.white.config.customCodeId;
            if (codeId) {
                await cleanupCandidate(codeId);
            }
        }
    };

    const cleanupExistingCache = async () => {
        if (setupData.black.type === "custom" && setupData.black.config?.customType === "cache") {
            const codeId = setupData.black.config.customCodeId;
            if (codeId) {
                await cleanupCache(codeId);
            }
        }
        if (setupData.white.type === "custom" && setupData.white.config?.customType === "cache") {
            const codeId = setupData.white.config.customCodeId;
            if (codeId) {
                await cleanupCache(codeId);
            }
        }
    };
    
    const handleStartGame = async () => {
        if (!isValid) return;

        // Check if both players have valid custom files
        let missing = false;
        let missingType: "candidate" | "cache" | null = null;
        const players = [
            { side: "black", config: setupData.black.config, type: setupData.black.type },
            { side: "white", config: setupData.white.config, type: setupData.white.type }
        ];

        for (const player of players) {
            if (player.type === "custom") {
                const { customType, customCodeId } = player.config || {};
                if (customType && customCodeId) {
                    const exists = await checkCustomFileExists(customType, customCodeId);
                    if (!exists) {
                        missing = true;
                        missingType = customType;
                        break; // No need to check further if one is missing
                    }
                }
            }
        }
        // If any custom file is missing, prompt user to reconfigure
        if (missing) {
            if (
                window.confirm(
                    "Your game setup has timed out, or the uploaded file does not exist. Please reconfigure your game. Click confirm to return."
                )
            ) {
                await cleanupExistingCandidates();
                if (missingType === "cache") {
                    await cleanupExistingCache();
                }
                const newMatchId = uuid();
                router.push(`/setup/${newMatchId}`);
            }
            return;
        }

        router.push(`/game/${matchId}`);
    };

    return (
        <button
            className={`px-6 py-3 rounded-lg font-semibold text-white transition
                ${isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
            `}
            disabled={!isValid}
            onClick={handleStartGame}
        >
            Start Game
        </button>
    );
};

export default GameStartButton;