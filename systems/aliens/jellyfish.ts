import { AlienEntity } from './entity';
import { AlienUpdateContext } from './types';
import { COLORS } from '../../constants';

export class JellyfishAlien extends AlienEntity {
    private stateTimer = 0;

    update(ctx: AlienUpdateContext): void {
        this.timeOffset = (this.timeOffset || 0) + 0.05;
        this.pos.x = this.startX + Math.sin(this.timeOffset) * 35;
        this.pos.y += (this.vy || 0.8) * 0.6;

        this.stateTimer++;
        if (this.stateTimer >= 120) {
            this.stateTimer = 0;
            ctx.bullets.push({
                id: `jelly-pod-${Date.now()}-${Math.random()}`,
                pos: { x: this.pos.x + this.width / 2 - 6, y: this.pos.y + this.height },
                width: 12,
                height: 12,
                vx: 0,
                velocity: 2.2,
                isEnemy: true,
                active: true,
                color: COLORS.enemyBulletDestructible,
                variant: 'ENEMY_POD',
                life: 60,
                damage: 1
            });
        }
    }
}
