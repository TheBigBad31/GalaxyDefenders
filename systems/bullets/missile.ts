
import { BulletUpdateContext } from './types';

export const updatePlayerMissile = (ctx: BulletUpdateContext) => {
    const { bullet, particles, playSound } = ctx;
    if (!bullet.active) return;

    if (bullet.missilePhase === 'DROP') {
        bullet.pos.y += bullet.velocity; 
        bullet.pos.x += bullet.vx;
        
        // Air Resistance / Gravity Drag
        // Slows down the vertical drop speed to make it look like it's catching air before ignition
        bullet.velocity *= 0.92;

        bullet.missileTimer = (bullet.missileTimer || 0) - 1;
        if (bullet.missileTimer <= 0) {
            bullet.missilePhase = 'IGNITE';
            bullet.missileTimer = 5; 
            bullet.velocity = 0;
            bullet.vx = bullet.vx * 0.1; 
        }
    } else if (bullet.missilePhase === 'IGNITE') {
        bullet.missileTimer = (bullet.missileTimer || 0) - 1;
        particles.push({
            id: 'smoke-' + Math.random(),
            pos: { x: bullet.pos.x + bullet.width/2, y: bullet.pos.y + bullet.height },
            velocity: { x: (Math.random()-0.5), y: Math.random() },
            life: 0.5, color: '#94a3b8', size: 4, type: 'SMOKE'
        });
        if (bullet.missileTimer <= 0) {
            bullet.missilePhase = 'FLY';
            bullet.velocity = -2; 
            playSound('SHOOT'); 
        }
    } else if (bullet.missilePhase === 'FLY') {
        bullet.velocity -= 0.25; 
        if (bullet.velocity < -7) bullet.velocity = -7; 
        bullet.pos.y += bullet.velocity;
        particles.push({
            id: 'fire-' + Math.random(),
            pos: { x: bullet.pos.x + bullet.width/2, y: bullet.pos.y + bullet.height },
            velocity: { x: (Math.random()-0.5)*2, y: 4 },
            life: 0.4, color: '#f97316', size: 6, type: 'SPARK'
        });
    }
};
