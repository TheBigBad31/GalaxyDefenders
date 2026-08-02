
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { COLORS, SNIPER_AIM_DURATION, SNIPER_LOCK_DURATION, SNIPER_COOLDOWN } from '../../constants';
import { AlienEntity } from './entity';

export class SniperAlien extends AlienEntity {
    constructor(props: Alien) {
        super(props);
        if (!this.sniperPhase) {
            this.sniperPhase = 'AIMING';
            this.sniperTimer = SNIPER_AIM_DURATION;
        }
    }

    update(ctx: AlienUpdateContext) {
        const { player, bullets, createExplosion, playSound } = ctx;

        // Movement: Patrol top area
        const t = (ctx.gameTime + this.timeOffset) * 0.02;
        this.pos.x = this.startX + Math.sin(t * 0.2) * 30; // Slower Sine
        if (this.pos.y < 120) this.pos.y += this.vy;
        
        // SNIPER STATE MACHINE
        if (this.sniperPhase === 'AIMING') {
            // Track angle to player
            const centerX = this.pos.x + this.width / 2;
            const centerY = this.pos.y + this.height; 
            const targetX = player.pos.x + player.width / 2;
            const targetY = player.pos.y + player.height / 2;
            this.aimAngle = Math.atan2(targetY - centerY, targetX - centerX);
            
            if (this.sniperTimer) this.sniperTimer--;
            if (this.sniperTimer !== undefined && this.sniperTimer <= 0) {
                this.sniperPhase = 'LOCKED';
                this.sniperTimer = SNIPER_LOCK_DURATION;
                playSound('SHIELD'); // Warning sound
            }
        } else if (this.sniperPhase === 'LOCKED') {
            // Angle is frozen
            if (this.sniperTimer) this.sniperTimer--;
            if (this.sniperTimer !== undefined && this.sniperTimer <= 0) {
                // FIRE!
                this.sniperPhase = 'COOLDOWN';
                this.sniperTimer = SNIPER_COOLDOWN;
                
                const centerX = this.pos.x + this.width / 2;
                const centerY = this.pos.y + this.height;
                const speed = 12.0; // Very Fast
                const vx = Math.cos(this.aimAngle || 0) * speed;
                const vy = Math.sin(this.aimAngle || 0) * speed;

                bullets.push({
                    id: Math.random().toString(),
                    pos: { x: centerX - 2, y: centerY },
                    width: 4, height: 16,
                    color: COLORS.enemyBulletSniper,
                    active: true, velocity: vy, vx: vx, isEnemy: true,
                    bulletType: 'FAST', variant: 'ENEMY_SNIPER'
                });
                createExplosion(centerX, centerY, COLORS.enemyBulletSniper, 'SMALL');
                playSound('SHOOT');
            }
        } else if (this.sniperPhase === 'COOLDOWN') {
            if (this.sniperTimer) this.sniperTimer--;
            if (this.sniperTimer !== undefined && this.sniperTimer <= 0) {
                this.sniperPhase = 'AIMING';
                this.sniperTimer = SNIPER_AIM_DURATION;
            }
        }
    }
}
