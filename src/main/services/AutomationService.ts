import * as robot from '@jitsi/robotjs';
import { logger } from '../../utils/Logger';
import { AppConfig, RuntimeConfig } from '../../config';

interface Point {
    x: number;
    y: number;
}

/**
 * Automation Service - Handles mouse and keyboard automation
 */
export class AutomationService {
    private runtimeConfig: RuntimeConfig;

    constructor() {
        this.runtimeConfig = RuntimeConfig.getInstance();
    }
    
    async simulateMouseMovement(pixelDistance: number = AppConfig.MOUSE.DEFAULT_PIXEL_DISTANCE, keyButton: string = 'none'): Promise<boolean> {
        try {
            // Get current mouse position using robotjs
            const currentPos = robot.getMousePos();
            
            // Calculate target position (circular movement for better coverage)
            const angle = Math.random() * Math.PI * 2;
            const targetX = Math.round(currentPos.x + Math.cos(angle) * pixelDistance);
            const targetY = Math.round(currentPos.y + Math.sin(angle) * pixelDistance);
            
            logger.debug(`Moving mouse from (${currentPos.x}, ${currentPos.y}) to (${targetX}, ${targetY})`);
            
            // Perform smooth mouse movement
            await this.performSmoothMovement(currentPos, { x: targetX, y: targetY });
            
            logger.debug('Universal mouse simulation completed successfully');

            // Perform additional key press if button is selected
            if (keyButton !== AppConfig.KEY_BUTTONS.NONE) {
                await this.performKeyPress(keyButton);
            } else {
                logger.info(`[AutomationService] Skipping key press - none selected`);
            }
            
            return true;
            
        } catch (error) {
            logger.error('Error simulating smooth mouse movement:', error);
            return false;
        }
    }
    
    private async performKeyPress(keyType: string): Promise<void> {
        try {
            const key = this.mapKeyButtonToKey(keyType);
            if (!key) {
                logger.warn(`Key type '${keyType}' is not supported on macOS with robotjs`);
                return;
            }
            robot.keyTap(key);

            await this.delay(10);

            logger.debug(`Keyboard key ${keyType} pressed`);
        } catch (error: any) {
            logger.error(`Keyboard press error (${keyType}):`, error);
        }
    }
    
    private mapKeyButtonToKey(keyType: string): string | null {
        switch (keyType) {
            case AppConfig.KEY_BUTTONS.F13:
                return 'f13';
            case AppConfig.KEY_BUTTONS.F14:
                return 'f14';
            case AppConfig.KEY_BUTTONS.F15:
                return 'f15';
            case AppConfig.KEY_BUTTONS.F16:
                return 'f16';
            case AppConfig.KEY_BUTTONS.F17:
                return 'f17';
            case AppConfig.KEY_BUTTONS.F18:
                return 'f18';
            case AppConfig.KEY_BUTTONS.F19:
                return 'f19';
            case AppConfig.KEY_BUTTONS.F20:
                return 'f20';
            default:
                return null;
        }
    }
    
    private async performSmoothMovement(startPos: Point, targetPos: Point): Promise<void> {
        const { steps, stepDelay, pauseDelay } = this.runtimeConfig.getAnimationConfig();
        
        // Smooth movement to target
        for (let i = 1; i <= steps; i++) {
            const currentX = Math.round(startPos.x + (targetPos.x - startPos.x) * (i / steps));
            const currentY = Math.round(startPos.y + (targetPos.y - startPos.y) * (i / steps));
            
            try {
                robot.moveMouse(currentX, currentY);
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
                robot.moveMouse(returnX, returnY);
                if (i < steps) {
                    await this.delay(stepDelay);
                }
            } catch (error: any) {
                logger.warn('Return movement error:', error.message);
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}