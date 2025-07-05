//
// Tool functions handling the name converting.
// 

import { PlayerConfig } from "@/data/types/setup";
import communityData from '@/data/constants/community.json';
import { Turn } from "@/data/types/game";

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
    
    switch (playerConfig.type) {
        case 'custom':
            return playerConfig.config.customName || "(Uploaded Code)";
        case 'archive':
            return playerConfig.config.archiveName || "(Historic Algorithm)";
        case 'human':
            return playerConfig.config.humanName || "(Human Player)";
        case 'ai':
            return playerConfig.config.aiName || "(AI Player)";
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
            return "TODO";
        default:
            return "(Not Selected)";
    }
};

// International standard naming of reversi position:
export const getRowName = (rowIdx: number): string => {
    // row 0-7 -> a-h
    return String.fromCharCode("a".charCodeAt(0) + rowIdx);
};

export const getColName = (colIdx: number): string => {
    // col 0-7 -> 1-8
    return (colIdx + 1).toString();
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