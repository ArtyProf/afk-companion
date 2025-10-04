/**
 * Logger - Centralized logging system with enable/disable functionality
 * Usage: Pass --enable-logs argument to enable logging
 */
export class Logger {
    private static instance: Logger;
    private loggingEnabled: boolean = false;

    private constructor() {
        // Check for --enable-logs argument
        this.loggingEnabled = process.argv.includes('--enable-logs');
        
        if (this.loggingEnabled) {
            console.log('Logging enabled via --enable-logs flag');
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
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.loggingEnabled) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    public error(message: string, ...args: any[]): void {
        // Always show errors regardless of logging flag
        console.error(`[ERROR] ${message}`, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        if (this.loggingEnabled) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}

// Export singleton instance for easy use
export const logger = Logger.getInstance();