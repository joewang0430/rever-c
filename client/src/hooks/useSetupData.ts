//
// Hook to manage setup data for a match.
// 

"use client";

import { useState, useCallback, useEffect } from 'react';
import { SetupData, PlayerConfig, BoardSize } from '../data/types/setup';

export const useSetupData = () => {
    const [setupData, setSetupData] = useState<SetupData>({
        matchId: "",
        boardSize: 8,
        black: { type: null }, 
        white: { type: null }  
    });

    // // if there is an initial configuration, merge it with the default setup data
    // useEffect(() => {
    //     if (initialConfig) {
    //         setSetupData(prev => ({
    //             ...prev,
    //             ...initialConfig,
    //             matchId // ensure matchId not overridden
    //         }));
    //     }
    // }, [initialConfig, matchId]);

    // update board size
    const updateBoardSize = useCallback((size: BoardSize) => {
        setSetupData(prev => {
            const newData = { ...prev, boardSize: size };
        
            // if the board size is not 8, reset AI players
            if (size === 12) {
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
        return setupData.boardSize === 8 || setupData.boardSize === 6;
    }, [setupData.boardSize]);

    // validate the setup data
    const validateSetup = useCallback((): boolean => {
        const { black, white, boardSize } = setupData;
        
        // check if both players are configured
        if (black.type === null || white.type === null) {
            return false;
        }
        
        // check if player types are valid
        if ((black.type === "ai" || white.type === "ai") && boardSize === 12) {
            return false;
        }
        
        // check if custom players have necessary configurations
        if (black.type === "custom" && (!black.config?.customCodeId || !black.config?.customName)) return false;
        if (white.type === "custom" && (!white.config?.customCodeId || !white.config?.customName)) return false;
        
        // check if archived players (community) have necessary configurations
        if (black.type === "archive" && (!black.config?.archiveId || !black.config?.archiveGroup || !black.config?.archiveName)) return false;
        if (white.type === "archive" && (!white.config?.archiveId || !white.config?.archiveGroup || !white.config?.archiveName)) return false;
        
        // check if AIs have necessary configurations
        if (black.type === "ai" && (!black.config?.aiId || !black.config?.aiName)) return false;
        if (white.type === "ai" && (!white.config?.aiId || !white.config?.aiName)) return false;
        
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