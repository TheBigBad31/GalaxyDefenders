
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { COLORS } from '../../constants';
import { AlienEntity } from './entity';

export class BossAlien extends AlienEntity {
    constructor(props: Alien) {
        super(props);
        // Init boss specifics if needed
        if (this.gatlingTimer === undefined) {
            this.gatlingTimer = 180;
            this.isGatlingFiring = true;
        }
        if (this.spiralAngle === undefined) {
            this.spiralAngle = 0;
        }
    }

    update(ctx: AlienUpdateContext) {
        const { player, gameTime, bullets, playSound } = ctx;

        // 1. Movement: Tracking with inertia
        const targetX = player.pos.x + player.width / 2 - this.width / 2;
        const dx = targetX - this.pos.x;
        let vx = dx * 0.02; // Smooth tracking
        const maxSpeed = 1.2;
        if (vx > maxSpeed) vx = maxSpeed;
        if (vx < -maxSpeed) vx = -maxSpeed;
        this.pos.x += vx;
        
        this.pos.y = Math.min(50, this.pos.y + 0.5); // Move down to fight pos

        // 2. Attack: QUAD GATLING (Cycle: Firing / Cooldown)
        this.gatlingTimer!--;
        if (this.gatlingTimer! <= 0) {
            this.isGatlingFiring = !this.isGatlingFiring;
            // Toggle duration: 3s Fire (180), 2s Cooldown (120)
            this.gatlingTimer = this.isGatlingFiring ? 180 : 120;
        }

        if (this.isGatlingFiring && gameTime % 12 === 0) { 
            const gunOffsets = [10, 40, this.width - 40, this.width - 10]; // 4 distinct cannons
            gunOffsets.forEach(offset => {
                bullets.push({
                    id: `boss-gatling-${Math.random()}`,
                    pos: { x: this.pos.x + offset - 4, y: this.pos.y + this.height - 10 },
                    width: 8, height: 20,
                    color: '#f97316', // Orange bullet
                    active: true,
                    velocity: 4.5, // Fast heavy bullets
                    vx: 0,
                    isEnemy: true,
                    bulletType: 'HEAVY',
                    variant: 'ENEMY_NORMAL' 
                });
            });
            if (gameTime % 24 === 0) playSound('SHOOT');
        }

        // 3. Attack: SPIRAL (Continuous Double Stream)
        this.spiralAngle! += 0.05; // Rotate angle
        if (gameTime % 4 === 0) { // Fast emission for dense wall
            const centerX = this.pos.x + this.width / 2;
            const centerY = this.pos.y + this.height / 2;
            const speed = 3.0;
            // Emit 2 bullets opposite to each other
            for(let i=0; i<2; i++) {
                const angle = this.spiralAngle! + (Math.PI * i);
                bullets.push({
                    id: `boss-spiral-${Math.random()}`,
                    pos: { x: centerX, y: centerY },
                    width: 10, height: 10,
                    color: COLORS.enemyBulletDestructible,
                    active: true,
                    velocity: Math.sin(angle) * speed,
                    vx: Math.cos(angle) * speed,
                    isEnemy: true,
                    bulletType: 'DESTRUCTIBLE',
                    variant: 'ENEMY_DESTRUCTIBLE'
                });
            }
        }
    }
}
