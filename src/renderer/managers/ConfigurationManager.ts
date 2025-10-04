import { logger } from '../../utils/Logger';

interface Settings {
    interval: number; // seconds
    pixelDistance: number; // pixels for mouse movement
}

/**
 * Configuration Manager - Handles settings and preferences
 */
export class ConfigurationManager {
    private settings: Settings;

    constructor() {
        this.settings = {
            interval: 60, // seconds
            pixelDistance: 5, // pixels for mouse movement
        };
    }
    
    get<K extends keyof Settings>(key: K): Settings[K] {
        return this.settings[key];
    }
    
    set<K extends keyof Settings>(key: K, value: Settings[K]): void {
        this.settings[key] = value;
        const storageKey = `afk-companion-${key as string}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
        logger.debug(`Configuration updated: ${storageKey} = ${value}`);
    }
    
    getAll(): Settings {
        return { ...this.settings };
    }
}