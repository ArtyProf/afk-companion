const ActionProvider = require('./ActionProvider');
const { ipcRenderer } = require('electron');

/**
 * Mouse Action Provider - Handles mouse-based actions
 */
class MouseActionProvider extends ActionProvider {
    async execute(config) {
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
        } catch (error) {
            return {
                success: false,
                message: `Mouse action failed: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    getName() {
        return 'Mouse Movement';
    }
}

module.exports = MouseActionProvider;