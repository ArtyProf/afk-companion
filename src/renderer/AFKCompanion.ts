// Import required managers and providers directly to avoid circular dependency
import { ConfigurationManager } from './managers/ConfigurationManager';
import { StatisticsManager } from './managers/StatisticsManager';
import { TimerManager } from './managers/TimerManager';
import { UIManager } from './managers/UIManager';
import { MouseActionProvider } from './providers/MouseActionProvider';
import { FallbackActionProvider } from './providers/FallbackActionProvider';
import { ActionProvider, ActionResult } from './providers/ActionProvider';

/**
 * Main AFK Companion Controller - Orchestrates all components
 */
export class AFKCompanion {
    private isActive: boolean = false;
    private config: ConfigurationManager;
    private stats: StatisticsManager;
    private ui: UIManager;
    private actionProviders: ActionProvider[];
    private timer: TimerManager;

    constructor() {
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
    
    private init(): void {
        // Initialize UI elements first
        this.ui.initialize();
        
        // Bind UI events
        this.ui.bindEvents({
            onToggle: () => this.toggle(),
            onIntervalChange: (value: number) => this.onIntervalChange(value),
            onPixelDistanceChange: (value: number) => this.onPixelDistanceChange(value),
            onWindowFocus: () => this.onWindowFocus()
        });
        
        // Initialize UI state
        this.updateUI();
        
        console.log('AFK Companion initialized with modular architecture');
    }
    
    private onIntervalChange(interval: number): void {
        this.config.set('interval', interval);
        if (this.isActive) {
            this.restart();
        }
    }
    
    private onPixelDistanceChange(distance: number): void {
        this.config.set('pixelDistance', distance);
    }
    
    private onWindowFocus(): void {
        this.updateUI();
    }
    
    private onTimerTick(): void {
        this.updateUI();
    }
    
    private async performAction(): Promise<void> {
        const config = this.config.getAll();
        let actionResult: ActionResult | null = null;
        
        // Try each action provider until one succeeds
        for (const provider of this.actionProviders) {
            try {
                actionResult = await provider.execute(config);
                if (actionResult.success) {
                    break;
                }
            } catch (error: any) {
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
    
    start(): void {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.start();
        
        const interval = this.config.get('interval');
        console.log(`Starting AFK Companion with ${interval}s interval`);
        
        this.timer.start(interval);
        this.updateUI();
    }
    
    stop(): void {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.timer.stop();
        
        console.log('AFK Companion stopped');
        this.updateUI();
    }
    
    toggle(): void {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    private restart(): void {
        console.log('Restarting AFK Companion with new settings');
        this.stop();
        setTimeout(() => this.start(), 100);
    }
    
    private updateUI(): void {
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