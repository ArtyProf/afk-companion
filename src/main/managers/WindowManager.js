const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Window Manager - Handles main window creation and lifecycle
 */
class WindowManager {
    constructor() {
        this.mainWindow = null;
        this.windowConfig = {
            width: 400,
            height: 500,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false
            },
            icon: path.join(__dirname, '..', '..', '..', 'assets', 'icon.png'),
            show: false,
            titleBarStyle: 'default'
        };
    }
    
    createWindow() {
        // Create the browser window
        this.mainWindow = new BrowserWindow(this.windowConfig);
        
        // Load the index.html
        this.mainWindow.loadFile('index.html');
        
        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });
        
        this.bindWindowEvents();
        
        return this.mainWindow;
    }
    
    bindWindowEvents() {
        // Handle window minimize to tray
        this.mainWindow.on('minimize', (event) => {
            event.preventDefault();
            this.mainWindow.hide();
            this.onMinimize && this.onMinimize();
        });
        
        // Handle window close
        this.mainWindow.on('close', (event) => {
            if (!this.isQuiting) {
                event.preventDefault();
                this.mainWindow.hide();
                this.onClose && this.onClose();
            }
        });
        
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    
    getWindow() {
        return this.mainWindow;
    }
    
    showWindow() {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }
    
    hideWindow() {
        if (this.mainWindow) {
            this.mainWindow.hide();
        }
    }
    
    isWindowVisible() {
        return this.mainWindow && this.mainWindow.isVisible();
    }
    
    focusWindow() {
        if (this.mainWindow) {
            this.mainWindow.focus();
        }
    }
    
    getWindowPosition() {
        return this.mainWindow ? this.mainWindow.getPosition() : [0, 0];
    }
    
    setWindowPosition(x, y) {
        if (this.mainWindow) {
            this.mainWindow.setPosition(x, y);
        }
    }
    
    setQuiting(isQuiting) {
        this.isQuiting = isQuiting;
    }
    
    // Event callback setters
    setOnMinimize(callback) {
        this.onMinimize = callback;
    }
    
    setOnClose(callback) {
        this.onClose = callback;
    }
}

module.exports = WindowManager;