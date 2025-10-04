import { mouse, keyboard, Key } from '@nut-tree-fork/nut-js';
import { logger } from '../../utils/Logger';

interface Point {
    x: number;
    y: number;
}

interface AnimationConfig {
    steps: number;
    stepDelay: number;
    pauseDelay: number;
}

/**
 * Automation Service - Handles mouse and keyboard automation
 */
export class AutomationService {
    private animationConfig: AnimationConfig;

    constructor() {
        this.animationConfig = {
            steps: 12,
            stepDelay: 8,
            pauseDelay: 80
        };
    }
    
    async simulateMouseMovement(pixelDistance: number = 5): Promise<boolean> {
        try {
            // Get current mouse position using nut-js
            const currentPos = await mouse.getPosition();
            
            // Calculate target position (circular movement for better coverage)
            const angle = Math.random() * Math.PI * 2;
            const targetX = Math.round(currentPos.x + Math.cos(angle) * pixelDistance);
            const targetY = Math.round(currentPos.y + Math.sin(angle) * pixelDistance);
            
            logger.debug(`Moving mouse from (${currentPos.x}, ${currentPos.y}) to (${targetX}, ${targetY})`);
            
            // Toggle ScrollLock for system sleep prevention
            await this.toggleScrollLock();
            
            // Perform smooth mouse movement
            await this.performSmoothMovement(currentPos, { x: targetX, y: targetY });
            
            logger.debug('Universal mouse simulation completed successfully');
            return true;
            
        } catch (error) {
            logger.error('Error simulating smooth mouse movement:', error);
            return false;
        }
    }
    
    private async toggleScrollLock(): Promise<void> {
        try {
            await keyboard.pressKey(Key.ScrollLock);
            await keyboard.releaseKey(Key.ScrollLock);
            await this.delay(10);
            await keyboard.pressKey(Key.ScrollLock);
            await keyboard.releaseKey(Key.ScrollLock);
            logger.debug('ScrollLock toggle completed');
        } catch (error: any) {
            logger.warn('ScrollLock toggle error:', error.message);
        }
    }
    
    private async performSmoothMovement(startPos: Point, targetPos: Point): Promise<void> {
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
            } catch (error: any) {
                logger.warn('Movement step error:', error.message);
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
            } catch (error: any) {
                logger.warn('Return movement error:', error.message);
            }
        }
    }
    
    async getCurrentMousePosition(): Promise<Point> {
        try {
            return await mouse.getPosition();
        } catch (error) {
            logger.error('Error getting mouse position:', error);
            return { x: 0, y: 0 };
        }
    }

    async setMousePosition(x: number, y: number): Promise<boolean> {
        try {
            await mouse.setPosition({ x, y });
            return true;
        } catch (error) {
            logger.error('Error setting mouse position:', error);
            return false;
        }
    }
    
    setAnimationConfig(config: Partial<AnimationConfig>): void {
        this.animationConfig = { ...this.animationConfig, ...config };
    }
    
    getAnimationConfig(): AnimationConfig {
        return { ...this.animationConfig };
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}