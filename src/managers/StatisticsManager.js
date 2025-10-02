/**
 * Statistics Manager - Handles tracking and statistics
 */
class StatisticsManager {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.actionCount = 0;
        this.startTime = null;
        this.lastActionTime = null;
    }
    
    start() {
        this.startTime = Date.now();
        this.actionCount = 0;
    }
    
    recordAction(actionResult) {
        this.actionCount++;
        this.lastActionTime = Date.now();
        
        console.log(`[${new Date().toLocaleTimeString()}] ${actionResult.message}`);
    }
    
    getStats() {
        const now = Date.now();
        const elapsed = this.startTime ? now - this.startTime : 0;
        
        return {
            actionCount: this.actionCount,
            runningTime: elapsed,
            lastActionTime: this.lastActionTime,
            formattedRunningTime: this.formatTime(elapsed)
        };
    }
    
    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

module.exports = StatisticsManager;