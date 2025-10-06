/**
 * Timer Manager - Handles countdown and interval management
 */
export class TimerManager {
    private onTick: () => void;
    private onAction: () => void;
    private intervalId: NodeJS.Timeout | null = null;
    private countdownId: NodeJS.Timeout | null = null;
    private nextActionTime: number = 0;
    private interval: number = 60;

    constructor(onTick: () => void, onAction: () => void) {
        this.onTick = onTick;
        this.onAction = onAction;
    }
    
    start(interval: number): void {
        this.interval = interval;
        this.nextActionTime = Math.floor(interval / 1000); // Convert milliseconds to seconds for countdown display
        
        // Immediate first action
        this.onAction();
        
        // Set up action interval (interval is already in milliseconds)
        this.intervalId = setInterval(() => {
            this.onAction();
            this.nextActionTime = Math.floor(this.interval / 1000); // Reset countdown in seconds
        }, interval);
        
        // Set up countdown (still counts down in seconds for display)
        this.countdownId = setInterval(() => {
            if (this.nextActionTime > 0) {
                this.nextActionTime--;
            }
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
        
        this.nextActionTime = Math.floor(this.interval / 1000);
    }
    
    getNextActionTime(): string {
        const minutes = Math.floor(this.nextActionTime / 60);
        const seconds = this.nextActionTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    isRunning(): boolean {
        return this.intervalId !== null;
    }
}