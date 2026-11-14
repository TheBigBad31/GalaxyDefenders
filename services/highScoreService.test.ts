// @ts-ignore — vitest types may not be in local node_modules
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    highScoreService,
    HIGHSCORE_STORAGE_KEY,
    HIGHSCORE_SCHEMA_VERSION,
} from './highScoreService';

function createMockLocalStorage() {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
            store[key] = String(value);
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
}

describe('highScoreService', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', createMockLocalStorage());
        highScoreService.clearAll();
    });

    it('returns an empty store when localStorage is empty', () => {
        const store = highScoreService.getStore();
        expect(store.version).toBe(HIGHSCORE_SCHEMA_VERSION);
        expect(store.top10).toEqual([]);
        expect(store.bestByShip).toEqual({});
        expect(highScoreService.getGlobalBest()).toBe(0);
    });

    it('falls back to empty store on invalid JSON in localStorage', () => {
        localStorage.setItem(HIGHSCORE_STORAGE_KEY, '{corrupted_json!!!');
        const store = highScoreService.getStore();
        expect(store.version).toBe(HIGHSCORE_SCHEMA_VERSION);
        expect(store.top10).toEqual([]);
        expect(store.bestByShip).toEqual({});
    });

    it('falls back to empty store on wrong schema version or non-object data', () => {
        localStorage.setItem(
            HIGHSCORE_STORAGE_KEY,
            JSON.stringify({ version: 999, top10: [{ score: 500 }] })
        );
        expect(highScoreService.getTop10()).toEqual([]);

        localStorage.setItem(HIGHSCORE_STORAGE_KEY, JSON.stringify('not-an-object'));
        expect(highScoreService.getTop10()).toEqual([]);
    });

    it('sorts Top 10 descending by score and caps at 10 entries', () => {
        for (let i = 1; i <= 12; i++) {
            highScoreService.recordScore({
                score: i * 1000,
                level: i,
                shipId: 'VIPER',
                pilotName: `Pilot ${i}`,
                pilotId: `pilot_${i}`,
                maxCombo: i,
                date: `2026-11-14T12:00:${String(i).padStart(2, '0')}Z`,
            });
        }

        const top10 = highScoreService.getTop10();
        expect(top10).toHaveLength(10);
        expect(top10[0].score).toBe(12000);
        expect(top10[9].score).toBe(3000);
        expect(highScoreService.getGlobalBest()).toBe(12000);
    });

    it('tracks bestByShip independently for each ship', () => {
        highScoreService.recordScore({
            score: 5000,
            level: 3,
            shipId: 'VIPER',
            pilotName: 'GUEST PILOT',
            pilotId: 'guest_pilot',
            maxCombo: 4,
            date: '2026-11-14T10:00:00Z',
        });

        highScoreService.recordScore({
            score: 3000,
            level: 2,
            shipId: 'VIPER',
            pilotName: 'GUEST PILOT',
            pilotId: 'guest_pilot',
            maxCombo: 2,
            date: '2026-11-14T10:05:00Z',
        });

        highScoreService.recordScore({
            score: 8500,
            level: 5,
            shipId: 'TITAN',
            pilotName: 'Sébastien',
            pilotId: 'google_123',
            maxCombo: 8,
            date: '2026-11-14T10:10:00Z',
        });

        const viperBest = highScoreService.getBestByShip('VIPER');
        const titanBest = highScoreService.getBestByShip('TITAN');
        const phantomBest = highScoreService.getBestByShip('PHANTOM');

        expect(viperBest?.score).toBe(5000);
        expect(viperBest?.level).toBe(3);
        expect(titanBest?.score).toBe(8500);
        expect(titanBest?.pilotName).toBe('Sébastien');
        expect(phantomBest).toBeNull();
    });

    it('returns accurate isNewRecord, isShipRecord, and rank', () => {
        const first = highScoreService.recordScore({
            score: 4000,
            level: 2,
            shipId: 'VIPER',
            pilotName: 'Alice',
            pilotId: 'alice_1',
            date: '2026-11-14T11:00:00Z',
        });
        expect(first.isNewRecord).toBe(true);
        expect(first.isShipRecord).toBe(true);
        expect(first.rank).toBe(1);

        const second = highScoreService.recordScore({
            score: 2500,
            level: 1,
            shipId: 'TITAN',
            pilotName: 'Bob',
            pilotId: 'bob_1',
            date: '2026-11-14T11:01:00Z',
        });
        expect(second.isNewRecord).toBe(false);
        expect(second.isShipRecord).toBe(true);
        expect(second.rank).toBe(2);
    });
});
