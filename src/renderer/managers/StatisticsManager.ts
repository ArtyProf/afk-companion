interface ActionResult {
    success: boolean;
    message: string;
    timestamp: string;
}

interface Stats {
    actionCount: number;
    runningTime: number;
    lastActionTime: number | null;
    formattedRunningTime: string;
}

/**
 * Statistics Manager - Handles tracking and statistics
 */
export class StatisticsManager {
    private actionCount: number = 0;
    private startTime: number | null = null;
    private lastActionTime: number | null = null;

    constructor() {
        this.reset();
    }
    
    reset(): void {
        this.actionCount = 0;
        this.startTime = null;
        this.lastActionTime = null;
    }
    
    start(): void {
        this.startTime = Date.now();
        this.actionCount = 0;
    }
    
    recordAction(actionResult: ActionResult): void {
        this.actionCount++;
        this.lastActionTime = Date.now();
        
        console.log(`[${new Date().toLocaleTimeString()}] ${actionResult.message}`);
    }
    
    getStats(): Stats {
        const now = Date.now();
        const elapsed = this.startTime ? now - this.startTime : 0;
        
        return {
            actionCount: this.actionCount,
            runningTime: elapsed,
            lastActionTime: this.lastActionTime,
            formattedRunningTime: this.formatTime(elapsed)
        };
    }
    
    private formatTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}