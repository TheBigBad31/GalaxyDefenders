
import { AlienUpdateContext } from './types';
import { Alien, AlienType } from '../../types';
import { spawnKamikaze } from '../spawning/factories';
import { COLORS } from '../../constants';

export const updateMothership = (alien: Alien, ctx: AlienUpdateContext) => {
    const { gameTime, aliens, bullets, playSound, player, createExplosion } = ctx;
    const isSupreme = alien.type === AlienType.SUPREME_MOTHERSHIP;

    // Movement: Slow sine wave
    alien.pos.y = Math.min(60, alien.pos.y + alien.vy); 
    alien.pos.x = alien.startX + Math.sin(gameTime * 0.01) * 250; 
    
    // Spawning logic
    if (alien.spawnTimer !== undefined) {
        alien.spawnTimer--;
        if (alien.spawnTimer <= 0) {
            if (isSupreme) {
                // QUAD SPAWN
                aliens.push(spawnKamikaze(alien.pos.x, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                aliens.push(spawnKamikaze(alien.pos.x + 30, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                aliens.push(spawnKamikaze(alien.pos.x + alien.width - 30, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                aliens.push(spawnKamikaze(alien.pos.x + alien.width - 20, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                alien.spawnTimer = 180; // 3 seconds interval
            } else {
                // DUAL SPAWN
                aliens.push(spawnKamikaze(alien.pos.x, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                aliens.push(spawnKamikaze(alien.pos.x + alien.width - 20, alien.pos.y + alien.height/2, alien.squadId || 'ms', alien.id));
                alien.spawnTimer = 240; // 4 seconds interval
            }
            playSound('BOSS_SPAWN');
        }
    }

    // SUPREME SPECIAL: Homing Missiles
    // Modified to be less frequent (every 7s), larger, slower (easier to shield), but visually imposing
    if (isSupreme && gameTime % 420 === 0) { 
        const pCx = player.pos.x + player.width / 2;
        const pCy = player.pos.y + player.height / 2;
        const dx = pCx - (alien.pos.x + alien.width / 2);
        const dy = pCy - (alien.pos.y + alien.height);
        const angle = Math.atan2(dy, dx);
        
        const speed = 1.8; // Slower than standard 2.5
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = 28; // Massive projectile

        bullets.push({
            id: `homing-${Math.random()}`,
            pos: { x: alien.pos.x + alien.width/2 - size/2, y: alien.pos.y + alien.height },
            width: size, height: size,
            color: '#c084fc', // Bright Purple
            active: true, velocity: vy, vx: vx, isEnemy: true,
            bulletType: 'HEAVY', variant: 'ENEMY_HOMING'
        });
        createExplosion(alien.pos.x + alien.width/2, alien.pos.y + alien.height, '#c084fc', 'MEDIUM');
    }
};
