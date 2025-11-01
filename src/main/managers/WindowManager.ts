import { BrowserWindow, BrowserWindowConstructorOptions, Event } from 'electron';
import { IconResolver } from '../../utils/IconResolver';
import * as path from 'path';

/**
 * Window Manager - Handles main window creation and lifecycle
 */
export class WindowManager {
    private mainWindow: BrowserWindow | null = null;
    private windowConfig: BrowserWindowConstructorOptions;
    private isQuiting: boolean = false;
    private onMinimize?: () => void;
    private onClose?: () => void;

    constructor() {
        const iconPath = IconResolver.getIconPath();
        this.windowConfig = {
            width: 400,
            height: 500,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false
            },
            icon: iconPath,
            show: false,
            titleBarStyle: 'default',
            autoHideMenuBar: true
        };
    }
    
    createWindow(): BrowserWindow {
        // Create the browser window
        this.mainWindow = new BrowserWindow(this.windowConfig);
        
        // Load the webpack-built index.html from dist-ts/renderer directory
        // In dev: dist-ts/renderer is at project root. In production: relative to app.asar
        const isDev = process.env.NODE_ENV !== 'production';
        const htmlPath = isDev 
            ? path.join(process.cwd(), 'dist-ts/index.html')
            : path.join(__dirname, '../index.html');
        
        this.mainWindow.loadFile(htmlPath);
        
        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        
        this.bindWindowEvents();
        
        return this.mainWindow;
    }
    
    private bindWindowEvents(): void {
        if (!this.mainWindow) return;

        // Handle window minimize to tray
        this.mainWindow.on('minimize', () => {
            this.mainWindow?.hide();
            this.onMinimize?.();
        });
        
        // Handle window close
        this.mainWindow.on('close', (event: Event) => {
            if (!this.isQuiting) {
                event.preventDefault();
                this.mainWindow?.hide();
                this.onClose?.();
            }
        });
        
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    
    getWindow(): BrowserWindow | null {
        return this.mainWindow;
    }
    
    showWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }
    
    hideWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.hide();
        }
    }
    
    isWindowVisible(): boolean {
        return this.mainWindow ? this.mainWindow.isVisible() : false;
    }
    
    focusWindow(): void {
        if (this.mainWindow) {
            this.mainWindow.focus();
        }
    }
    
    getWindowPosition(): [number, number] {
        if (this.mainWindow) {
            const position = this.mainWindow.getPosition();
            return [position[0], position[1]];
        }
        return [0, 0];
    }
    
    setWindowPosition(x: number, y: number): void {
        if (this.mainWindow) {
            this.mainWindow.setPosition(x, y);
        }
    }
    
    setQuiting(isQuiting: boolean): void {
        this.isQuiting = isQuiting;
    }
    
    // Event callback setters
    setOnMinimize(callback: () => void): void {
        this.onMinimize = callback;
    }
    
    setOnClose(callback: () => void): void {
        this.onClose = callback;
    }
}