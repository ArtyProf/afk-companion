/**
 * Timer Manager - Handles countdown and interval management
 */
class TimerManager {
    constructor(onTick, onAction) {
        this.onTick = onTick;
        this.onAction = onAction;
        this.intervalId = null;
        this.countdownId = null;
        this.nextActionTime = 0;
        this.interval = 60;
    }
    
    start(interval) {
        this.interval = interval;
        this.nextActionTime = interval;
        
        // Immediate first action
        this.onAction();
        
        // Set up action interval
        this.intervalId = setInterval(() => {
            this.onAction();
            this.nextActionTime = this.interval;
        }, interval * 1000);
        
        // Set up countdown
        this.countdownId = setInterval(() => {
            if (this.nextActionTime > 0) {
                this.nextActionTime--;
            }
            this.onTick();
        }, 1000);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        if (this.countdownId) {
            clearInterval(this.countdownId);
            this.countdownId = null;
        }
        
        this.nextActionTime = this.interval;
    }
    
    getNextActionTime() {
        const minutes = Math.floor(this.nextActionTime / 60);
        const seconds = this.nextActionTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    isRunning() {
        return this.intervalId !== null;
    }
}

module.exports = TimerManager;