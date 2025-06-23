//
// This is the hook to manage Historic Algorithms (archive) data.
//

"use client";

import { useState, useEffect } from 'react';
import communityData from '@/data/constants/community.json';

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

export const useArchiveData = (side: 'black' | 'white') => {
    const [selectedArchive, setSelectedArchive] = useState<ArchiveEntry | null>(null);
    const [openGroups, setOpenGroups] = useState<string[]>(['2024']);

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
        setOpenGroups(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    // Find archive based on ID
    const findArchiveById = (archiveId: string): ArchiveEntry | null => {
        const archive = communityData.groups
            .flatMap(g => g.archives)
            .find(a => a.id === archiveId);
        return archive ? (archive as ArchiveEntry) : null;
    };

    // Get complete customCodeId (groupId/archiveId)
    const getCustomCodeId = (): string | null => {
        if (!selectedArchive) return null;
        return `${selectedArchive.groupId}/${selectedArchive.id}`;
    };

    return {
        groups: communityData.groups as ArchiveGroupEntry[],
        selectedArchive,
        openGroups,

        selectArchive,
        clearSelection,
        toggleGroup,
        findArchiveById,
        getCustomCodeId
    };
};