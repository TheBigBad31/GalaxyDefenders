
import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH } from '../../constants';
import { createAlien } from './utils';

// 2. HEAVY ESCORT: A tanky unit protected by orbiting or close guards
export const spawnHeavyEscort = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `escort-${Date.now()}-${squadIndex}`;
    const startY = -200 - (squadIndex * 200);
    const centerX = Math.random() * (CANVAS_WIDTH - 300) + 150;

    // Heavy Unit Selection
    let heavyType = AlienType.MOTHERSHIP;

    // Rule: No Mothership in Phase 1 (Level 1) until Supreme Mothership is defeated (Level 2+)
    if (level === 1) {
        heavyType = AlienType.ELITE;
    } else {
        if (level >= 5 && Math.random() > 0.5) heavyType = AlienType.ARTILLERY;
        else if (level >= 3 && Math.random() > 0.7) heavyType = AlienType.GUNNER;
    }

    const heavy = createAlien(heavyType, centerX, startY, squadId, level, {
        movementType: heavyType === AlienType.GUNNER ? MovementType.TRACKING : MovementType.HOVER,
        spawnTimer: 120, // Init special timers
        burstRemaining: 0,
        burstTimer: 60
    });
    heavy.pos.x = centerX - heavy.width/2; // Center properly
    heavy.startX = centerX;
    squad.push(heavy);

    // Escort Guards
    // Level 1: 2 Fighters
    // Level 2+: 2 Snipers added
    const guardCount = level >= 2 ? 4 : 2;
    
    for (let i = 0; i < guardCount; i++) {
        // Guards act as individual units but spawn near the heavy
        const xDir = i % 2 === 0 ? -1 : 1;
        const xOffset = (heavy.width/2 + 40 + (Math.floor(i/2) * 40)) * xDir;
        const yOffset = 20;

        // Outer guards are Snipers (if count > 2 and i >= 2)
        let type = AlienType.FIGHTER;
        if (level >= 4 && i < 2) type = AlienType.REFLECTOR; // Upgrade inner guards later
        if (i >= 2) type = AlienType.SNIPER;

        squad.push(createAlien(type, centerX + xOffset, startY + yOffset, squadId, level, {
            movementType: MovementType.SINE, // They weave around (Snipers will ignore this and patrol top)
            startX: centerX + xOffset,
            timeOffset: i * 20
        }));
    }

    return squad;
};
