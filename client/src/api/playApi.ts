//
// Fetch backend .c logic moves, or, fetch AI moves.
//

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


import { CustomType } from "@/data/types/setup";
import { 
    FetchCodeMoveParams, 
    FetchCodeMoveResult 
} from "@/data/types/game";

// Get the move decision from backend when is custom uploade ("candidate" or "cache") mode
export async function fetchCustomMove(params: FetchCodeMoveParams, customType: CustomType, customCodeId: string): Promise<FetchCodeMoveResult> {
    const res = await fetch(`${API_BASE_URL}/api/move/${customType}/${customCodeId}`, {
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
    };
}

// Get the move decision from backend when is historic code ("archive") mode
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
    };
}

