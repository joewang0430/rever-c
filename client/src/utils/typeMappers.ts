//
// Mapps data types from the API to the client-side types (folders)
// 

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

