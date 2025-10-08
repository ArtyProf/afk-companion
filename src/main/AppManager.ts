import { app, BrowserWindow } from 'electron';
import { WindowManager } from './managers/WindowManager';
import { TrayManager } from './managers/TrayManager';
import { SteamManager } from './managers/SteamManager';
import { AutomationService } from './services/AutomationService';
import { IPCHandler } from './handlers/IPCHandler';
import { logger } from '../utils/Logger';

/**
 * App Manager - Main orchestrator for the Electron application
 */
export class AppManager {
    private windowManager: WindowManager;
    private trayManager: TrayManager;
    private steamManager: SteamManager;
    private automationService: AutomationService;
    private ipcHandler: IPCHandler;
    private isQuitting: boolean = false;

    constructor() {
        this.windowManager = new WindowManager();
        this.trayManager = new TrayManager();
        this.steamManager = new SteamManager();
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
        this.ipcHandler.setSteamManager(this.steamManager);
        
        // Set up event callbacks
        this.windowManager.setOnMinimize(() => this.handleWindowMinimize());
        this.windowManager.setOnClose(() => this.handleWindowClose());
        this.trayManager.setOnQuit(() => this.handleAppQuit());
    }
    
    private bindAppEvents(): void {
        app.whenReady().then(() => this.onAppReady());
        
        app.on('window-all-closed', () => this.onWindowAllClosed());
        
        app.on('activate', () => this.onActivate());
        
        // Handle Command+Q and Dock quit on macOS
        app.on('before-quit', () => {
            if (process.platform === 'darwin' && !this.isQuitting) {
                this.isQuitting = true;
                this.windowManager.setQuiting(true);
                this.cleanup();
            }
        });

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
            
            // Skip tray on macOS
            if (process.platform === 'darwin') {
                this.trayManager.createTray();
            }
            
            // Create main window
            this.windowManager.createWindow();
            
            logger.info('AFK Companion initialized with modular main process architecture');
            
        } catch (error) {
            logger.error('Error during app initialization:', error);
        }
    }
    
    private onWindowAllClosed(): void {
        // Keep app running in tray on all platforms
        // macOS quit is handled via before-quit event
        logger.debug('All windows closed - keeping app running in tray');
    }
    
    private onActivate(): void {
        // macOS dock icon click - show window if hidden or create if closed
        if (this.windowManager.getWindow()) {
            this.windowManager.showWindow();
        } else if (BrowserWindow.getAllWindows().length === 0) {
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
        if (this.isQuitting) {
            return; // Prevent recursive calls
        }
        
        this.isQuitting = true;
        this.windowManager.setQuiting(true);
        this.cleanup();
        app.quit();
    }
    
    private cleanup(): void {
        // Clean up resources
        this.ipcHandler.unregisterHandlers();
        this.trayManager.destroy();
        logger.info('App cleanup completed');
    }
}