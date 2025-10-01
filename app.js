// AFK Companion - Anti-idle functionality
const { ipcRenderer } = require('electron');

class AFKCompanion {
    constructor() {
        this.isActive = false;
        this.interval = 60; // seconds
        this.actionType = 'mouse';
        this.actionCount = 0;
        this.startTime = null;
        this.intervalId = null;
        this.countdownId = null;
        this.nextActionTime = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
        this.startCountdown();
    }
    
    bindEvents() {
        // Toggle button
        const toggleBtn = document.getElementById('toggle-btn');
        toggleBtn.addEventListener('click', () => this.toggle());
        
        // Settings
        const intervalSelect = document.getElementById('interval-select');
        intervalSelect.addEventListener('change', (e) => {
            this.interval = parseInt(e.target.value);
            if (!this.isActive) {
                this.resetCountdown();
            }
        });
        
        const actionSelect = document.getElementById('action-select');
        actionSelect.addEventListener('change', (e) => {
            this.actionType = e.target.value;
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && (e.ctrlKey || e.altKey)) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Handle window focus/blur for more natural behavior
        window.addEventListener('focus', () => {
            if (this.isActive) {
                this.resetCountdown();
            }
        });
    }
    
    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isActive = true;
        this.startTime = Date.now();
        this.actionCount = 0;
        
        // Immediate first action
        this.performAction();
        
        // Set up interval
        this.intervalId = setInterval(() => {
            this.performAction();
        }, this.interval * 1000);
        
        this.updateUI();
        this.resetCountdown();
        console.log('AFK Companion started');
    }
    
    stop() {
        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateUI();
        this.resetCountdown();
        console.log('AFK Companion stopped');
    }
    
    performAction() {
        try {
            switch (this.actionType) {
                case 'mouse':
                    this.performMouseAction();
                    break;
                case 'key':
                    this.performKeyAction();
                    break;
                case 'both':
                    this.performMouseAction();
                    setTimeout(() => this.performKeyAction(), 100);
                    break;
            }
            
            this.actionCount++;
            this.updateUI();
            this.resetCountdown();
            
        } catch (error) {
            console.error('Error performing action:', error);
            // Continue running even if individual action fails
        }
    }
    
    performMouseAction() {
        // Use Electron's built-in capabilities to simulate activity
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.invoke('simulate-mouse-movement');
            } catch (error) {
                console.log('Using fallback mouse simulation');
                this.fallbackMouseAction();
            }
        } else {
            this.fallbackMouseAction();
        }
        
        this.logAction('Mouse movement performed');
    }
    
    performKeyAction() {
        // Use Electron's built-in capabilities to simulate key press
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.invoke('simulate-key-press');
            } catch (error) {
                console.log('Using fallback key simulation');
                this.fallbackKeyAction();
            }
        } else {
            this.fallbackKeyAction();
        }
        
        this.logAction('Key press performed');
    }
    
    fallbackMouseAction() {
        // Fallback: Move the app window slightly (invisible to user)
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.invoke('jiggle-window');
            } catch (error) {
                // Ultimate fallback: trigger a small DOM event
                const event = new MouseEvent('mousemove', {
                    clientX: Math.random() * 2,
                    clientY: Math.random() * 2
                });
                document.dispatchEvent(event);
            }
        }
    }
    
    fallbackKeyAction() {
        // Fallback: Create a programmatic keyboard event
        const event = new KeyboardEvent('keydown', {
            key: 'F24', // F24 is very rarely used
            code: 'F24'
        });
        document.dispatchEvent(event);
    }
    
    logAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
    }
    
    updateUI() {
        // Status indicator
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const toggleBtn = document.getElementById('toggle-btn');
        
        if (this.isActive) {
            statusDot.className = 'status-dot active';
            statusText.textContent = 'Active';
            toggleBtn.textContent = 'Stop Anti-AFK';
            toggleBtn.className = 'btn btn-primary active';
        } else {
            statusDot.className = 'status-dot inactive';
            statusText.textContent = 'Inactive';
            toggleBtn.textContent = 'Start Anti-AFK';
            toggleBtn.className = 'btn btn-primary';
        }
        
        // Statistics
        document.getElementById('action-count').textContent = this.actionCount;
        
        // Running time
        if (this.startTime && this.isActive) {
            const elapsed = Date.now() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('running-time').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            document.getElementById('running-time').textContent = '00:00:00';
        }
    }
    
    startCountdown() {
        this.countdownId = setInterval(() => {
            this.updateCountdown();
            this.updateUI(); // Update running time
        }, 1000);
    }
    
    resetCountdown() {
        this.nextActionTime = this.interval;
    }
    
    updateCountdown() {
        if (this.isActive && this.nextActionTime > 0) {
            this.nextActionTime--;
        } else if (!this.isActive) {
            this.nextActionTime = this.interval;
        }
        
        const minutes = Math.floor(this.nextActionTime / 60);
        const seconds = this.nextActionTime % 60;
        const timeString = this.isActive ? 
            `${minutes}:${seconds.toString().padStart(2, '0')}` : '--';
        
        document.getElementById('next-action').textContent = timeString;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('AFK Companion loaded');
    new AFKCompanion();
    
    // Get platform info
    if (typeof require !== 'undefined') {
        try {
            ipcRenderer.invoke('get-platform').then(platform => {
                console.log(`Running on: ${platform}`);
            });
        } catch (error) {
            console.log('Running in web mode');
        }
    }
});

// Handle app visibility
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('App became visible');
    } else {
        console.log('App became hidden');
    }
});