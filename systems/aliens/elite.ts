
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { PALETTES, ALIEN_CONFIGS, DIFFICULTY_SCALE } from '../../constants';

export const updateElite = (alien: Alien, ctx: AlienUpdateContext) => {
    const { player, bullets, currentLevel, playSound } = ctx;

    // Movement: Swoop but stop at top
    if (alien.pos.y < 150) alien.pos.y += alien.vy;
    // Apply standard swoop physics for X
    const t = (ctx.gameTime + alien.timeOffset) * 0.015;
    alien.pos.x = alien.startX + Math.sin(t) * 30;

    // Firing: Triple Shot
    const config = ALIEN_CONFIGS.ELITE;
    const fireRateMult = Math.pow(DIFFICULTY_SCALE.fireRateMultiplier, currentLevel - 1);
    const chance = (config.fireChance || 0.0005) * fireRateMult;

    if (alien.pos.y > 0 && Math.random() < chance) {
        const pCx = player.pos.x + player.width / 2;
        const pCy = player.pos.y + player.height / 2;
        const dx = pCx - (alien.pos.x + alien.width / 2);
        const dy = pCy - (alien.pos.y + alien.height);
        const baseAngle = Math.atan2(dy, dx);
        const speed = (config.bulletSpeed || 2.5); 
        const angles = [baseAngle - 0.2, baseAngle, baseAngle + 0.2];
        angles.forEach(angle => {
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            bullets.push({
               id: Math.random().toString(),
               pos: { x: alien.pos.x + alien.width / 2 - 4, y: alien.pos.y + alien.height },
               width: 8, height: 16,
               color: PALETTES.ELITE['3'], 
               active: true, velocity: vy, vx: vx, isEnemy: true,
               bulletType: 'HEAVY', variant: 'ENEMY_HEAVY'
            });
        });
        playSound('SHOOT');
    }
};
