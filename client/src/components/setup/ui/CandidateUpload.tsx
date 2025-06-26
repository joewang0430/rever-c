//
// Component for uploading and managing Temporary Code (candidates) for players
// in the setup process.
//

"use client";

import { useState } from 'react';
import { PlayerConfig } from '@/data/types/setup';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cleanupCandidate } from '@/api/upload';

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
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.c')) {
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
            className: 'bg-gray-300 text-gray-500' 
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

    return (
        <div className="space-y-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">
                Upload Temporary Code ({side === 'black' ? 'Black' : 'White'} Player)
            </h3>

            {/* File selection */}
            <div className="space-y-3">
                <input
                    type="file"
                    accept=".c"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* Selected file display */}
                {selectedFile && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Selected: {selectedFile.name}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2">
                    {buttonState.show && (
                        <button
                            onClick={handleButtonClick}
                            disabled={buttonState.disabled}
                            className={`px-6 py-2 rounded font-medium transition-colors ${buttonState.className} ${
                                buttonState.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            {buttonState.text}
                        </button>
                    )}
                    
                    {/* Clear button 保持不变 */}
                    {clearButtonState.show && (
                        <button
                            onClick={handleClear}
                            disabled={clearButtonState.disabled}
                            className={`px-4 py-2 rounded font-medium transition-colors ${
                                clearButtonState.disabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                            }`}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Processing status */}
            {uploadStatus.currentStep !== 'idle' && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Processing Status:</h4>
                    
                    {/* Upload status */}
                    <div className={`flex items-center space-x-2 p-2 rounded ${
                        uploadStatus.uploading || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-700'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : uploadStatus.currentStep === 'uploading'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                    }`}>
                        <span className="text-lg">
                            {uploadStatus.uploading || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'uploading' ? '⏳' : '⭕'}
                        </span>
                        <span className="font-medium">File Upload</span>
                        {uploadStatus.currentStep === 'uploading' && (
                            <span className="text-sm animate-pulse">Uploading...</span>
                        )}
                    </div>

                    {/* Compilation status */}
                    <div className={`flex items-center space-x-2 p-2 rounded ${
                        uploadStatus.compiling || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-700'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : uploadStatus.currentStep === 'compiling'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                    }`}>
                        <span className="text-lg">
                            {uploadStatus.compiling || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'compiling' ? '⏳' : '⭕'}
                        </span>
                        <span className="font-medium">Code Compilation</span>
                        {uploadStatus.currentStep === 'compiling' && (
                            <span className="text-sm animate-pulse">Compiling...</span>
                        )}
                    </div>

                    {/* Testing status */}
                    <div className={`flex items-center space-x-2 p-2 rounded ${
                        uploadStatus.testing || uploadStatus.currentStep === 'success'
                            ? 'bg-green-100 text-green-700'
                            : uploadStatus.currentStep === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : uploadStatus.currentStep === 'testing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                    }`}>
                        <span className="text-lg">
                            {uploadStatus.testing || uploadStatus.currentStep === 'success' ? '✅' : 
                             uploadStatus.currentStep === 'failed' ? '❌' : 
                             uploadStatus.currentStep === 'testing' ? '⏳' : '⭕'}
                        </span>
                        <span className="font-medium">Code Testing</span>
                        {uploadStatus.currentStep === 'testing' && (
                            <span className="text-sm animate-pulse">Testing...</span>
                        )}
                        {/* Show return value on success */}
                        {uploadStatus.currentStep === 'success' && uploadStatus.testReturnValue !== undefined && (
                            <span className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                                Return: {uploadStatus.testReturnValue}
                            </span>
                        )}
                    </div>

                    {/* Error message */}
                    {uploadStatus.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <div className="flex items-start">
                                <span className="text-red-500 mr-2">⚠️</span>
                                <div>
                                    <p className="font-medium text-red-800">Error occurred:</p>
                                    <p className="text-red-700 text-sm mt-1">{uploadStatus.error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Success message */}
                    {uploadStatus.currentStep === 'success' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-start">
                                <span className="text-green-500 mr-2">🎉</span>
                                <div>
                                    <p className="font-medium text-green-800">Success!</p>
                                    <p className="text-green-700 text-sm mt-1">
                                        Your code has been uploaded, compiled, and passed the basic test.
                                    </p>
                                    {uploadStatus.testReturnValue !== undefined && (
                                        <p className="text-green-700 text-sm mt-1">
                                            Function returned: <code className="bg-white px-1 rounded">{uploadStatus.testReturnValue}</code>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TODO: Test Info - Used in Development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <details>
                        <summary className="cursor-pointer text-sm font-medium text-gray-600">
                            Debug: Upload Status & State
                        </summary>
                        <div className="mt-2 space-y-3">
                            {/* Upload Status */}
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Upload Status:</h5>
                                <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded border">
                                    {JSON.stringify(uploadStatus, null, 2)}
                                </pre>
                            </div>
                            
                            {/* Local State */}
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
                            
                            {/* Player Config */}
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
                            
                            {/* Timestamps */}
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

        </div>
    );
};

export default CandidateUpload;