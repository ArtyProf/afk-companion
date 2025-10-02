const { app, BrowserWindow } = require('electron');

// Import managers and services
const WindowManager = require('./managers/WindowManager');
const TrayManager = require('./managers/TrayManager');
const AutomationService = require('./services/AutomationService');
const IPCHandler = require('./handlers/IPCHandler');

/**
 * App Manager - Main orchestrator for the Electron application
 */
class AppManager {
    constructor() {
        this.windowManager = new WindowManager();
        this.trayManager = new TrayManager();
        this.automationService = new AutomationService();
        this.ipcHandler = new IPCHandler();
        
        this.setupDependencies();
        this.bindAppEvents();
    }
    
    setupDependencies() {
        // Set up cross-dependencies between managers
        this.trayManager.setWindowManager(this.windowManager);
        this.ipcHandler.setAutomationService(this.automationService);
        this.ipcHandler.setWindowManager(this.windowManager);
        
        // Set up event callbacks
        this.windowManager.setOnMinimize(() => this.handleWindowMinimize());
        this.windowManager.setOnClose(() => this.handleWindowClose());
        this.trayManager.setOnQuit(() => this.handleAppQuit());
    }
    
    bindAppEvents() {
        app.whenReady().then(() => this.onAppReady());
        
        app.on('window-all-closed', () => this.onWindowAllClosed());
        
        app.on('activate', () => this.onActivate());
        
        // Security: Prevent new window creation
        app.on('web-contents-created', (event, contents) => {
            contents.on('new-window', (navigationEvent) => {
                navigationEvent.preventDefault();
            });
        });
    }
    
    async onAppReady() {
        try {
            // Initialize IPC handlers
            this.ipcHandler.registerHandlers();
            
            // Create main window
            this.windowManager.createWindow();
            
            console.log('AFK Companion initialized with modular main process architecture');
            
        } catch (error) {
            console.error('Error during app initialization:', error);
        }
    }
    
    onWindowAllClosed() {
        // Don't quit the app when window is closed - keep running in tray
        // Only quit when explicitly requested through tray menu or app.isQuiting flag
        console.log('All windows closed - keeping app running in tray');
    }
    
    onActivate() {
        if (BrowserWindow.getAllWindows().length === 0) {
            this.windowManager.createWindow();
        }
    }
    
    handleWindowMinimize() {
        if (!this.trayManager.getTray()) {
            this.trayManager.createTray();
        }
    }
    
    handleWindowClose() {
        if (!this.trayManager.getTray()) {
            this.trayManager.createTray();
        }
    }
    
    handleAppQuit() {
        app.isQuiting = true;
        this.windowManager.setQuiting(true);
        this.cleanup();
        app.quit();
    }
    
    cleanup() {
        // Clean up resources
        this.ipcHandler.unregisterHandlers();
        this.trayManager.destroy();
        console.log('App cleanup completed');
    }
    
    // Getters for external access
    getWindowManager() {
        return this.windowManager;
    }
    
    getTrayManager() {
        return this.trayManager;
    }
    
    getAutomationService() {
        return this.automationService;
    }
    
    getIPCHandler() {
        return this.ipcHandler;
    }
}

module.exports = AppManager;