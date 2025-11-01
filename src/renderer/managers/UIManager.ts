interface UIElements {
    statusDot?: HTMLElement | null;
    statusText?: HTMLElement | null;
    toggleBtn?: HTMLElement | null;
    actionCount?: HTMLElement | null;
    runningTime?: HTMLElement | null;
    nextAction?: HTMLElement | null;
}

interface Stats {
    actionCount: number;
    formattedRunningTime: string;
}

interface UICallbacks {
    onToggle: () => void;
    onIntervalChange: (value: number) => void;
    onPixelDistanceChange: (value: number) => void;
    onKeyButtonChange: (value: string) => void;
    onWindowFocus: () => void;
}

/**
 * UI Manager - Handles all UI updates and interactions
 */
export class UIManager {
    private elements: UIElements = {};
    
    initialize(): void {
        this.elements = {
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            toggleBtn: document.getElementById('toggle-btn'),
            actionCount: document.getElementById('action-count'),
            runningTime: document.getElementById('running-time'),
            nextAction: document.getElementById('next-action')
        };
    }
    
    updateStatus(isActive: boolean): void {
        if (isActive) {
            if (this.elements.statusDot) this.elements.statusDot.className = 'status-dot active';
            if (this.elements.statusText) this.elements.statusText.textContent = 'Active';
            if (this.elements.toggleBtn) {
                this.elements.toggleBtn.textContent = 'Stop Anti-AFK';
                this.elements.toggleBtn.className = 'btn btn-primary active';
            }
        } else {
            if (this.elements.statusDot) this.elements.statusDot.className = 'status-dot inactive';
            if (this.elements.statusText) this.elements.statusText.textContent = 'Inactive';
            if (this.elements.toggleBtn) {
                this.elements.toggleBtn.textContent = 'Start Anti-AFK';
                this.elements.toggleBtn.className = 'btn btn-primary';
            }
        }
    }
    
    updateStatistics(stats: Stats): void {
        if (this.elements.actionCount) this.elements.actionCount.textContent = stats.actionCount.toString();
        if (this.elements.runningTime) this.elements.runningTime.textContent = stats.formattedRunningTime;
    }
    
    updateCountdown(timeString: string, isActive: boolean): void {
        if (this.elements.nextAction) this.elements.nextAction.textContent = isActive ? timeString : '--';
    }
    
    /**
     * Update form inputs with loaded configuration values
     */
    updateConfigValues(config: { interval: number; pixelDistance: number; keyButton: string }): void {
        const intervalSelect = document.getElementById('interval-select') as HTMLSelectElement;
        if (intervalSelect) {
            intervalSelect.value = config.interval.toString();
        }
        
        const pixelDistanceInput = document.getElementById('pixel-distance') as HTMLInputElement;
        if (pixelDistanceInput) {
            pixelDistanceInput.value = config.pixelDistance.toString();
        }
        
        const keyButtonSelect = document.getElementById('key-button-select') as HTMLSelectElement;
        if (keyButtonSelect) {
            keyButtonSelect.value = config.keyButton;
        }
    }
    
    bindEvents(callbacks: UICallbacks): void {
        // Toggle button
        if (this.elements.toggleBtn) {
            this.elements.toggleBtn.addEventListener('click', callbacks.onToggle);
        }
        
        // Settings
        const intervalSelect = document.getElementById('interval-select') as HTMLSelectElement;
        if (intervalSelect) {
            intervalSelect.addEventListener('change', (e) => {
                callbacks.onIntervalChange(parseInt((e.target as HTMLSelectElement).value));
            });
        }
        
        const pixelDistanceInput = document.getElementById('pixel-distance') as HTMLInputElement;
        if (pixelDistanceInput) {
            pixelDistanceInput.addEventListener('change', (e) => {
                callbacks.onPixelDistanceChange(parseInt((e.target as HTMLInputElement).value));
            });
        }
        
        const keyButtonSelect = document.getElementById('key-button-select') as HTMLSelectElement;
        if (keyButtonSelect) {
            keyButtonSelect.addEventListener('change', (e) => {
                callbacks.onKeyButtonChange((e.target as HTMLSelectElement).value);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && (e.ctrlKey || e.altKey)) {
                e.preventDefault();
                callbacks.onToggle();
            }
        });
        
        // Window focus
        window.addEventListener('focus', callbacks.onWindowFocus);
    }
}