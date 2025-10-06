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
            'open-external',
            'achievement-track-action'
        ];
        
        handlers.forEach(handler => {
            ipcMain.removeHandler(handler);
        });
        
        logger.info('IPC handlers unregistered');
    }
}