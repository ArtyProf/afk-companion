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
}