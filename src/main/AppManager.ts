import { app, BrowserWindow } from 'electron';

// Import managers and services
import { WindowManager } from './managers/WindowManager';
import { TrayManager } from './managers/TrayManager';
import { AutomationService } from './services/AutomationService';
import { IPCHandler } from './handlers/IPCHandler';

/**
 * App Manager - Main orchestrator for the Electron application
 */
export class AppManager {
    private windowManager: WindowManager;
    private trayManager: TrayManager;
    private automationService: AutomationService;
    private ipcHandler: IPCHandler;

    constructor() {
        this.windowManager = new WindowManager();
        this.trayManager = new TrayManager();
        this.automationService = new AutomationService();
        this.ipcHandler = new IPCHandler();
        
        this.setupDependencies();
        this.bindAppEvents();
    }
    
    private setupDependencies(): void {
        // Set up cross-dependencies between managers
        this.trayManager.setWindowManager(this.windowManager);
        this.ipcHandler.setAutomationService(this.automationService);
        this.ipcHandler.setWindowManager(this.windowManager);
        
        // Set up event callbacks
        this.windowManager.setOnMinimize(() => this.handleWindowMinimize());
        this.windowManager.setOnClose(() => this.handleWindowClose());
        this.trayManager.setOnQuit(() => this.handleAppQuit());
    }
    
    private bindAppEvents(): void {
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
    
    private async onAppReady(): Promise<void> {
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
    
    private onWindowAllClosed(): void {
        // Don't quit the app when window is closed - keep running in tray
        // Only quit when explicitly requested through tray menu or app.isQuiting flag
        console.log('All windows closed - keeping app running in tray');
    }
    
    private onActivate(): void {
        if (BrowserWindow.getAllWindows().length === 0) {
            this.windowManager.createWindow();
        }
    }
    
    private handleWindowMinimize(): void {
        if (!this.trayManager.getTray()) {
            this.trayManager.createTray();
        }
    }
    
    private handleWindowClose(): void {
        if (!this.trayManager.getTray()) {
            this.trayManager.createTray();
        }
    }
    
    private handleAppQuit(): void {
        (app as any).isQuiting = true;
        this.windowManager.setQuiting(true);
        this.cleanup();
        app.quit();
    }
    
    private cleanup(): void {
        // Clean up resources
        this.ipcHandler.unregisterHandlers();
        this.trayManager.destroy();
        console.log('App cleanup completed');
    }
    
    // Getters for external access
    getWindowManager(): WindowManager {
        return this.windowManager;
    }
    
    getTrayManager(): TrayManager {
        return this.trayManager;
    }
    
    getAutomationService(): AutomationService {
        return this.automationService;
    }
    
    getIPCHandler(): IPCHandler {
        return this.ipcHandler;
    }
}