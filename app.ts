// AFK Companion - Anti-idle functionality with modular architecture
const { ipcRenderer } = require('electron');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('AFK Companion loaded with abstracted architecture');
    
    try {
        // Import the main AFKCompanion class
        const { AFKCompanion } = require('./dist-ts/src/renderer/AFKCompanion.js');
        
        // Initialize the AFKCompanion
        (window as any).afkCompanion = new AFKCompanion();
        
        // Get platform info
        if (typeof require !== 'undefined') {
            try {
                ipcRenderer.invoke('get-platform').then((platform: string) => {
                    console.log(`Running on: ${platform}`);
                });
            } catch (error) {
                console.log('Running in web mode');
            }
        }
    } catch (error: any) {
        console.error('Error during initialization:', error);
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