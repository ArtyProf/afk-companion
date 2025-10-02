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
        console.log(`Configuration updated: ${key} = ${value}`);
    }
    
    getAll(): Settings {
        return { ...this.settings };
    }
}