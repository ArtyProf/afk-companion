/**
 * Timer Manager - Handles countdown and interval management
 */
export class TimerManager {
    private onTick: () => void;
    private onAction: () => void;
    private intervalId: NodeJS.Timeout | null = null;
    private countdownId: NodeJS.Timeout | null = null;
    private nextActionTimeMs: number = 0; // Track in milliseconds
    private intervalMs: number = 60000; // Store in milliseconds

    constructor(onTick: () => void, onAction: () => void) {
        this.onTick = onTick;
        this.onAction = onAction;
    }
    
    start(interval: number): void {
        this.intervalMs = interval;
        this.nextActionTimeMs = interval;
        
        // Immediate first action
        this.onAction();
        
        // Set up action interval
        this.intervalId = setInterval(() => {
            this.onAction();
            this.nextActionTimeMs = this.intervalMs; // Reset countdown
        }, interval);
        
        // Set up countdown (decrements every second)
        this.countdownId = setInterval(() => {
            if (this.nextActionTimeMs > 0) this.nextActionTimeMs -= 1000;
            this.onTick();
        }, 1000);
    }
    
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        if (this.countdownId) {
            clearInterval(this.countdownId);
            this.countdownId = null;
        }
        
        this.nextActionTimeMs = this.intervalMs;
    }
    
    getNextActionTime(): string {
        const totalSeconds = Math.floor(this.nextActionTimeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    isRunning(): boolean {
        return this.intervalId !== null;
    }
}