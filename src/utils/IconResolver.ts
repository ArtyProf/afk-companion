import * as fs from 'fs';
import { AppConfig } from '../config';
import { FilePathUtils } from './FilePathUtils';

/**
 * Icon Resolver - Determines the correct icon path based on platform
 * Uses FilePathUtils for consistent path resolution
 */
export class IconResolver {
    
    /**
     * Get the appropriate icon path for the current platform
     */
    static getIconPath(): string {
        // Try platform-specific icon first
        const platformIcon = this.getPlatformSpecificIcon();
        if (platformIcon && fs.existsSync(platformIcon)) {
            return platformIcon;
        }
        
        // Fallback to Windows icon (most common)
        return FilePathUtils.getAssetPath(AppConfig.PATHS.ICONS.WINDOWS);
    }
    
    private static getPlatformSpecificIcon(): string | null {
        switch (process.platform) {
            case 'win32':
                return FilePathUtils.getAssetPath(AppConfig.PATHS.ICONS.WINDOWS);
            case 'linux':
                return FilePathUtils.getAssetPath(AppConfig.PATHS.ICONS.LINUX);
            case 'darwin':
                return FilePathUtils.getAssetPath(AppConfig.PATHS.ICONS.MACOS);
            default:
                return null;
        }
    }
}