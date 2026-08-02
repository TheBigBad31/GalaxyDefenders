
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
        bullet.width = 8 + Math.sin(gameTime * 0.5) * 4; 
    }
    else {
        // Beam, Spread, Satellite
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
    }
};
