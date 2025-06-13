import { ProcessResponse, StatusResponse } from '@/data/types/upload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const processCandidate = async (file: File): Promise<ProcessResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/candidates`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
    }
    
    return response.json();
};

export const processCache = async (file: File): Promise<ProcessResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/caches`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
    }
    
    return response.json();
};

export const getProcessStatus = async (codeId: string): Promise<StatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/upload/status/${codeId}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get status');
    }
    
    return response.json();
};

export const cleanupCandidate = async (codeId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/upload/cleanup/${codeId}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Cleanup failed');
    }
};

export const cleanupCache = async (codeId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/upload/cleanup/${codeId}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Cleanup failed');
    }
};