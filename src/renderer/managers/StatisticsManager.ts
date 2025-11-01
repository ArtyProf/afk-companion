import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config/AppConfig';
import { ActionResult } from './MouseActionManager';
import { ipcRenderer } from 'electron';

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
}

/**
 * Statistics Manager - Handles tracking and statistics with Steam Cloud sync via IPC
 */
export class StatisticsManager {
    private actionCount: number = 0;
    private startTime: number | null = null;
    private lastActionTime: number | null = null;

    constructor() {
        this.initializePersistentStats();
    }

    private async initializePersistentStats(): Promise<void> {
        // Try to load from Steam Cloud first (if available and enabled)
        const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
        
        if (cloudEnabled) {
            try {
                const cloudStats = await ipcRenderer.invoke('steam-cloud-load-stats');
                if (cloudStats) {
                    // Sync cloud data to localStorage
                    localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(cloudStats));
                    logger.info('Loaded stats from Steam Cloud and synced to localStorage');
                    return;
                }
            } catch (error) {
                logger.warn('Failed to load from Steam Cloud, falling back to localStorage:', error);
            }
        }

        // Fallback to localStorage if cloud unavailable or disabled
        if (!localStorage.getItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS)) {
            const defaultStats: AdvancedStatsDisplay = {
                totalSessions: 0,
                totalTime: 0,
                totalActions: 0
            };
            localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(defaultStats));
            logger.info('Initialized default stats in localStorage');
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
            totalActions: 0
        };
    }

    private async savePersistentStats(stats: AdvancedStatsDisplay): Promise<void> {
        console.log('Saving persistent stats:', stats);
        
        // Always save to localStorage (fallback/backup)
        localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(stats));

        const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
        
        // Also save to Steam Cloud if available and enabled
        if (cloudEnabled) {
            try {
                await ipcRenderer.invoke('steam-cloud-save-stats', stats);
            } catch (error) {
                logger.error('Error saving to Steam Cloud:', error);
            }
        } else {
            logger.debug('Steam Cloud disabled or unavailable, stats saved to localStorage only');
        }
    }
    
    start(): void {
        this.startTime = Date.now();
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
        
        logger.info(`Action recorded: ${actionResult.message}`);
    }
    
    stop(): void {
        if (this.startTime) {
            // Calculate session duration and add to total
            const sessionDuration = Math.floor((Date.now() - this.startTime) / 1000);
            const persistentStats = this.loadPersistentStats();
            persistentStats.totalTime += sessionDuration;
            this.savePersistentStats(persistentStats);
            
            logger.info(`Session ended. Duration: ${sessionDuration}s`);
        }
        this.startTime = null;
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
        
        // Calculate average session duration
        const avgDurationSeconds = persistentStats.totalSessions > 0 
            ? persistentStats.totalTime / persistentStats.totalSessions 
            : 0;
        
        return {
            totalSessions: persistentStats.totalSessions,
            totalTime: this.formatDuration(persistentStats.totalTime),
            totalActions: persistentStats.totalActions,
            avgSessionDuration: this.formatDuration(avgDurationSeconds)
        };
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