// data types required to setup a game

export interface SetupData {
    matchId: string;
    boardSize: 8 | 12 | 26;
    black: PlayerConfig;
    white: PlayerConfig;
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
export type BoardSize = 8 | 12 | 26;