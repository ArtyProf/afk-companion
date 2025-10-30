import { ipcRenderer } from 'electron';
import { logger } from '../../utils/Logger';
import { ConfigurationSettings } from '@/config/RuntimeConfig';

export interface ActionResult {
    success: boolean;
    message: string;
    timestamp: string;
}

/**
 * Mouse Action Manager - Handles mouse movement via IPC
 * Simplified to focus only on the primary mouse movement action
 */
export class MouseActionManager {
    
    /**
     * Execute mouse movement action via IPC
     * @param config Configuration containing pixelDistance and keyButton
     * @returns Result of the mouse movement execution
     */
    async executeMouseAction(config: ConfigurationSettings): Promise<ActionResult> {
        try {
            logger.debug(`Executing mouse movement with ${config.pixelDistance}px distance and key button: ${config.keyButton}`);
            const result = await ipcRenderer.invoke('simulate-mouse-movement', config.pixelDistance, config.keyButton);
            
            if (!result) {
                throw new Error('Mouse simulation failed');
            }
            
            return {
                success: true,
                message: `Mouse movement completed (${config.pixelDistance}px)`,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            logger.debug(`Mouse movement failed: ${error.message}`);
            return {
                success: false,
                message: `Mouse movement failed: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
}