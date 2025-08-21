"use client";

import { useState, useEffect } from 'react';
import { PlayerConfig } from '@/data/types/setup';
import { storage } from '@/utils/storage';
import { aiList, AIInfo } from '@/data/constants/ai';

export const useAIData = (
    side: 'black' | 'white',
    playerConfig: PlayerConfig,
    onConfigChange: (config: PlayerConfig) => void
) => {
    const [selectedAI, setSelectedAI] = useState<AIInfo | null>(null);

    // Effect 1: Restore last selection from localStorage on mount.
    useEffect(() => {
        const storageKey = `selectedAI_${side}`;
        try {
            const lastSelectedId = storage.getItem(storageKey);
            if (lastSelectedId && aiList[lastSelectedId]) {
                setSelectedAI(aiList[lastSelectedId]);
            }
        } catch (error) {
            console.warn(`Failed to restore AI selection for ${side}:`, error);
            storage.removeItem(storageKey); // Clean up invalid storage.
        }
    }, [side]);

    // Effect 2: Update parent's playerConfig when selectedAI changes.
    useEffect(() => {
        const newConfig = { ...playerConfig.config };
        if (selectedAI) {
            newConfig.aiId = selectedAI.id;
            newConfig.aiName = selectedAI.name;
        } else {
            delete newConfig.aiId;
            delete newConfig.aiName;
        }
        onConfigChange({ ...playerConfig, config: newConfig });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAI]); // `onConfigChange` is excluded to prevent infinite loops.

    // Action: Select an AI and save it to localStorage.
    const selectAI = (ai: AIInfo) => {
        setSelectedAI(ai);
        try {
            storage.setItem(`selectedAI_${side}`, ai.id);
        } catch (error) {
            console.warn(`Failed to save AI selection for ${side}:`, error);
        }
    };

    // Action: Clear the current selection.
    const clearSelection = () => {
        setSelectedAI(null);
        try {
            storage.removeItem(`selectedAI_${side}`);
        } catch (error) {
            console.warn(`Failed to clear AI selection for ${side}:`, error);
        }
    };

    return {
        availableAIs: Object.values(aiList),
        selectedAI,
        selectAI,
        clearSelection,
    };
};