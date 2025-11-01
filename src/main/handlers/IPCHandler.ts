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
        ipcMain.handle('simulate-mouse-movement', async (event: IpcMainInvokeEvent, pixelDistance: number = 5, keyButton: string = 'none') => {
            if (this.automationService) {
                return await this.automationService.simulateMouseMovement(pixelDistance, keyButton);
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

        // Steam Cloud - Check if enabled
        ipcMain.handle('steam-cloud-enabled', () => {
            if (!this.steamManager) return false;
            return this.steamManager.isCloudEnabledForAccount() && this.steamManager.isCloudEnabledForApp();
        });

        // Steam Cloud - Save stats
        ipcMain.handle('steam-cloud-save-stats', async (event: IpcMainInvokeEvent, stats: any) => {
            if (!this.steamManager) return false;
            return await this.steamManager.savePersistentStats(stats);
        });

        // Steam Cloud - Load stats
        ipcMain.handle('steam-cloud-load-stats', async () => {
            if (!this.steamManager) return null;
            return await this.steamManager.loadPersistentStats();
        });

        // Steam Cloud - Save config
        ipcMain.handle('steam-cloud-save-config', async (event: IpcMainInvokeEvent, config: any) => {
            if (!this.steamManager) return false;
            return await this.steamManager.saveConfiguration(config);
        });

        // Steam Cloud - Load config
        ipcMain.handle('steam-cloud-load-config', async () => {
            if (!this.steamManager) return null;
            return await this.steamManager.loadConfiguration();
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
            'achievement-track-action',
            'steam-cloud-enabled',
            'steam-cloud-save-stats',
            'steam-cloud-load-stats',
            'steam-cloud-save-config',
            'steam-cloud-load-config'
        ];
        
        handlers.forEach(handler => {
            ipcMain.removeHandler(handler);
        });
        
        logger.info('IPC handlers unregistered');
    }
}