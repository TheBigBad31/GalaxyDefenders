import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH } from '../../constants';
import { createAlien } from './utils';

// 7. HUNTER KILLER: Small group of heavy units that track player X position
export const spawnHunterKiller = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `hunter-${Date.now()}-${squadIndex}`;
    const startY = -150 - (squadIndex * 200);
    
    // Only units that make sense to track
    const unitType = level >= 4 ? AlienType.GUNNER : AlienType.ASSAULT;
    
    const count = 3; 
    const gap = 120;
    const totalWidth = (count - 1) * gap;
    const startXCenter = CANVAS_WIDTH / 2;

    for (let i = 0; i < count; i++) {
        const xOffset = (i - (count-1)/2) * gap;
        const x = startXCenter + xOffset;

        squad.push(createAlien(unitType, x, startY, squadId, level, {
            movementType: MovementType.TRACKING,
            vy: 0.8 // Slightly slower to allow tracking to work
        }));
    }

    return squad;
};