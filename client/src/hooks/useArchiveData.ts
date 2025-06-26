//
// This is the hook to manage Historic Algorithms (archive) data.
//

"use client";

import { useState, useEffect } from 'react';
import communityData from '@/data/constants/community.json';
import { PlayerConfig } from '@/data/types/setup';
import { storage } from '@/utils/storage';
import { ArchiveEntry, ArchiveGroupEntry } from '@/data/types/archive';


export const useArchiveData = (side: 'black' | 'white', playerConfig: PlayerConfig, onConfigChange: (config: PlayerConfig) => void) => {
    const [selectedArchive, setSelectedArchive] = useState<ArchiveEntry | null>(null);
    const [openGroups, setOpenGroups] = useState<string[]>(() => {
        try {
            return storage.getJSON(`archiveOpenGroups_${side}`) || ['2024'];
        } catch {
            return ['2024'];
        }
    });
    // Reload selection from local storage
    useEffect(() => {
        const storageKey = `selectedArchive_${side}`;
        const lastSelectedId = storage.getItem(storageKey);
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
                storage.removeItem(storageKey);
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
    }, [selectedArchive, onConfigChange]); // prevent infinite dep loop

    // Select archive
    const selectArchive = (archive: ArchiveEntry) => {
        setSelectedArchive(archive);

        try {
            const storageKey = `selectedArchive_${side}`;
            storage.setItem(storageKey, archive.id);
        } catch (error) {
            console.warn(`Failed to save archive selection for ${side}:`, error);
        }
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedArchive(null);
        try {
            const storageKey = `selectedArchive_${side}`;
            storage.removeItem(storageKey);
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
                storage.setJSON(`archiveOpenGroups_${side}`, newGroups);
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