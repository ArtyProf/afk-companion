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
    lastModified: number; // timestamp - when stats were last modified
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
        const localStats = this.loadPersistentStats();
        
        // Try to load from Steam Cloud and compare timestamps
        const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
        
        if (cloudEnabled) {
            try {
                const cloudStats = await ipcRenderer.invoke('steam-cloud-load-stats');
                
                if (cloudStats) {
                    // Compare timestamps - use newest data
                    const localTimestamp = localStats.lastModified || 0;
                    const cloudTimestamp = cloudStats.lastModified || 0;
                    
                    if (cloudTimestamp > localTimestamp) {
                        // Cloud is newer - sync TO localStorage
                        localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(cloudStats));
                        logger.info(`Stats loaded from Steam Cloud (cloud: ${new Date(cloudTimestamp).toISOString()}, local: ${new Date(localTimestamp).toISOString()})`);
                        return;
                    } else if (localTimestamp > cloudTimestamp) {
                        // Local is newer - sync TO cloud (offline progress)
                        await ipcRenderer.invoke('steam-cloud-save-stats', localStats);
                        logger.info(`Local stats are newer, synced to Steam Cloud (local: ${new Date(localTimestamp).toISOString()}, cloud: ${new Date(cloudTimestamp).toISOString()})`);
                        return;
                    } else {
                        // Same timestamp - already in sync
                        logger.info('Stats loaded from Steam Cloud (already in sync)');
                        return;
                    }
                } else {
                    // No cloud data - upload local to cloud
                    await ipcRenderer.invoke('steam-cloud-save-stats', localStats);
                    logger.info('No cloud stats found, uploaded local stats to Steam Cloud');
                    return;
                }
            } catch (error) {
                logger.warn('Failed to load from Steam Cloud, using localStorage:', error);
            }
        }

        // Fallback to localStorage if cloud unavailable or disabled
        if (!localStorage.getItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS)) {
            const defaultStats: AdvancedStatsDisplay = {
                totalSessions: 0,
                totalTime: 0,
                totalActions: 0,
                lastModified: Date.now()
            };
            localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(defaultStats));
            logger.info('Initialized default stats in localStorage');
        }
    }

    private loadPersistentStats(): AdvancedStatsDisplay {
        const stored = localStorage.getItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS);
        if (stored) {
            const stats = JSON.parse(stored);
            // Add lastModified if missing (backward compatibility)
            if (!stats.lastModified) {
                stats.lastModified = Date.now();
            }
            return stats;
        }
        // New device/first run: return defaults with ZERO timestamp
        // This ensures cloud data (if exists) will always win on first load
        return {
            totalSessions: 0,
            totalTime: 0,
            totalActions: 0,
            lastModified: 0  // ← IMPORTANT: 0 means "never modified", cloud will win
        };
    }

    private async savePersistentStats(stats: AdvancedStatsDisplay): Promise<void> {
        // Update timestamp
        stats.lastModified = Date.now();
        
        console.log('Saving persistent stats:', stats);
        
        // Always save to localStorage (fallback/backup)
        localStorage.setItem(AppConfig.STORAGE.KEYS.PERSISTENT_STATS, JSON.stringify(stats));
        
        // Debug: Check Steam Cloud status via IPC
        const cloudEnabled = await ipcRenderer.invoke('steam-cloud-enabled');
        console.log('Steam Cloud Check:');
        console.log('  - Steam Cloud enabled:', cloudEnabled);
        
        // Also save to Steam Cloud if available and enabled
        if (cloudEnabled) {
            try {
                console.log('Attempting to save to Steam Cloud...');
                const success = await ipcRenderer.invoke('steam-cloud-save-stats', stats);
                if (success) {
                    console.log('Stats saved to both localStorage and Steam Cloud');
                } else {
                    console.log('Steam Cloud save failed, but localStorage updated');
                }
            } catch (error) {
                console.log('Error saving to Steam Cloud:', error);
            }
        } else {
            console.log('Steam Cloud disabled or unavailable, stats saved to localStorage only');
        }
    }    start(): void {
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