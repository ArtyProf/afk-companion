// Centralized exports for main process modules

// Managers
const WindowManager = require('./managers/WindowManager');
const TrayManager = require('./managers/TrayManager');

// Services
const AutomationService = require('./services/AutomationService');

// Handlers
const IPCHandler = require('./handlers/IPCHandler');

// Main Controller
const AppManager = require('./AppManager');

module.exports = {
    // Managers
    WindowManager,
    TrayManager,
    
    // Services
    AutomationService,
    
    // Handlers
    IPCHandler,
    
    // Main Controller
    AppManager
};