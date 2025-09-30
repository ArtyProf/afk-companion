// Renderer process script
const os = require('os');
const { shell } = require('electron');

// DOM elements
const platformElement = document.getElementById('platform');
const archElement = document.getElementById('arch');
const nodeVersionElement = document.getElementById('node-version');
const electronVersionElement = document.getElementById('electron-version');
const demoButton = document.getElementById('demo-button');
const platformButton = document.getElementById('platform-button');
const messageElement = document.getElementById('message');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadSystemInfo();
    setupEventListeners();
    applyPlatformStyles();
});

function loadSystemInfo() {
    // Display system information
    platformElement.textContent = getPlatformName();
    archElement.textContent = os.arch();
    nodeVersionElement.textContent = process.versions.node;
    electronVersionElement.textContent = process.versions.electron;
}

function getPlatformName() {
    const platform = os.platform();
    switch (platform) {
        case 'win32':
            return 'Windows';
        case 'linux':
            return 'Linux';
        case 'darwin':
            return 'macOS';
        default:
            return platform;
    }
}

function applyPlatformStyles() {
    const platform = os.platform();
    document.body.classList.add(`platform-${platform === 'win32' ? 'windows' : platform}`);
}

function setupEventListeners() {
    let clickCount = 0;
    
    demoButton.addEventListener('click', () => {
        clickCount++;
        showMessage(`🎉 Button clicked ${clickCount} time${clickCount > 1 ? 's' : ''}!`, 'success');
        
        // Add some fun effects
        demoButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            demoButton.style.transform = '';
        }, 150);
    });
    
    platformButton.addEventListener('click', () => {
        const platform = os.platform();
        const platformInfo = {
            platform: getPlatformName(),
            architecture: os.arch(),
            cpus: os.cpus().length,
            totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
            freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
            uptime: `${Math.round(os.uptime() / 3600)} hours`,
            homeDir: os.homedir(),
            tmpDir: os.tmpdir()
        };
        
        const infoText = Object.entries(platformInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
            
        showMessage(`💻 Detailed Platform Information:\n\n${infoText}`, 'info');
    });
}

function showMessage(text, type = 'info') {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.whiteSpace = 'pre-line';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

// Handle external links
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'r':
                event.preventDefault();
                location.reload();
                break;
            case 'i':
                if (event.shiftKey) {
                    event.preventDefault();
                    // This would open DevTools, but it's handled by the main process
                }
                break;
        }
    }
});

// Show welcome message
window.addEventListener('load', () => {
    setTimeout(() => {
        showMessage(`Welcome to Electron! Running on ${getPlatformName()} 🚀`, 'success');
    }, 1000);
});