//
// This file proveide API calls to create a new game, form the setup stage.
// It only handles the initialization of the game, not the actual game processing.
//

import { SetupData } from "@/data/types/setup";

export async function saveSetupData(matchId: string, setupData: SetupData) {
    const res = await fetch("/api/match/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, setupData }),
    });
    if (!res.ok) {
        throw new Error("Failed to save setup data");
    }
    return await res.json();
}