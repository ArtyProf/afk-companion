import { app } from 'electron';
import { join } from 'path';

/**
 * File Path Utilities - Centralized asset file path resolution
 */
export class FilePathUtils {
    
    /**
     * Get the path to any file in the assets folder
     * @param fileName - The name of the file (e.g., 'icon.png', 'tray-icon.png')
     * @returns Absolute path to the specified file
     */
    static getAssetPath(fileName: string): string {
        const appPath = app.getAppPath();
        return join(appPath, 'assets', fileName);
    }
}