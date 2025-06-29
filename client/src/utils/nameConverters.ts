//
// Tool functions handling the name converting.
// 

import { PlayerConfig } from "@/data/types/setup";
import communityData from '@/data/constants/community.json';

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
}