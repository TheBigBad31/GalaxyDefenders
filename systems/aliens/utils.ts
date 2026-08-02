

import { Alien, MovementType, AlienType } from '../../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ALIEN_CONFIGS, COLORS, BULLET_SIZE, PALETTES, DIFFICULTY_SCALE } from '../../constants';
import { AlienUpdateContext } from './types';

export const handleStandardMovement = (alien: Alien, gameTime: number) => {
    // Limits
    let bottomLimit = CANVAS_HEIGHT - 100;
    if (alien.type === AlienType.REFLECTOR) bottomLimit = CANVAS_HEIGHT / 2;
    const topLimit = 50;

    // Movement Patterns
    const t = (gameTime + alien.timeOffset) * 0.02;
    
    if (alien.movementType === MovementType.SINE) {
        alien.pos.x = alien.startX + Math.sin(t) * 50;
        alien.pos.y += alien.vy;
    } 
    else if (alien.movementType === MovementType.ZIGZAG) {
        alien.pos.x = alien.startX + Math.sin(t * 2) * 30;
        alien.pos.y += alien.vy;
    } 
    else if (alien.movementType === MovementType.SWOOP) {
        const swoopT = (gameTime + alien.timeOffset) * 0.015; 
        alien.pos.x = alien.startX + Math.sin(swoopT) * 30; 
        alien.pos.y += Math.cos(swoopT * 2) * 0.5 + alien.vy; 
    }
    else if (alien.movementType === MovementType.STRAIGHT) {
        alien.pos.y += alien.vy;
    }

    // Bounce Logic (Vertical)
    if (alien.movementType !== MovementType.CROSS_SCREEN && alien.type !== AlienType.UFO) {
        if (alien.pos.y > bottomLimit && alien.vy > 0) alien.vy = -Math.abs(alien.vy);
        if (alien.pos.y > 0 && alien.pos.y < topLimit && alien.vy < 0) alien.vy = Math.abs(alien.vy);
    }
};

export const handleStandardFire = (alien: Alien, ctx: AlienUpdateContext) => {
    const config = ALIEN_CONFIGS[alien.type];
    const fireRateMult = Math.pow(DIFFICULTY_SCALE.fireRateMultiplier, ctx.currentLevel - 1);
    const chance = (config.fireChance || 0.001) * fireRateMult;

    if (alien.pos.y > 0 && alien.pos.y < CANVAS_HEIGHT && Math.random() < chance) {
        let bSpeed = config.bulletSpeed || 5;
        let bColor = COLORS.enemyBullet;
        let bType: any = 'NORMAL';
        let bSize = { ...BULLET_SIZE };
        let bVariant: any = 'ENEMY_NORMAL';

        if (alien.type === AlienType.SCOUT) { 
            bType = 'FAST'; bColor = COLORS.enemyBulletFast; bVariant = 'ENEMY_FAST'; 
        } else if (alien.type === AlienType.ASSAULT) { 
            // Assault logic is specific (dual shot), handled in Assault file, 
            // but this is fallback for others
            bType = 'HEAVY'; bColor = COLORS.enemyBulletHeavy; bSize = { width: 8, height: 16 }; bVariant = 'ENEMY_HEAVY'; 
        } else if (alien.type === AlienType.REFLECTOR) { 
            bColor = PALETTES.REFLECTOR['3']; 
            bVariant = 'ENEMY_GALAXY';
            bSize = { width: 14, height: 14 };
        }

        const bulletLevelSpeed = bSpeed + (ctx.currentLevel * 0.1);
        let vx = 0;
        let vy = bulletLevelSpeed;

        // Slight aim for standard enemies
        if (Math.random() < 0.3) {
            const dx = (ctx.player.pos.x + ctx.player.width/2) - (alien.pos.x + alien.width/2);
            vx = dx * 0.01; 
            if (vx > 2) vx = 2;
            if (vx < -2) vx = -2;
        }
        
        ctx.bullets.push({
            id: Math.random().toString(),
            pos: { x: alien.pos.x + alien.width / 2 - bSize.width / 2, y: alien.pos.y + alien.height },
            width: bSize.width, height: bSize.height, color: bColor, active: true,
            velocity: vy, vx: vx, isEnemy: true, bulletType: bType, variant: bVariant
        });
    }
};
