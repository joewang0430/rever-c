"use client";

import { useState, useEffect } from 'react';
// import { useCacheManager } from '@/hooks/useCacheManager';
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
    
    // Automatically load the cache config
    useEffect(() => {
        if (cacheState && isCacheAvailable() && !playerConfig.config?.customCodeId) {
            const updatedConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customCodeId: cacheState.code_id,
                    customName: cacheState.filename.replace('.c', '')
                }
            };
            onConfigChange(updatedConfig);
        }
    }, [cacheState, isCacheAvailable, onConfigChange]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.c')) {
            setSelectedFile(file);
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
            }

        } catch (error) {
            console.error('Cache upload failed:', error);
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
            case 'uploading': return 'bg-blue-100 text-blue-800';
            case 'compiling': return 'bg-yellow-100 text-yellow-800';
            case 'testing': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            {/* Debug info display in development */}
            {process.env.NODE_ENV === 'development' && (
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
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">Stored Code</h3>
                <div className="text-right">
                    <div className="text-xs text-gray-500">Valid for 36 hours</div>
                    <div className="text-xs text-gray-400 capitalize">{side} Player</div>
                </div>
            </div>

            {/* Current Cache Display */}
            {cacheState && (
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-800">{cacheState.filename}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(cacheState.status)}`}>
                                    {cacheState.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
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
                        {isCacheAvailable() && (
                            <div className="flex items-center space-x-1 text-green-600">
                                <span className="text-sm">✅</span>
                                <span className="text-xs font-medium">Ready</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* File Upload Section - 只有在没有成功缓存时才显示 */}
            {!hasSuccessfulCache && (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select C File to Store:
                        </label>
                        <input
                            type="file"
                            accept=".c"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 
                                     file:mr-4 file:py-2 file:px-4 
                                     file:rounded-full file:border-0 
                                     file:text-sm file:font-semibold 
                                     file:bg-blue-50 file:text-blue-700 
                                     hover:file:bg-blue-100
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        />
                    </div>
                    
                    {selectedFile && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border">
                            <span className="text-blue-600">📄</span>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-blue-800">{selectedFile.name}</div>
                                <div className="text-xs text-blue-600">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Upload button - 只有在没有成功缓存时才显示 */}
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
                                className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
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
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Retry Upload
                            </button>
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
                                : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer shadow-sm hover:shadow-md'
                        }`}
                    >
                        {hasSuccessfulCache ? 'Clear and Reload' : 'Clear'}
                    </button>
                )}
            </div>

            {/* Processing Status Display */}
            {uploadStatus.currentStep !== 'idle' && (
                <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Processing Status</span>
                        {(uploadStatus.currentStep === 'uploading' || uploadStatus.currentStep === 'compiling' || uploadStatus.currentStep === 'testing') && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        )}
                    </h4>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        uploadStatus.uploading || uploadStatus.currentStep === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : uploadStatus.currentStep === 'uploading'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.uploading || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'uploading' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">File Upload</span>
                            {uploadStatus.currentStep === 'uploading' && (
                                <span className="ml-2 text-sm animate-pulse">Uploading file...</span>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        uploadStatus.compiling || uploadStatus.currentStep === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : uploadStatus.currentStep === 'compiling'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.compiling || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'compiling' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">Code Compilation</span>
                            {uploadStatus.currentStep === 'compiling' && (
                                <span className="ml-2 text-sm animate-pulse">Compiling C code...</span>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        uploadStatus.testing || uploadStatus.currentStep === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : uploadStatus.currentStep === 'testing'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                        <span className="text-xl">
                            {uploadStatus.testing || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'testing' ? '⏳' : '⭕'}
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">Function Testing</span>
                            {uploadStatus.currentStep === 'testing' && (
                                <span className="ml-2 text-sm animate-pulse">Testing makeMove function...</span>
                            )}
                            {uploadStatus.currentStep === 'success' && uploadStatus.testReturnValue !== undefined && (
                                <div className="mt-1">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Return Value: {uploadStatus.testReturnValue}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploadStatus.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <span className="text-red-500 text-xl">⚠️</span>
                                <div className="flex-1">
                                    <h5 className="font-medium text-red-800 mb-1">Error Occurred</h5>
                                    <p className="text-red-700 text-sm">{uploadStatus.error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {uploadStatus.currentStep === 'success' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <span className="text-green-500 text-xl">🎉</span>
                                <div className="flex-1">
                                    <h5 className="font-medium text-green-800 mb-1">Code Stored Successfully!</h5>
                                    <p className="text-green-700 text-sm mb-2">
                                        Your code has been stored and is ready for use in games for the next 36 hours.
                                    </p>
                                    {uploadStatus.testReturnValue !== undefined && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-green-700 text-sm">Function returned:</span>
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
            {playerConfig.config?.customCodeId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                        <span className="text-sm">🔧</span>
                        <span className="text-sm font-medium">
                            Active Config: {playerConfig.config.customName || 'Custom Code'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CacheUpload;