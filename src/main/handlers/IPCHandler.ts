import { ipcMain, shell, IpcMainInvokeEvent } from 'electron';
import { AutomationService } from '../services/AutomationService';
import { WindowManager } from '../managers/WindowManager';
import { SteamManager } from '../managers/SteamManager';
import { logger } from '../../utils/Logger';
import { AppConfig } from '../../config';

/**
 * IPC Handler - Manages Inter-Process Communication between main and renderer
 */
export class IPCHandler {
    private automationService: AutomationService | null = null;
    private windowManager: WindowManager | null = null;
    private steamManager: SteamManager | null = null;

    setAutomationService(automationService: AutomationService): void {
        this.automationService = automationService;
    }
    
    setWindowManager(windowManager: WindowManager): void {
        this.windowManager = windowManager;
    }

    setSteamManager(steamManager: SteamManager): void {
        this.steamManager = steamManager;
    }
    
    registerHandlers(): void {
        // Platform information
        ipcMain.handle('get-platform', () => {
            return process.platform;
        });
        
        // Mouse movement simulation
        ipcMain.handle('simulate-mouse-movement', async (event: IpcMainInvokeEvent, pixelDistance: number = 5) => {
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
        ipcMain.handle('set-mouse-position', async (event: IpcMainInvokeEvent, x: number, y: number) => {
            if (this.automationService) {
                return await this.automationService.setMousePosition(x, y);
            }
            return false;
        });
        
        // Animation configuration
        ipcMain.handle('set-animation-config', (event: IpcMainInvokeEvent, config: any) => {
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
        
        // Open external links in default browser
        ipcMain.handle('open-external', (event: IpcMainInvokeEvent, url: string) => {
            try {
                shell.openExternal(url);
                return true;
            } catch (error) {
                logger.error('Error opening external link:', error);
                return false;
            }
        });

        // Steam Integration
        ipcMain.handle('steam-is-available', () => {
            return this.steamManager?.isSteamAvailable() || false;
        });

        ipcMain.handle('steam-get-username', () => {
            return this.steamManager?.getSteamUserName() || 'Unknown';
        });

        // Simple achievement checking
        ipcMain.handle('achievement-track-action', (event: IpcMainInvokeEvent, totalActions: number) => {
            this.steamManager?.checkAchievements(totalActions);
        });
        
        logger.info('IPC handlers registered successfully');
    }
    
    private jiggleWindow(): boolean {
        try {
            if (this.windowManager) {
                const [x, y] = this.windowManager.getWindowPosition();
                this.windowManager.setWindowPosition(x + AppConfig.MOUSE.JIGGLE_OFFSET, y);
                setTimeout(() => {
                    if (this.windowManager) {
                        this.windowManager.setWindowPosition(x, y);
                    }
                }, AppConfig.MOUSE.JIGGLE_DELAY);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Error jiggling window:', error);
            return false;
        }
    }
    
    unregisterHandlers(): void {
        // Remove all IPC handlers
        const handlers = [
            'get-platform',
            'simulate-mouse-movement',
            'jiggle-window',
            'get-mouse-position',
            'set-mouse-position',
            'set-animation-config',
            'get-animation-config',
            'open-external',
            'steam-is-available',
            'steam-get-username',
            'achievement-track-action'
        ];
        
        handlers.forEach(handler => {
            ipcMain.removeHandler(handler);
        });
        
        logger.info('IPC handlers unregistered');
    }
}