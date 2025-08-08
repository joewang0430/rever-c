//
// Component providing selection of Historic Algorithms (archive) in the setup page.
//

"use client";

import { useArchiveData } from '@/hooks/useArchiveData';
import { PlayerConfig, BoardSize } from '@/data/types/setup';
import Image from 'next/image';
import { ArchiveEntry } from '@/data/types/archive';
import { useEffect } from 'react';

interface ArchiveSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
    boardSize: BoardSize;
};

const ArchiveSetupBlock = ({ playerConfig, onConfigChange, side, boardSize }: ArchiveSetupBlockProps) => {    const { 
        groups, 
        selectedArchive, 
        selectArchive, 
        clearSelection,
        openGroups, 
        toggleGroup
    } = useArchiveData(side, playerConfig, onConfigChange);

    // New addition: When boardSize changes, check whether the current selection is valid
    useEffect(() => {
        if (boardSize === 12 && selectedArchive?.heavy) {
            clearSelection();
        }
    }, [boardSize, selectedArchive, clearSelection]);

    const handleArchiveSelect = (archive: ArchiveEntry) => {
        selectArchive(archive);
        
        // const updatedConfig: PlayerConfig = {
        //     ...playerConfig,
        //     config: {
        //         ...playerConfig.config  || {},
        //         archiveGroup: archive.groupId,
        //         archiveId: archive.id,
        //         archiveName: archive.name
        //     }
        // };
        // onConfigChange(updatedConfig);
    };

    const handleClearSelection = () => {
        clearSelection();
        
        // const updatedConfig: PlayerConfig = {
        //     ...playerConfig,
        //     config: {
        //         ...playerConfig.config || {},   // Prevent undefined config
        //         archiveGroup: undefined,
        //         archiveId: undefined,
        //         archiveName: undefined
        //     }
        // };
        // onConfigChange(updatedConfig);
    };

    return (
        <div className="h-[70vh] flex flex-col">
            {/* Header */}
            {/* <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">Historic Algorithms</h3>
                <div className="text-xs text-gray-400 capitalize">{side} Player</div>
            </div> */}

            {/* Groups */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {groups.map(group => (
                    <div key={group.id} className="rounded-sm">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full p-3 flex items-center justify-between bg-gray-100 hover:cursor-pointer transition-colors rounded-t-sm"
                        >
                            <span className="font-medium text-gray-600 rvct-theme-500">{group.name}</span>
                            <span className={`transform transition-transform text-gray-500 ${
                                openGroups.includes(group.id) ? 'rotate-180' : ''
                            }`}>
                                ▼
                            </span>
                        </button>

                        {/* Archives List */}
                        {openGroups.includes(group.id) && (
                            <div className="p-2 space-y-2 bg-gray-100 rounded-b-sm">
                                {group.archives.map(archive => {
                                    const isDisabled = boardSize === 12 && archive.heavy;
                                    const isSelected = selectedArchive?.id === archive.id;
                                    return (
                                        <div
                                            key={archive.id}
                                            onClick={() => !isDisabled && handleArchiveSelect(archive)}
                                            className={`p-3 rounded-lg transition-all border-3 ${!isDisabled ? 'group' : ''} ${
                                                isDisabled
                                                    ? 'bg-gray-50 opacity-50 cursor-not-allowed border-transparent'
                                                    : `cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-white border-rvc-primary-green'
                                                            : 'bg-white hover:bg-white border-gray-100'
                                                    }`
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Image 
                                                    src={archive.image}
                                                    alt={archive.shortName}
                                                    width={28}
                                                    height={28}
                                                    className="rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <div 
                                                    className="flex-1 overflow-hidden" 
                                                    style={{ maskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}
                                                >
                                                    <div className="flex items-baseline">
                                                        <div className={`font-medium shrink-0 ${isSelected ? 'text-rvc-primary-green rvct-theme-500' : 'text-gray-700 rvct-theme-500'}`}>{archive.shortName}</div>
                                                        <div className="relative ml-2 h-5 flex items-center">
                                                            {/* Default view: show rating if it exists */}
                                                            {archive.rating && (
                                                                <div className="text-sm text-gray-400 rvct-theme-500 whitespace-nowrap transition-all duration-200 ease-in-out transform group-hover:opacity-0 group-hover:translate-y-3">
                                                                    {`${archive.rating}`}
                                                                </div>
                                                            )}

                                                            {/* Hover view: show description */}
                                                            <div className="text-sm text-gray-500 rvct-theme-500 whitespace-nowrap absolute left-0 transition-all duration-200 ease-in-out opacity-0 transform -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0">
                                                                {archive.shortDescription}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Current Selection Display */}
            {/* {selectedArchive && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-blue-800">
                            <span className="text-sm">🏆</span>
                            <span className="text-sm font-medium">
                                Selected: {selectedArchive.shortName}
                            </span>
                        </div>
                        <button
                            onClick={handleClearSelection}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )} */}

            {/* Debug Info (Development only) */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                    <div><strong>Debug Info ({side}):</strong></div>
                    <div>Archive Group: {playerConfig.config?.archiveGroup || 'None'}</div>
                    <div>Archive ID: {playerConfig.config?.archiveId || 'None'}</div>
                    <div>Archive Name: {playerConfig.config?.archiveName || 'None'}</div>
                    <div>Open Groups: {openGroups.join(', ')}</div>
                </div>
            )} */}
        </div>
    );
};

export default ArchiveSetupBlock;