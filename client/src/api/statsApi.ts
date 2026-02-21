//
// API calls for game statistics.
//

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface StatsResponse {
    total_games: number;
    last_updated: string;
}

// Get current game statistics
export async function getStats(): Promise<StatsResponse> {
    const res = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

// Increment total games count (call when game ends)
export async function incrementStats(): Promise<StatsResponse> {
    const res = await fetch(`${API_BASE_URL}/api/stats/increment`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to increment stats");
    return res.json();
}
