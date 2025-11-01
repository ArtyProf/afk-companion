import { AppConfig } from './AppConfig';

/**
 * Runtime Configuration - Simple configuration holder
 * Does NOT handle persistence - use ConfigPersistence for that
 */
export class RuntimeConfig {
    private static instance: RuntimeConfig;
    
    // User preferences that can be modified
    public mousePixelDistance: number = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
    public keyButton: string = AppConfig.KEY_BUTTONS.NONE;
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

    public getPixelDistance(): number {
        return this.mousePixelDistance;
    }

    public getKeyButton(): string {
        return this.keyButton;
    }

    public getAllSettings(): ConfigurationSettings {
        return {
            interval: this.getInterval(),
            pixelDistance: this.getPixelDistance(),
            keyButton: this.getKeyButton()
        };
    }

    /**
     * Load settings into this config instance
     */
    public loadSettings(settings: ConfigurationSettings): void {
        this.timerInterval = settings.interval;
        this.mousePixelDistance = settings.pixelDistance;
        this.keyButton = settings.keyButton;
    }

    /**
     * Reset to defaults
     */
    public resetToDefaults(): void {
        this.mousePixelDistance = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE;
        this.keyButton = AppConfig.KEY_BUTTONS.NONE;
        this.timerInterval = AppConfig.TIMER.DEFAULT_INTERVAL;
    }
}

export interface ConfigurationSettings {
    interval: number; // milliseconds - timer interval
    pixelDistance: number; // pixels - mouse movement distance
    keyButton: string; // keyboard button to press: 'none', 'scrolllock', 'f15', etc.
}
