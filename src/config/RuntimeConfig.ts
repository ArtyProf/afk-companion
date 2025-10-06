import { AppConfig } from './AppConfig';

/**
 * Runtime Configuration - Unified configuration system with persistence
 * Handles both main process and renderer process configuration needs
 */
export class RuntimeConfig {
    private static instance: RuntimeConfig;
    
    // User preferences that can be modified
    public mousePixelDistance: number = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
    public timerInterval: number = AppConfig.TIMER.DEFAULT_INTERVAL;
    public animationSteps: number = AppConfig.ANIMATION.DEFAULT_STEPS;
    public animationStepDelay: number = AppConfig.ANIMATION.DEFAULT_STEP_DELAY;
    public animationPauseDelay: number = AppConfig.ANIMATION.DEFAULT_PAUSE_DELAY;

    public static getInstance(): RuntimeConfig {
        if (!RuntimeConfig.instance) {
            RuntimeConfig.instance = new RuntimeConfig();
        }
        return RuntimeConfig.instance;
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

    public getAllSettings(): ConfigurationSettings {
        return {
            interval: this.getInterval(),
            pixelDistance: this.getPixelDistance()
        };
    }

    // Debug method to clear storage and reset to defaults
    public clearStorageAndReset(): void {
        localStorage.removeItem(AppConfig.STORAGE.KEYS.INTERVAL);
        localStorage.removeItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE);
        
        // Reset to defaults
        this.mousePixelDistance = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
        this.timerInterval = AppConfig.TIMER.DEFAULT_INTERVAL;       
    }

    private saveToStorage(): void {
        localStorage.setItem(AppConfig.STORAGE.KEYS.INTERVAL, JSON.stringify(this.timerInterval));
        localStorage.setItem(AppConfig.STORAGE.KEYS.PIXEL_DISTANCE, JSON.stringify(this.mousePixelDistance));
    }
}

export interface ConfigurationSettings {
    interval: number; // milliseconds - timer interval
    pixelDistance: number; // pixels - mouse movement distance
}