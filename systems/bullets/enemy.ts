
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
    } else if (bullet.variant === 'ENEMY_POD') {
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
        bullet.life = (bullet.life ?? 60) - 1;

        if (bullet.life <= 0) {
            bullet.active = false;
            if (ctx.bullets) {
                const cx = bullet.pos.x + bullet.width / 2;
                const cy = bullet.pos.y + bullet.height / 2;
                const speed = 4.5;
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    ctx.bullets.push({
                        id: `pod-frag-${Date.now()}-${i}-${Math.random()}`,
                        pos: { x: cx - 3, y: cy - 3 },
                        width: 6,
                        height: 6,
                        vx: Math.cos(angle) * speed,
                        velocity: Math.sin(angle) * speed,
                        isEnemy: true,
                        active: true,
                        color: bullet.color,
                        variant: 'ENEMY_FAST',
                        damage: 1
                    });
                }
            }
        }
    } else {
        // Standard Enemy Bullet
        bullet.pos.y += bullet.velocity;
        bullet.pos.x += bullet.vx;
    }
};
