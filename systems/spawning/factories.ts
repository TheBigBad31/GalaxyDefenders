
import { 
    Alien, 
    AlienType, 
    MovementType, 
    PowerUp, 
    PowerUpType,
    PowerUpCategory 
} from '../../types';
import { 
    CANVAS_WIDTH, 
    ALIEN_CONFIGS, 
    UFO_SIZE, 
    KAMIKAZE_SIZE, 
    COLORS, 
    POWERUP_SIZE, 
    POWERUP_CYCLE_TIME, 
    POWERUP_CYCLES 
} from '../../constants';
import { AlienFactory } from '../aliens/factory';

/**
 * Crée un Alien Kamikaze (poursuite/suicide)
 */
export const spawnKamikaze = (startX: number, startY: number, squadId: string, parentId?: string): Alien => {
    const config = ALIEN_CONFIGS[AlienType.KAMIKAZE];
    const props: Alien = {
        id: `kamikaze-${Date.now()}-${Math.random()}`,
        pos: { x: startX, y: startY },
        width: KAMIKAZE_SIZE.width,
        height: KAMIKAZE_SIZE.height,
        color: config.color,
        active: true,
        type: AlienType.KAMIKAZE,
        scoreValue: config.score,
        hp: config.hp,
        maxHp: config.hp,
        movementType: MovementType.HOMING,
        startX: startX,
        timeOffset: Math.random() * 100, 
        vy: config.speed || 2.0, 
        squadId,
        parentAlienId: parentId,
        phase: parentId ? 'PROTECT' : 'TRACKING',
        protectTimer: 180 
    };
    return AlienFactory.create(props);
};

/**
 * Crée un OVNI (Bonus rare)
 */
export const spawnUfo = (level: number): Alien => {
    const config = ALIEN_CONFIGS[AlienType.UFO];
    const levelMultiplier = 1 + (level * 0.1);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction === 1 ? -UFO_SIZE.width : CANVAS_WIDTH;
    const posY = 180; 

    const props: Alien = {
      id: `ufo-${Date.now()}`,
      pos: { x: startX, y: posY },
      width: UFO_SIZE.width,
      height: UFO_SIZE.height,
      color: config.color,
      active: true,
      type: AlienType.UFO,
      scoreValue: Math.floor(config.score * levelMultiplier),
      hp: config.hp,
      maxHp: config.hp,
      vy: 0,
      movementType: MovementType.STRAIGHT,
      vx: (config.speed || 0.8) * levelMultiplier * direction, 
      startX: startX,
      timeOffset: 0
    }; 
    return AlienFactory.create(props);
};

/**
 * Crée un PowerUp (Bonus) avec 2 "Faces" (Types)
 * Logique modifiée: Pour les armes, alterne entre une arme PRIMAIRE et une arme SECONDAIRE.
 */
export const createPowerUp = (x: number, y: number, specificType?: PowerUpType, specificCategory?: PowerUpCategory): PowerUp => {
    let faceA: PowerUpType;
    let faceB: PowerUpType;
    let category: PowerUpCategory;

    // Helpers
    const getPool = (cat: PowerUpCategory) => POWERUP_CYCLES[cat];
    const getRandom = (cat: PowerUpCategory) => {
        const p = getPool(cat);
        return p[Math.floor(Math.random() * p.length)];
    };
    const getCatFromType = (t: PowerUpType): PowerUpCategory => {
        if (POWERUP_CYCLES.PRIMARY.includes(t)) return 'PRIMARY';
        if (POWERUP_CYCLES.SECONDARY.includes(t)) return 'SECONDARY';
        return 'SUPPORT';
    };

    if (specificType) {
        faceA = specificType;
        const catA = getCatFromType(faceA);
        category = catA;
        
        if (catA === 'SUPPORT') {
             // Support cycles with other Support (if available) or itself
             const pool = getPool('SUPPORT');
             faceB = pool.find(t => t !== faceA) || faceA;
        } else {
             // Weapon cycles with other category weapon to force variety
             // e.g. If boss drops Primary, it will cycle to Secondary
             const otherCat = catA === 'PRIMARY' ? 'SECONDARY' : 'PRIMARY';
             faceB = getRandom(otherCat);
        }
    } else {
        // Random Generation
        let targetCategory: 'WEAPON' | 'SUPPORT' = 'WEAPON';
        
        if (specificCategory === 'SUPPORT') targetCategory = 'SUPPORT';
        else if (specificCategory) targetCategory = 'WEAPON'; // Explicit PRIMARY/SECONDARY request
        else {
             // Fully random: 20% Chance for Support items (Heal/Shield)
             targetCategory = Math.random() < 0.2 ? 'SUPPORT' : 'WEAPON';
        }

        if (targetCategory === 'SUPPORT') {
             category = 'SUPPORT';
             const pool = getPool('SUPPORT');
             faceA = pool[Math.floor(Math.random() * pool.length)];
             // Ensure faceB is different if possible
             faceB = pool.find(t => t !== faceA) || faceA;
        } else {
             // WEAPON: Mix Primary and Secondary
             const primary = getRandom('PRIMARY');
             const secondary = getRandom('SECONDARY');
             
             // If specific category requested, ensure faceA matches it initially
             if (specificCategory === 'SECONDARY') {
                 category = 'SECONDARY';
                 faceA = secondary;
                 faceB = primary;
             } else {
                 category = 'PRIMARY';
                 faceA = primary;
                 faceB = secondary;
             }
             
             // If completely random weapon drop, randomize start order (50/50)
             if (!specificCategory && Math.random() > 0.5) {
                  const temp = faceA;
                  faceA = faceB;
                  faceB = temp;
                  category = 'SECONDARY';
             }
        }
    }

    // Initial State
    const currentType = faceA;
    
    let color = COLORS.powerupBeam;
    if (currentType === PowerUpType.BEAM_GUN) color = COLORS.powerupBeam;
    else if (currentType === PowerUpType.SPREAD_GUN) color = COLORS.powerupSpread;
    else if (currentType === PowerUpType.MISSILE_PACK) color = COLORS.powerupMissile;
    else if (currentType === PowerUpType.SHIELD_REFILL) color = COLORS.powerupShield;
    else if (currentType === PowerUpType.FLAME_THROWER) color = COLORS.powerupFlame;
    else if (currentType === PowerUpType.SIDEWINDER) color = COLORS.powerupSidewinder;
    else if (currentType === PowerUpType.REPAIR_KIT) color = COLORS.powerupRepair;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 0.8;

    return {
      id: Math.random().toString(),
      pos: { x, y },
      width: POWERUP_SIZE.width,
      height: POWERUP_SIZE.height,
      color: color,
      type: currentType,
      category: category,
      faceA: faceA,
      faceB: faceB,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      active: true,
      timeOffset: Math.random() * 1000,
      lifeTime: 900, 
      maxLifeTime: 900,
      cycleTimer: POWERUP_CYCLE_TIME
    };
};
