
import { BulletUpdateContext } from './types';

export const updateEnemyBullet = (ctx: BulletUpdateContext) => {
    const { bullet, player } = ctx;
    
    if (bullet.variant === 'ENEMY_HOMING') {
        // Simple Homing Logic
        const targetX = player.pos.x + player.width / 2;
        const targetY = player.pos.y + player.height / 2;
        const bulletX = bullet.pos.x + bullet.width / 2;
        const bulletY = bullet.pos.y + bullet.height / 2;
        
        const angleToPlayer = Math.atan2(targetY - bulletY, targetX - bulletX);
        
        // Current velocity angle
        const currentAngle = Math.atan2(bullet.velocity, bullet.vx);
        
        // Smoothly steer towards player (0.05 turn rate)
        let newAngle = currentAngle;
        const angleDiff = angleToPlayer - currentAngle;
        
        // Normalize angle diff
        let diff = angleDiff;
        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        newAngle += diff * 0.05;
        
        const speed = Math.hypot(bullet.vx, bullet.velocity);
        bullet.vx = Math.cos(newAngle) * speed;
        bullet.velocity = Math.sin(newAngle) * speed;

        bullet.pos.x += bullet.vx;
        bullet.pos.y += bullet.velocity;
    } else {
        // Standard Enemy Bullet
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
    }
};
