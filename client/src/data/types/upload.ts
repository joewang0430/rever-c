//
// Data types for the upload process.
//


export interface UploadStatus {
    uploading: boolean;
    compiling: boolean;  
    testing: boolean;
    success: boolean;
    error: string | null;
    currentStep: 'idle' | 'uploading' | 'compiling' | 'testing' | 'success' | 'failed';
    testReturnValue?: number;
}

export interface ProcessResponse {
    code_id: string;
    status: string;
    message: string;
}

export interface StatusResponse {
    code_id: string;
    status: 'uploading' | 'compiling' | 'testing' | 'success' | 'failed';
    error_message?: string;
    test_return_value?: number;
    failed_stage?: 'uploading' | 'compiling' | 'testing';
}