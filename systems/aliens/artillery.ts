
import { AlienUpdateContext } from './types';
import { Alien, AlienType } from '../../types';
import { COLORS, ALIEN_CONFIGS } from '../../constants';

export const updateArtillery = (alien: Alien, ctx: AlienUpdateContext) => {
    const { player, bullets, gameTime, createExplosion } = ctx;
    const isSupreme = alien.type === AlienType.SUPREME_ARTILLERY;

    // Movement: Hover & Sine
    alien.pos.y = Math.min(isSupreme ? 80 : 100, alien.pos.y + alien.vy); 
    alien.pos.x = alien.startX + Math.sin(gameTime * (isSupreme ? 0.003 : 0.005)) * 150;

    const config = ALIEN_CONFIGS[alien.type];

    // Firing Logic
    if ((alien.burstRemaining || 0) > 0) {
        alien.burstTimer = (alien.burstTimer || 0) - 1;
        if (alien.burstTimer <= 0) {
            const pCx = player.pos.x + player.width / 2;
            const pCy = player.pos.y + player.height / 2;
            const dx = pCx - (alien.pos.x + alien.width / 2);
            const dy = pCy - (alien.pos.y + alien.height);
            const angle = Math.atan2(dy, dx);
            const speed = (config.bulletSpeed || 3.5); 
            
            if (isSupreme) {
                // SUPREME ATTACK: Massive Fan
                const fanCount = 24;
                const fanSpread = Math.PI / 1.5; // Wide angle
                const startAngle = angle - fanSpread/2;
                const step = fanSpread / fanCount;
                
                for(let i=0; i<fanCount; i++) {
                    const a = startAngle + (step * i);
                    const vx = Math.cos(a) * speed;
                    const vy = Math.sin(a) * speed;
                    bullets.push({
                        id: Math.random().toString(),
                        pos: { x: alien.pos.x + alien.width/2 - 6, y: alien.pos.y + alien.height },
                        width: 12, height: 12,
                        color: COLORS.enemyBulletDestructible, 
                        active: true, velocity: vy, vx: vx, isEnemy: true,
                        bulletType: 'DESTRUCTIBLE', variant: 'ENEMY_DESTRUCTIBLE'
                    });
                }
                alien.burstRemaining = (alien.burstRemaining || 0) - 1;
                // Increased interval between fan waves from 60 (1s) to 90 (1.5s) for Boss
                // This makes the wall less dense and gives time to weave
                alien.burstTimer = 90; 
            } else {
                // NORMAL ATTACK: Dual Destructible Stream
                const angles = [angle - 0.15, angle + 0.15];
                const offsets = [-20, 20]; 
                angles.forEach((a, i) => {
                    const vx = Math.cos(a) * speed;
                    const vy = Math.sin(a) * speed;
                    bullets.push({
                       id: Math.random().toString(),
                       pos: { x: (alien.pos.x + alien.width / 2) + offsets[i] - 6, y: alien.pos.y + alien.height },
                       width: 12, height: 12,
                       color: COLORS.enemyBulletDestructible, 
                       active: true, velocity: vy, vx: vx, isEnemy: true,
                       bulletType: 'DESTRUCTIBLE', variant: 'ENEMY_DESTRUCTIBLE'
                    });
                });
                alien.burstRemaining = (alien.burstRemaining || 0) - 1;
                alien.burstTimer = 12; 
            }
        }
    } else {
        alien.burstTimer = (alien.burstTimer || 0) - 1;
        // Massive cooldown increase for Supreme: 360 (6 seconds) vs 240 (4s) for Normal
        // This ensures the "wall" dissipates entirely before the next attack for the boss
        const cooldown = isSupreme ? 360 : 240; 
        if (alien.burstTimer <= -cooldown) { 
           alien.burstRemaining = isSupreme ? 3 : 8; 
           alien.burstTimer = 0;
        }
    }

    // SUPREME SPECIAL: Heavy Cannon Support
    // Slowed down frequency from 180 (3s) to 240 (4s) to reduce pressure
    if (isSupreme && gameTime % 240 === 0) {
        bullets.push({
            id: `supreme-cannon-${Math.random()}`,
            pos: { x: alien.pos.x + alien.width/2 - 5, y: alien.pos.y + alien.height },
            width: 10, height: 20,
            color: '#fcd34d',
            active: true, velocity: 4.0, vx: 0, isEnemy: true,
            bulletType: 'HEAVY', variant: 'ENEMY_HEAVY'
        });
        createExplosion(alien.pos.x + alien.width/2, alien.pos.y + alien.height, '#fcd34d', 'SMALL');
    }
};
