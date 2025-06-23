//
// This is the hook to manage Historic Algorithms (archive) data.
//

"use client";

import { useState, useEffect } from 'react';
import communityData from '@/data/constants/community.json';
import { PlayerConfig } from '@/data/types/setup';

interface ArchiveEntry {
    id: string;
    groupId: string;
    name: string;
    shortName: string;
    description: string;
    shortDescription: string;
    image: string;
};

interface ArchiveGroupEntry {
    id: string;
    name: string;
    archives: ArchiveEntry[];
};

export const useArchiveData = (side: 'black' | 'white', playerConfig: PlayerConfig, onConfigChange: (config: PlayerConfig) => void) => {
    const [selectedArchive, setSelectedArchive] = useState<ArchiveEntry | null>(null);
    const [openGroups, setOpenGroups] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(`archiveOpenGroups_${side}`);  // 🔥 加上 side
            return saved ? JSON.parse(saved) : ['2024'];
        } catch {
            return ['2024'];
    }
});

    // Reload selection from local storage
    useEffect(() => {
        const storageKey = `selectedArchive_${side}`;
        const lastSelectedId = localStorage.getItem(storageKey);
        if (lastSelectedId) {
            try {
                const archive = communityData.groups
                    .flatMap((g => g.archives))
                    .find(a => a.id === lastSelectedId);

                    if (archive) {
                        setSelectedArchive(archive as ArchiveEntry);
                    }
            } catch (error) {
                console.warn(`Failed to restore archive selection for ${side}:`, error);
                localStorage.removeItem(storageKey);
            }
        }
    }, [side]);

    // Update player config when selected archive changes
    useEffect(() => {
        if (selectedArchive) {
            // Update player config with selected archive
            const updatedConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config || {},
                    archiveGroup: selectedArchive.groupId,
                    archiveId: selectedArchive.id,
                    archiveName: selectedArchive.name
                }
            };
            onConfigChange(updatedConfig);
        } else {
            // update as well when cleared
            const updatedConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config || {},
                    archiveGroup: undefined,
                    archiveId: undefined,
                    archiveName: undefined
                }
            };
            onConfigChange(updatedConfig);
        }
    }, [selectedArchive]); // prevent infinite dep loop

    // Select archive
    const selectArchive = (archive: ArchiveEntry) => {
        setSelectedArchive(archive);

        try {
            const storageKey = `selectedArchive_${side}`;
            localStorage.setItem(storageKey, archive.id);
        } catch (error) {
            console.warn(`Failed to save archive selection for ${side}:`, error);
        }
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedArchive(null);
        try {
            const storageKey = `selectedArchive_${side}`;
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.warn(`Failed to clear archive selection for ${side}:`, error);
        }
    };

    // Toggle group open state
    const toggleGroup = (groupId: string) => {
        setOpenGroups(prev => {
            const newGroups = prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId];
            
            try {
                localStorage.setItem(`archiveOpenGroups_${side}`, JSON.stringify(newGroups));  // 🔥 加上 side
            } catch (error) {
                console.warn(`Failed to save open groups for ${side}:`, error);
            }
            
            return newGroups;
        });
    };

    // Find archive based on ID
    const findArchiveById = (archiveId: string): ArchiveEntry | null => {
        const archive = communityData.groups
            .flatMap(g => g.archives)
            .find(a => a.id === archiveId);
        return archive ? (archive as ArchiveEntry) : null;
    };

    return {
        groups: communityData.groups as ArchiveGroupEntry[],
        selectedArchive,
        openGroups,

        selectArchive,
        clearSelection,
        toggleGroup,
        findArchiveById
    };
};