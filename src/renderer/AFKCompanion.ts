import { ipcRenderer } from 'electron';
import { RuntimeConfig } from '../config';
import { StatisticsManager } from './managers/StatisticsManager';
import { TimerManager } from './managers/TimerManager';
import { MouseActionManager } from './managers/MouseActionManager';
import { ConfigPersistence } from './managers/ConfigPersistence';

export interface AFKState {
    isActive: boolean;
    actionCount: number;
    runningTime: string;
    nextAction: string;
    interval: number;
    pixelDistance: number;
    keyButton: string;
    advancedStats: {
        totalSessions: number;
        totalTime: string;
        totalActions: number;
        avgSessionDuration: string;
    };
}

/**
 * Main AFK Companion Controller - Orchestrates all components
 * Refactored to work with React - exposes state through callbacks
 */
export class AFKCompanion {
    private isActive: boolean = false;
    private config: RuntimeConfig;
    private configPersistence: ConfigPersistence;
    private stats: StatisticsManager;
    private mouseActionManager: MouseActionManager;
    private timer: TimerManager;
    private stateUpdateCallback?: (state: AFKState) => void;
    
    constructor() {
        // Initialize components
        this.config = RuntimeConfig.getInstance();
        this.configPersistence = new ConfigPersistence();
        this.stats = new StatisticsManager();
        this.mouseActionManager = new MouseActionManager();
        
        // Initialize timer
        this.timer = new TimerManager(
            () => this.onTimerTick(),
            () => this.performAction()
        );
        
        this.init();
    }
    
    /**
     * Set callback for state updates (React component will use this)
     */
    public setStateUpdateCallback(callback: (state: AFKState) => void): void {
        this.stateUpdateCallback = callback;
    }
    
    private async init(): Promise<void> {
        // Load configuration from persistence
        const savedConfig = await this.configPersistence.loadConfig();
        this.config.loadSettings(savedConfig);
        
        // Trigger initial state update
        this.updateState();
        
        // Initialize advanced stats display
        this.updateAdvancedStats();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && (e.ctrlKey || e.altKey)) {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    private updateAdvancedStats(): void {
        if (this.stateUpdateCallback) {
            this.stateUpdateCallback(this.getCurrentState());
        }
    }
    
    public async onIntervalChange(interval: number): Promise<void> {
        this.config.setTimerInterval(interval);
        await this.configPersistence.saveConfig(this.config.getAllSettings());
        if (this.isActive) {
            this.restart();
        }
        this.updateState();
    }
    
    public async onPixelDistanceChange(distance: number): Promise<void> {
        this.config.setMousePixelDistance(distance);
        await this.configPersistence.saveConfig(this.config.getAllSettings());
        if (this.isActive) {
            this.restart();
        }
        this.updateState();
    }
    
    public async onKeyButtonChange(button: string): Promise<void> {
        this.config.keyButton = button;
        await this.configPersistence.saveConfig(this.config.getAllSettings());
        if (this.isActive) {
            this.restart();
        }
        this.updateState();
    }
    
    private onTimerTick(): void {
        this.updateState();
    }
    
    private async performAction(): Promise<void> {
        const config = this.config.getAllSettings();
        
        // Execute mouse action using the configuration settings directly
        const actionResult = await this.mouseActionManager.executeMouseAction(config);
        
        // Record the action result
        this.stats.recordAction(actionResult);
        
        // Check Steam achievements based on total actions
        const totalActions = this.stats.getAdvancedStats().totalActions;
        ipcRenderer.invoke('achievement-track-action', totalActions);
        
        this.updateState();
    }
    
    public start(): void {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.start();
        
        const interval = this.config.getInterval();
        this.timer.start(interval);
        this.updateState();
    }
    
    public stop(): void {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.timer.stop();
        this.stats.stop();
        this.updateState();
    }
    
    public toggle(): void {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    private restart(): void {
        this.stop();
        setTimeout(() => this.start(), 100);
    }
    
    private getCurrentState(): AFKState {
        const stats = this.stats.getStats();
        const advancedStats = this.stats.getAdvancedStats();
        const nextActionTime = this.timer.getNextActionTime();
        const config = this.config.getAllSettings();
        
        return {
            isActive: this.isActive,
            actionCount: stats.actionCount,
            runningTime: stats.formattedRunningTime,
            nextAction: this.isActive ? nextActionTime : '--',
            interval: config.interval,
            pixelDistance: config.pixelDistance,
            keyButton: config.keyButton,
            advancedStats: {
                totalSessions: advancedStats.totalSessions,
                totalTime: advancedStats.totalTime,
                totalActions: advancedStats.totalActions,
                avgSessionDuration: advancedStats.avgSessionDuration
            }
        };
    }
    
    private updateState(): void {
        if (this.stateUpdateCallback) {
            this.stateUpdateCallback(this.getCurrentState());
        }
    }
}
