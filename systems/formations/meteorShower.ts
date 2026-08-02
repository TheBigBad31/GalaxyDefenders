import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH, ALIEN_SIZE } from '../../constants';
import { createAlien } from './utils';

// 6. METEOR SHOWER: High speed, straight down, random X distribution
export const spawnMeteorShower = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `meteor-${Date.now()}-${squadIndex}`;
    
    const count = 8 + Math.floor(level); // Dense cloud
    const clampedCount = Math.min(count, 15);

    // Use Kamikaze sprites but Straight movement for "dumb falling debris" effect
    // Or Scouts for "fast dive"
    const unitType = level >= 5 ? AlienType.KAMIKAZE : AlienType.SCOUT;

    for (let i = 0; i < clampedCount; i++) {
        const x = Math.random() * (CANVAS_WIDTH - ALIEN_SIZE.width);
        // Staggered vertical start significantly to create a "rain" effect
        const y = -100 - (Math.random() * 600) - (squadIndex * 300);
        
        // Varying speeds
        const speedVar = 1.5 + Math.random() * 2.0;

        squad.push(createAlien(unitType, x, y, squadId, level, {
            movementType: MovementType.STRAIGHT,
            vy: speedVar, // Override speed calculation
            hp: 1, // Fragile (they are debris/fast movers)
            scoreValue: 50
        }));
    }

    return squad;
};