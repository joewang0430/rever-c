//
// Tool functions handling the name converting.
// 

import { PlayerConfig } from "@/data/types/setup";
import communityData from '@/data/constants/community.json';
import { Board, Turn } from "@/data/types/game";
import { aiList } from "@/data/constants/ai";

// player type: custom, archive, human, ai, null
export const playerTypeToFolder = (customType: 'cache' | 'candidate'): string => {
    const mapping = {
        'cache': 'caches',
        'candidate': 'candidates',
        'archive': 'archives',
        'ai': 'ai', // ai has no pls
    };
    return mapping[customType];
};

// export const folderToCustomType = (folder: string): 'cache' | 'candidate' | null => {
//     const mapping = {
//         'caches': 'cache',
//         'candidates': 'candidate'
//     };
//     return mapping[folder] || null;
// };

export const getPlayerName = (playerConfig: PlayerConfig): string => {
    if (!playerConfig.config) {
        return "Not Selected";
    }
    
    // TODO: default name further decided
    switch (playerConfig.type) {
        case 'custom':
            return playerConfig.config.customName || "(Select)";
        case 'archive':
            return playerConfig.config.archiveName || "(Select)";
        case 'human':
            return playerConfig.config.humanName || "(Select)";
        case 'ai':
            return playerConfig.config.aiName || "(Select)";
        default:
            return "(Not Selected)";
    }
};

export const getPlayerDescription = (playerConfig: PlayerConfig) => {
    if (!playerConfig.config) {
        return "";
    }

    switch (playerConfig.type) {
        case 'custom':
            return "Challenger's Code.";
        case 'archive':
            const archiveId = playerConfig.config.archiveId;
            for (const group of communityData.groups) {
                const found = group.archives.find((a: any) => a.id === archiveId);
                if (found) {
                    return found.description || "";
                }
            }
            return "";
        case 'human':
            return "Human Player";
        case 'ai':
            const aiId = playerConfig.config.aiId;
            if (aiId && aiList[aiId]) {
                return aiList[aiId].description || "";
            }
    return "(AI Player)";
        default:
            return "(Not Selected)";
    }
};

// International standard naming of reversi position:
export const getRowName = (rowIdx: number): string => {
    // 0-7 -> 1-8
    return (rowIdx + 1).toString();
};

export const getColName = (colIdx: number): string => {
    // 0-7 -> a-h
    return String.fromCharCode("a".charCodeAt(0) + colIdx);
};

// 'B' to 'black'
export const getSetupTurnName = (turn: Turn): 'black' | 'white' => {
    return turn === 'B' ? 'black' : 'white';
}

// 'black' to 'B'
export const getGameTurnName = (side: 'black' | 'white'): Turn => {
    return side === 'black' ? 'B' : 'W';
}

// Readable time display
export function formatElapsed(us: number): string {
    if (us < 1000) {
        // < 1ms
        return `${us} μs`;
    }
    const ms = us / 1000;
    if (ms < 1000) {
        // < 1s
        return `${ms.toFixed(1)} ms`;
    }
    const s = ms / 1000;
    if (s < 60) {
        // < 1min
        return `${Math.floor(s)}s  ${Math.round(ms % 1000)}ms`;
    }
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    if (m < 60) {
        // < 1h
        return `${m}m  ${sec}s`;
    }
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}h  ${min}m  ${sec}s`;
}

/**
 * Convert Board into log text
 * like：
 *    a b c d e f g h
 * 1  ○ ○ ○ ○ ● ● ● ●
 * 2  ○ ○ ○ ○ ● ● ● ●
 * ...
 */
export const boardToLogText = (board: Board): string => {
    if (!board || board.length === 0) return "";
    const size = board.length;

    // Horizontal letters
    const colLabels = Array.from({ length: size }, (_, i) => 
        String.fromCharCode(97 + i)
    ).join(" ");
    let lines = ["   " + colLabels];

    // For each row
    for (let row = 0; row < size; row++) {
        const rowLabel = (row + 1).toString().padStart(2, " ");
        const rowContent = board[row]
            .map(cell => {
                if (cell === "B") return "●";
                if (cell === "W") return "○";
                return "·";
            })
            .join(" ");
        lines.push(`${rowLabel} ${rowContent}`);
    }
    
    return lines.join("\n");
};