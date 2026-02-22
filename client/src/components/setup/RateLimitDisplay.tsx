//
// Small display showing daily rate limits at the bottom of setup page
//

"use client";

import { useState, useEffect } from 'react';
import { getAllLimits } from '@/utils/rateLimit';

export default function RateLimitDisplay() {
    const [limits, setLimits] = useState<{
        uploads: { remaining: number; total: number };
        begins: { remaining: number; total: number };
        ai: { remaining: number; total: number };
    } | null>(null);

    useEffect(() => {
        // Get limits on mount
        setLimits(getAllLimits());

        // Update every minute to catch midnight reset
        const interval = setInterval(() => {
            setLimits(getAllLimits());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!limits) return null;

    return (
        <div className="mt-2 text-center text-[10px] text-gray-400">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Up: {limits.uploads.remaining}/{limits.uploads.total}</span>
                <span className="text-gray-300">|</span>
                <span>Games: {limits.begins.remaining}/{limits.begins.total}</span>
                <span className="text-gray-300">|</span>
                <span>AI: {limits.ai.remaining}/{limits.ai.total}</span>
                <span className="text-gray-300">·</span>
                <span>reset at midnigh</span>
            </span>
        </div>
    );
}
