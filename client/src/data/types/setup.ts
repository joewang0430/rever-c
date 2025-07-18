//
// Data types required to setup a game
//  

export interface SetupData {
    matchId: string;
    boardSize: 6 | 8 | 12;
    black: PlayerConfig;
    white: PlayerConfig;
    createAt: string;
}

export interface PlayerConfig {
    type: "custom" | "archive" | "human" | "ai" | null; 
    config?: {
        // Custom Mode
        customType?: "candidate" | "cache"; 
        customCodeId?: string;
        customName?: string;
        // Archive Mode  
        archiveGroup?: string; 
        archiveId?: string;
        archiveName?: string
        // Human Mode
        humanName?: string;
        // AI Mode (if applicable)
        aiId?: string;
        aiName?: string;
    };
}

export type PlayerType = "custom" | "archive" | "human" | "ai" | null; 
export type CustomType = "candidate" | "cache";
export type BoardSize = 6 | 8 | 12;

/*
id: string;
group: // which group the archive belongs to (file below archives/ in backend)
name: // full name when being played
shortName: // short name when showing in the selection list
description?:    // info shown when being played
shortDescription?: //  info shown in the selection list
picture: // path to the picture of each archive selection in setup page
*/
