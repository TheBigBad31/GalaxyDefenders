
import { Alien, AlienType, MovementType } from '../../types';
import { CANVAS_WIDTH } from '../../constants';
import { createAlien } from '../formations/utils';
import { spawnUfo } from './factories';

// Import formations
import { spawnStrikeWing } from '../formations/strikeWing';
import { spawnHeavyEscort } from '../formations/heavyEscort';
import { spawnPhalanx } from '../formations/phalanx';
import { spawnSwarm } from '../formations/swarm';
import { spawnPincer } from '../formations/pincer';
import { spawnMeteorShower } from '../formations/meteorShower';
import { spawnHunterKiller } from '../formations/hunterKiller';

type SpawnStrategy = 'SWARM' | 'STRIKE' | 'ESCORT' | 'PHALANX' | 'PINCER' | 'METEOR' | 'HUNTER';

export const spawnWaveEnemies = (currentLevel: number, currentWave: number): Alien[] => {
    const allEnemies: Alien[] = [];

    // --- BOSS WAVE LOGIC (Wave 15) ---
    if (currentWave === 15) {
        let bossType: AlienType = AlienType.SUPREME_MOTHERSHIP;
        if (currentLevel === 2) bossType = AlienType.SUPREME_ARTILLERY;
        if (currentLevel >= 3) bossType = AlienType.BOSS;

        const boss = createAlien(bossType, CANVAS_WIDTH/2, -150, `boss-${Date.now()}`, currentLevel, {
            movementType: currentLevel === 1 ? MovementType.SINE : MovementType.HOVER,
            spawnTimer: 120,
            burstRemaining: 0,
            burstTimer: 120,
            spiralAngle: 0,
            gatlingTimer: 180,
            isGatlingFiring: true
        });
        boss.pos.x -= boss.width/2;
        boss.startX = boss.pos.x;
        allEnemies.push(boss);
        return allEnemies;
    }

    // --- WAVE COMPOSITION LOGIC ---
    let squadsToSpawn = 1;
    let strategy: SpawnStrategy = 'SWARM';
    let forcedElite = false;

    // Progression Design (15 Waves)
    if (currentWave <= 2) {
        strategy = 'SWARM';
    } 
    else if (currentWave === 3) {
        squadsToSpawn = 2;
        strategy = 'PINCER';
    }
    else if (currentWave === 4 || currentWave === 8) {
        strategy = 'STRIKE';
        forcedElite = true;
    }
    else if (currentWave === 5) {
        strategy = 'METEOR';
    }
    else if (currentWave === 6) {
        squadsToSpawn = 2;
        // Logic handled below
    }
    else if (currentWave === 7) {
        strategy = 'ESCORT';
    }
    else if (currentWave === 9) {
        strategy = 'HUNTER';
    }
    else if (currentWave === 10 || currentWave === 11) {
        squadsToSpawn = 3;
    }
    else if (currentWave === 12) {
        squadsToSpawn = 2;
        strategy = 'METEOR';
    }
    else if (currentWave >= 13 && currentWave <= 14) {
        squadsToSpawn = 4;
    }

    // Generate Squads
    for (let i = 0; i < squadsToSpawn; i++) {
        let currentStrategy: SpawnStrategy = strategy;

        // For multi-squad waves, mix it up
        if (squadsToSpawn > 1 && strategy !== 'METEOR' && strategy !== 'PINCER') {
            const roll = Math.random();
            if (currentWave >= 12) {
                // Chaos mode
                if (roll < 0.2) currentStrategy = 'ESCORT';
                else if (roll < 0.4) currentStrategy = 'HUNTER';
                else if (roll < 0.6) currentStrategy = 'PINCER';
                else if (roll < 0.8) currentStrategy = 'PHALANX';
                else currentStrategy = 'METEOR';
            } else {
                // Structured Multi-wave
                if (i === 0) currentStrategy = 'PHALANX'; 
                else if (i === 1) currentStrategy = 'HUNTER';
                else currentStrategy = 'SWARM'; 
            }
        }

        let squad: Alien[] = [];
        
        switch (currentStrategy) {
            case 'STRIKE':
                squad = spawnStrikeWing(currentLevel, i, forcedElite ? AlienType.ELITE : undefined);
                break;
            case 'ESCORT':
                squad = spawnHeavyEscort(currentLevel, i);
                break;
            case 'PHALANX':
                squad = spawnPhalanx(currentLevel, i);
                break;
            case 'PINCER':
                squad = spawnPincer(currentLevel, i);
                break;
            case 'METEOR':
                squad = spawnMeteorShower(currentLevel, i);
                break;
            case 'HUNTER':
                squad = spawnHunterKiller(currentLevel, i);
                break;
            case 'SWARM':
            default:
                squad = spawnSwarm(currentLevel, i);
                break;
        }
        
        allEnemies.push(...squad);
    }

    // --- Rare UFO Check ---
    if (currentLevel >= 4 && Math.random() < 0.12) {
        allEnemies.push(spawnUfo(currentLevel));
    }

    return allEnemies;
};
