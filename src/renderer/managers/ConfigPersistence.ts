import { ipcRenderer } from 'electron';
import { AppConfig } from '../../config/AppConfig';
import { ConfigurationSettings } from '../../config/RuntimeConfig';

/**
 * Configuration Persistence Manager
 * Handles saving/loading configuration with dual storage:
 * - localStorage (always, fallback)
 * - Steam Cloud (when enabled, via IPC)
 * 
 * Uses timestamp-based conflict resolution:
 * - Newest data wins (by lastModified timestamp)
 * - Handles offline → online transitions
 * - Supports multi-device sync
 */
export class ConfigPersistence {
    /**
     * Load configuration from Steam Cloud or localStorage
     * Priority: Newest data (by timestamp) → localStorage → defaults
     * Automatically syncs newer data to both storage locations
     */
    async loadConfig(): Promise<ConfigurationSettings> {
        const localConfig = this.loadFromLocalStorage();
        
        // Try to load from Steam Cloud
        try {
            const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
            
            if (cloudEnabled) {
                const cloudConfig = await ipcRenderer.invoke('steam-cloud-load-config');
                
                if (cloudConfig) {
                    // Compare timestamps - use newest data
                    const localTimestamp = localConfig.lastModified || 0;
                    const cloudTimestamp = cloudConfig.lastModified || 0;
                    
                    if (cloudTimestamp > localTimestamp) {
                        // Cloud is newer - sync TO localStorage
                        this.saveToLocalStorage(cloudConfig);
                        console.log(`Configuration loaded from Steam Cloud (cloud: ${new Date(cloudTimestamp).toISOString()}, local: ${new Date(localTimestamp).toISOString()})`);
                        return cloudConfig;
                    } else if (localTimestamp > cloudTimestamp) {
                        // Local is newer - sync TO cloud (offline changes)
                        await ipcRenderer.invoke('steam-cloud-save-config', localConfig);
                        console.log(`Local configuration is newer, synced to Steam Cloud (local: ${new Date(localTimestamp).toISOString()}, cloud: ${new Date(cloudTimestamp).toISOString()})`);
                        return localConfig;
                    } else {
                        // Same timestamp - already in sync
                        console.log('Configuration loaded from Steam Cloud (already in sync)');
                        return cloudConfig;
                    }
                } else {
                    // No cloud data - upload local to cloud
                    await ipcRenderer.invoke('steam-cloud-save-config', localConfig);
                    console.log('No cloud data found, uploaded local configuration to Steam Cloud');
                    return localConfig;
                }
            }
        } catch (error) {
            console.warn('Failed to load from Steam Cloud, using localStorage:', error);
        }

        // Fallback to localStorage
        console.log('Steam Cloud disabled or unavailable, using localStorage');
        return localConfig;
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
        const storedTimestamp = localStorage.getItem(AppConfig.STORAGE.KEYS.LAST_MODIFIED);

        return {
            interval: storedInterval ? JSON.parse(storedInterval) : AppConfig.TIMER.DEFAULT_INTERVAL,
            pixelDistance: storedPixelDistance ? JSON.parse(storedPixelDistance) : AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE,
            keyButton: storedKeyButton ? JSON.parse(storedKeyButton) : AppConfig.KEY_BUTTONS.NONE,
            // IMPORTANT: 0 if no timestamp stored (new device) - ensures cloud data wins on first load
            lastModified: storedTimestamp ? JSON.parse(storedTimestamp) : 0
        };
    }

    /**
     * Save to localStorage only
     */
    private saveToLocalStorage(config: ConfigurationSettings): void {
        localStorage.setItem(AppConfig.STORAGE.KEYS.INTERVAL, JSON.stringify(config.interval));
        localStorage.setItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE, JSON.stringify(config.pixelDistance));
        localStorage.setItem(AppConfig.STORAGE.KEYS.KEY_BUTTON, JSON.stringify(config.keyButton));
        localStorage.setItem(AppConfig.STORAGE.KEYS.LAST_MODIFIED, JSON.stringify(config.lastModified));
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
