import { mouse, keyboard, Key, Button } from '@nut-tree-fork/nut-js';
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
            // Get current mouse position using nut-js
            const currentPos = await mouse.getPosition();
            
            // Calculate target position (circular movement for better coverage)
            const angle = Math.random() * Math.PI * 2;
            const targetX = Math.round(currentPos.x + Math.cos(angle) * pixelDistance);
            const targetY = Math.round(currentPos.y + Math.sin(angle) * pixelDistance);
            
            logger.debug(`Moving mouse from (${currentPos.x}, ${currentPos.y}) to (${targetX}, ${targetY})`);
            
            // Perform smooth mouse movement
            await this.performSmoothMovement(currentPos, { x: targetX, y: targetY });
            
            // Perform additional key press if button is selected
            if (keyButton !== AppConfig.KEY_BUTTONS.NONE) {
                await this.performKeyPress(keyButton);
            } else {
                logger.info(`[AutomationService] Skipping key press - none selected`);
            }
            
            logger.debug('Universal mouse simulation completed successfully');
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
                logger.warn(`Unknown key type: ${keyType}`);
                return;
            }

            // Check if this is a toggle key (Caps Lock, Num Lock, Scroll Lock)
            const isToggleKey = keyType === AppConfig.KEY_BUTTONS.CAPS_LOCK ||
                                keyType === AppConfig.KEY_BUTTONS.NUM_LOCK ||
                                keyType === AppConfig.KEY_BUTTONS.SCROLL_LOCK;

            if (isToggleKey) {
                // Toggle keys need longer delays on macOS to register
                // Press and release to turn ON (with visible LED blink)
                await keyboard.pressKey(key);
                await this.delay(50); // Longer delay for toggle keys
                await keyboard.releaseKey(key);
                await this.delay(100); // Allow LED to be visible

                // Press and release again to turn OFF
                await keyboard.pressKey(key);
                await this.delay(50);
                await keyboard.releaseKey(key);                
                logger.debug(`Keyboard toggle key ${keyType} pressed (on/off cycle)`);
            } else {
                // Normal keys - single press
                await keyboard.pressKey(key);
                await this.delay(10);
                await keyboard.releaseKey(key);
                
                logger.debug(`Keyboard key ${keyType} pressed`);
            }
        } catch (error: any) {
            logger.error(`Keyboard press error (${keyType}):`, error);
        }
    }
    
    private mapKeyButtonToKey(keyType: string): Key | null {
        switch (keyType) {
            case AppConfig.KEY_BUTTONS.SCROLL_LOCK:
                return Key.ScrollLock;
            case AppConfig.KEY_BUTTONS.F13:
                return Key.F13;
            case AppConfig.KEY_BUTTONS.F14:
                return Key.F14;
            case AppConfig.KEY_BUTTONS.F15:
                return Key.F15;
            case AppConfig.KEY_BUTTONS.F16:
                return Key.F16;
            case AppConfig.KEY_BUTTONS.F17:
                return Key.F17;
            case AppConfig.KEY_BUTTONS.F18:
                return Key.F18;
            case AppConfig.KEY_BUTTONS.F19:
                return Key.F19;
            case AppConfig.KEY_BUTTONS.F20:
                return Key.F20;
            case AppConfig.KEY_BUTTONS.NUM_LOCK:
                return Key.NumLock;
            case AppConfig.KEY_BUTTONS.CAPS_LOCK:
                return Key.CapsLock;
            case AppConfig.KEY_BUTTONS.PAUSE:
                return Key.Pause;
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}