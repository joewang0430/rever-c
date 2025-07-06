//
// This file proveide API calls to create / delete game data, form the setup stage.
// It only handles the initialization of the game, not the actual game processing.
//

import { SetupData } from "@/data/types/setup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// In setup page, save the setupData into backend data storage (Redis server)
export async function saveSetupDataToGame(matchId: string, setupData: SetupData) {
    const res = await fetch(`${API_BASE_URL}/api/game/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, setupData }),
    });
    if (!res.ok) {
        throw new Error("Failed to save setup data");
    }
    return await res.json();
}

// Get setupData that previously in Redis, when in game page
export async function getSetupData(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/api/game/setup/${matchId}`, {
        method: "GET",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch setup data");
    }
    return await res.json(); 
}

// Clean up the redis data for setupData, only when error occurs during the game
export async function cleanupSetupDataRDB (matchId: string) {
    const res = await fetch(`${API_BASE_URL}/api/game/setup/${matchId}/cleanup`, {
        method: "POST",
    });
    if (!res.ok) {
        throw new Error ("Failed to cleanup setup data");

    }
    return await res.json();
}