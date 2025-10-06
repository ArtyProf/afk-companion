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
    public loggingEnabled: boolean = false;

    public static getInstance(): RuntimeConfig {
        if (!RuntimeConfig.instance) {
            RuntimeConfig.instance = new RuntimeConfig();
        }
        return RuntimeConfig.instance;
    }

    // Validation methods
    public setMousePixelDistance(distance: number): boolean {
        if (distance >= AppConfig.MOUSE.MIN_PIXEL_DISTANCE && 
            distance <= AppConfig.MOUSE.MAX_PIXEL_DISTANCE) {
            this.mousePixelDistance = distance;
            return true;
        }
        return false;
    }

    public setTimerInterval(interval: number): boolean {
        if (interval >= AppConfig.TIMER.MIN_INTERVAL && 
            interval <= AppConfig.TIMER.MAX_INTERVAL) {
            this.timerInterval = interval;
            return true;
        }
        return false;
    }

    public getAnimationConfig() {
        return {
            steps: this.animationSteps,
            stepDelay: this.animationStepDelay,
            pauseDelay: this.animationPauseDelay
        };
    }

    public getInterval(): number {
        return this.timerInterval / 1000;
    }

    public setInterval(seconds: number): boolean {
        const milliseconds = seconds * 1000;
        if (this.setTimerInterval(milliseconds)) {
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public getPixelDistance(): number {
        return this.mousePixelDistance;
    }

    public setPixelDistance(distance: number): boolean {
        if (this.setMousePixelDistance(distance)) {
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public getAllSettings(): ConfigurationSettings {
        return {
            interval: this.getInterval(),
            pixelDistance: this.getPixelDistance()
        };
    }

    // Debug method to clear storage and reset to defaults
    public clearStorageAndReset(): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('afk-companion-interval');
            localStorage.removeItem('afk-companion-pixelDistance');
        }
        
        // Reset to defaults
        this.mousePixelDistance = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
        this.timerInterval = AppConfig.TIMER.DEFAULT_INTERVAL;       
    }

    private saveToStorage(): void {
        if (typeof localStorage === 'undefined') return;
        
        localStorage.setItem('afk-companion-interval', JSON.stringify(this.timerInterval / 1000));
        localStorage.setItem('afk-companion-pixelDistance', JSON.stringify(this.mousePixelDistance));
    }

}

export interface ConfigurationSettings {
    interval: number;
    pixelDistance: number;
}