/**
 * Application Configuration - Centralized configuration management
 * All magic numbers, strings, and settings should be defined here
 */
export class AppConfig {
    
    // ==================== STEAM CONFIGURATION ====================
    static readonly STEAM = {
        APP_ID: 2609100,
        ACHIEVEMENT_THRESHOLDS: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150],
        ACHIEVEMENT_PREFIX: 'NEW_ACHIEVEMENT_',
        CLOUD: {
            STATS_FILE: 'stats.sav',
            CONFIG_FILE: 'config.sav'
        }
    } as const;

    // ==================== ANIMATION CONFIGURATION ====================
    static readonly ANIMATION = {
        DEFAULT_STEPS: 12,
        DEFAULT_STEP_DELAY: 8,
        DEFAULT_PAUSE_DELAY: 80
    } as const;

    // ==================== MOUSE CONFIGURATION ====================
    static readonly MOUSE = {
        DEFAULT_PIXEL_DISTANCE: 5,
        MIN_PIXEL_DISTANCE: 1,
        MAX_PIXEL_DISTANCE: 50,
        JIGGLE_OFFSET: 1,
        JIGGLE_DELAY: 10
    } as const;

    // ==================== KEYBOARD BUTTON CONFIGURATION ====================
    static readonly KEY_BUTTONS = {
        NONE: 'none',
        F13: 'f13',
        F14: 'f14',
        F15: 'f15',
        F16: 'f16',
        F17: 'f17',
        F18: 'f18',
        F19: 'f19',
        F20: 'f20'
    } as const;
    
    // ==================== TIMER CONFIGURATION ====================
    static readonly TIMER = {
        DEFAULT_INTERVAL: 60000, // 60 seconds in milliseconds
        MIN_INTERVAL: 5000,      // 5 seconds
        MAX_INTERVAL: 300000     // 5 minutes
    } as const;

    // ==================== LOGGING CONFIGURATION ====================
    static readonly LOGGING = {
        ENABLE_FLAG: '--enable-logs',
        LOG_LEVELS: {
            INFO: 'INFO',
            WARN: 'WARN',
            ERROR: 'ERROR',
            DEBUG: 'DEBUG'
        }
    } as const;

    // ==================== STORAGE CONFIGURATION ====================
    static readonly STORAGE = {
        KEYS: {
            INTERVAL: 'afk-companion-interval',
            PIXEL_DISTANCE: 'afk-companion-pixelDistance',
            KEY_BUTTON: 'afk-companion-keyButton',
            PERSISTENT_STATS: 'afk-persistent-stats',
            LAST_MODIFIED: 'afk-companion-lastModified'
        }
    } as const;

    // ==================== FILE PATHS ====================
    static readonly PATHS = {
        ASSETS_FOLDER: 'assets',
        ICONS: {
            WINDOWS: 'icon.ico',
            LINUX: 'icon.png',
            MACOS: 'icon.icns'
        }
    } as const;
}