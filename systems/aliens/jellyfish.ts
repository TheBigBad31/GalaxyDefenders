import { AlienEntity } from './entity';
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { CANVAS_WIDTH } from '../../constants';

export class JellyfishAlien extends AlienEntity {
    private fireCooldown: number;

    constructor(props: Alien) {
        super(props);
        this.fireCooldown = 90 + Math.floor(Math.random() * 90);
    }

    update(ctx: AlienUpdateContext): void {
        // Gentle floating descent with sine wave
        this.pos.y += this.vy * 0.7;
        this.pos.x += Math.sin(ctx.gameTime * 0.04 + this.timeOffset) * 1.2;
        this.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.pos.x));

        this.fireCooldown--;
        if (this.fireCooldown <= 0 && this.pos.y > 0 && this.pos.y < 500) {
            this.fireCooldown = 140 + Math.floor(Math.random() * 60);
            ctx.bullets.push({
                id: `pod-${Date.now()}-${Math.random()}`,
                pos: { x: this.pos.x + this.width / 2 - 7, y: this.pos.y + this.height },
                width: 14,
                height: 14,
                color: '#a855f7',
                active: true,
                velocity: 2.2,
                vx: 0,
                isEnemy: true,
                variant: 'ENEMY_POD',
                lifeTime: 90,
            });
        }
    }
}
