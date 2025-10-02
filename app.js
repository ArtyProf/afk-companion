// AFK Companion - Anti-idle functionality with modular architecture
const { ipcRenderer } = require('electron');

// Import the main AFKCompanion class from centralized index
const { AFKCompanion } = require('./src/renderer');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('AFK Companion loaded with abstracted architecture');
    window.afkCompanion = new AFKCompanion();
    
    // Get platform info
    if (typeof require !== 'undefined') {
        try {
            ipcRenderer.invoke('get-platform').then(platform => {
                console.log(`Running on: ${platform}`);
            });
        } catch (error) {
            console.log('Running in web mode');
        }
    }
});

// Handle app visibility
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('App became visible');
    } else {
        console.log('App became hidden');
    }
});