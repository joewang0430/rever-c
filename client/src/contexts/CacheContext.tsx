"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useCacheManager } from '@/hooks/useCacheManager';
import { CacheData } from '@/data/types/upload';

interface CacheContextType {
    cacheState: CacheData | null;
    uploadCache: (file: File) => Promise<string>;
    clearCache: () => Promise<void>;
    isCacheAvailable: () => boolean;
    updateCacheStatus: (statusUpdate: { 
        status: "uploading" | "compiling" | "testing" | "success" | "failed"; 
        testReturnValue?: number; 
    }) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider = ({ children }: { children: ReactNode }) => {
    const cacheManager = useCacheManager();

    return (
        <CacheContext.Provider value={cacheManager}>
            {children}
        </CacheContext.Provider>
    );
};

export const useCacheContext = () => {
    const context = useContext(CacheContext);
    if (context === undefined) {
        throw new Error('useCacheContext must be used within a CacheProvider');
    }
    return context;
};
