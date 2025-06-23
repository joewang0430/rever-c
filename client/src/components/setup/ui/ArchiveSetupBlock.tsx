//
// Component providing selection of Historic Algorithms (archive) in the setup page.
//

"use client";

import { useArchiveData } from '@/hooks/useArchiveData';
import { PlayerConfig } from '@/data/types/setup';
import Image from 'next/image';

interface ArchiveSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const ArchiveSetupBlock = ({ playerConfig, onConfigChange, side }: ArchiveSetupBlockProps) => {
    const { 
        groups, 
        selectedArchive, 
        selectArchive, 
        clearSelection,
        openGroups, 
        toggleGroup
    } = useArchiveData(side, playerConfig, onConfigChange);

    const handleArchiveSelect = (archive: any) => {
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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">Historic Algorithms</h3>
                <div className="text-xs text-gray-400 capitalize">{side} Player</div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
                {groups.map(group => (
                    <div key={group.id} className="border rounded-lg">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
                        >
                            <span className="font-medium text-gray-700">{group.name}</span>
                            <span className={`transform transition-transform text-gray-500 ${
                                openGroups.includes(group.id) ? 'rotate-180' : ''
                            }`}>
                                ▼
                            </span>
                        </button>

                        {/* Archives List */}
                        {openGroups.includes(group.id) && (
                            <div className="p-2 space-y-2 border-t">
                                {group.archives.map(archive => (
                                    <div
                                        key={archive.id}
                                        onClick={() => handleArchiveSelect(archive)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                            selectedArchive?.id === archive.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Image 
                                                src={archive.image}
                                                alt={archive.shortName}
                                                width={48}
                                                height={48}
                                                className="rounded-full object-cover border-2 border-gray-200"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{archive.shortName}</div>
                                                <div className="text-sm text-gray-600">{archive.shortDescription}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Current Selection Display */}
            {selectedArchive && (
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
            )}

            {/* Debug Info (Development only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                    <div><strong>Debug Info ({side}):</strong></div>
                    <div>Archive Group: {playerConfig.config?.archiveGroup || 'None'}</div>
                    <div>Archive ID: {playerConfig.config?.archiveId || 'None'}</div>
                    <div>Archive Name: {playerConfig.config?.archiveName || 'None'}</div>
                    <div>Open Groups: {openGroups.join(', ')}</div>
                </div>
            )}
        </div>
    );
};

export default ArchiveSetupBlock;