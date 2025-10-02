/**
 * Configuration Manager - Handles settings and preferences
 */
class ConfigurationManager {
    constructor() {
        this.settings = {
            interval: 60, // seconds
            pixelDistance: 5, // pixels for mouse movement
        };
    }
    
    get(key) {
        return this.settings[key];
    }
    
    set(key, value) {
        this.settings[key] = value;
        console.log(`Configuration updated: ${key} = ${value}`);
    }
    
    getAll() {
        return { ...this.settings };
    }
}

module.exports = ConfigurationManager;