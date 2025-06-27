//
// This file proveide API calls to create a new game, form the setup stage.
// It only handles the initialization of the game, not the actual game processing.
//

import { SetupData } from "@/data/types/setup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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