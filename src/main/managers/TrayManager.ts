import { Tray, Menu, nativeImage, NativeImage } from 'electron';
import { WindowManager } from './WindowManager';
import { FilePathUtils } from '../utils/FilePathUtils';

/**
 * Tray Manager - Handles system tray functionality
 */
export class TrayManager {
    private tray: Tray | null = null;
    private windowManager: WindowManager | null = null;
    private onQuit?: () => void;

    setWindowManager(windowManager: WindowManager): void {
        this.windowManager = windowManager;
    }
    
    createTray(): Tray {
        const trayIcon = this.loadTrayIcon();
        this.tray = new Tray(trayIcon);
        
        const contextMenu = this.buildContextMenu();
        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip('AFK Companion - Anti-idle utility');
        
        this.bindTrayEvents();
        
        return this.tray;
    }
    
    private loadTrayIcon(): NativeImage {
        let trayIcon: NativeImage;
        
        try {
            const iconPath = FilePathUtils.getAssetPath('icon.ico');
            
            // First try to load the tray icon from assets
            trayIcon = nativeImage.createFromPath(iconPath);

            if (trayIcon.isEmpty()) {
                // If tray icon doesn't exist, try the main icon
                trayIcon = nativeImage.createFromPath(iconPath);
            }
        } catch (error) {
            console.log('Error loading tray icon from assets:', error);
            trayIcon = nativeImage.createEmpty();
        }
        
        // Ultimate fallback: create a template icon
        if (!trayIcon || trayIcon.isEmpty()) {
            trayIcon = nativeImage.createEmpty();
            console.log('Using empty tray icon, system will provide default');
        }
        
        return trayIcon;
    }

    private buildContextMenu(): Menu {
        return Menu.buildFromTemplate([
            {
                label: 'Show AFK Companion',
                click: () => {
                    if (this.windowManager) {
                        this.windowManager.showWindow();
                    }
                }
            },
            {
                label: 'Hide AFK Companion',
                click: () => {
                    if (this.windowManager) {
                        this.windowManager.hideWindow();
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: () => {
                    this.onQuit && this.onQuit();
                }
            }
        ]);
    }
    
    private bindTrayEvents(): void {
        if (!this.tray) return;

        this.tray.on('double-click', () => {
            if (this.windowManager) {
                if (this.windowManager.isWindowVisible()) {
                    this.windowManager.focusWindow();
                } else {
                    this.windowManager.showWindow();
                }
            }
        });
        
        this.tray.on('click', () => {
            if (process.platform !== 'darwin') { // Don't toggle on macOS (different behavior expected)
                if (this.windowManager) {
                    if (this.windowManager.isWindowVisible()) {
                        this.windowManager.hideWindow();
                    } else {
                        this.windowManager.showWindow();
                    }
                }
            }
        });
    }
    
    getTray(): Tray | null {
        return this.tray;
    }
    
    setOnQuit(callback: () => void): void {
        this.onQuit = callback;
    }
    
    destroy(): void {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
        }
    }
}