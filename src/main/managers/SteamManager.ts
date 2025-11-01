import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config';
import SteamworksSDK from 'steamworks-ffi-node';

/**
 * Steam Manager - Simple Steam integration for achievements using steamworks-ffi-node
 */
export class SteamManager {
    private steam: SteamworksSDK;
    private isInitialized: boolean = false;
    private callbackInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.steam = SteamworksSDK.getInstance();
        this.initializeSteam();
    }

    private initializeSteam(): void {
        try {
            // Initialize Steam API
            const success = this.steam.init({ appId: AppConfig.STEAM.APP_ID });
            
            if (success) {
                this.isInitialized = true;
                const status = this.steam.getStatus();
                logger.info(`Steam initialized successfully - App ID: ${status.appId}, Steam ID: ${status.steamId}`);
                
                // Start running callbacks periodically (required for Steam API)
                this.callbackInterval = setInterval(() => {
                    this.steam.runCallbacks();
                }, 1000); // Run callbacks every second
                
            } else {
                logger.warn('Failed to initialize Steam API');
            }
        } catch (error) {
            logger.info('Steam not available (not running under Steam client):', error);
            this.isInitialized = false;
        }
    }

    /**
     * Check and unlock achievements based on total actions
     * Triggers when exact threshold is met or every 200 actions
     */
    checkAchievements(totalActions: number): void {
        if (!this.isInitialized) {
            return;
        }

        const shouldCheck = this.shouldCheckAchievements(totalActions);
        
        if (shouldCheck) {
            this.unlockEligibleAchievements(totalActions);
        }
    }

    /**
     * Determine if we should check achievements
     */
    private shouldCheckAchievements(totalActions: number): boolean {
        const isExactThreshold = (AppConfig.STEAM.ACHIEVEMENT_THRESHOLDS as readonly number[]).includes(totalActions);
        
        const isDivisibleBy200 = totalActions > 0 && totalActions % 200 === 0;
        
        return isExactThreshold || isDivisibleBy200;
    }

    /**
     * Unlock all achievements that the user is eligible for
     * Checks all thresholds up to the current action count
     */
    private async unlockEligibleAchievements(totalActions: number): Promise<void> {
        const thresholds = AppConfig.STEAM.ACHIEVEMENT_THRESHOLDS as readonly number[];
        
        for (let i = 0; i < thresholds.length; i++) {
            const threshold = thresholds[i];

            if (totalActions >= threshold) {
                const achievementName = `${AppConfig.STEAM.ACHIEVEMENT_PREFIX}${i}`;
                
                try {
                    // Check if achievement is already unlocked
                    const isUnlocked = await this.steam.achievements.isAchievementUnlocked(achievementName);
                    
                    if (!isUnlocked) {
                        // Unlock the achievement
                        const success = await this.steam.achievements.unlockAchievement(achievementName);
                        
                        if (success) {
                            logger.info(`Achievement unlocked: ${achievementName} at ${totalActions} actions (threshold: ${threshold})!`);
                        } else {
                            logger.warn(`Failed to unlock achievement: ${achievementName}`);
                        }
                    }
                } catch (error) {
                    logger.error(`Error unlocking achievement ${achievementName}:`, error);
                }
            }
        }
    }

    /**
     * Shutdown Steam API when app closes
     */
    shutdown(): void {
        if (this.isInitialized) {
            try {
                // Stop callback interval
                if (this.callbackInterval) {
                    clearInterval(this.callbackInterval);
                    this.callbackInterval = null;
                }
                
                this.steam.shutdown();
                logger.info('Steam API shutdown successfully');
            } catch (error) {
                logger.error('Error shutting down Steam API:', error);
            }
        }
    }

    /**
     * Save data to Steam Cloud using Steam Remote Storage API
     * This prevents users from manually modifying save files
     */
    async saveToCloud(filename: string, data: any): Promise<boolean> {
        if (!this.isInitialized) {
            logger.warn('Steam not initialized, cannot save to cloud');
            return false;
        }

        try {
            const jsonData = JSON.stringify(data);
            const buffer = Buffer.from(jsonData, 'utf8');
            
            // Use Steam Cloud API to write file directly
            const success = this.steam.cloud.fileWrite(filename, buffer);
            
            if (success) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            logger.error(`Error saving to Steam Cloud (${filename}):`, error);
            return false;
        }
    }

    /**
     * Load data from Steam Cloud using Steam Remote Storage API
     * This ensures data integrity and prevents tampering
     */
    async loadFromCloud(filename: string): Promise<any | null> {
        if (!this.isInitialized) {
            logger.warn('Steam not initialized, cannot load from cloud');
            return null;
        }

        try {
            // Check if file exists in Steam Cloud
            const exists = this.steam.cloud.fileExists(filename);
            
            if (!exists) {
                return null;
            }

            // Read file from Steam Cloud API
            const result = this.steam.cloud.fileRead(filename);
            
            if (!result.success || !result.data) {
                return null;
            }

            const jsonData = result.data.toString('utf8');
            const data = JSON.parse(jsonData);
            return data;
        } catch (error) {
            logger.error(`Error loading from Steam Cloud (${filename}):`, error);
            return null;
        }
    }

    /**
     * Check if Steam Cloud is enabled for this user account
     */
    isCloudEnabledForAccount(): boolean {
        if (!this.isInitialized) {
            return false;
        }

        try {
            return this.steam.cloud.isCloudEnabledForAccount();
        } catch (error) {
            logger.error('Error checking cloud status:', error);
            return false;
        }
    }

    /**
     * Check if Steam Cloud is enabled for this app
     */
    isCloudEnabledForApp(): boolean {
        if (!this.isInitialized) {
            return false;
        }

        try {
            return this.steam.cloud.isCloudEnabledForApp();
        } catch (error) {
            logger.error('Error checking app cloud status:', error);
            return false;
        }
    }

    /**
     * Save persistent stats to Steam Cloud
     */
    async savePersistentStats(stats: any): Promise<boolean> {
        return await this.saveToCloud(AppConfig.STEAM.CLOUD.STATS_FILE, stats);
    }

    /**
     * Load persistent stats from Steam Cloud
     */
    async loadPersistentStats(): Promise<any | null> {
        return await this.loadFromCloud(AppConfig.STEAM.CLOUD.STATS_FILE);
    }

    /**
     * Save configuration to Steam Cloud
     */
    async saveConfiguration(config: any): Promise<boolean> {
        return await this.saveToCloud(AppConfig.STEAM.CLOUD.CONFIG_FILE, config);
    }

    /**
     * Load configuration from Steam Cloud
     */
    async loadConfiguration(): Promise<any | null> {
        return await this.loadFromCloud(AppConfig.STEAM.CLOUD.CONFIG_FILE);
    }
}