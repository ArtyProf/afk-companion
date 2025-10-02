const ActionProvider = require('./ActionProvider');
const { ipcRenderer } = require('electron');

/**
 * Fallback Action Provider - Handles fallback actions when primary fails
 */
class FallbackActionProvider extends ActionProvider {
    async execute(config) {
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
    
    getName() {
        return 'Fallback Action';
    }
}

module.exports = FallbackActionProvider;