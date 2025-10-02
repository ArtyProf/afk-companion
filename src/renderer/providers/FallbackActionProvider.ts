import { ActionProvider, ActionResult } from './ActionProvider';
import { ipcRenderer } from 'electron';

interface Config {
    pixelDistance: number;
}

/**
 * Fallback Action Provider - Handles fallback actions when primary fails
 */
export class FallbackActionProvider extends ActionProvider {
    async execute(config: Config): Promise<ActionResult> {
        try {
            // Try window jiggle first
            await ipcRenderer.invoke('jiggle-window');
            
            return {
                success: true,
                message: 'Fallback window jiggle completed',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Ultimate fallback: DOM event
            const event = new MouseEvent('mousemove', {
                clientX: Math.random() * config.pixelDistance,
                clientY: Math.random() * config.pixelDistance
            });
            document.dispatchEvent(event);
            
            return {
                success: true,
                message: 'DOM event fallback completed',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    getName(): string {
        return 'Fallback Action';
    }
}