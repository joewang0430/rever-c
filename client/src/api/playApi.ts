//
// Fetch backend .c logic moves, or, fetch AI moves.
//

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


import { CustomType } from "@/data/types/setup";
import { 
    FetchCodeMoveParams, 
    FetchCodeMoveResult,
    FetchAIMoveParams,
    FetchAIMoveResult
} from "@/data/types/game";

// Get the move decision from backend when it is custom uploade ("candidate" or "cache") mode
export async function fetchCustomMove(params: FetchCodeMoveParams, customType: CustomType, customCodeId: string): Promise<FetchCodeMoveResult> {
    const res = await fetch(`${API_BASE_URL}/api/move/custom/${customType}/${customCodeId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("fetch uploaded code api failed");
    const data = await res.json();
    return {
        move: { row: data.row, col: data.col },
        elapsed: data.elapsed,
        returnValue: data.returnValue,
        timeout: data.timeout || false,
    };
}

// Get the move decision from backend when it is historic code ("archive") mode
export async function fetchArchiveMove(params: FetchCodeMoveParams, archiveGroup: string, archiveId: string): Promise<FetchCodeMoveResult> {
    const res = await fetch(`${API_BASE_URL}/api/move/archive/${archiveGroup}/${archiveId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("fetch historic code api failed");
    const data = await res.json();
    return {
        move: { row: data.row, col: data.col },
        elapsed: data.elapsed,
        returnValue: data.returnValue,
        timeout: data.timeout || false,
    };
}

// Get the move decision from backend when it is AI mode
export async function fetchAIMove(params: FetchAIMoveParams, aiId: string): Promise<FetchAIMoveResult> {
    // Validate params before sending
    if (!params.board || !Array.isArray(params.board) || params.board.length === 0) {
        throw new Error("Invalid board data");
    }
    if (!params.turn || !['B', 'W'].includes(params.turn)) {
        throw new Error("Invalid turn data");
    }
    if (!params.availableMoves || params.availableMoves.length === 0) {
        throw new Error("No available moves");
    }
    if (params.size <= 0 || params.size > 20) {
        throw new Error("Invalid board size");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // timeout
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/move/ai/${aiId}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`AI API failed (${res.status}): ${errorText}`);
        }
        
        const data = await res.json();
        return {
            move: { row: data.row, col: data.col },
            explanation: data.explanation,
        };
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("AI request timeout");
        }
        throw error;
    }
}