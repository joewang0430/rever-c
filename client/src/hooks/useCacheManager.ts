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
} from '../data/types/upload';
import { processCache, cleanupCache } from '../api/upload';
import { storage } from '@/utils/storage';

/* Helper Functions */

export const getCacheData = (): CacheData | null => {
    try {
        const data = storage.getJSON(CACHE_STORAGE_KEY) as CacheData;
        if (!data) return null;

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
};

// Load cache data into local storage
export const saveCacheData = (data: CacheData) => {
    try {
        storage.setJSON(CACHE_STORAGE_KEY, data);
    } catch (error) {
        console.error('Failed to set cache data:', error);
    }
};

// Clear cache data from local storage
export const clearCacheData = () => {
    try {
        storage.removeItem(CACHE_STORAGE_KEY);
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
        clearCacheData();
        return null;
    }

    return cache;
};


/* Custom Hook */

export const useCacheManager = () => {
    const [cacheState, setCacheState] = useState<CacheData | null>(null);

    // Initialize and check the cache
    useEffect(() => {
        const cache = checkCacheOnLoad();
        setCacheState(cache);
    }, []);

    // Upload cache file, including cleanup of old cache if exists
    const uploadCache = useCallback(async (file: File): Promise<string> => {
        try {
            // Check & cleanup old cache if exists
            const oldCache = getCacheData();
            if (oldCache && !isCacheExpired(oldCache.upload_time)) {
                try {
                    await cleanupCache(oldCache.code_id);
                } catch (error) {
                    console.warn('Failed to cleanup old cache:', error);
                }
            }
            // Then upload the new cache file, get code id
            const response = await processCache(file);

            // Create new cache data object
            const newCacheData: CacheData = {
                code_id: response.code_id,
                upload_time: new Date().toISOString(),
                filename: file.name,
                status: 'uploading', 
            };

            // Then store it in local storage
            saveCacheData(newCacheData);
            setCacheState(newCacheData);

            return response.code_id;

        } catch (error) {
            console.error('Cache upload failed:', error);
            throw error;
        }
    },[]);

    // Cleanup cache data
    const clearCache = useCallback(async ()=> {
        const cache = getCacheData();
        if (cache) {
            try {
                await cleanupCache(cache.code_id);
            } catch (error) {
                console.warn('Failed to cleanup cache on server:', error);
            }
        }
        clearCacheData();
        setCacheState(null);
    }, []);

    // Check if cache is available
    const isCacheAvailable = useCallback((): boolean => {
        if (!cacheState) {return false;} 
        else if (!cacheState.code_id || !cacheState.upload_time) {return false;}
        if (isCacheExpired(cacheState.upload_time)) return false;

        return true;
    },[cacheState]);

    // Update cache status (for external usage, ex. after polling)
    const updateCacheStatus = useCallback((statusUpdate: { status: 'uploading' | 'compiling' | 'testing' | 'success' | 'failed'; testReturnValue?: number }) => {
        const currentCache = getCacheData();
        if (currentCache) {
            const updatedCache: CacheData = {
                ...currentCache,
                status: statusUpdate.status,
                return_value: statusUpdate.testReturnValue
            };
            saveCacheData(updatedCache);
            setCacheState(updatedCache);
        }
    }, []);

    return {
        // States
        cacheState,
        
        // Methods
        uploadCache,
        clearCache,
        isCacheAvailable,
        updateCacheStatus
    };
};