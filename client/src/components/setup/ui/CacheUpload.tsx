//
// Component for uploading and managing Stored Code (cache) for players
// in the setup process.
//

/**
 * This is literally the first SHIT MOUNTAIN code in my life.
 */

"use client";

import { useState, useEffect } from 'react';
import { useCacheContext } from '@/contexts/CacheContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PlayerConfig } from '@/data/types/setup';

interface CacheUploadProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
};

const CacheUpload = ({ playerConfig, onConfigChange, side }: CacheUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isButtonCooldown, setIsButtonCooldown] = useState<boolean>(false);
    // UI-only: hide file input after user clicks Upload
    const [hasProcessedFile, setHasProcessedFile] = useState(false);
    // New: track failed upload to show an error card identical to CandidateUpload
    const [showErrorCard, setShowErrorCard] = useState(false);
    const [errorFileInfo, setErrorFileInfo] = useState<{ name: string; size: number } | null>(null);
    const { 
        cacheState, 
        uploadCache, 
        clearCache,
        isCacheAvailable,
        updateCacheStatus
    } = useCacheContext();
    const { uploadStatus, pollStatus, cleanup } = useFileUpload('cache');

    // Check if there is an successful cache
    const hasSuccessfulCache = (cacheState && cacheState.status === 'success')
        || uploadStatus.currentStep === 'success';
    
    // Sync PlayerConfig with global cache success (bind or update when out-of-sync)
    useEffect(() => {
        if (
            cacheState?.status === 'success' &&
            playerConfig.config?.customType === 'cache'
        ) {
            const desiredId = cacheState.code_id;
            const desiredName = cacheState.filename.replace('.c', '');
            const currentId = playerConfig.config?.customCodeId;
            const currentName = playerConfig.config?.customName;
            if (currentId !== desiredId || currentName !== desiredName) {
                const updatedConfig: PlayerConfig = {
                    ...playerConfig,
                    config: {
                        ...playerConfig.config,
                        customCodeId: desiredId,
                        customName: desiredName
                    }
                };
                onConfigChange(updatedConfig);
            }
        }
    }, [cacheState?.status, cacheState?.code_id, cacheState?.filename, playerConfig.config?.customType, playerConfig.config?.customCodeId, playerConfig.config?.customName, onConfigChange]);

    // When global cache is cleared or not successful, clear PlayerConfig for cache mode
    useEffect(() => {
        const isClearedOrNotSuccess = !cacheState || cacheState.status !== 'success';
        if (
            isClearedOrNotSuccess &&
            playerConfig.config?.customType === 'cache' &&
            (playerConfig.config?.customCodeId !== undefined || playerConfig.config?.customName !== undefined)
        ) {
            const clearedConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customCodeId: undefined,
                    customName: undefined
                }
            };
            onConfigChange(clearedConfig);
        }
    }, [cacheState?.status, playerConfig.config?.customType, playerConfig.config?.customCodeId, playerConfig.config?.customName, onConfigChange]);

    // When global cache becomes successful elsewhere, clear local failure UI/state here
    useEffect(() => {
        const syncOnGlobalSuccess = async () => {
            if (cacheState?.status === 'success' && (uploadStatus.currentStep === 'failed' || showErrorCard)) {
                try { await cleanup(); } catch { /* ignore */ }
                setShowErrorCard(false);
                setErrorFileInfo(null);
            }
        };
        syncOnGlobalSuccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheState?.status, uploadStatus.currentStep, showErrorCard]);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.c')) {
            // If previous attempt failed, reset upload status to idle so user can upload again
            if (uploadStatus.currentStep === 'failed') {
                await cleanup();
            }
            setSelectedFile(file);
            // Selecting a new file should clear any previous error card
            if (showErrorCard) {
                setShowErrorCard(false);
                setErrorFileInfo(null);
            }
        } else if (file) {
            alert('Please select a .c file');
            e.target.value = '';
        }
    };

    // Handle clear button click
    // confirm window / clear cache LS & state & backend / clear upload status / clear file region / 
    const handleClear = async () => {
        const confirmMessage = hasSuccessfulCache 
            ? "Are you sure you want to clear the stored code and reload the upload interface?"
            : "Are you sure you want to clear the stored code? You will need to upload again for future games.";
            
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return;

            try {
                await clearCache();
                await cleanup();

                setSelectedFile(null);
                setHasProcessedFile(false);
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                const clearedConfig: PlayerConfig = {
                    ...playerConfig,
                    config: {
                        ...playerConfig.config,
                        customCodeId: undefined,
                        customName: undefined
                    }
                };
                onConfigChange(clearedConfig);
                // Clear any previous error card on explicit clear
                setShowErrorCard(false);
                setErrorFileInfo(null);

            } catch (error) {
                console.error('Clear cache failed:', error);
                alert('Failed to clear the code. Please try again or inform the developer.');
            }
    };

    // Handle upload button click: 
    // modify button / old file clean / process cache upload / update config
    const handleUpload = async () => {
        if (!selectedFile || isButtonCooldown) return;

    setIsButtonCooldown(true);
        setTimeout(() => setIsButtonCooldown(false), 1000); // 1s cooldown
    // Hide file input until cleared, matching Candidate behavior
    setHasProcessedFile(true);

        if (uploadStatus.currentStep === 'failed') await cleanup();

        try {
            const uploadedCodeId = await uploadCache(selectedFile);
            const isSuccess = await pollStatus(uploadedCodeId);

            if (isSuccess) {
                const updatedConfig: PlayerConfig = {
                    ...playerConfig,
                    config: {
                        ...playerConfig.config,
                        customCodeId: uploadedCodeId,
                        customName: selectedFile.name.replace('.c', '')
                    }
                };
                onConfigChange(updatedConfig);
                updateCacheStatus({
                    status: 'success',
                    testReturnValue: uploadStatus.testReturnValue
                });
                // Success: ensure error card is cleared
                setShowErrorCard(false);
                setErrorFileInfo(null);
            } else {
                // Any failure in the chain: reset context and local/UI state to "no upload" state
                // Preserve failed file info for error card before clearing selection
                if (selectedFile) {
                    setErrorFileInfo({ name: selectedFile.name, size: selectedFile.size });
                    setShowErrorCard(true);
                }
                try { await clearCache(); } catch { /* ignore clear errors */ }
                setHasProcessedFile(false);
                setSelectedFile(null);
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                const resetConfig: PlayerConfig = {
                    ...playerConfig,
                    config: {
                        ...playerConfig.config,
                        customCodeId: undefined,
                        customName: undefined
                    }
                };
                onConfigChange(resetConfig);
            }

        } catch (error) {
            console.error('Cache upload failed:', error);
            // Also treat thrown errors as failure: reset everything to initial state
            if (selectedFile) {
                setErrorFileInfo({ name: selectedFile.name, size: selectedFile.size });
                setShowErrorCard(true);
            }
            try { await clearCache(); } catch { /* ignore clear errors */ }
            setHasProcessedFile(false);
            setSelectedFile(null);
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            const resetConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customCodeId: undefined,
                    customName: undefined
                }
            };
            onConfigChange(resetConfig);
        }
    };

    // Utility function to get how long the file has been uploaded
    const getTimeAgo = (uploadTime: string): string => {
        const now = new Date();
        const uploaded = new Date(uploadTime);
        const diffMs = now.getTime() - uploaded.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'just now';
        }
    };

    // Color status based on the current file processing step
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'uploading': return 'bg-yellow-100 text-yellow-800';
            case 'compiling': return 'bg-yellow-100 text-yellow-800';
            case 'testing': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4 p-4 rounded-b bg-white flex-1 h-full flex flex-col min-h-0 overflow-y-auto">
            {/* Debug info display in development */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-bold text-yellow-800 mb-2">🐛 Debug Info:</div>
                    <div className="space-y-1 text-yellow-700">
                        <div>Cache State: {JSON.stringify(cacheState, null, 2)}</div>
                        <div>Upload Status: {JSON.stringify(uploadStatus, null, 2)}</div>
                        <div>Selected File: {selectedFile ? selectedFile.name : 'None'}</div>
                        <div>Button Cooldown: {isButtonCooldown ? 'Yes' : 'No'}</div>
                        <div>hasSuccessfulCache: {hasSuccessfulCache ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            )} */}

            {/* Header */}
            <div className="pb-1">
                <h3 className="text-md font-semibold text-gray-700 rvct-theme-500">Store your code to repeatedly use it.</h3>
            </div>

            {/* Error card (matches CandidateUpload failed selected-file card) */}
            {showErrorCard && errorFileInfo && (
                <div
                    className="relative flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors duration-200 border-yellow-400 bg-yellow-50"
                >
                    {/* top-right status pill */}
                    <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200">
                        ⚠️ Failed
                    </div>

                    {/* inline file icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5 text-rvc-primary-green"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l5 5v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v5h5" />
                    </svg>
                    <div className="flex-1">
                        <div className="text-md font-medium rvct-theme-500 text-yellow-700">{errorFileInfo.name}</div>
                        <div className="text-xs text-grey-400 rvct-theme-500">
                            {(errorFileInfo.size / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">Upload failed. See details below.</div>
                    </div>
                </div>
            )}

            {/* Current Cache Display */}
            {cacheState && (
                <div className={`p-6 bg-white rounded-lg border-2 ${cacheState.status === "success" ? "border-rvc-primary-green" : "border-rvc-primary-yellow"}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-md font-medium text-black font-bold">{cacheState.filename}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(cacheState.status)}`}>
                                    {cacheState.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1 rvct-theme">
                                <div>Uploaded {getTimeAgo(cacheState.upload_time)}</div>
                                {cacheState.return_value !== undefined && (
                                    <div className="flex items-center space-x-1">
                                        <span>Function return value:</span>
                                        <code className="bg-blue-100 text-blue-800 px-1 rounded text-xs">
                                            {cacheState.return_value}
                                        </code>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isCacheAvailable() && cacheState.status === "success" && (
                            <div className="flex items-center space-x-1 text-green-600">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rvc-primary-green align-middle mr-1"></span>
                                <span className="text-xs font-medium rvct-theme-500 text-rvc-primary-green">Ready</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* File Upload Section - only displayed when the cache is not successful and not yet processed */}
            {!hasSuccessfulCache && !hasProcessedFile && (
                <div className="space-y-3">
                    {!hasProcessedFile && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 rvct-theme">
                                Select C File to Upload:
                            </label>
                            <input
                                type="file"
                                accept=".c"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                    )}
                    
                    {selectedFile && (
                        <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-rvc-primary-green">
                            <span className="text-blue-600">📄</span>
                            <div className="flex-1">
                                <div className="text-md font-medium text-rvc-primary-green rvct-theme-500">{selectedFile.name}</div>
                                <div className="text-xs text-grey-400 rvct-theme-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Upload button - only displayed when the cache is not successful*/}
                {!hasSuccessfulCache && (
                    <>
                        {isButtonCooldown ? (
                            <button
                                disabled
                                className="px-4 py-2 rounded-lg font-medium bg-gray-400 text-gray-600 cursor-not-allowed"
                            >
                                Please wait...
                            </button>
                        ) : !selectedFile ? (
                            <button
                                disabled
                                className="px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                            >
                                Upload
                            </button>
                        ) : uploadStatus.currentStep === 'idle' ? (
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 rounded-lg font-medium bg-rvc-primary-green text-white hover:bg-rvc-primary-green/90 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Upload
                            </button>
                        ) : uploadStatus.currentStep === 'uploading' || uploadStatus.currentStep === 'compiling' || uploadStatus.currentStep === 'testing' ? (
                            <button
                                disabled
                                className="px-4 py-2 rounded-lg font-medium bg-blue-400 text-white cursor-not-allowed"
                            >
                                Processing...
                            </button>
                        ) : uploadStatus.currentStep === 'failed' ? (
                            null
                        ) : null}
                    </>
                )}

                {/* Clear button */}
                {(selectedFile || cacheState) && (
                    <button
                        onClick={handleClear}
                        disabled={uploadStatus.currentStep === 'uploading' || 
                                 uploadStatus.currentStep === 'compiling' || 
                                 uploadStatus.currentStep === 'testing'}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            uploadStatus.currentStep === 'uploading' || 
                            uploadStatus.currentStep === 'compiling' || 
                            uploadStatus.currentStep === 'testing'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-rvc-primary-red text-white hover:bg-rvc-primary-red/90 cursor-pointer shadow-sm hover:shadow-md'
                        }`}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Processing Status Display */}
            {uploadStatus.currentStep !== 'idle' && (
                <div className="space-y-2 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Processing Status</span>
                        {(uploadStatus.currentStep === 'uploading' || uploadStatus.currentStep === 'compiling' || uploadStatus.currentStep === 'testing') && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        )}
                    </h4>
                    
                    <div className={`flex items-center space-x-3 p-2.5 rounded-md transition-all duration-300 ${
                        uploadStatus.currentStep === 'failed'
                            ? (uploadStatus.failedStage === 'uploading' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')
                            : uploadStatus.uploading || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-800'
                            : uploadStatus.currentStep === 'uploading'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.currentStep === 'failed' ? (uploadStatus.failedStage === 'uploading' ? '❌' : '✅') :
                             uploadStatus.uploading || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'uploading' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">File Upload</span>
                            {uploadStatus.currentStep === 'uploading' && (
                                <span className="ml-2 text-sm animate-pulse">Uploading file...</span>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center space-x-3 p-2.5 rounded-md transition-all duration-300 ${
                        uploadStatus.currentStep === 'failed'
                            ? (uploadStatus.failedStage === 'compiling' ? 'bg-red-100 text-red-800' : uploadStatus.failedStage === 'testing' || uploadStatus.failedStage === 'uploading' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')
                            : uploadStatus.compiling || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-800'
                            : uploadStatus.currentStep === 'compiling'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.currentStep === 'failed' ? (uploadStatus.failedStage === 'compiling' ? '❌' : (uploadStatus.failedStage === 'testing' || uploadStatus.failedStage === 'uploading') ? '✅' : '⭕') :
                             uploadStatus.compiling || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'compiling' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">Code Compilation</span>
                            {uploadStatus.currentStep === 'compiling' && (
                                <span className="ml-2 text-sm animate-pulse">Compiling C code...</span>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center space-x-3 p-2.5 rounded-md transition-all duration-300 ${
                        uploadStatus.currentStep === 'failed'
                            ? (uploadStatus.failedStage === 'testing' ? 'bg-red-100 text-red-800' : (uploadStatus.failedStage === 'uploading' || uploadStatus.failedStage === 'compiling') ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700')
                            : uploadStatus.testing || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-800'
                            : uploadStatus.currentStep === 'testing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.currentStep === 'failed' ? (uploadStatus.failedStage === 'testing' ? '❌' : '⭕') :
                             uploadStatus.testing || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'testing' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">Function Testing</span>
                            {uploadStatus.currentStep === 'testing' && (
                                <span className="ml-2 text-sm animate-pulse">Testing makeMove function...</span>
                            )}
                            {uploadStatus.currentStep === 'success' && uploadStatus.testReturnValue !== undefined && (
                                <div className="mt-1">
                                    <span className="text-sm bg-white text-green-800 px-2 py-1 rounded">
                                        Return Value: {uploadStatus.testReturnValue}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploadStatus.error && (
                        <div className="p-3 bg-red-100 rounded-md">
                            <div className="flex items-start space-x-3 text-red-800">
                                <span className="text-red-600 text-xl">⚠️</span>
                                <div className="flex-1">
                                    <h5 className="font-medium mb-1">Error Occurred</h5>
                                    <p className="text-sm text-red-700">{uploadStatus.error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {uploadStatus.currentStep === 'success' && (
                        <div className="p-3 bg-green-100 rounded-md">
                            <div className="flex items-start space-x-3 text-green-800">
                                <span className="text-green-600 text-xl">🎉</span>
                                <div className="flex-1">
                                    <h5 className="font-medium mb-1">Code Stored Successfully!</h5>
                                    <p className="text-sm mb-2">
                                        Your code has been stored and is ready for use in games for the next 36 hours.
                                    </p>
                                    {uploadStatus.testReturnValue !== undefined && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">Function returned:</span>
                                            <code className="bg-white text-green-800 px-2 py-1 rounded text-sm font-mono">
                                                {uploadStatus.testReturnValue}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Current Player Config Display */}
            {/* {playerConfig.config?.customCodeId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                        <span className="text-sm">🔧</span>
                        <span className="text-sm font-medium">
                            Active Config: {playerConfig.config.customName || 'Custom Code'}
                        </span>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default CacheUpload;