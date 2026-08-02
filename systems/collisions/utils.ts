
import { AlienType } from '../../types';
import { PLAYER_BALANCE, ENEMY_BALANCE } from '../../constants';

export const getHitbox = (entity: any) => {
    let reductionX = 0;
    let reductionY = 0;

    // 1. PLAYER
    if (entity.id === 'player') {
         // High Res Sprite (64x64):
         // The visible ship area is roughly a cross shape.
         reductionX = PLAYER_BALANCE.HITBOX.X_REDUCTION; 
         reductionY = PLAYER_BALANCE.HITBOX.Y_REDUCTION; 
    }
    // 2. ALIENS
    else if (entity.type) {
        const t = entity.type as AlienType;
        if ([AlienType.SCOUT, AlienType.FIGHTER, AlienType.KAMIKAZE, AlienType.JELLYFISH, AlienType.ELITE].includes(t)) {
            // Agile/Small enemies: Generous hitbox reduction
            reductionX = ENEMY_BALANCE.ALIEN_HITBOX.SMALL_REDUCTION; 
            reductionY = ENEMY_BALANCE.ALIEN_HITBOX.SMALL_REDUCTION;
        } else if ([AlienType.BOSS, AlienType.MOTHERSHIP, AlienType.SUPREME_MOTHERSHIP, AlienType.ARTILLERY, AlienType.SUPREME_ARTILLERY, AlienType.UFO].includes(t)) {
            // Massive enemies: Less reduction
            reductionX = ENEMY_BALANCE.ALIEN_HITBOX.LARGE_REDUCTION;
            reductionY = ENEMY_BALANCE.ALIEN_HITBOX.LARGE_REDUCTION;
        } else {
            // Standard Heavy
            reductionX = ENEMY_BALANCE.ALIEN_HITBOX.DEFAULT_REDUCTION;
            reductionY = 0.20;
        }
    }
    // 3. PROJECTILES
    else if (entity.variant) {
        if (['ENEMY_HOMING', 'ENEMY_GALAXY', 'PLAYER_MISSILE', 'UFO_BEAM'].includes(entity.variant)) {
             reductionX = 0.0;
             reductionY = 0.0; 
        } else {
             // Standard bullets: 2px grace on edges
             return {
                 x: entity.pos.x + 2,
                 y: entity.pos.y + 2,
                 width: Math.max(1, entity.width - 4),
                 height: Math.max(1, entity.height - 4)
             };
        }
    }
    // 4. POWERUPS & OTHERS (Default AABB)
    else {
        return {
            x: entity.pos.x,
            y: entity.pos.y,
            width: entity.width,
            height: entity.height
        };
    }

    const rw = entity.width * reductionX;
    const rh = entity.height * reductionY;

    return {
        x: entity.pos.x + rw / 2,
        y: entity.pos.y + rh / 2,
        width: entity.width - rw,
        height: entity.height - rh
    };
};

export const checkCollision = (ent1: any, ent2: any) => {
    const b1 = getHitbox(ent1);
    const b2 = getHitbox(ent2);
    return (
        b1.x < b2.x + b2.width &&
        b1.x + b1.width > b2.x &&
        b1.y < b2.y + b2.height &&
        b1.y + b1.height > b2.y
    );
};
