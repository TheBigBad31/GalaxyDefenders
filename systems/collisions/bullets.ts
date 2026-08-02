
import { CollisionContext } from './types';
import { checkCollision } from './utils';
import { AlienType, Alien } from '../../types';
import { COLORS, PALETTES } from '../../constants';

const handleEnemyBullet = (bullet: any, ctx: CollisionContext) => {
    const { bullets, player, setHp, createExplosion, playSound, handlePlayerHit } = ctx;

    // 1. Destructible Bullets vs Player Bullets (Bullet Interception)
    if (bullet.variant === 'ENEMY_DESTRUCTIBLE') {
        bullets.forEach(pb => {
            if (!pb.active || pb.isEnemy) return;
            const dist = Math.hypot((bullet.pos.x + bullet.width/2) - (pb.pos.x + pb.width/2), (bullet.pos.y + bullet.height/2) - (pb.pos.y + pb.height/2));
            if (dist < 20) {
                bullet.active = false;
                pb.active = false; 
                createExplosion(bullet.pos.x + bullet.width/2, bullet.pos.y + bullet.height/2, '#fbbf24', 'SMALL');
                playSound('EXPLOSION');
            }
        });
        if (!bullet.active) return; 
    }

    // 2. Active Shield Deflection (Genji Deflect style)
    if (player.isShielding && player.shieldEnergy > 0) {
        const shieldDist = Math.hypot((bullet.pos.x + bullet.width/2) - (player.pos.x + player.width/2), (bullet.pos.y + bullet.height/2) - (player.pos.y + player.height/2));
        if (shieldDist < 50) {
            bullet.velocity = -bullet.velocity * 0.8; 
            bullet.vx = (Math.random() - 0.5) * 6; 
            bullet.isEnemy = false;
            bullet.color = '#00ffff'; 
            bullet.variant = 'PLAYER_BEAM'; 
            
            // Heal slightly on deflect
            if (player.hp < player.maxHp) {
                const healAmount = 5; 
                player.hp = Math.min(player.maxHp, player.hp + healAmount);
                setHp(player.hp);
            }
            createExplosion(bullet.pos.x, bullet.pos.y, '#4ade80', 'SMALL');
            return; 
        }
    }

    // 3. Player Hit
    if (checkCollision(bullet, player)) {
        bullet.active = false;
        createExplosion(player.pos.x + player.width/2, player.pos.y + player.height/2, PALETTES.PLAYER['4'], 'SMALL');
        handlePlayerHit(bullet.variant);
    }
};

const handlePlayerBullet = (bullet: any, ctx: CollisionContext) => {
    const { player, createExplosion, triggerMissileBlast, handleAlienHit, grid } = ctx;

    // OPTIMIZATION: Use Spatial Grid to retrieve only nearby aliens
    const nearbyAliens = grid.retrieve(bullet);

    for (const entity of nearbyAliens) {
        const alien = entity as Alien;
        if (!alien.active) continue;
        // Aliens with returnTimer > 0 are usually offscreen or in transition, often we skip them or not.
        // The original logic skipped them.
        if (alien.returnTimer && alien.returnTimer > 0) continue;

        if (checkCollision(bullet, alien)) {
            // A. Missile Logic
            if (bullet.variant === 'PLAYER_MISSILE') {
                bullet.active = false;
                triggerMissileBlast(bullet.pos.x + bullet.width/2, bullet.pos.y + bullet.height/2, bullet.missileSize || 'SMALL');
            } 
            // B. Flame Logic (Piercing/DoT)
            else if (bullet.variant === 'PLAYER_FLAME') {
                bullet.active = false;
                alien.hp -= bullet.damage || 0.25;
                createExplosion(bullet.pos.x, bullet.pos.y, COLORS.powerupFlame, 'SMALL');
                if (alien.hp <= 0) handleAlienHit(alien);
            }
            // C. Reflector Logic (Shield reflection)
            else if (alien.type === AlienType.REFLECTOR && (alien.shieldHp || 0) > 0) {
                const pCx = player.pos.x + player.width / 2;
                const pCy = player.pos.y + player.height / 2;
                const bCx = bullet.pos.x + bullet.width / 2;
                const bCy = bullet.pos.y + bullet.height / 2;

                const angle = Math.atan2(pCy - bCy, pCx - bCx);
                const speed = 5.0;

                bullet.vx = Math.cos(angle) * speed;
                bullet.velocity = Math.sin(angle) * speed;
                bullet.isEnemy = true;
                bullet.color = COLORS.enemyBulletFast; 
                bullet.variant = 'ENEMY_FAST';
                
                alien.shieldHp = (alien.shieldHp || 0) - 1;
                createExplosion(bullet.pos.x, bullet.pos.y, PALETTES.REFLECTOR['3'], 'SMALL');
            } 
            // D. Standard Hit
            else {
                bullet.active = false;
                alien.hp -= bullet.damage || 1; 
                if (alien.hp <= 0) handleAlienHit(alien);
            }
            
            break; // Bullet handles one alien at a time
        }
    }
};

export const handleBulletCollisions = (ctx: CollisionContext) => {
    ctx.bullets.forEach(bullet => {
        if (!bullet.active) return;
        if (bullet.isEnemy) {
            handleEnemyBullet(bullet, ctx);
        } else {
            handlePlayerBullet(bullet, ctx);
        }
    });
};
