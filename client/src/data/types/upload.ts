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
}

export interface StatusResponse {
    // code_id: string;
    status: 'uploading' | 'compiling' | 'testing' | 'success' | 'failed';
    error_message?: string;
    test_return_value?: number;
    failed_stage?: 'compiling' | 'testing';
}

export interface CacheData {
  code_id: string;
  upload_time: string;      // ISO 8601 format
  filename: string;
  status: StatusResponse['status'];
  return_value?: number;    // returned value of makeMove in the initial test;
                            // Note: this is different from the return value during the game
}

// Constants for cache management.
export const CACHE_EXPIRY_HOURS = 36;
export const CACHE_STORAGE_KEY = 'reverc_cache';