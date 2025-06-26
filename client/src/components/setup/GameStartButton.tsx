//
// This is the start button, leading to the game page, in the setup page.
//

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SetupData, PlayerConfig } from '../../data/types/setup';
import { getCandidateStatus, getCacheStatus, cleanupCandidate, cleanupCache, checkArchiveExists } from "@/api/upload";
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
            console.warn("Error occurred when custom file cleanning up:", e);
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

        // Check if both players have valid custom / archive files
        let missingCustom = false;
        let missingCustomType: "candidate" | "cache" | null = null;
        let missingArchive = false;
        let missingArchiveGroup: string | null = null;
        let missingArchiveSide: "black" | "white" | null = null;

        const players: { side: "black" | "white"; config: PlayerConfig["config"]; type: PlayerConfig["type"] }[] = [
            { side: "black", config: setupData.black.config, type: setupData.black.type },
            { side: "white", config: setupData.white.config, type: setupData.white.type }
        ];

        for (const player of players) {
            if (player.type === "custom") {
                const { customType, customCodeId } = player.config || {};
                if (customType && customCodeId) {
                    const exists = await checkCustomFileExists(customType, customCodeId);
                    if (!exists) {
                        missingCustom = true;
                        missingCustomType = customType;
                        break; // No need to check further if one is missingCustom
                    }
                }
            } else if (player.type === "archive") {
                const { archiveGroup, archiveId } = player.config || {};
                if (archiveGroup && archiveId) {
                    const exists = await checkArchiveExists(archiveGroup, archiveId);
                    if (!exists) {
                        missingArchive = true;
                        missingArchiveGroup = archiveGroup;
                        missingArchiveSide = player.side;
                    }
                }
            }
        }
        // If any custom file is missingCustom, prompt user to reconfigure
        if (missingCustom) {
            if (
                window.confirm(
                    "Your game setup has timed out, or the uploaded file does not exist. Please reconfigure your game. Click confirm to return."
                )
            ) {
                await cleanupExistingCandidates();
                if (missingCustomType === "cache") {
                    await cleanupExistingCache();
                }
                const newMatchId = uuid();
                router.push(`/setup/${newMatchId}`);
            }
            return;

        // If any archive in backend file is missing, prompt user to reconfigure as well
        } else if (missingArchive) {
            let message = "";
            if (missingArchiveSide === "black") {
                message = `The historic code for ${setupData.black.config?.archiveName} in ${missingArchiveGroup} does not exist. Please reconfigure your game. Click confirm to return.`;
            } else if (missingArchiveSide === "white") {
                message = `The historic code for ${setupData.white.config?.archiveName} in ${missingArchiveGroup} does not exist. Please reconfigure your game. Click confirm to return.`;
            }
            if (
                window.confirm(message)
            ) {
                await cleanupExistingCandidates();
                await cleanupExistingCache();
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