import { ipcRenderer } from 'electron';
import { AppConfig } from '../../config/AppConfig';

export interface ConfigurationSettings {
    interval: number;
    pixelDistance: number;
    keyButton: string;
}

/**
 * Configuration Persistence Manager
 * Handles saving/loading configuration with dual storage:
 * - localStorage (always, fallback)
 * - Steam Cloud (when enabled, via IPC)
 */
export class ConfigPersistence {
    /**
     * Load configuration from Steam Cloud or localStorage
     * Priority: Steam Cloud → localStorage → defaults
     */
    async loadConfig(): Promise<ConfigurationSettings> {
        // Try Steam Cloud first
        try {
            const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
            
            if (cloudEnabled) {
                const cloudConfig = await ipcRenderer.invoke('steam-cloud-load-config');
                
                if (cloudConfig) {
                    // Sync cloud data to localStorage
                    this.saveToLocalStorage(cloudConfig);
                    console.log('Configuration loaded from Steam Cloud and synced to localStorage');
                    return cloudConfig;
                }
            }
        } catch (error) {
            console.warn('Failed to load from Steam Cloud, falling back to localStorage:', error);
        }

        // Fallback to localStorage
        return this.loadFromLocalStorage();
    }

    /**
     * Save configuration to both localStorage and Steam Cloud
     */
    async saveConfig(config: ConfigurationSettings): Promise<void> {
        // Always save to localStorage
        this.saveToLocalStorage(config);

        // Also save to Steam Cloud if enabled
        try {
            const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
            
            if (cloudEnabled) {
                const success = await ipcRenderer.invoke('steam-cloud-save-config', config);
                
                if (success) {
                    console.log('Configuration saved to both localStorage and Steam Cloud');
                } else {
                    console.warn('Configuration saved to localStorage only (Steam Cloud failed)');
                }
            } else {
                console.log('Steam Cloud disabled, saved to localStorage only');
            }
        } catch (error) {
            console.error('Error saving to Steam Cloud:', error);
        }
    }

    /**
     * Load from localStorage only
     */
    private loadFromLocalStorage(): ConfigurationSettings {
        const storedInterval = localStorage.getItem(AppConfig.STORAGE.KEYS.INTERVAL);
        const storedPixelDistance = localStorage.getItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE);
        const storedKeyButton = localStorage.getItem(AppConfig.STORAGE.KEYS.KEY_BUTTON);

        return {
            interval: storedInterval ? JSON.parse(storedInterval) : AppConfig.TIMER.DEFAULT_INTERVAL,
            pixelDistance: storedPixelDistance ? JSON.parse(storedPixelDistance) : AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE,
            keyButton: storedKeyButton ? JSON.parse(storedKeyButton) : AppConfig.KEY_BUTTONS.NONE
        };
    }

    /**
     * Save to localStorage only
     */
    private saveToLocalStorage(config: ConfigurationSettings): void {
        localStorage.setItem(AppConfig.STORAGE.KEYS.INTERVAL, JSON.stringify(config.interval));
        localStorage.setItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE, JSON.stringify(config.pixelDistance));
        localStorage.setItem(AppConfig.STORAGE.KEYS.KEY_BUTTON, JSON.stringify(config.keyButton));
    }

    /**
     * Clear all stored configuration
     */
    clearConfig(): void {
        localStorage.removeItem(AppConfig.STORAGE.KEYS.INTERVAL);
        localStorage.removeItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE);
        localStorage.removeItem(AppConfig.STORAGE.KEYS.KEY_BUTTON);
    }
}
