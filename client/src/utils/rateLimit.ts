//
// Rate limiting utilities using localStorage
// Limits reset daily at midnight (local time)
//

const STORAGE_KEY = 'reverc_daily_limits';

// Daily limits
export const LIMITS = {
    UPLOAD: 50,      // Max code uploads per day
    BEGIN: 200,      // Max game starts per day
    AI: 10,          // Max AI calls per day
};

interface DailyUsage {
    date: string;       // YYYY-MM-DD format
    uploadCount: number;
    beginCount: number;
    aiCount: number;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Get current usage from localStorage, reset if it's a new day
function getDailyUsage(): DailyUsage {
    const today = getTodayDate();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const usage: DailyUsage = JSON.parse(stored);
            if (usage.date === today) {
                return usage;
            }
        }
    } catch (e) {
        console.error('Failed to read rate limit data:', e);
    }
    // New day or no data - return fresh usage
    return { date: today, uploadCount: 0, beginCount: 0, aiCount: 0 };
}

// Save usage to localStorage
function saveDailyUsage(usage: DailyUsage): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    } catch (e) {
        console.error('Failed to save rate limit data:', e);
    }
}

// ============ Upload Limits ============

export function canUpload(): boolean {
    const usage = getDailyUsage();
    return usage.uploadCount < LIMITS.UPLOAD;
}

export function getRemainingUploads(): number {
    const usage = getDailyUsage();
    return Math.max(0, LIMITS.UPLOAD - usage.uploadCount);
}

export function incrementUploadCount(): void {
    const usage = getDailyUsage();
    usage.uploadCount += 1;
    saveDailyUsage(usage);
}

// ============ Begin Game Limits ============

export function canBeginGame(): boolean {
    const usage = getDailyUsage();
    return usage.beginCount < LIMITS.BEGIN;
}

export function getRemainingBegins(): number {
    const usage = getDailyUsage();
    return Math.max(0, LIMITS.BEGIN - usage.beginCount);
}

export function incrementBeginCount(): void {
    const usage = getDailyUsage();
    usage.beginCount += 1;
    saveDailyUsage(usage);
}

// ============ AI Limits ============

export function canUseAI(aiCallsNeeded: number): boolean {
    const usage = getDailyUsage();
    return (usage.aiCount + aiCallsNeeded) <= LIMITS.AI;
}

export function getRemainingAICalls(): number {
    const usage = getDailyUsage();
    return Math.max(0, LIMITS.AI - usage.aiCount);
}

export function incrementAICount(count: number): void {
    const usage = getDailyUsage();
    usage.aiCount += count;
    saveDailyUsage(usage);
}

// ============ Utility Functions ============

// Count how many AI calls a game setup would use
export function countAICallsNeeded(blackType: string | null, whiteType: string | null): number {
    let calls = 0;
    if (blackType === 'ai') calls += 1;
    if (whiteType === 'ai') calls += 1;
    return calls;
}

// Get all remaining limits for display
export function getAllLimits(): {
    uploads: { remaining: number; total: number };
    begins: { remaining: number; total: number };
    ai: { remaining: number; total: number };
} {
    const usage = getDailyUsage();
    return {
        uploads: { remaining: Math.max(0, LIMITS.UPLOAD - usage.uploadCount), total: LIMITS.UPLOAD },
        begins: { remaining: Math.max(0, LIMITS.BEGIN - usage.beginCount), total: LIMITS.BEGIN },
        ai: { remaining: Math.max(0, LIMITS.AI - usage.aiCount), total: LIMITS.AI },
    };
}
