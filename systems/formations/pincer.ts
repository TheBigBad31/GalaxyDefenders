import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH, ALIEN_SIZE } from '../../constants';
import { createAlien } from './utils';

// 5. PINCER: Enemies spawn at corners and swoop inward to cross in the center
export const spawnPincer = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `pincer-${Date.now()}-${squadIndex}`;
    const startY = -100 - (squadIndex * 150);
    
    // Fast agile units preferred
    let unitType = AlienType.FIGHTER;
    if (level >= 3) unitType = AlienType.SCOUT;
    if (level >= 6) unitType = AlienType.JELLYFISH;

    const count = 4 + Math.floor(level / 3); // Per side
    const maxCount = 4;
    const actualCount = Math.min(count, maxCount);

    for (let i = 0; i < actualCount; i++) {
        const timeOffset = i * 20;
        const yOffset = i * 40;

        // Left Wing (Swoops Right)
        squad.push(createAlien(unitType, 20 + (i * 20), startY - yOffset, squadId, level, {
            movementType: MovementType.SWOOP,
            startX: 50, // Bias start for swoop calc
            timeOffset: timeOffset,
            vx: 1.5 // Bias direction
        }));

        // Right Wing (Swoops Left)
        squad.push(createAlien(unitType, CANVAS_WIDTH - 60 - (i * 20), startY - yOffset, squadId, level, {
            movementType: MovementType.SWOOP,
            startX: CANVAS_WIDTH - 50,
            timeOffset: timeOffset,
            vx: -1.5 // Bias direction
        }));
    }

    return squad;
};