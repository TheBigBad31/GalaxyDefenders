
import { Alien, AlienType, MovementType } from '../../types';
import { 
    ALIEN_CONFIGS, 
    ALIEN_SIZE, 
    MOTHERSHIP_SIZE, 
    ARTILLERY_SIZE, 
    GUNNER_SIZE, 
    ELITE_SIZE, 
    KAMIKAZE_SIZE, 
    BOSS_SIZE,
    UFO_SIZE,
    DIFFICULTY_SCALE 
} from '../../constants';
import { AlienFactory } from '../aliens/factory';

export const createAlien = (type: AlienType, x: number, y: number, squadId: string, level: number, overrides: Partial<Alien> = {}): Alien => {
    const config = ALIEN_CONFIGS[type];
    const speedMult = 1 + (level * DIFFICULTY_SCALE.speedMultiplier);
    const hpAdd = Math.floor((level - 1) * DIFFICULTY_SCALE.hpMultiplier);
    const hp = Math.floor(config.hp + hpAdd);

    // Determine dimensions based on type
    let w = ALIEN_SIZE.width;
    let h = ALIEN_SIZE.height;
    if (type === AlienType.BOSS) { w = BOSS_SIZE.width; h = BOSS_SIZE.height; }
    else if (type === AlienType.UFO) { w = UFO_SIZE.width; h = UFO_SIZE.height; }
    else if (type === AlienType.SUPREME_MOTHERSHIP) { w = 120; h = 70; }
    else if (type === AlienType.SUPREME_ARTILLERY) { w = 100; h = 80; }
    else if (type === AlienType.MOTHERSHIP) { w = MOTHERSHIP_SIZE.width; h = MOTHERSHIP_SIZE.height; }
    else if (type === AlienType.ARTILLERY) { w = ARTILLERY_SIZE.width; h = ARTILLERY_SIZE.height; }
    else if (type === AlienType.GUNNER) { w = GUNNER_SIZE.width; h = GUNNER_SIZE.height; }
    else if (type === AlienType.ELITE) { w = ELITE_SIZE.width; h = ELITE_SIZE.height; }
    else if (type === AlienType.KAMIKAZE) { w = KAMIKAZE_SIZE.width; h = KAMIKAZE_SIZE.height; }

    const props: Alien = {
        id: `alien-${Date.now()}-${Math.random()}`,
        pos: { x, y },
        width: w, height: h,
        color: config.color,
        active: true,
        type: type,
        scoreValue: config.score,
        hp: hp,
        maxHp: hp,
        shieldHp: config.shieldHp ? config.shieldHp + Math.floor(level/2) : 0,
        movementType: MovementType.SINE, // Default
        startX: x,
        timeOffset: 0,
        vy: (config.speed || 1.0) * speedMult,
        squadId,
        ...overrides
    };

    // Use Factory to create the correct Class Instance
    return AlienFactory.create(props);
};
