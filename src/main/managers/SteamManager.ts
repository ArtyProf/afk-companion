import { logger } from '../../utils/Logger';
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
            this.steamClient = steamworks.init(2609100);
            
            if (this.steamClient) {
                this.steamworks = steamworks;
                this.isInitialized = true;
                logger.info('Steam initialized successfully with client');
            } else {
                logger.warn('Failed to initialize Steam');
            }
        } catch (error) {
            logger.info('Steam not available:', error);
            this.isInitialized = false;
        }
    }

    // Achievement thresholds: every 15 actions
    private static readonly ACHIEVEMENT_THRESHOLDS = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150];

    /**
     * Check and unlock achievements based on total actions
     * Only triggers when exact threshold is met for efficiency
     */
    checkAchievements(totalActions: number): void {
        if (!this.isInitialized) {
            return;
        }

        // Only check if the current action count matches a threshold
        const thresholdIndex = SteamManager.ACHIEVEMENT_THRESHOLDS.indexOf(totalActions);
        
        if (thresholdIndex !== -1) {
            const achievementName = `NEW_ACHIEVEMENT_${thresholdIndex}`;
            
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