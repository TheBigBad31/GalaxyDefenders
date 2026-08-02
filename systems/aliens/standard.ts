
import { AlienUpdateContext } from './types';
import { Alien, AlienType, MovementType } from '../../types';
import { ALIEN_CONFIGS, COLORS, CANVAS_WIDTH, DIFFICULTY_SCALE, BULLET_SIZE, PALETTES, CANVAS_HEIGHT } from '../../constants';
import { AlienEntity } from './entity';

// Utility helper reused within class
const applyMovement = (alien: AlienEntity, gameTime: number) => {
    // Limits
    let bottomLimit = CANVAS_HEIGHT - 100;
    if (alien.type === AlienType.REFLECTOR) bottomLimit = CANVAS_HEIGHT / 2;
    const topLimit = 50;

    // Movement Patterns
    const t = (gameTime + alien.timeOffset) * 0.02;
    
    if (alien.movementType === MovementType.SINE) {
        alien.pos.x = alien.startX + Math.sin(t) * 50;
        alien.pos.y += alien.vy;
    } 
    else if (alien.movementType === MovementType.ZIGZAG) {
        alien.pos.x = alien.startX + Math.sin(t * 2) * 30;
        alien.pos.y += alien.vy;
    } 
    else if (alien.movementType === MovementType.SWOOP) {
        const swoopT = (gameTime + alien.timeOffset) * 0.015; 
        alien.pos.x = alien.startX + Math.sin(swoopT) * 30; 
        alien.pos.y += Math.cos(swoopT * 2) * 0.5 + alien.vy; 
    }
    else if (alien.movementType === MovementType.STRAIGHT) {
        alien.pos.y += alien.vy;
    }

    // Bounce Logic (Vertical)
    if (alien.movementType !== MovementType.CROSS_SCREEN && alien.type !== AlienType.UFO) {
        if (alien.pos.y > bottomLimit && alien.vy > 0) alien.vy = -Math.abs(alien.vy);
        if (alien.pos.y > 0 && alien.pos.y < topLimit && alien.vy < 0) alien.vy = Math.abs(alien.vy);
    }
};

export class StandardAlien extends AlienEntity {
    
    update(ctx: AlienUpdateContext) {
        if (this.movementType === MovementType.CROSS_SCREEN) {
            this.updateStrafer(ctx);
        } else {
            // Standard Movement
            applyMovement(this, ctx.gameTime);

            // --- ASSAULT SPECIAL FIRE (Was Octopus) ---
            if (this.type === AlienType.ASSAULT) {
                this.updateAssaultFire(ctx);
            } else {
                // Generic Fire (Scout, Fighter, Reflector)
                this.updateStandardFire(ctx);
            }
        }
    }

    private updateStrafer(ctx: AlienUpdateContext) {
        this.pos.x += this.vx || 0;
        if (this.baseY !== undefined) {
            this.pos.y = this.baseY + Math.sin((ctx.gameTime + this.timeOffset) * 0.05) * 60;
        }
        const buffer = 100;
        if (this.vx! > 0 && this.pos.x > CANVAS_WIDTH + buffer) {
            this.returnTimer = 120;
            this.vx = -Math.abs(this.vx!);
            this.hasFired = false; 
        } else if (this.vx! < 0 && this.pos.x < -this.width - buffer) {
            this.returnTimer = 120;
            this.vx = Math.abs(this.vx!);
            this.hasFired = false; 
        }
        if (!this.hasFired) {
            const centerScreenX = CANVAS_WIDTH / 2;
            const alienCenterX = this.pos.x + this.width / 2;
            if (Math.abs(alienCenterX - centerScreenX) < Math.abs(this.vx || 5)) {
                 this.hasFired = true;
                 const pCx = ctx.player.pos.x + ctx.player.width / 2;
                 const pCy = ctx.player.pos.y + ctx.player.height / 2;
                 const dx = pCx - alienCenterX;
                 const dy = pCy - (this.pos.y + this.height);
                 const angle = Math.atan2(dy, dx);
                 const speed = 4.0;
                 const vx = Math.cos(angle) * speed;
                 const vy = Math.sin(angle) * speed;
                 ctx.bullets.push({
                    id: Math.random().toString(),
                    pos: { x: alienCenterX - 2, y: this.pos.y + this.height },
                    width: 4, height: 12,
                    color: COLORS.enemyBulletFast, 
                    active: true, velocity: vy, vx: vx, isEnemy: true,
                    bulletType: 'FAST', variant: 'ENEMY_FAST'
                 });
                 ctx.playSound('SHOOT');
            }
        }
    }

