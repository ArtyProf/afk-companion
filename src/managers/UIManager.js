/**
 * UI Manager - Handles all UI updates and interactions
 */
class UIManager {
    constructor() {
        this.elements = {};
    }
    
    initialize() {
        this.elements = {
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            toggleBtn: document.getElementById('toggle-btn'),
            actionCount: document.getElementById('action-count'),
            runningTime: document.getElementById('running-time'),
            nextAction: document.getElementById('next-action')
        };
    }
    
    updateStatus(isActive) {
        if (isActive) {
            this.elements.statusDot.className = 'status-dot active';
            this.elements.statusText.textContent = 'Active';
            this.elements.toggleBtn.textContent = 'Stop Anti-AFK';
            this.elements.toggleBtn.className = 'btn btn-primary active';
        } else {
            this.elements.statusDot.className = 'status-dot inactive';
            this.elements.statusText.textContent = 'Inactive';
            this.elements.toggleBtn.textContent = 'Start Anti-AFK';
            this.elements.toggleBtn.className = 'btn btn-primary';
        }
    }
    
    updateStatistics(stats) {
        this.elements.actionCount.textContent = stats.actionCount;
        this.elements.runningTime.textContent = stats.formattedRunningTime;
    }
    
    updateCountdown(timeString, isActive) {
        this.elements.nextAction.textContent = isActive ? timeString : '--';
    }
    
    bindEvents(callbacks) {
        // Toggle button
        this.elements.toggleBtn.addEventListener('click', callbacks.onToggle);
        
        // Settings
        const intervalSelect = document.getElementById('interval-select');
        intervalSelect.addEventListener('change', (e) => {
            callbacks.onIntervalChange(parseInt(e.target.value));
        });
        
        const pixelDistanceInput = document.getElementById('pixel-distance');
        pixelDistanceInput.addEventListener('change', (e) => {
            callbacks.onPixelDistanceChange(parseInt(e.target.value));
        });
        
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

module.exports = UIManager;