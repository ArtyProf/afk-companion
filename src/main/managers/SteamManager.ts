import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config';
import steamworks from 'steamworks.js';

/**
 * Steam Manager - Simple Steam integration for achievements
 */
export class SteamManager {
    private steamworks: any = null;
    private steamClient: any = null;
    private isInitialized: boolean = false;

    constructor() {
        this.initializeSteam();
    }

    private initializeSteam(): void {
        try {
            this.steamClient = steamworks.init(AppConfig.STEAM.APP_ID);
            
            if (this.steamClient) {
                this.steamworks = steamworks;
                this.isInitialized = true;
                logger.info(`Steam initialized successfully with App ID ${AppConfig.STEAM.APP_ID}`);
            } else {
                logger.warn('Failed to initialize Steam');
            }
        } catch (error) {
            logger.info('Steam not available:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Check and unlock achievements based on total actions
     * Only triggers when exact threshold is met for efficiency
     */
    checkAchievements(totalActions: number): void {
        if (!this.isInitialized) {
            return;
        }

        // Only check if the current action count matches a threshold
        const thresholdIndex = (AppConfig.STEAM.ACHIEVEMENT_THRESHOLDS as readonly number[]).indexOf(totalActions);
        
        if (thresholdIndex !== -1) {
            const achievementName = `${AppConfig.STEAM.ACHIEVEMENT_PREFIX}${thresholdIndex}`;
            
            try {
                // Use the stored Steam client
                if (!this.steamClient.achievement.isActivated(achievementName)) {
                    this.steamClient.achievement.activate(achievementName);
                    logger.info(`Achievement unlocked: ${achievementName} at ${totalActions} actions!`);
                } else {
                    logger.debug(`Achievement ${achievementName} already unlocked`);
                }
            } catch (error) {
                logger.error(`Error unlocking achievement ${achievementName}:`, error);
            }
        }
    }

    /**
     * Check if Steam is available
     */
    isSteamAvailable(): boolean {
        return this.isInitialized;
    }

    /**
     * Get Steam username
     */
    getSteamUserName(): string {
        if (!this.isInitialized) return 'Unknown';

        try {
            return this.steamworks.localplayer.getName() || 'Steam User';
        } catch (error) {
            return 'Steam User';
        }
    }

}