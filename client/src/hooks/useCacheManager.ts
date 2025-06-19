// 
// For the "Code Storage" feature, we will use local storage to cache the uploaded code data.
// This file provides functions and the hook to manage this cache.
// 

"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
    CacheData, 
    CACHE_EXPIRY_HOURS, 
    CACHE_STORAGE_KEY,
    StatusResponse,
    ProcessResponse
} from '../data/types/upload';
import { processCache, getCacheStatus, cleanupCache } from '../api/upload';

/* Helper Functions */

// Get cache data from local storage
export const getCacheData = (): CacheData | null => {
    try {
        const cached = localStorage.getItem(CACHE_STORAGE_KEY);
        if (!cached) return null;

        const data = JSON.parse(cached) as CacheData;

        // Verify the data structure
        if (!data.code_id || !data.upload_time || !data.filename) {
            clearCacheData();
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to get cache data:', error);
        clearCacheData();
        return null;
    }
}

// Load cache data into local storage
export const setCacheData = (data: CacheData): void => {
    try {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to set cache data:', error);
    }
}

// Clear cache data from local storage
export const clearCacheData = (): void => {
    try {
        localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear cache data:', error);
    }
};

// Check if the cache is expired based on the upload time
export const isCacheExpired = (uploadTime: string): boolean => {
    try {
        const now = new Date();
        const uploaded = new Date(uploadTime);
        const diffHours = (now.getTime() - uploaded.getTime()) / (1000 * 60 * 60);
        return diffHours > CACHE_EXPIRY_HOURS;
    } catch (error) {
        console.error('Failed to check cache expiry:', error);
        return true; // Register as expired when there's an error
    }
};

// Check the cache when the page loads
export const checkCacheOnLoad = (): CacheData | null => {
    const cache = getCacheData();
    
    if (!cache) return null;
    
    // check if the cache is expired
    if (isCacheExpired(cache.upload_time)) {
        console.log('Your code storage expired, clearing...');
        clearCacheData();
        return null;
    }
    
    console.log('Valid code storage found:', cache);
    return cache;
};


/* Custom Hook */

export const useCacheManager = () => {
    const [cacheData, setCacheDataState] = useState<CacheData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<StatusResponse['status'] | null>(null);

    // Initialize and check the cache
    useEffect(() => {
        const cache = checkCacheOnLoad();
        setCacheDataState(cache);
    }, []);

    // Upload cache file
    const uploadCache = useCallback(async (file: File): Promise<string> => {
        try {
            setIsLoading(true);
            setUploadProgress('uploading');
            
            // Check & cleanup old cache if exists
            const oldCache = getCacheData();
            if (oldCache && !isCacheExpired(oldCache.upload_time)) {
                try {
                    await cleanupCache(oldCache.code_id);
                } catch (error) {
                    console.warn('Failed to cleanup old cache:', error);
                }
            }
            // Then upload the new cache file
            const response = await processCache(file); 

            // Create new cache data object
            const newCacheData: CacheData = {
                code_id: response.code_id,
                upload_time: new Date().toISOString(),
                filename: file.name,
                status: 'uploading',
            };

            // Then store it in local storage
            setCacheData(newCacheData);
            setCacheDataState(newCacheData);

            return response.code_id;

        } catch (error) {
            console.error('Cache upload failed:', error);
            setUploadProgress(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cleanup cache data
    const clearCache = useCallback(async () => {
        const cache = getCacheData();
        if (cache) {
            try {
                await cleanupCache(cache.code_id);
            } catch (error) {
                console.warn('Failed to cleanup cache on server:', error);
            }
        }
        clearCacheData();
        setCacheDataState(null);
        setUploadProgress(null);
    }, []);

    // Check if cache is available
    const isCacheAvailable = useCallback((): boolean => {
        if (!cacheData) return false;
        if (isCacheExpired(cacheData.upload_time)) return false;
        return cacheData.status === 'success';
    }, [cacheData]);

    // Update cache status (for external usage, ex. after polling)
    const updateCacheStatus = useCallback((status: StatusResponse) => {
        const currentCache = getCacheData();
        if (currentCache) {
            const updatedCache: CacheData = {
                ...currentCache,
                status: status.status,
                return_value: status.test_return_value
            };
            setCacheData(updatedCache);
            setCacheDataState(updatedCache);
        }
        setUploadProgress(null);
    }, []);

    return {
        // States
        cacheData,
        isLoading,
        uploadProgress,
        
        // Methods
        uploadCache,
        clearCache,
        isCacheAvailable,
        updateCacheStatus,
        checkExpired: (uploadTime: string) => isCacheExpired(uploadTime),
    };
};