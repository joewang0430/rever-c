//
// This file contains api functions to handle file uploads, connecting to backend.
// 

import { ProcessResponse, StatusResponse } from '@/data/types/upload';

// TODO: consider delete localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
}

// Upload and process candidate file (temporary code)
export async function processCandidate(file: File): Promise<ProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/candidate`, {
        method: 'POST',
        body: formData,
    });

    return handleResponse<ProcessResponse>(response);
}

// Upload and process cache file (stored code)
export async function processCache(file: File): Promise<ProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/cache`, {
        method: 'POST',
        body: formData,
    });

    return handleResponse<ProcessResponse>(response);
}

// Get processing status for a candidate (temporary) code ID
export async function getCandidateStatus(codeId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/status/candidate/${codeId}`, {
        method: 'GET',
    });
    return handleResponse<StatusResponse>(response);
}

// Get processing status for a cache (stored) code ID
export async function getCacheStatus(codeId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/status/cache/${codeId}`, {
        method: 'GET',
    });
    return handleResponse<StatusResponse>(response);
}

// Clean up candidate files (both .c and .so files)
export async function cleanupCandidate(codeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cleanup/candidate/${codeId}`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cleanup failed: ${errorText}`);
    }
}

// Clean up cache files (both .c and .so files)
export async function cleanupCache(codeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cleanup/cache/${codeId}`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cleanup failed: ${errorText}`);
    }
}

// Check if a archive file exists on the server
export async function checkArchiveExists(archiveGroup: string, archiveId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/status/archive/${archiveGroup}/${archiveId}`, {
        method: 'GET',
    });
    if (response.ok) {
        return true;
    }
    if (response.status === 404) {
        return false;
    }
    const errorText = await response.text();
    throw new Error(`Archive check failed: ${errorText}`);
};
