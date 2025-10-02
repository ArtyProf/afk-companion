// Import required managers and providers directly to avoid circular dependency
const ConfigurationManager = require('./managers/ConfigurationManager');
const StatisticsManager = require('./managers/StatisticsManager');
const TimerManager = require('./managers/TimerManager');
const UIManager = require('./managers/UIManager');
const MouseActionProvider = require('./providers/MouseActionProvider');
const FallbackActionProvider = require('./providers/FallbackActionProvider');

/**
 * Main AFK Companion Controller - Orchestrates all components
 */
class AFKCompanion {
    constructor() {
        this.isActive = false;
        
        // Initialize components
        this.config = new ConfigurationManager();
        this.stats = new StatisticsManager();
        this.ui = new UIManager();
        
        // Initialize action providers
        this.actionProviders = [
            new MouseActionProvider(),
            new FallbackActionProvider()
        ];
        
        // Initialize timer
        this.timer = new TimerManager(
            () => this.onTimerTick(),
            () => this.performAction()
        );
        
        this.init();
    }
    
    init() {
        // Initialize UI elements first
        this.ui.initialize();
        
        // Bind UI events
        this.ui.bindEvents({
            onToggle: () => this.toggle(),
            onIntervalChange: (value) => this.onIntervalChange(value),
            onPixelDistanceChange: (value) => this.onPixelDistanceChange(value),
            onWindowFocus: () => this.onWindowFocus()
        });
        
        // Initialize UI state
        this.updateUI();
        
        console.log('AFK Companion initialized with modular architecture');
    }
    
    onIntervalChange(interval) {
        this.config.set('interval', interval);
        if (this.isActive) {
            this.restart();
        }
    }
    
    onPixelDistanceChange(distance) {
        this.config.set('pixelDistance', distance);
    }
    
    onWindowFocus() {
        this.updateUI();
    }
    
    onTimerTick() {
        this.updateUI();
    }
    
    async performAction() {
        const config = this.config.getAll();
        let actionResult = null;
        
        // Try each action provider until one succeeds
        for (const provider of this.actionProviders) {
            try {
                actionResult = await provider.execute(config);
                if (actionResult.success) {
                    break;
                }
            } catch (error) {
                console.log(`${provider.getName()} failed: ${error.message}`);
                continue;
            }
        }
        
        // Record the action result
        if (actionResult) {
            this.stats.recordAction(actionResult);
        }
        
        this.updateUI();
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.start();
        
        const interval = this.config.get('interval');
        console.log(`Starting AFK Companion with ${interval}s interval`);
        
        this.timer.start(interval);
        this.updateUI();
    }
    
    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.timer.stop();
        
        console.log('AFK Companion stopped');
        this.updateUI();
    }
    
    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    restart() {
        console.log('Restarting AFK Companion with new settings');
        this.stop();
        setTimeout(() => this.start(), 100);
    }
    
    updateUI() {
        // Update status
        this.ui.updateStatus(this.isActive);
        
        // Update statistics
        const stats = this.stats.getStats();
        this.ui.updateStatistics(stats);
        
        // Update countdown
        const nextActionTime = this.timer.getNextActionTime();
        this.ui.updateCountdown(nextActionTime, this.isActive);
    }
}

module.exports = AFKCompanion;