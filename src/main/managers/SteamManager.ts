/**
 * Steam Manager - Simple Steam integration for achievements
 */
export class SteamManager {
    private steamworks: any = null;
    private isInitialized: boolean = false;

    constructor() {
        this.initializeSteam();
    }

    private initializeSteam(): void {
        try {
            const steamworks = require('steamworks.js');
            
            if (steamworks.init(2609100)) {
                this.steamworks = steamworks;
                this.isInitialized = true;
                console.log('Steam initialized successfully');
            } else {
                console.log('Failed to initialize Steam');
            }
        } catch (error) {
            console.log('Steam not available:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Check and unlock achievements based on total actions
     * This is the ONLY method needed for achievements!
     */
    checkAchievements(totalActions: number): void {
        if (!this.isInitialized) {
            console.log(`Achievement check: ${totalActions} actions (Steam not available)`);
            return;
        }

        // Achievement thresholds: every 15 actions
        const thresholds = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150];
        
        for (let i = 0; i < thresholds.length; i++) {
            if (totalActions >= thresholds[i]) {
                const achievementName = `NEW_ACHIEVEMENT_${i}`;
                
                try {
                    // Check if already unlocked
                    if (!this.steamworks.achievement.isActivated(achievementName)) {
                        this.steamworks.achievement.activate(achievementName);
                        console.log(`Achievement unlocked: ${achievementName} at ${totalActions} actions`);
                    }
                } catch (error) {
                    console.error(`Error unlocking achievement ${achievementName}:`, error);
                }
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