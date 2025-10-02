import { ActionProvider, ActionResult } from './ActionProvider';
import { ipcRenderer } from 'electron';

interface Config {
    pixelDistance: number;
}

/**
 * Mouse Action Provider - Handles mouse-based actions
 */
export class MouseActionProvider extends ActionProvider {
    async execute(config: Config): Promise<ActionResult> {
        try {
            console.log(`Executing mouse action with ${config.pixelDistance}px distance`);
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