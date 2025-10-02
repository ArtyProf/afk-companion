// AFK Companion - Main process with modular architecture
// Import the main AppManager directly to avoid circular dependency
const AppManager = require('./src/main/AppManager');

// Initialize the application
const appManager = new AppManager();

// Export for external access if needed
module.exports = appManager;