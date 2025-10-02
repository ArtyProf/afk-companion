// Centralized exports for all AFK Companion modules
// This file provides a unified interface for both renderer and main process modules

// Renderer Process Modules (Frontend)
const RendererModules = require('./renderer');

// Main Process Modules (Backend)
const MainModules = require('./main');

module.exports = {
    // Export renderer modules with namespace
    renderer: RendererModules,
    
    // Export main modules with namespace
    main: MainModules,
    
    // Direct exports for convenience (renderer modules)
    ...RendererModules,
    
    // Prefixed main process exports to avoid conflicts
    MainAppManager: MainModules.AppManager,
    MainWindowManager: MainModules.WindowManager,
    MainTrayManager: MainModules.TrayManager,
    MainAutomationService: MainModules.AutomationService,
    MainIPCHandler: MainModules.IPCHandler
};