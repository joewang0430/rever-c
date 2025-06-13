"use client";

import { useState, useEffect } from 'react';
import { PlayerConfig } from '@/data/types/setup';
import { useFileUpload } from '@/hooks/useFileUpload';

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

    // if polling indicates failure, reset config
    useEffect(() => {
        if (uploadStatus.currentStep === 'failed' && (playerConfig.config?.customCodeId || playerConfig.config?.customName)) {
            const resetConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customName: undefined,
                    customCodeId: undefined
                }
            };
            onConfigChange(resetConfig);
            setHasProcessedFile(false);
        }
    }, [uploadStatus.currentStep, playerConfig, onConfigChange]);

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

    // Handle main button click
    const handleButtonClick = async () => {
        if (!selectedFile || isButtonCooldown) return; 

        // cool down to prevent multiple clicks
        setIsButtonCooldown(true);
        setTimeout(() => {
            setIsButtonCooldown(false);
        }, 1000);

        // If user selected a new file after processing, this becomes "Reload"
        if (hasProcessedFile && uploadStatus.currentStep !== 'idle') {
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
            return;
        }

        // Otherwise, start upload process
        try {
            setHasProcessedFile(true);
            const uploadedCodeId = await processFile(selectedFile);
            
            // Update PlayerConfig
            const updatedConfig: PlayerConfig = {
                ...playerConfig,
                config: {
                    ...playerConfig.config,
                    customName: selectedFile.name.replace('.c', ''),
                    customCodeId: uploadedCodeId
                }
            };
            onConfigChange(updatedConfig);

            // Start polling
            await pollStatus(uploadedCodeId);
            
        } catch (error) {
            console.error('Upload failed:', error);
            setHasProcessedFile(false);
        }
    };

    // Determine button state
    const getButtonState = () => {

        if (isButtonCooldown) {
            return { text: 'Please wait...', disabled: true, className: 'bg-gray-400 text-gray-600' };
        }   // Always a cooldown after clicking the button

        if (!selectedFile) {
            return { text: 'Upload', disabled: true, className: 'bg-gray-300 text-gray-500' };
        }
        
        if (hasProcessedFile && uploadStatus.currentStep !== 'idle') {
            // Check if user selected a new file
            const currentFileName = playerConfig.config?.customName;
            const selectedFileName = selectedFile.name.replace('.c', '');
            
            if (currentFileName !== selectedFileName) {
                return { text: 'Reload', disabled: false, className: 'bg-blue-500 text-white hover:bg-blue-600' };
            }
        }

        switch (uploadStatus.currentStep) {
            case 'idle':
                return { text: 'Upload', disabled: false, className: 'bg-green-500 text-white hover:bg-green-600' };
            case 'uploading':
            case 'compiling':
            case 'testing':
                return { text: 'Processing...', disabled: true, className: 'bg-yellow-500 text-white' };
            case 'success':
                return { text: 'Submitted', disabled: true, className: 'bg-gray-400 text-gray-600' };
            case 'failed':
                return { text: 'Upload', disabled: false, className: 'bg-red-500 text-white hover:bg-red-600' };
            default:
                return { text: 'Upload', disabled: true, className: 'bg-gray-300 text-gray-500' };
        }
    };

    const buttonState = getButtonState();

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

                {/* Main action button */}
                <button
                    onClick={handleButtonClick}
                    disabled={buttonState.disabled}
                    className={`px-6 py-2 rounded font-medium transition-colors ${buttonState.className} ${
                        buttonState.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    {buttonState.text}
                </button>
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
                                        Your code has been uploaded, compiled, and tested successfully.
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
        </div>
    );
};

export default CandidateUpload;