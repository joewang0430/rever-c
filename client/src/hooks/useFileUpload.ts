//
// Hook for managing file upload and processing status
// Handles the complete upload -> compile -> test pipeline
//

"use client";

import { useState, useCallback } from 'react';
import { UploadStatus, ProcessResponse, StatusResponse } from '@/data/types/upload';
import { processCandidate, processCache, getCandidateStatus, getCacheStatus, cleanupCandidate, cleanupCache} from '@/api/uploadApi';

export const useFileUpload = (uploadType: 'candidate' | 'cache' = 'candidate') => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        uploading: false,           // if file is uploaded to backend
        compiling: false,           // if file is compiled successfully
        testing: false,             // if file is tested successfully
        success: false,             // if entire process is successful
        error: null,                // error message if any step fails
        currentStep: 'idle',        // current step in the process
        testReturnValue: undefined  // return value from C function
    });

    const [codeId, setCodeId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Function to start processing the file (upload + compile + test)
    const processFile = useCallback(async (file: File) => {
        try {
            // Reset status and start processing
            setUploadStatus({
                uploading: false,
                compiling: false,
                testing: false,
                success: false,
                error: null,
                currentStep: 'uploading',
                testReturnValue: undefined
            });

            // Choose the correct API function based on upload type
            const processFn = uploadType === 'candidate' ? processCandidate : processCache;
            const response: ProcessResponse = await processFn(file);
            setCodeId(response.code_id);
            
            // File uploaded successfully, now backend will handle compile + test
            setUploadStatus(prev => ({
                ...prev,
                uploading: true,
                currentStep: 'compiling'
            }));

            return response.code_id;
        } catch (error) {
            setUploadStatus(prev => ({
                ...prev,
                uploading: false,
                error: error instanceof Error ? error.message : 'Upload failed',
                currentStep: 'failed'
            }));
            throw error;
        }
    }, [uploadType]);

    // Function to poll the processing status
    const pollStatus = useCallback(async (codeId: string): Promise<boolean> => {
        setIsProcessing(true);

        return new Promise((resolve) => {
            const poll = async () => {
                try {
                    const status: StatusResponse = uploadType === 'candidate' 
                        ? await getCandidateStatus(codeId)
                        : await getCacheStatus(codeId);
                    
                    switch (status.status) {
                        case 'uploading':
                            setUploadStatus(prev => ({
                                ...prev,
                                currentStep: 'uploading'
                            }));
                            break;
                            
                        case 'compiling':
                            setUploadStatus(prev => ({
                                ...prev,
                                uploading: true,
                                compiling: false,
                                currentStep: 'compiling'
                            }));
                            break;
                            
                        case 'testing':
                            setUploadStatus(prev => ({
                                ...prev,
                                uploading: true,
                                compiling: true,
                                testing: false,
                                currentStep: 'testing'
                            }));
                            break;
                            
                        case 'success':
                            setUploadStatus(prev => ({
                                ...prev,
                                uploading: true,
                                compiling: true,
                                testing: true,
                                success: true,
                                currentStep: 'success',
                                testReturnValue: status.test_return_value 
                            }));
                            setIsProcessing(false);
                            resolve(true);  // return success
                            return;
                            
                        case 'failed':
                            try {
                                const cleanupFn = uploadType === 'candidate' ? cleanupCandidate : cleanupCache;
                                console.log('Process failed, cleaning up all files...');
                                await cleanupFn(codeId); 
                            } catch (cleanupError) {
                                console.error('Auto cleanup failed:', cleanupError);
                            }

                            setUploadStatus(prev => ({
                                ...prev,
                                error: status.error_message || 'Process failed',
                                currentStep: 'failed'
                            }));
                            setIsProcessing(false);
                            resolve(false);
                            return;
                            
                        default:
                            // unkonwn status, continue polling
                            break;
                    }
                    
                    // Continue polling every second
                    setTimeout(poll, 1000);
                } catch (error) {
                    setUploadStatus(prev => ({
                        ...prev,
                        error: error instanceof Error ? error.message : 'Status check failed',
                        currentStep: 'failed'
                    }));
                    setIsProcessing(false);
                    resolve(false);  // return failure as well if network error
                }
            };
            
            // Start polling
            poll();
        });
    }, [uploadType]);
        

    // Clean up backend files and reset state
    const cleanup = useCallback(async () => {
        if (codeId) {
            try {
                const cleanupFn = uploadType === 'candidate' ? cleanupCandidate : cleanupCache;
                await cleanupFn(codeId);
            } catch (error) {
                console.error('Cleanup failed:', error);
            }
        }
        
        // Reset all states
        setUploadStatus({
            uploading: false,
            compiling: false,
            testing: false,
            success: false,
            error: null,
            currentStep: 'idle',
            testReturnValue: undefined
        });
        setCodeId(null);
        setIsProcessing(false);
    }, [codeId, uploadType]);

    return {
        uploadStatus,
        codeId,
        isProcessing,
        processFile,
        pollStatus,
        cleanup
    };
};