import { AppConfig } from './AppConfig';
import { SteamManager } from '../main/managers/SteamManager';

/**
 * Runtime Configuration - Unified configuration system with persistence
 * Handles both main process and renderer process configuration needs
 * Supports dual storage: localStorage (always) + Steam Cloud (when enabled)
 */
export class RuntimeConfig {
    private static instance: RuntimeConfig;
    private steamManager: SteamManager | null = null;
    
    // User preferences that can be modified
    public mousePixelDistance: number = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
    public keyButton: string = AppConfig.KEY_BUTTONS.NONE;
    public timerInterval: number = AppConfig.TIMER.DEFAULT_INTERVAL;
    public animationSteps: number = AppConfig.ANIMATION.DEFAULT_STEPS;
    public animationStepDelay: number = AppConfig.ANIMATION.DEFAULT_STEP_DELAY;
    public animationPauseDelay: number = AppConfig.ANIMATION.DEFAULT_PAUSE_DELAY;

    public static getInstance(steamManager?: SteamManager): RuntimeConfig {
        if (!RuntimeConfig.instance) {
            RuntimeConfig.instance = new RuntimeConfig();
        }
        if (steamManager) {
            RuntimeConfig.instance.setSteamManager(steamManager);
        }
        return RuntimeConfig.instance;
    }

    /**
     * Set Steam Manager for cloud sync
     */
    public setSteamManager(manager: SteamManager): void {
        this.steamManager = manager;
        // Load configuration from cloud if available
        this.initializeFromCloud();
    }

    /**
     * Initialize configuration from Steam Cloud or localStorage
     * Cloud data takes priority, then syncs to localStorage
     */
    private async initializeFromCloud(): Promise<void> {
        if (this.steamManager && this.steamManager.isCloudEnabledForAccount() && this.steamManager.isCloudEnabledForApp()) {
            const cloudConfig = await this.steamManager.loadConfiguration();
            
            if (cloudConfig) {
                // Load from cloud and sync to localStorage
                this.mousePixelDistance = cloudConfig.pixelDistance ?? AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
                this.keyButton = cloudConfig.keyButton ?? AppConfig.KEY_BUTTONS.NONE;
                this.timerInterval = cloudConfig.interval ?? AppConfig.TIMER.DEFAULT_INTERVAL;
                
                // Sync to localStorage
                this.saveToLocalStorage();
                console.log('Configuration loaded from Steam Cloud and synced to localStorage');
            } else {
                // No cloud data, load from localStorage (if exists)
                this.loadFromLocalStorage();
            }
        } else {
            // Cloud not available, load from localStorage
            this.loadFromLocalStorage();
        }
    }

    /**
     * Load configuration from localStorage
     */
    private loadFromLocalStorage(): void {
        const storedInterval = localStorage.getItem(AppConfig.STORAGE.KEYS.INTERVAL);
        const storedPixelDistance = localStorage.getItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE);
        const storedKeyButton = localStorage.getItem(AppConfig.STORAGE.KEYS.KEY_BUTTON);

        if (storedInterval) this.timerInterval = JSON.parse(storedInterval);
        if (storedPixelDistance) this.mousePixelDistance = JSON.parse(storedPixelDistance);
        if (storedKeyButton) this.keyButton = JSON.parse(storedKeyButton);
    }

    public setMousePixelDistance(distance: number): void {
        this.mousePixelDistance = distance;
    }

    public setTimerInterval(interval: number): void {
        this.timerInterval = interval;
    }

    public getAnimationConfig() {
        return {
            steps: this.animationSteps,
            stepDelay: this.animationStepDelay,
            pauseDelay: this.animationPauseDelay
        };
    }

    public getInterval(): number {
        return this.timerInterval;
    }

    public setInterval(milliseconds: number): void {
        this.setTimerInterval(milliseconds);
        this.saveToStorage();
    }

    public getPixelDistance(): number {
        return this.mousePixelDistance;
    }

    public setPixelDistance(distance: number): void {
        this.setMousePixelDistance(distance);
        this.saveToStorage();
    }

    public getKeyButton(): string {
        return this.keyButton;
    }

    public setKeyButton(button: string): void {
        this.keyButton = button;
        this.saveToStorage();
    }

    public getAllSettings(): ConfigurationSettings {
        return {
            interval: this.getInterval(),
            pixelDistance: this.getPixelDistance(),
            keyButton: this.getKeyButton()
        };
    }

    // Debug method to clear storage and reset to defaults
    public clearStorageAndReset(): void {
        localStorage.removeItem(AppConfig.STORAGE.KEYS.INTERVAL);
        localStorage.removeItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE);
        localStorage.removeItem(AppConfig.STORAGE.KEYS.KEY_BUTTON);
        
        // Reset to defaults
        this.mousePixelDistance = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
        this.keyButton = AppConfig.KEY_BUTTONS.NONE;
        this.timerInterval = AppConfig.TIMER.DEFAULT_INTERVAL;       
    }

    /**
     * Save configuration to localStorage only
     */
    private saveToLocalStorage(): void {
        localStorage.setItem(AppConfig.STORAGE.KEYS.INTERVAL, JSON.stringify(this.timerInterval));
        localStorage.setItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE, JSON.stringify(this.mousePixelDistance));
        localStorage.setItem(AppConfig.STORAGE.KEYS.KEY_BUTTON, JSON.stringify(this.keyButton));
    }

    /**
     * Save configuration to both localStorage and Steam Cloud (if enabled)
     * Dual storage: localStorage (always) + Steam Cloud (when enabled)
     */
    private async saveToStorage(): Promise<void> {
        // Always save to localStorage
        this.saveToLocalStorage();
        
        // Also save to Steam Cloud if available
        if (this.steamManager && this.steamManager.isCloudEnabledForAccount() && this.steamManager.isCloudEnabledForApp()) {
            const settings = this.getAllSettings();
            const success = await this.steamManager.saveConfiguration(settings);
            
            if (success) {
                console.log('Configuration saved to both localStorage and Steam Cloud');
            } else {
                console.warn('Configuration saved to localStorage only (Steam Cloud failed)');
            }
        }
    }
}

export interface ConfigurationSettings {
    interval: number; // milliseconds - timer interval
    pixelDistance: number; // pixels - mouse movement distance
    keyButton: string; // keyboard button to press: 'none', 'scrolllock', 'f15', etc.
}