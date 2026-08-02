import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH } from '../../constants';
import { createAlien } from './utils';

// 3. PHALANX: A grid/wall of enemies moving together
export const spawnPhalanx = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `phalanx-${Date.now()}-${squadIndex}`;
    const startY = -100 - (squadIndex * 150);
    
    // Front line fodder
    let frontUnitType: AlienType = AlienType.FIGHTER;
    if (level >= 3) frontUnitType = AlienType.ASSAULT;
    
    const rows = 2;
    const cols = level >= 5 ? 4 : 3;
    const gap = 60;
    const totalWidth = (cols - 1) * gap;
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + (Math.random() - 0.5) * 200;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let type: AlienType = frontUnitType;
            // Back row is SNIPERS (Early introduction)
            if (r === 0) {
                type = AlienType.SNIPER;
            }

            squad.push(createAlien(type, startX + c * gap, startY - r * 50, squadId, level, {
                movementType: MovementType.STRAIGHT, // March forward
                vy: 0.5 + (level * 0.05) // Slow march
            }));
        }
    }

    return squad;
};
