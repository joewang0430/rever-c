/* Custom hook to manage setup data for a match */

"use client";

import { useState, useCallback } from 'react';
import { SetupData, PlayerConfig, BoardSize } from '../data/types/setup';

export const useSetupData = (matchId: string) => {
    const [setupData, setSetupData] = useState<SetupData>({
        matchId,
        boardSize: 8,
        black: { type: null }, 
        white: { type: null }  
    });

    // update board size
    const updateBoardSize = useCallback((size: BoardSize) => {
        setSetupData(prev => {
            const newData = { ...prev, boardSize: size };
        
            // if the board size is not 8, reset AI players
            if (size !== 8) {
                if (newData.black.type === "ai") {
                    newData.black = { type: null };
                }
                if (newData.white.type === "ai") {
                    newData.white = { type: null };
                }
            } 

        return newData;
        });
    }, []);

    // update black player configuration
    const updateBlackPlayer = useCallback((config: PlayerConfig) => {
        setSetupData(prev => ({ ...prev, black: config }));
    }, []);

    // update white player configuration
    const updateWhitePlayer = useCallback((config: PlayerConfig) => {
        setSetupData(prev => ({ ...prev, white: config }));
    }, []);

    // check if AI is available based on board size
    const isAIAvailable = useCallback((): boolean => {
        return setupData.boardSize === 8;
    }, [setupData.boardSize]);

    // validate the setup data
    const validateSetup = useCallback((): boolean => {
        const { black, white, boardSize } = setupData;
        
        // check if both players are configured
        if (black.type === null || white.type === null) {
        return false;
        }
        
        // check if player types are valid
        if ((black.type === "ai" || white.type === "ai") && boardSize !== 8) {
        return false;
        }
        
        // check if custom players have necessary configurations
        if (black.type === "custom" && (!black.config?.customCodeId)) return false;
        if (white.type === "custom" && (!white.config?.customCodeId)) return false;
        
        // check if archived players (community) have necessary configurations
        if (black.type === "archive" && (!black.config?.archiveId || !black.config?.archiveYear)) return false;
        if (white.type === "archive" && (!white.config?.archiveId || !white.config?.archiveYear)) return false;
        
        // check if AIs have necessary configurations
        if (black.type === "ai" && (!black.config?.aiModel)) return false;
        if (white.type === "ai" && (!white.config?.aiModel)) return false;
        
        return true;

    }, [setupData]);

    return {
        setupData,
        updateBoardSize,
        updateBlackPlayer,
        updateWhitePlayer,
        validateSetup,
        isAIAvailable,
        isValid: validateSetup()
    };
};