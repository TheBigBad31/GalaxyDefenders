import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { PALETTES, ALIEN_CONFIGS, DIFFICULTY_SCALE, CANVAS_HEIGHT } from '../../constants';

export const updateGunner = (alien: Alien, ctx: AlienUpdateContext) => {
    const { player, bullets, currentLevel } = ctx;
    
    // Movement: Tracking
    const targetX = player.pos.x + player.width/2 - alien.width/2;
    const dx = targetX - alien.pos.x;
    const maxTrackSpeed = 1.2; 
    let trackVx = dx * 0.02;
    if (trackVx > maxTrackSpeed) trackVx = maxTrackSpeed;
    if (trackVx < -maxTrackSpeed) trackVx = -maxTrackSpeed;
    alien.pos.x += trackVx;
    
    // Y Movement: Prevent drift off-screen
    // If it gets too low (> 400), reverse/slow down to hover
    if (alien.pos.y > CANVAS_HEIGHT - 200) {
        alien.vy -= 0.05; // Decelerate/Float up
    } else if (alien.pos.y < 50) {
        alien.vy += 0.05; // Go down
    }
    
    // Cap vertical speed
    if (alien.vy > 1) alien.vy = 1;
    if (alien.vy < -1) alien.vy = -1;

    alien.pos.y += alien.vy;

    // Firing: Burst Logic
    const config = ALIEN_CONFIGS[alien.type];
    const fireRateMult = Math.pow(DIFFICULTY_SCALE.fireRateMultiplier, currentLevel - 1);
    const chance = (config.fireChance || 0.006) * fireRateMult;

    if ((alien.burstRemaining || 0) > 0) {
        alien.burstTimer = (alien.burstTimer || 0) - 1;
        if (alien.burstTimer <= 0) {
            const pCx = player.pos.x + player.width / 2;
            const pCy = player.pos.y + player.height / 2;
            const dx = pCx - (alien.pos.x + alien.width / 2);
            const dy = pCy - (alien.pos.y + alien.height);
            const angle = Math.atan2(dy, dx);
            const speed = (config.bulletSpeed || 3) + 2; 
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            bullets.push({
               id: Math.random().toString(),
               pos: { x: alien.pos.x + alien.width / 2 - 4, y: alien.pos.y + alien.height },
               width: 8, height: 16,
               color: PALETTES.GUNNER['3'], 
               active: true, velocity: vy, vx: vx, isEnemy: true,
               bulletType: 'NORMAL', variant: 'ENEMY_NORMAL'
            });
            alien.burstRemaining = (alien.burstRemaining || 0) - 1;
            alien.burstTimer = 10; 
        }
    } else if (alien.pos.y > 0 && Math.random() < chance) {
        alien.burstRemaining = 3;
        alien.burstTimer = 0;
    }
};