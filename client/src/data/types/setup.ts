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
    // Archive Mode  
    archiveYear?: string; 
    archiveId?: string;
    // Human Mode
    humanName?: string;
    // AI Mode (if applicable)
    aiModel?: string;
  };
}

export type PlayerType = "custom" | "archive" | "human" | "ai" | null; 
export type CustomType = "candidate" | "cache";
export type BoardSize = 8 | 12 | 26;