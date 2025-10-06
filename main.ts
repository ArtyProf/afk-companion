// AFK Companion - Main process with modular architecture (TypeScript)
// Import the main AppManager directly to avoid circular dependency
import { AppManager } from './src/main/AppManager';

// Initialize the application
new AppManager();