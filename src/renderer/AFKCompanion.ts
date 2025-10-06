import { ipcRenderer } from 'electron';
import { RuntimeConfig } from '../config';
import { StatisticsManager } from './managers/StatisticsManager';
import { TimerManager } from './managers/TimerManager';
import { UIManager } from './managers/UIManager';
import { MouseActionManager, MouseActionResult } from './managers/MouseActionManager';

/**
 * Main AFK Companion Controller - Orchestrates all components
 */
export class AFKCompanion {
    private isActive: boolean = false;
    private config: RuntimeConfig;
    private stats: StatisticsManager;
    private ui: UIManager;
    private mouseActionManager: MouseActionManager;
    private timer: TimerManager;

    constructor() {
        // Initialize components
        this.config = RuntimeConfig.getInstance();
        this.stats = new StatisticsManager();
        this.ui = new UIManager();
        this.mouseActionManager = new MouseActionManager();
        
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
        
        // Initialize tab functionality
        this.initializeTabs();
        
        // Initialize UI state
        this.updateUI();
        
        // Initialize advanced stats display immediately
        this.updateAdvancedStats();

        this.config.clearStorageAndReset();
    }
    
    private initializeTabs(): void {
        const tabs = {
            main: document.getElementById('main-tab'),
            stats: document.getElementById('stats-tab'),
            usecase: document.getElementById('usecase-tab'),
            features: document.getElementById('features-tab')
        };
        
        const contents = {
            main: document.getElementById('main-content'),
            stats: document.getElementById('stats-content'),
            usecase: document.getElementById('usecase-content'),
            features: document.getElementById('features-content')
        };
        
        // Add click listeners for all tabs
        if (tabs.main) {
            tabs.main.addEventListener('click', () => {
                this.switchTab('main', tabs, contents);
            });
        }
        
        if (tabs.stats) {
            tabs.stats.addEventListener('click', () => {
                this.switchTab('stats', tabs, contents);
                // Small delay to ensure tab switch completes before updating stats
                setTimeout(() => {
                    this.updateAdvancedStats();
                }, 50);
            });
        }
        
        if (tabs.usecase) {
            tabs.usecase.addEventListener('click', () => {
                this.switchTab('usecase', tabs, contents);
            });
        }
        
        if (tabs.features) {
            tabs.features.addEventListener('click', () => {
                this.switchTab('features', tabs, contents);
            });
        }
    }
    
    private switchTab(activeTab: 'main' | 'stats' | 'usecase' | 'features', tabs: any, contents: any): void {
        // Remove active class from all tabs and contents
        Object.values(tabs).forEach((tab: any) => {
            if (tab) tab.classList.remove('active');
        });
        
        Object.values(contents).forEach((content: any) => {
            if (content) content.classList.remove('active');
        });
        
        // Add active class to selected tab and content
        if (tabs[activeTab]) {
            tabs[activeTab].classList.add('active');
        }
        
        if (contents[activeTab]) {
            contents[activeTab].classList.add('active');
        }
    }
    
    private updateAdvancedStats(): void {
        const advancedStats = this.stats.getAdvancedStats();
        
        const elements = {
            totalSessions: document.getElementById('total-sessions'),
            totalTime: document.getElementById('total-time'),
            totalActions: document.getElementById('total-actions'),
            avgSessionDuration: document.getElementById('avg-session-duration')
        };
        
        if (elements.totalSessions) {
            elements.totalSessions.textContent = advancedStats.totalSessions.toString();
        }
        if (elements.totalTime) {
            elements.totalTime.textContent = advancedStats.totalTime;
        }
        if (elements.totalActions) {
            elements.totalActions.textContent = advancedStats.totalActions.toString();
        }
        if (elements.avgSessionDuration) {
            elements.avgSessionDuration.textContent = advancedStats.avgSessionDuration;
        }
    }
    
    private onIntervalChange(interval: number): void {
        this.config.setInterval(interval);
        if (this.isActive) {
            this.restart();
        }
    }
    
    private onPixelDistanceChange(distance: number): void {
        this.config.setPixelDistance(distance);
        if (this.isActive) {
            this.restart();
        }
    }
    
    private onWindowFocus(): void {
        this.updateUI();
    }
    
    private onTimerTick(): void {
        this.updateUI();
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
        
        this.updateUI();
    }
    
    start(): void {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.start();
        
        const interval = this.config.getInterval();
        this.timer.start(interval);
        this.updateUI();
    }
    
    stop(): void {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.timer.stop();
        this.stats.stop();
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
        this.stop();
        setTimeout(() => this.start(), 100);
    }
    
    private updateUI(): void {
        // Update status
        this.ui.updateStatus(this.isActive);
        
        // Update statistics
        const stats = this.stats.getStats();
        this.ui.updateStatistics(stats);
        
        // Update advanced statistics (for the stats tab)
        this.updateAdvancedStats();
        
        // Update countdown
        const nextActionTime = this.timer.getNextActionTime();
        this.ui.updateCountdown(nextActionTime, this.isActive);
    }
}