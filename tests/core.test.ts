import { describe, it, expect } from 'vitest';
import { SpatialGrid } from '../systems/collisions/SpatialGrid';
import { checkCollision } from '../systems/collisions/utils';
import { AlienFactory } from '../systems/aliens/factory';
import { AlienEntity } from '../systems/aliens/entity';
import { Alien, AlienType } from '../types';
import { nextEntityId } from '../utils/id';

const makeAlien = (type: AlienType, x = 100, y = 100): Alien => ({
    id: nextEntityId(),
    pos: { x, y },
    width: 40,
    height: 40,
    color: '#fff',
    active: true,
    type,
    scoreValue: 100,
    hp: 10,
    maxHp: 10,
    movementType: 'CLASSIC' as any,
    startX: x,
    timeOffset: 0,
    vy: 1,
});

describe('SpatialGrid', () => {
    it('inserts and retrieves overlapping entities without duplicates', () => {
        const grid = new SpatialGrid(100);
        const a1 = makeAlien(AlienType.SCOUT, 90, 90); // spans cell (0,0)-(1,1)
        const a2 = makeAlien(AlienType.FIGHTER, 300, 300);
        grid.insert(a1);
        grid.insert(a2);

        const res = grid.retrieve({ pos: { x: 95, y: 95 }, width: 20, height: 20 });
        expect(res).toContain(a1);
        expect(res).not.toContain(a2);
        expect(res.length).toBe(1);
    });

    it('clears buckets properly', () => {
        const grid = new SpatialGrid(100);
        grid.insert(makeAlien(AlienType.SCOUT, 50, 50));
        grid.clear();
        const res = grid.retrieve({ pos: { x: 50, y: 50 }, width: 20, height: 20 });
        expect(res.length).toBe(0);
    });
});

describe('checkCollision', () => {
    it('detects overlapping AABBs and rejects separated ones', () => {
        const a = { pos: { x: 0, y: 0 }, width: 20, height: 20 };
        const b = { pos: { x: 10, y: 10 }, width: 20, height: 20 };
        const c = { pos: { x: 100, y: 100 }, width: 20, height: 20 };
        expect(checkCollision(a, b)).toBe(true);
        expect(checkCollision(a, c)).toBe(false);
    });
});

describe('AlienFactory POO', () => {
    it('creates AlienEntity instances for all migrated alien types', () => {
        const types = [
            AlienType.MOTHERSHIP,
            AlienType.SUPREME_MOTHERSHIP,
            AlienType.KAMIKAZE,
            AlienType.GUNNER,
            AlienType.ARTILLERY,
            AlienType.SUPREME_ARTILLERY,
            AlienType.ELITE,
            AlienType.UFO,
            AlienType.BOSS,
            AlienType.SNIPER,
            AlienType.SCOUT,
        ];
        for (const t of types) {
            const entity = AlienFactory.create(makeAlien(t));
            expect(entity).toBeInstanceOf(AlienEntity);
            expect(typeof entity.update).toBe('function');
        }
    });
});

describe('nextEntityId', () => {
    it('generates unique incremental string IDs', () => {
        const id1 = nextEntityId();
        const id2 = nextEntityId();
        expect(id1).not.toBe(id2);
        expect(Number(id2)).toBe(Number(id1) + 1);
    });
});
