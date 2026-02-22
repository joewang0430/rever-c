//
// Component for uploading and managing Temporary Code (candidates) for players
// in the setup process.
//

"use client";

import { useState } from 'react';
import { PlayerConfig } from '@/data/types/setup';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cleanupCandidate } from '@/api/uploadApi';
import { canUpload, incrementUploadCount, getRemainingUploads } from '@/utils/rateLimit';

interface CandidateUploadProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const CandidateUpload = ({ playerConfig, onConfigChange, side }: CandidateUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasProcessedFile, setHasProcessedFile] = useState(false);
    const [isButtonCooldown, setIsButtonCooldown] = useState(false);
    const { uploadStatus, processFile, pollStatus, cleanup } = useFileUpload('candidate');

    // Handle file selection
    const MAX_FILE_SIZE = 500 * 1024; // 500KB
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.c')) {
            // Check file size limit
            if (file.size > MAX_FILE_SIZE) {
                alert(`File size exceeds 500KB limit. Your file is ${(file.size / 1024).toFixed(1)}KB.`);
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            // If user selects a new file after processing, reset the processed state
            if (hasProcessedFile) {
                setHasProcessedFile(false);
            }
        } else if (file) {
            alert('Please select a .c file');
            e.target.value = '';
        }
    };

    // Handle clear button click
    const handleClear = async () => {
        // Show confirmation dialog before clearing
        const confirmed = window.confirm(
            "Are you sure you want to clear the current file? This action cannot be undone."
        );
        
        if (!confirmed) return;

        // Clear uploaded file from backend if exists
        try {
            if (playerConfig.config?.customCodeId) {
                await cleanupCandidate(playerConfig.config.customCodeId);
            }
        } catch (error) {
            console.error('Clear cleanup failed:', error);
            // Continue with clearing even if backend cleanup fails
        }

        // Reset upload status
        await cleanup();

        // Clear local state
        setSelectedFile(null);
        setHasProcessedFile(false);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }

        // Reset PlayerConfig to clean state
        const clearedConfig: PlayerConfig = {
            ...playerConfig,
            config: {
                ...playerConfig.config,
                customCodeId: undefined,
                customName: undefined
            }
        };
        
        onConfigChange(clearedConfig);
    };

    // Handle main button click
    const handleButtonClick = async () => {
        if (!selectedFile || isButtonCooldown) return; 

        // Check upload rate limit
        if (!canUpload()) {
            alert(`You have reached the daily upload limit (${getRemainingUploads()} remaining). Please try again tomorrow.`);
            return;
        }

        // cool down to prevent multiple clicks
        setIsButtonCooldown(true);
        setTimeout(() => {
            setIsButtonCooldown(false);
        }, 1000);

        // If we are in a failed state, implement Reload logic
        if (uploadStatus.currentStep === 'failed') {
            
            // Reset UploadStatus
            await cleanup();
            setHasProcessedFile(false);
            
            // Reset PlayerConfig
            const resetConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customName: undefined,
                    customCodeId: undefined
                }
            };
            onConfigChange(resetConfig);
            
            // Then begin the upload process by continuing logics below
        }
        // If not failed, still need to clean up the old file
        else if (playerConfig.config?.customCodeId) {
            try {
                await cleanupCandidate(playerConfig.config.customCodeId);
            } catch (error) {
                console.error('Failed to cleanup old file:', error);
                // Continue with upload even if cleanup fails
            }
        }

        // Begin file upload and processing
        try {
            setHasProcessedFile(true);
            const uploadedCodeId = await processFile(selectedFile);

            // Polling for status updates
            const isSuccess = await pollStatus(uploadedCodeId);

            // Reset PlayerConfig ONLY IF the upload was successful
            if (isSuccess) {
                // Increment upload count on successful upload
                incrementUploadCount();
                
                const updatedConfig: PlayerConfig = {
                    ...playerConfig,
                    config: {
                        ...playerConfig.config,
                        customName: selectedFile.name.replace('.c', ''),
                        customCodeId: uploadedCodeId
                    }
                };
                onConfigChange(updatedConfig);
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setHasProcessedFile(false);
        }
    };

    // Determine button state
    const getButtonState = () => {

        if (isButtonCooldown) {
        return { 
            show: true,  
            text: 'Please wait...', 
            disabled: true, 
            className: 'bg-gray-400 text-gray-600' 
        };
    }

    if (!selectedFile) {
        return { 
            show: true,  
            text: 'Upload', 
            disabled: true, 
            className: "px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
        };
    }

        switch (uploadStatus.currentStep) {
            case 'idle':
                return { 
                    show: true, 
                    text: 'Upload', 
                    disabled: false, 
                    className: 'bg-green-500 text-white hover:bg-green-600' 
                };
                
            case 'uploading':
            case 'compiling':
            case 'testing':
                return { 
                    show: true, 
                    text: 'Submitting...', 
                    disabled: true, 
                    className: 'bg-blue-400 text-white' 
                };
                
            case 'success':
                return { 
                    show: true, 
                    text: 'Submitted', 
                    disabled: true, 
                    className: 'bg-gray-500 text-white' 
                };
            
            case 'failed':
                return { 
                    show: true,
                    text: 'Reload', 
                    disabled: false, 
                    className: 'bg-red-500 text-white hover:bg-red-600' 
                };
                
            default:
                return { 
                    show: true, 
                    text: 'Upload', 
                    disabled: true, 
                    className: 'bg-gray-300 text-gray-500' 
                };
        }
    };

    // Determine clear button state
    const getClearButtonState = () => {
        const hasSelectedFile = selectedFile !== null;
        const hasUploadedFile = playerConfig.config?.customName !== undefined;
        
        // If no file selected and no uploaded file, don't show clear button
        if (!hasSelectedFile && !hasUploadedFile) {
            return { show: false, disabled: true };
        }
        
        // If uploading/processing, disable clear button
        if (uploadStatus.currentStep === 'uploading' || 
            uploadStatus.currentStep === 'compiling' || 
            uploadStatus.currentStep === 'testing') {
            return { show: true, disabled: true };
        }
        
        return { show: true, disabled: false };
    };

    const buttonState = getButtonState();
    const clearButtonState = getClearButtonState();

    // UI helpers for selected-file card status indicator
    const isSuccess = uploadStatus.currentStep === 'success';
    const isFailed = uploadStatus.currentStep === 'failed';

    return (
        <div className="space-y-4 p-4 rounded-b bg-white flex-1 h-full flex flex-col min-h-0 overflow-y-auto">
            <h3 className="text-md font-semibold text-gray-700 rvct-theme-500">
                Upload one-time code for this match.
            </h3>

            {/* File selection */}
            <div className="space-y-3">
                {!hasProcessedFile && (
                    <>
                        <label className="block text-sm font-medium text-gray-700 mb-2 rvct-theme">
                            Select C File to Upload:
                        </label>
                        <input
                            type="file"
                            accept=".c"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                    </>
                )}
                
                {/* Selected file display */}
                {selectedFile && (
                    <div
                        className={`relative flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors duration-200 ${
                            isFailed
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-rvc-primary-green'
                        }`}
                    >
                        {/* top-right status pill for success/failure */}
                        <div
                            className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border ${
                                isFailed
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : isSuccess
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'hidden'
                            }`}
                        >
                            {isFailed ? '⚠️ Failed' : '🌟 Success'}
                        </div>

                        {/* nicer file icon */}
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
                            <div className={`text-md font-medium rvct-theme-500 ${isFailed ? 'text-yellow-700' : 'text-rvc-primary-green'}`}>{selectedFile.name}</div>
                            <div className="text-xs text-grey-400 rvct-theme-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </div>
                            {isFailed && (
                                <div className="text-xs text-yellow-700 mt-1">Upload failed. See details below.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Upload button - hide on success */}
                {uploadStatus.currentStep !== 'success' && (
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
                                onClick={handleButtonClick}
                                className="px-4 py-2 rounded-lg font-medium bg-rvc-primary-green text-white hover:bg-rvc-primary-green/90 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Upload
                            </button>
                        ) : uploadStatus.currentStep === 'uploading' || uploadStatus.currentStep === 'compiling' || uploadStatus.currentStep === 'testing' ? (
                            <button
                                disabled
                                className="px-4 py-2 rounded-lg font-medium bg-rvc-primary-blue text-white cursor-not-allowed"
                            >
                                Processing...
                            </button>
                        ) : null}
                    </>
                )}

                {/* Clear button */}
                {(selectedFile || playerConfig.config?.customName) && (
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
                                    <h5 className="font-medium mb-1">Code Uploaded Successfully!</h5>
                                    <p className="text-sm">
                                        Your code has been uploaded, compiled, and passed the basic test.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* <div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <details>
                        <summary className="cursor-pointer text-sm font-medium text-gray-600">
                            Debug: Upload Status & State
                        </summary>
                        <div className="mt-2 space-y-3">
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Upload Status:</h5>
                                <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded border">
                                    {JSON.stringify(uploadStatus, null, 2)}
                                </pre>
                            </div>
                            
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Local State:</h5>
                                <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded border">
                                    {JSON.stringify({
                                        selectedFile: selectedFile ? {
                                            name: selectedFile.name,
                                            size: selectedFile.size,
                                            type: selectedFile.type,
                                            lastModified: new Date(selectedFile.lastModified).toISOString()
                                        } : null,
                                        hasProcessedFile,
                                        isButtonCooldown,
                                        buttonState: buttonState,
                                        clearButtonState: clearButtonState
                                    }, null, 2)}
                                </pre>
                            </div>
                            
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Player Config:</h5>
                                <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded border">
                                    {JSON.stringify({
                                        customName: playerConfig.config?.customName,
                                        customCodeId: playerConfig.config?.customCodeId,
                                        side: side,
                                        playerType: playerConfig.type
                                    }, null, 2)}
                                </pre>
                            </div>
                            
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Timestamps:</h5>
                                <div className="text-xs text-gray-800 bg-white p-2 rounded border">
                                    <p>Current Time: {new Date().toISOString()}</p>
                                    <p>Selected File Time: {selectedFile ? new Date(selectedFile.lastModified).toISOString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            )}
            </div> */}

        </div>
    );
};

export default CandidateUpload;