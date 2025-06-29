//
// Tool functions handling the name converting.
// 

import { PlayerConfig } from "@/data/types/setup";

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

export const getDisplayName = (playerConfig: PlayerConfig): string => {
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