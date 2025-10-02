const { mouse, keyboard, Key } = require('@nut-tree-fork/nut-js');

/**
 * Automation Service - Handles mouse and keyboard automation
 */
class AutomationService {
    constructor() {
        this.animationConfig = {
            steps: 12,
            stepDelay: 8,
            pauseDelay: 80
        };
    }
    
    async simulateMouseMovement(pixelDistance = 5) {
        try {
            // Get current mouse position using nut-js
            const currentPos = await mouse.getPosition();
            
            // Calculate target position (circular movement for better coverage)
            const angle = Math.random() * Math.PI * 2;
            const targetX = Math.round(currentPos.x + Math.cos(angle) * pixelDistance);
            const targetY = Math.round(currentPos.y + Math.sin(angle) * pixelDistance);
            
            console.log(`Moving mouse from (${currentPos.x}, ${currentPos.y}) to (${targetX}, ${targetY})`);
            
            // Toggle ScrollLock for system sleep prevention
            await this.toggleScrollLock();
            
            // Perform smooth mouse movement
            await this.performSmoothMovement(currentPos, { x: targetX, y: targetY });
            
            console.log('Universal mouse simulation completed successfully');
            return true;
            
        } catch (error) {
            console.error('Error simulating smooth mouse movement:', error);
            return false;
        }
    }
    
    async toggleScrollLock() {
        try {
            await keyboard.pressKey(Key.ScrollLock);
            await keyboard.releaseKey(Key.ScrollLock);
            await this.delay(10);
            await keyboard.pressKey(Key.ScrollLock);
            await keyboard.releaseKey(Key.ScrollLock);
            console.log('ScrollLock toggle completed');
        } catch (error) {
            console.log('ScrollLock toggle error:', error.message);
        }
    }
    
    async performSmoothMovement(startPos, targetPos) {
        const { steps, stepDelay, pauseDelay } = this.animationConfig;
        
        // Smooth movement to target
        for (let i = 1; i <= steps; i++) {
            const currentX = Math.round(startPos.x + (targetPos.x - startPos.x) * (i / steps));
            const currentY = Math.round(startPos.y + (targetPos.y - startPos.y) * (i / steps));
            
            try {
                await mouse.setPosition({ x: currentX, y: currentY });
                if (i < steps) {
                    await this.delay(stepDelay);
                }
            } catch (error) {
                console.log('Movement step error:', error.message);
            }
        }
        
        // Brief pause at target
        await this.delay(pauseDelay);
        
        // Move back smoothly to original position
        for (let i = 1; i <= steps; i++) {
            const returnX = Math.round(targetPos.x + (startPos.x - targetPos.x) * (i / steps));
            const returnY = Math.round(targetPos.y + (startPos.y - targetPos.y) * (i / steps));
            
            try {
                await mouse.setPosition({ x: returnX, y: returnY });
                if (i < steps) {
                    await this.delay(stepDelay);
                }
            } catch (error) {
                console.log('Return movement error:', error.message);
            }
        }
    }
    
    async getCurrentMousePosition() {
        try {
            return await mouse.getPosition();
        } catch (error) {
            console.error('Error getting mouse position:', error);
            return { x: 0, y: 0 };
        }
    }
    
    async setMousePosition(x, y) {
        try {
            await mouse.setPosition({ x, y });
            return true;
        } catch (error) {
            console.error('Error setting mouse position:', error);
            return false;
        }
    }
    
    setAnimationConfig(config) {
        this.animationConfig = { ...this.animationConfig, ...config };
    }
    
    getAnimationConfig() {
        return { ...this.animationConfig };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = AutomationService;