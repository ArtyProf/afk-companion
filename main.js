const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { mouse, keyboard, Key } = require('@nut-tree-fork/nut-js');

let mainWindow;
let tray;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the index.html
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window minimize to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
    if (!tray) {
      createTray();
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      if (!tray) {
        createTray();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createTray = () => {
  // Use the actual tray icon file from assets
  let trayIcon;
  
  try {
    // First try to load the tray icon from assets
    const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    trayIcon = nativeImage.createFromPath(trayIconPath);
    
    if (trayIcon.isEmpty()) {
      // If tray icon doesn't exist, try the main icon
      const mainIconPath = path.join(__dirname, 'assets', 'icon.png');
      trayIcon = nativeImage.createFromPath(mainIconPath);
      
      // Resize it to appropriate tray size if it's too large
      if (!trayIcon.isEmpty()) {
        trayIcon = trayIcon.resize({ width: 16, height: 16 });
      }
    }
  } catch (error) {
    console.log('Error loading tray icon from assets:', error);
  }
  
  // Ultimate fallback: create a template icon
  if (!trayIcon || trayIcon.isEmpty()) {
    trayIcon = nativeImage.createEmpty();
    console.log('Using empty tray icon, system will provide default');
  }
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show AFK Companion',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Hide AFK Companion',
      click: () => {
        mainWindow.hide();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('AFK Companion - Anti-idle utility');
  
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  
  tray.on('click', () => {
    if (process.platform !== 'darwin') { // Don't toggle on macOS (different behavior expected)
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
};



// App event handlers
app.whenReady().then(async () => {
  // Initialize xdotool finder on Linux at startup for better performance
  if (process.platform === 'linux') {
    try {
      await xdotoolFinder.findXdotool();
      console.log('xdotool path detected:', xdotoolFinder.getXdotoolPath());
    } catch (error) {
      console.error('Failed to detect xdotool at startup:', error.message);
    }
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  // Don't quit the app when window is closed - keep running in tray
  // Only quit when explicitly requested through tray menu or app.isQuiting flag
  console.log('All windows closed - keeping app running in tray');
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



// Handle IPC messages from renderer
ipcMain.handle('get-platform', () => {
  return process.platform;
});



// Handle smooth mouse movement simulation with configurable distance and ScrollLock toggle
// 🎯 Universal cross-platform solution using nut-js (works on Windows, Linux, Steam)
ipcMain.handle('simulate-mouse-movement', async (event, pixelDistance = 5) => {
  try {
    
    // Get current mouse position using nut-js
    const currentPos = await mouse.getPosition();
    
    // Calculate target position (circular movement for better coverage)
    const angle = Math.random() * Math.PI * 2;
    const targetX = Math.round(currentPos.x + Math.cos(angle) * pixelDistance);
    const targetY = Math.round(currentPos.y + Math.sin(angle) * pixelDistance);
    
    console.log(`Moving mouse from (${currentPos.x}, ${currentPos.y}) to (${targetX}, ${targetY})`);
    
    // Toggle ScrollLock twice (on then off) to prevent system sleep
    try {
      await keyboard.pressKey(Key.ScrollLock);
      await keyboard.releaseKey(Key.ScrollLock);
      await new Promise(resolve => setTimeout(resolve, 10));
      await keyboard.pressKey(Key.ScrollLock);
      await keyboard.releaseKey(Key.ScrollLock);
      console.log('ScrollLock toggle completed');
    } catch (error) {
      console.log('ScrollLock toggle error:', error.message);
    }
    
    // Smooth mouse movement in steps
    const steps = 12;
    const stepDelay = 8;
    
    for (let i = 1; i <= steps; i++) {
      const currentX = Math.round(currentPos.x + (targetX - currentPos.x) * (i / steps));
      const currentY = Math.round(currentPos.y + (targetY - currentPos.y) * (i / steps));
      
      try {
        await mouse.setPosition({ x: currentX, y: currentY });
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
      } catch (error) {
        console.log('Movement step error:', error.message);
      }
    }
    
    // Brief pause at target
    await new Promise(resolve => setTimeout(resolve, 80));
    
    // Move back smoothly to original position
    for (let i = 1; i <= steps; i++) {
      const returnX = Math.round(targetX + (currentPos.x - targetX) * (i / steps));
      const returnY = Math.round(targetY + (currentPos.y - targetY) * (i / steps));
      
      try {
        await mouse.setPosition({ x: returnX, y: returnY });
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
      } catch (error) {
        console.log('Return movement error:', error.message);
      }
    }
    
    console.log('Universal mouse simulation completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error simulating smooth mouse movement:', error);
    return false;
  }
});

// Handle window jiggle (fallback method)
ipcMain.handle('jiggle-window', () => {
  try {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      mainWindow.setPosition(x + 1, y);
      setTimeout(() => {
        mainWindow.setPosition(x, y);
      }, 10);
    }
    return true;
  } catch (error) {
    console.error('Error jiggling window:', error);
    return false;
  }
});

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent) => {
    navigationEvent.preventDefault();
  });
});