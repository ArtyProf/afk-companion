const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerSaveBlocker } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let powerSaveBlockerId = null;
let backgroundKeepAliveInterval = null;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
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

// Background process management
const startBackgroundKeepAlive = () => {
  console.log('Starting background keep-alive system');
  
  // Enable power save blocker to prevent system sleep
  if (powerSaveBlockerId === null) {
    try {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
      console.log('Power save blocker started:', powerSaveBlockerId);
    } catch (error) {
      console.log('Could not start power save blocker:', error);
    }
  }
  
  // Set up background keep-alive interval
  if (backgroundKeepAliveInterval === null) {
    backgroundKeepAliveInterval = setInterval(() => {
      // Keep the main process active by performing a lightweight operation
      const now = Date.now();
      console.log('Background keep-alive tick:', now);
      
      // Also notify renderer if window exists
      if (mainWindow && !mainWindow.isDestroyed()) {
        try {
          mainWindow.webContents.send('background-keepalive', now);
        } catch (error) {
          console.log('Could not send keep-alive to renderer:', error);
        }
      }
    }, 30000); // Every 30 seconds
  }
};

const stopBackgroundKeepAlive = () => {
  console.log('Stopping background keep-alive system');
  
  // Stop power save blocker
  if (powerSaveBlockerId !== null) {
    try {
      powerSaveBlocker.stop(powerSaveBlockerId);
      console.log('Power save blocker stopped');
    } catch (error) {
      console.log('Error stopping power save blocker:', error);
    }
    powerSaveBlockerId = null;
  }
  
  // Clear background interval
  if (backgroundKeepAliveInterval !== null) {
    clearInterval(backgroundKeepAliveInterval);
    backgroundKeepAliveInterval = null;
  }
};

// App event handlers
app.whenReady().then(() => {
  createWindow();
  startBackgroundKeepAlive(); // Start background management immediately
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackgroundKeepAlive();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('App is about to quit - cleaning up');
  stopBackgroundKeepAlive();
});

// Handle system events that might affect background processing
app.on('ready', () => {
  // Listen for system power events
  try {
    const { powerMonitor } = require('electron');
    
    powerMonitor.on('suspend', () => {
      console.log('System suspending - maintaining background process');
    });
    
    powerMonitor.on('resume', () => {
      console.log('System resumed - ensuring background process is active');
      // Restart background keep-alive if needed
      if (backgroundKeepAliveInterval === null) {
        startBackgroundKeepAlive();
      }
    });
    
    powerMonitor.on('lock-screen', () => {
      console.log('Screen locked - maintaining background operation');
    });
    
    powerMonitor.on('unlock-screen', () => {
      console.log('Screen unlocked - background operation continuing');
    });
    
  } catch (error) {
    console.log('PowerMonitor not available:', error.message);
  }
});

// Handle IPC messages from renderer
ipcMain.handle('get-platform', () => {
  return process.platform;
});

// Handle background keep-alive requests
ipcMain.handle('ensure-background-active', () => {
  console.log('Renderer requested background keep-alive check');
  if (backgroundKeepAliveInterval === null) {
    console.log('Background keep-alive was inactive - restarting');
    startBackgroundKeepAlive();
  }
  return {
    keepAliveActive: backgroundKeepAliveInterval !== null,
    powerBlockerActive: powerSaveBlockerId !== null
  };
});

// Handle renderer heartbeat
ipcMain.handle('renderer-heartbeat', () => {
  const timestamp = Date.now();
  console.log('Received renderer heartbeat:', timestamp);
  return timestamp;
});

// Handle smooth mouse movement simulation with configurable distance
ipcMain.handle('simulate-mouse-movement', async (event, pixelDistance = 5) => {
  try {
    const { screen } = require('electron');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Get current mouse position
    const cursor = screen.getCursorScreenPoint();
    
    // Calculate target position (circular movement for better coverage)
    const angle = Math.random() * Math.PI * 2;
    const targetX = cursor.x + Math.cos(angle) * pixelDistance;
    const targetY = cursor.y + Math.sin(angle) * pixelDistance;
    
    if (process.platform === 'win32') {
      // Windows: Use PowerShell function for smooth movement
      const startX = Math.round(cursor.x);
      const startY = Math.round(cursor.y);
      const endX = Math.round(targetX);
      const endY = Math.round(targetY);
      
      const powershellScript = `Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; function Move-MouseSmoothly { param([int]$StartX, [int]$StartY, [int]$TargetX, [int]$TargetY, [int]$Steps = 10) for ($i = 1; $i -le $Steps; $i++) { $X = $StartX + (($TargetX - $StartX) * $i / $Steps); $Y = $StartY + (($TargetY - $StartY) * $i / $Steps); [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point([math]::Round($X), [math]::Round($Y)); Start-Sleep -Milliseconds 10 } }; Move-MouseSmoothly -StartX ${startX} -StartY ${startY} -TargetX ${endX} -TargetY ${endY}; Start-Sleep -Milliseconds 50; Move-MouseSmoothly -StartX ${endX} -StartY ${endY} -TargetX ${startX} -TargetY ${startY}`;
      
      console.log('Executing PowerShell mouse movement...');
      const result = await execAsync(`powershell.exe -Command "${powershellScript}"`);
      console.log('PowerShell execution completed successfully');
      
    } else if (process.platform === 'linux') {
      // Linux: Use xdotool with smooth movement simulation
      const steps = 12;
      const stepDelay = 8;
      
      for (let i = 1; i <= steps; i++) {
        const currentX = Math.round(cursor.x + (targetX - cursor.x) * (i / steps));
        const currentY = Math.round(cursor.y + (targetY - cursor.y) * (i / steps));
        
        try {
          await execAsync(`xdotool mousemove ${currentX} ${currentY}`);
          if (i < steps) {
            await new Promise(resolve => setTimeout(resolve, stepDelay));
          }
        } catch (error) {
          console.log('Linux movement step error:', error.message);
        }
      }
      
      // Brief pause at target
      await new Promise(resolve => setTimeout(resolve, 80));
      
      // Move back smoothly
      for (let i = 1; i <= steps; i++) {
        const currentX = Math.round(targetX + (cursor.x - targetX) * (i / steps));
        const currentY = Math.round(targetY + (cursor.y - targetY) * (i / steps));
        
        try {
          await execAsync(`xdotool mousemove ${currentX} ${currentY}`);
          if (i < steps) {
            await new Promise(resolve => setTimeout(resolve, stepDelay));
          }
        } catch (error) {
          console.log('Linux return movement error:', error.message);
        }
      }
    }
    
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