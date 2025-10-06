import { AppConfig } from '../config';

/**
 * Logger - Centralized logging system with enable/disable functionality
 * Usage: Pass --enable-logs argument to enable logging
 */
export class Logger {
    private static instance: Logger;
    private loggingEnabled: boolean = false;

    private constructor() {
        // Check for --enable-logs argument using configuration
        this.loggingEnabled = process.argv.includes(AppConfig.LOGGING.ENABLE_FLAG);
        
        if (this.loggingEnabled) {
            console.log(`Logging enabled via ${AppConfig.LOGGING.ENABLE_FLAG} flag`);
        }
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public info(message: string, ...args: any[]): void {
        if (this.loggingEnabled) {
            console.info(`[${AppConfig.LOGGING.LOG_LEVELS.INFO}] ${message}`, ...args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.loggingEnabled) {
            console.warn(`[${AppConfig.LOGGING.LOG_LEVELS.WARN}] ${message}`, ...args);
        }
    }

    public error(message: string, ...args: any[]): void {
        // Always show errors regardless of logging flag
        console.error(`[${AppConfig.LOGGING.LOG_LEVELS.ERROR}] ${message}`, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        if (this.loggingEnabled) {
            console.debug(`[${AppConfig.LOGGING.LOG_LEVELS.DEBUG}] ${message}`, ...args);
        }
    }
}

// Export singleton instance for easy use
export const logger = Logger.getInstance();