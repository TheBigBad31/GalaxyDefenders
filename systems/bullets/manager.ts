
import { BulletUpdateContext } from './types';
import { updatePlayerMissile } from './missile';
import { updatePlayerBullet } from './player';
import { updateEnemyBullet } from './enemy';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export const updateBullet = (ctx: BulletUpdateContext) => {
    const { bullet } = ctx;
    
    if (bullet.variant === 'PLAYER_MISSILE') {
        updatePlayerMissile(ctx);
    } else if (bullet.isEnemy) {
        updateEnemyBullet(ctx);
    } else {
        updatePlayerBullet(ctx);
    }

    // Shared Bounds Check
    if (bullet.active) {
        if (bullet.pos.y < -50 || bullet.pos.y > CANVAS_HEIGHT + 50 ||
            bullet.pos.x < -50 || bullet.pos.x > CANVAS_WIDTH + 50) {
            bullet.active = false;
        }
    }
};
