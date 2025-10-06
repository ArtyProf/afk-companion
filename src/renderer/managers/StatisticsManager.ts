import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config/AppConfig';

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

interface AdvancedStatsDisplay {
    totalSessions: number;
    totalTime: number;
    totalActions: number;
    firstUsed: string;
}

/**
 * Statistics Manager - Handles tracking and statistics
 */
export class StatisticsManager {
    private actionCount: number = 0;
    private startTime: number | null = null;
    private lastActionTime: number | null = null;
    private sessionStartTime: number | null = null;

    constructor() {
        this.reset();
        this.initializePersistentStats();
    }

    private initializePersistentStats(): void {
        if (!localStorage.getItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS)) {
            const defaultStats: AdvancedStatsDisplay = {
                totalSessions: 0,
                totalTime: 0,
                totalActions: 0,
                firstUsed: new Date().toISOString()
            };
            localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(defaultStats));
        }
    }

    private loadPersistentStats(): AdvancedStatsDisplay {
        const stored = localStorage.getItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            totalSessions: 0,
            totalTime: 0,
            totalActions: 0,
            firstUsed: new Date().toISOString()
        };
    }

    private savePersistentStats(stats: AdvancedStatsDisplay): void {
        logger.debug('Saving persistent stats:', stats);
        localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(stats));
    }
    
    reset(): void {
        this.actionCount = 0;
        this.startTime = null;
        this.lastActionTime = null;
    }
    
    start(): void {
        this.startTime = Date.now();
        this.sessionStartTime = Date.now();
        this.actionCount = 0;
        
        // Increment total sessions
        const persistentStats = this.loadPersistentStats();
        persistentStats.totalSessions++;
        this.savePersistentStats(persistentStats);
    }
    
    recordAction(actionResult: ActionResult): void {
        this.actionCount++;
        this.lastActionTime = Date.now();
        
        // Update persistent stats
        const persistentStats = this.loadPersistentStats();
        persistentStats.totalActions++;
        
        this.savePersistentStats(persistentStats);
        
        logger.info(`Action recorded: ${actionResult.message} - Success: ${actionResult.success}`);
        logger.debug('Updated persistent stats after action:', persistentStats);
    }
    
    stop(): void {
        if (this.sessionStartTime) {
            // Calculate session duration and add to total
            const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            const persistentStats = this.loadPersistentStats();
            persistentStats.totalTime += sessionDuration;
            
            this.savePersistentStats(persistentStats);
            
            logger.info(`Session ended. Duration: ${sessionDuration}s`);
        }
        this.sessionStartTime = null;
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
    
    getAdvancedStats() {
        const persistentStats = this.loadPersistentStats();
        logger.debug('Raw persistent stats:', persistentStats);
        
        // Calculate average session duration
        const avgDurationSeconds = persistentStats.totalSessions > 0 
            ? persistentStats.totalTime / persistentStats.totalSessions 
            : 0;
        
        const result = {
            totalSessions: persistentStats.totalSessions,
            totalTime: this.formatDuration(persistentStats.totalTime),
            totalActions: persistentStats.totalActions,
            avgSessionDuration: this.formatDuration(avgDurationSeconds)
        };
        
        logger.debug('Formatted advanced stats:', result);
        return result;
    }

    clearPersistentStats(): void {
        localStorage.removeItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS);
        this.initializePersistentStats();
        logger.info('Persistent stats cleared');
    }

    private formatDuration(seconds: number): string {
        if (seconds === 0) return '0m';
        if (seconds < 60) return '< 1m';
        if (seconds < 3600) {
            return `${Math.round(seconds / 60)}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
    }

    private formatTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}