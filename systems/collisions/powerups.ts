

import { CollisionContext } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, POWERUP_CYCLE_TIME } from '../../constants';
import { PowerUpType } from '../../types';

export const handlePowerUps = (ctx: CollisionContext) => {
    const { powerUps, player, playSound, canvasRef, onCollectPowerUp, scoreRef, setScore, updateStats } = ctx;

    powerUps.forEach(p => {
        // 1. Physics (Movement & Bounce)
        p.pos.x += p.vx;
        p.pos.y += p.vy;
        
        // Screen bounds bouncing
        if (p.pos.x <= 0 || p.pos.x + p.width >= CANVAS_WIDTH) p.vx = -p.vx;
        if (p.pos.y <= 0 || p.pos.y + p.height >= CANVAS_HEIGHT) p.vy = -p.vy;
        if (p.pos.y < 0) { p.pos.y = 0; p.vy = Math.abs(p.vy); }
        
        // 2. Type Cycling (Toggle between Face A and Face B)
        p.cycleTimer--;
        if (p.cycleTimer <= 0) {
            p.cycleTimer = POWERUP_CYCLE_TIME;
            
            // Toggle Logic
            p.type = (p.type === p.faceA) ? p.faceB : p.faceA;
            
            // Update color to match new type
            if (p.type === PowerUpType.BEAM_GUN) p.color = COLORS.powerupBeam;
            else if (p.type === PowerUpType.SPREAD_GUN) p.color = COLORS.powerupSpread;
            else if (p.type === PowerUpType.MISSILE_PACK) p.color = COLORS.powerupMissile;
            else if (p.type === PowerUpType.SHIELD_REFILL) p.color = COLORS.powerupShield;
            else if (p.type === PowerUpType.FLAME_THROWER) p.color = COLORS.powerupFlame;
            else if (p.type === PowerUpType.SIDEWINDER) p.color = COLORS.powerupSidewinder;
            else if (p.type === PowerUpType.REPAIR_KIT) p.color = COLORS.powerupRepair;
        }

        // 3. Collision with Player (Simple AABB)
        if (
            p.pos.x < player.pos.x + player.width &&
            p.pos.x + p.width > player.pos.x &&
            p.pos.y < player.pos.y + player.height &&
            p.pos.y + p.height > player.pos.y
        ) {
            p.active = false;
            playSound('POWERUP'); 
            
            // Trigger UI flying icon animation
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const screenX = rect.left + p.pos.x;
                const screenY = rect.top + p.pos.y;
                onCollectPowerUp(screenX, screenY, p.type, p.color);
            }

            // Apply Stats
            if (p.type === PowerUpType.BEAM_GUN) player.beamLevel += 1;
            else if (p.type === PowerUpType.SPREAD_GUN) player.spreadLevel += 1;
            else if (p.type === PowerUpType.MISSILE_PACK) player.missileLevel += 1;
            else if (p.type === PowerUpType.FLAME_THROWER) player.flameLevel += 1;
            else if (p.type === PowerUpType.SIDEWINDER) player.sidewinderLevel += 1;
            else if (p.type === PowerUpType.REPAIR_KIT) {
                 player.hp = Math.min(player.hp + 150, player.maxHp);
                 ctx.setHp(player.hp);
            }
            else if (p.type === PowerUpType.SHIELD_REFILL) {
                 player.shieldEnergy = player.maxShieldEnergy;
            }
            
            scoreRef.current += 100;
            setScore(scoreRef.current);
            updateStats(); 
        }
    });
};