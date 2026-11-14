
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
        if (bullet.homing && ctx.aliens && ctx.aliens.length > 0) {
            let nearest: typeof ctx.aliens[0] | null = null;
            let minDist = Infinity;
            const bx = bullet.pos.x + bullet.width / 2;
            const by = bullet.pos.y + bullet.height / 2;
            for (const a of ctx.aliens) {
                if (!a.active || a.pos.y > by) continue;
                const dx = (a.pos.x + a.width / 2) - bx;
                const dy = (a.pos.y + a.height / 2) - by;
                const dist = dx * dx + dy * dy;
                if (dist < minDist) {
                    minDist = dist;
                    nearest = a;
                }
            }
            if (nearest) {
                const targetX = nearest.pos.x + nearest.width / 2;
                const dx = targetX - bx;
                bullet.vx += Math.sign(dx) * 0.15;
                bullet.vx = Math.max(-4.5, Math.min(4.5, bullet.vx));
            }
        }
        bullet.pos.y += bullet.velocity; 
        bullet.pos.x += bullet.vx;
        bullet.width = 8 + Math.sin(gameTime * 0.5) * 4; 
    }
    else {
        // Beam, Spread, Satellite
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
    }
};
