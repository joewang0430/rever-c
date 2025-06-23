//
// This file handles local storage operations.   
//

const APP_PREFIX = 'reverc_';

export const storage = {
    setItem: (key: string, value: string) => {
        try {
            localStorage.setItem(`${APP_PREFIX}${key}`, value);
        } catch (error) {
            console.warn(`Failed to save ${key}:`, error);
        }
    },
    
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(`${APP_PREFIX}${key}`);
        } catch (error) {
            console.warn(`Failed to get ${key}:`, error);
            return null;
        }
    },
    
    removeItem: (key: string) => {
        try {
            localStorage.removeItem(`${APP_PREFIX}${key}`);
        } catch (error) {
            console.warn(`Failed to remove ${key}:`, error);
        }
    },
    
    setJSON: (key: string, value: any) => {
        storage.setItem(key, JSON.stringify(value));
    },
    
    getJSON: (key: string): any => {
        const item = storage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
};