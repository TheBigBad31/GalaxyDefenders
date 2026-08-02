
import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH, ALIEN_SIZE, ELITE_SIZE } from '../../constants';
import { createAlien } from './utils';

// 1. STRIKE WING: V-Formation with a Leader and Wingmen
export const spawnStrikeWing = (level: number, squadIndex: number, forcedLeaderType?: AlienType): Alien[] => {
    const squad: Alien[] = [];
    const squadId = `strike-${Date.now()}-${squadIndex}`;
    const startY = -150 - (squadIndex * 150);
    const centerX = Math.random() * (CANVAS_WIDTH - 200) + 100;

    // Leader Selection
    let leaderType = forcedLeaderType;
    if (!leaderType) {
        leaderType = level >= 4 ? AlienType.ELITE : (level >= 2 ? AlienType.ASSAULT : AlienType.FIGHTER);
    }
    
    // Inner Wingman Selection
    const innerWingmanType = level >= 3 ? AlienType.FIGHTER : AlienType.SCOUT;

    // Spawn Leader
    const leader = createAlien(leaderType, centerX - ALIEN_SIZE.width/2, startY, squadId, level, {
        movementType: MovementType.SWOOP,
        timeOffset: 0
    });
    // Adjust Leader X centering based on its actual width
    leader.pos.x = centerX - leader.width/2;
    leader.startX = centerX;
    squad.push(leader);

    // Spawn Wingmen (V Shape)
    const wingCount = 2; // Pairs
    for (let i = 1; i <= wingCount; i++) {
        const xOffset = i * 50;
        const yOffset = -i * 40;
        const timeLag = i * 15;

        // Determine Type: Outer pair (i=2) are SNIPERS for cover fire
        let type = innerWingmanType;
        if (i === 2) type = AlienType.SNIPER;

        // Left Wingman
        squad.push(createAlien(type, centerX - xOffset, startY + yOffset, squadId, level, {
            movementType: MovementType.SWOOP,
            startX: centerX - xOffset, // They maintain relative X
            timeOffset: timeLag
        }));

        // Right Wingman
        squad.push(createAlien(type, centerX + xOffset, startY + yOffset, squadId, level, {
            movementType: MovementType.SWOOP,
            startX: centerX + xOffset,
            timeOffset: timeLag
        }));
    }

    return squad;
};
