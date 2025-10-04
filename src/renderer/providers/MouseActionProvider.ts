import { ActionProvider, ActionResult } from './ActionProvider';
import { ipcRenderer } from 'electron';
import { logger } from '../../utils/Logger';

interface Config {
    pixelDistance: number;
}

/**
 * Mouse Action Provider - Handles mouse-based actions
 */
export class MouseActionProvider extends ActionProvider {
    async execute(config: Config): Promise<ActionResult> {
        try {
            logger.debug(`Executing mouse action with ${config.pixelDistance}px distance`);
            const result = await ipcRenderer.invoke('simulate-mouse-movement', config.pixelDistance);
            
            if (!result) {
                throw new Error('Mouse simulation failed');
            }
            
            return {
                success: true,
                message: `Mouse movement completed (${config.pixelDistance}px)`,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Mouse action failed: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    getName(): string {
        return 'Mouse Movement';
    }
}