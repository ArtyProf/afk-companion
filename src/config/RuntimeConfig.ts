import { AppConfig } from './AppConfig';

/**
 * Runtime Configuration - For user-configurable settings
 * These can be modified at runtime unlike AppConfig constants
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

    private constructor() {}

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

    public setAnimationConfig(config: { steps: number; stepDelay: number; pauseDelay: number }) {
        this.animationSteps = config.steps;
        this.animationStepDelay = config.stepDelay;
        this.animationPauseDelay = config.pauseDelay;
    }
}