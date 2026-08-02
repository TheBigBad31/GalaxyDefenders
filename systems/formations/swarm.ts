import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH } from '../../constants';
import { createAlien } from './utils';

// 4. SWARM: Chaotic, organic movement (Classic)
export const spawnSwarm = (level: number, squadIndex: number): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `swarm-${Date.now()}-${squadIndex}`;
    const patterns = ['SNAKE', 'SPREAD_WAVE', 'CROSS'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Unit Pool
    const pool = [AlienType.SCOUT];
    if (level >= 2) pool.push(AlienType.FIGHTER);
    if (level >= 4) pool.push(AlienType.JELLYFISH);
    
    const type = pool[Math.floor(Math.random() * pool.length)];
    
    let count = 5 + Math.floor(level / 2);
    if (count > 10) count = 10;

    const squadCenterX = Math.random() * (CANVAS_WIDTH - 200) + 100;
    const startY = -50 - (squadIndex * 100);

    for (let i = 0; i < count; i++) {
        let x = squadCenterX;
        let y = startY;
        let timeOffset = i * 10;
        let moveType = MovementType.SINE;
        let startXVal = x;

        if (pattern === 'SNAKE') {
            moveType = MovementType.SINE;
            y = startY - (i * 45);
            timeOffset = i * 25;
        } else if (pattern === 'SPREAD_WAVE') {
            moveType = MovementType.ZIGZAG;
            x = squadCenterX - ((count * 35)/2) + (i * 35);
            y = startY - (i % 2) * 20; 
            timeOffset = i * 20;
            startXVal = x;
        } else if (pattern === 'CROSS') {
            moveType = MovementType.CROSS_SCREEN;
            // Half form left, half from right
            const side = i % 2 === 0 ? -1 : 1;
            x = side === -1 ? -50 : CANVAS_WIDTH + 50;
            y = 50 + (i * 40); // Stagger height
            startXVal = x; // BaseX for Cross Screen logic is unused but we set pos.x
        }

        const alien = createAlien(type, x, y, squadId, level, {
            movementType: moveType,
            startX: startXVal,
            baseY: y, // For cross screen ref
            timeOffset: timeOffset,
            vx: pattern === 'CROSS' ? (i % 2 === 0 ? 3 : -3) : 0 // Set velocity for strafers
        });
        squad.push(alien);
    }

    return squad;
};