    private updateAssaultFire(ctx: AlienUpdateContext) {
        const config = ALIEN_CONFIGS.ASSAULT;
        const fireRateMult = Math.pow(DIFFICULTY_SCALE.fireRateMultiplier, ctx.currentLevel - 1);
        const chance = (config.fireChance || 0.003) * fireRateMult;
        
        if (this.pos.y > 0 && Math.random() < chance) {
            const pCx = ctx.player.pos.x + ctx.player.width / 2;
            const pCy = ctx.player.pos.y + ctx.player.height / 2;
            const dx = pCx - (this.pos.x + this.width / 2);
            const dy = pCy - (this.pos.y + this.height);
            const baseAngle = Math.atan2(dy, dx);
            
            // Shoot 2 spread bullets
            const angles = [baseAngle - 0.15, baseAngle + 0.15];
            angles.forEach(a => {
                const speed = config.bulletSpeed || 1.8;
                const vx = Math.cos(a) * speed;
                const vy = Math.sin(a) * speed;
                ctx.bullets.push({
                    id: Math.random().toString(),
                    pos: { x: this.pos.x + this.width / 2 - 4, y: this.pos.y + this.height },
                    width: 8, height: 16,
                    color: COLORS.enemyBulletHeavy,
                    active: true, velocity: vy, vx: vx, isEnemy: true,
                    bulletType: 'HEAVY', variant: 'ENEMY_HEAVY'
                });
            });
        }
    }

    private updateStandardFire(ctx: AlienUpdateContext) {
        const config = ALIEN_CONFIGS[this.type];
        const fireRateMult = Math.pow(DIFFICULTY_SCALE.fireRateMultiplier, ctx.currentLevel - 1);
        const chance = (config.fireChance || 0.001) * fireRateMult;

        if (this.pos.y > 0 && this.pos.y < CANVAS_HEIGHT && Math.random() < chance) {
            let bSpeed = config.bulletSpeed || 5;
            let bColor = COLORS.enemyBullet;
            let bType: any = 'NORMAL';
            let bSize = { ...BULLET_SIZE };
            let bVariant: any = 'ENEMY_NORMAL';

            if (this.type === AlienType.SCOUT) { 
                bType = 'FAST'; bColor = COLORS.enemyBulletFast; bVariant = 'ENEMY_FAST'; 
            } else if (this.type === AlienType.REFLECTOR) { 
                bColor = PALETTES.REFLECTOR['3']; 
                bVariant = 'ENEMY_GALAXY';
                bSize = { width: 14, height: 14 };
            }

            const bulletLevelSpeed = bSpeed + (ctx.currentLevel * 0.1);
            let vx = 0;
            let vy = bulletLevelSpeed;

            // Slight aim for standard enemies
            if (Math.random() < 0.3) {
                const dx = (ctx.player.pos.x + ctx.player.width/2) - (this.pos.x + this.width/2);
                vx = dx * 0.01; 
                if (vx > 2) vx = 2;
                if (vx < -2) vx = -2;
            }
            
            ctx.bullets.push({
                id: Math.random().toString(),
                pos: { x: this.pos.x + this.width / 2 - bSize.width / 2, y: this.pos.y + this.height },
                width: bSize.width, height: bSize.height, color: bColor, active: true,
                velocity: vy, vx: vx, isEnemy: true, bulletType: bType, variant: bVariant
            });
        }
    }
}
