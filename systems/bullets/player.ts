
import { BulletUpdateContext } from './types';

export const updatePlayerBullet = (ctx: BulletUpdateContext) => {
    const { bullet, gameTime } = ctx;
    
    if (bullet.variant === 'PLAYER_FLAME') {
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
        bullet.life = (bullet.life || 0) - 0.05; 
        if (bullet.life <= 0) bullet.active = false;
        bullet.pos.x += (Math.random() - 0.5) * 4;
    }
    else if (bullet.variant === 'PLAYER_SIDEWINDER') {
        bullet.pos.y += bullet.velocity; 
        bullet.pos.x += bullet.vx;
        if (bullet.homingStrength && ctx.aliens && ctx.aliens.length > 0) {
            let nearestX: number | null = null;
            let bestDistSq = Infinity;
            for (const alien of ctx.aliens) {
                if (!alien.active || alien.pos.y > bullet.pos.y) continue;
                const dx = (alien.pos.x + alien.width / 2) - bullet.pos.x;
                const dy = (alien.pos.y + alien.height / 2) - bullet.pos.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < bestDistSq) {
                    bestDistSq = d2;
                    nearestX = alien.pos.x + alien.width / 2;
                }
            }
            if (nearestX !== null) {
                const dx = nearestX - bullet.pos.x;
                bullet.pos.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.08, bullet.homingStrength);
            }
        }
        bullet.width = 8 + Math.sin(gameTime * 0.5) * 4; 
    }
    else {
        // Beam, Spread, Satellite
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
    }
};
