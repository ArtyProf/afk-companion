// Centralized exports for all managers and providers

// Managers
const ConfigurationManager = require('./managers/ConfigurationManager');
const StatisticsManager = require('./managers/StatisticsManager');
const TimerManager = require('./managers/TimerManager');
const UIManager = require('./managers/UIManager');

// Providers
const ActionProvider = require('./providers/ActionProvider');
const MouseActionProvider = require('./providers/MouseActionProvider');
const FallbackActionProvider = require('./providers/FallbackActionProvider');

// Main Controller
const AFKCompanion = require('./AFKCompanion');

module.exports = {
    // Managers
    ConfigurationManager,
    StatisticsManager,
    TimerManager,
    UIManager,
    
    // Providers
    ActionProvider,
    MouseActionProvider,
    FallbackActionProvider,
    
    // Main Controller
    AFKCompanion
};