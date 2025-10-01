const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

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



// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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

// Handle mouse movement simulation
ipcMain.handle('simulate-mouse-movement', () => {
  try {
    // Get current mouse position and move it by 1 pixel
    const { screen } = require('electron');
    const cursor = screen.getCursorScreenPoint();
    
    // Move cursor by 1 pixel and then back (invisible to user)
    const newX = cursor.x + 1;
    const newY = cursor.y;
    
    // Use child_process to execute system commands for mouse movement
    const { exec } = require('child_process');
    
    if (process.platform === 'win32') {
      // Windows: Use PowerShell to move mouse
      exec(`powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${newX}, ${newY})"`, (error) => {
        if (!error) {
          // Move back to original position after 10ms
          setTimeout(() => {
            exec(`powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${cursor.x}, ${cursor.y})"`);
          }, 10);
        }
      });
    } else if (process.platform === 'linux') {
      // Linux: Use xdotool
      exec(`xdotool mousemove ${newX} ${newY}`, (error) => {
        if (!error) {
          setTimeout(() => {
            exec(`xdotool mousemove ${cursor.x} ${cursor.y}`);
          }, 10);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error simulating mouse movement:', error);
    return false;
  }
});

// Handle key press simulation
ipcMain.handle('simulate-key-press', () => {
  try {
    const { exec } = require('child_process');
    
    if (process.platform === 'win32') {
      // Windows: Send F15 key (rarely used, safe for games)
      exec('powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'{F15}\')"');
    } else if (process.platform === 'linux') {
      // Linux: Use xdotool to send F15
      exec('xdotool key F15');
    }
    
    return true;
  } catch (error) {
    console.error('Error simulating key press:', error);
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