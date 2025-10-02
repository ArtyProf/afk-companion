const { ipcMain } = require('electron');

/**
 * IPC Handler - Manages Inter-Process Communication between main and renderer
 */
class IPCHandler {
    constructor() {
        this.automationService = null;
        this.windowManager = null;
    }
    
    setAutomationService(automationService) {
        this.automationService = automationService;
    }
    
    setWindowManager(windowManager) {
        this.windowManager = windowManager;
    }
    
    registerHandlers() {
        // Platform information
        ipcMain.handle('get-platform', () => {
            return process.platform;
        });
        
        // Mouse movement simulation
        ipcMain.handle('simulate-mouse-movement', async (event, pixelDistance = 5) => {
            if (this.automationService) {
                return await this.automationService.simulateMouseMovement(pixelDistance);
            }
            return false;
        });
        
        // Window jiggle fallback
        ipcMain.handle('jiggle-window', () => {
            return this.jiggleWindow();
        });
        
        // Mouse position utilities
        ipcMain.handle('get-mouse-position', async () => {
            if (this.automationService) {
                return await this.automationService.getCurrentMousePosition();
            }
            return { x: 0, y: 0 };
        });
        
        // Set mouse position
        ipcMain.handle('set-mouse-position', async (event, x, y) => {
            if (this.automationService) {
                return await this.automationService.setMousePosition(x, y);
            }
            return false;
        });
        
        // Animation configuration
        ipcMain.handle('set-animation-config', (event, config) => {
            if (this.automationService) {
                this.automationService.setAnimationConfig(config);
                return true;
            }
            return false;
        });
        
        ipcMain.handle('get-animation-config', () => {
            if (this.automationService) {
                return this.automationService.getAnimationConfig();
            }
            return null;
        });
        
        console.log('IPC handlers registered successfully');
    }
    
    jiggleWindow() {
        try {
            if (this.windowManager) {
                const [x, y] = this.windowManager.getWindowPosition();
                this.windowManager.setWindowPosition(x + 1, y);
                setTimeout(() => {
                    this.windowManager.setWindowPosition(x, y);
                }, 10);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error jiggling window:', error);
            return false;
        }
    }
    
    unregisterHandlers() {
        // Remove all IPC handlers
        const handlers = [
            'get-platform',
            'simulate-mouse-movement',
            'jiggle-window',
            'get-mouse-position',
            'set-mouse-position',
            'set-animation-config',
            'get-animation-config'
        ];
        
        handlers.forEach(handler => {
            ipcMain.removeHandler(handler);
        });
        
        console.log('IPC handlers unregistered');
    }
}

module.exports = IPCHandler;