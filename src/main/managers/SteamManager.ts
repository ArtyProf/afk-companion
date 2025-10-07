import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config';
import steamworks from 'steamworks.js';

/**
 * Steam Manager - Simple Steam integration for achievements
 */
export class SteamManager {
    private steamClient: any = null;
    private isInitialized: boolean = false;

    constructor() {
        this.initializeSteam();
    }

    private initializeSteam(): void {
        try {
            this.steamClient = steamworks.init(AppConfig.STEAM.APP_ID);
            
            if (this.steamClient) {
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
    private unlockEligibleAchievements(totalActions: number): void {
        const thresholds = AppConfig.STEAM.ACHIEVEMENT_THRESHOLDS as readonly number[];
        
        for (let i = 0; i < thresholds.length; i++) {
            const threshold = thresholds[i];

            if (totalActions >= threshold) {
                const achievementName = `${AppConfig.STEAM.ACHIEVEMENT_PREFIX}${i}`;
                
                try {
                    if (!this.steamClient.achievement.isActivated(achievementName)) {
                        this.steamClient.achievement.activate(achievementName);
                        logger.info(`Achievement unlocked: ${achievementName} at ${totalActions} actions (threshold: ${threshold})!`);
                    }
                } catch (error) {
                    logger.error(`Error unlocking achievement ${achievementName}:`, error);
                }
            }
        }
    }
}