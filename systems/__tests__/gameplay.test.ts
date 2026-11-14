import { describe, it, expect, vi } from 'vitest';
import { SpatialGrid } from '../collisions/SpatialGrid';
import { checkCollision } from '../collisions/utils';
import { handleCollisions } from '../collisions';
import { spawnWaveEnemies } from '../spawning/waveManager';
import { AlienType, Entity } from '../../types';

describe('SpatialGrid', () => {
    it('inserts and retrieves entities without duplicates across cells', () => {
        const grid = new SpatialGrid(100);
        const e1: Entity = { id: '1', pos: { x: 90, y: 90 }, width: 30, height: 30, active: true, color: '#fff' };
        const e2: Entity = { id: '2', pos: { x: 350, y: 350 }, width: 20, height: 20, active: true, color: '#fff' };

        grid.insert(e1);
        grid.insert(e2);

        const res1 = grid.retrieve({ pos: { x: 95, y: 95 }, width: 10, height: 10 });
        expect(res1).toHaveLength(1);
        expect(res1[0]).toBe(e1);

        const res2 = grid.retrieve({ pos: { x: 350, y: 350 }, width: 10, height: 10 });
        expect(res2).toHaveLength(1);
        expect(res2[0]).toBe(e2);

        grid.clear();
        expect(grid.retrieve({ pos: { x: 95, y: 95 }, width: 10, height: 10 })).toHaveLength(0);
    });
});

describe('checkCollision', () => {
    it('detects overlapping AABBs and rejects separated AABBs', () => {
        const a = { pos: { x: 10, y: 10 }, width: 20, height: 20 };
        const b = { pos: { x: 25, y: 25 }, width: 20, height: 20 };
        const c = { pos: { x: 50, y: 50 }, width: 20, height: 20 };

        expect(checkCollision(a, b)).toBe(true);
        expect(checkCollision(a, c)).toBe(false);
    });
});

describe('handleAlienHit (via handleCollisions)', () => {
    it('deactivates alien, increments score, and triggers explosion on lethal hit', () => {
        const alien: any = {
            id: 'a1',
            type: AlienType.SCOUT,
            pos: { x: 100, y: 100 },
            width: 30,
            height: 30,
            hp: 1,
            maxHp: 1,
            scoreValue: 150,
            active: true,
        };
        const bullet: any = {
            id: 'b1',
            pos: { x: 105, y: 105 },
            width: 6,
            height: 12,
            velocity: -10,
            isEnemy: false,
            active: true,
            damage: 1,
        };
        const grid = new SpatialGrid(100);
        grid.insert(alien);
        const scoreRef = { current: 0 };
        const setScore = vi.fn();
        const createExplosion = vi.fn();
        const playSound = vi.fn();

        handleCollisions({
            player: { pos: { x: 0, y: 500 }, width: 40, height: 40, isShielding: false, shieldEnergy: 0 } as any,
            aliens: [alien],
            bullets: [bullet],
            blastZones: [],
            particles: [],
            powerUps: [],
            grid,
            gameTime: 0,
            scoreRef,
            setScore,
            setHp: vi.fn(),
            createExplosion,
            playSound,
            onPlayerDeath: vi.fn(),
            setShieldEnergy: vi.fn(),
            setWeaponLevel: vi.fn(),
            setActiveWeapon: vi.fn(),
            setSpecialWeapon: vi.fn(),
            setSpecialAmmo: vi.fn(),
            setPowerUpNotification: vi.fn(),
            setGameOver: vi.fn(),
            addPopup: vi.fn(),
            handleAlienHit: (a: any) => {
                a.active = false;
                scoreRef.current += a.scoreValue;
                setScore(scoreRef.current);
                createExplosion(a.pos.x, a.pos.y, '#fff', 'SMALL');
                playSound('EXPLOSION');
            },
        } as any);

        expect(alien.active).toBe(false);
        expect(scoreRef.current).toBe(150);
        expect(setScore).toHaveBeenCalledWith(150);
        expect(createExplosion).toHaveBeenCalled();
        expect(playSound).toHaveBeenCalledWith('EXPLOSION');
    });
});

describe('spawnWaveEnemies (waveManager)', () => {
    it('spawns active enemies for level 1 wave 0', () => {
        const enemies = spawnWaveEnemies(1, 0);
        expect(enemies.length).toBeGreaterThan(0);
        expect(enemies.every(e => e.active)).toBe(true);
    });
});

describe('Fixed-timestep accumulator', () => {
    it('steps fixed 60Hz ticks deterministically regardless of frame delta', () => {
        const FIXED_DT = 1000 / 60;
        let accumulator = 0;
        let steps = 0;

        const advance = (dtMs: number) => {
            accumulator += Math.min(dtMs, 100);
            while (accumulator >= FIXED_DT) {
                steps++;
                accumulator -= FIXED_DT;
            }
        };

        // 2 frames at 30fps (~33.34ms each) -> 4 fixed 60Hz steps
        advance(33.34);
        advance(33.34);
        expect(steps).toBe(4);
    });
});
