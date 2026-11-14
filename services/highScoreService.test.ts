import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    highScoreService,
    HIGHSCORES_STORAGE_KEY,
    HIGHSCORES_SCHEMA_VERSION,
} from './highScoreService';

function createMockStorage(): Storage {
    const store = new Map<string, string>();
    return {
        get length() {
            return store.size;
        },
        clear: () => store.clear(),
        getItem: (key: string) => store.get(key) ?? null,
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        removeItem: (key: string) => {
            store.delete(key);
        },
        setItem: (key: string, value: string) => {
            store.set(key, String(value));
        },
    };
}

describe('highScoreService', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', createMockStorage());
        highScoreService.clearAll();
    });

    it('sorts Top 10 descending by score and caps at 10 entries', () => {
        for (let i = 1; i <= 12; i++) {
            highScoreService.recordScore({
                score: i * 1000,
                level: i,
                shipId: 'VIPER',
                pilotName: `Pilot ${i}`,
                pilotId: `pilot_${i}`,
                maxCombo: i % 8 + 1,
                date: `2026-11-14T12:00:${String(i).padStart(2, '0')}Z`,
            });
        }

        const top10 = highScoreService.getTop10();
        expect(top10).toHaveLength(10);
        expect(top10[0].score).toBe(12000);
        expect(top10[0].pilotName).toBe('Pilot 12');
        expect(top10[9].score).toBe(3000);
    });

    it('tracks bestByShip independently for each ship and returns record flags', () => {
        const first = highScoreService.recordScore({
            score: 5000,
            level: 3,
            shipId: 'VIPER',
            pilotName: 'GUEST PILOT',
            pilotId: 'guest_pilot',
        });
        expect(first.isNewGlobalRecord).toBe(true);
        expect(first.isNewShipRecord).toBe(true);
        expect(first.rank).toBe(1);

        const secondShip = highScoreService.recordScore({
            score: 3000,
            level: 2,
            shipId: 'TITAN',
            pilotName: 'Sébastien',
            pilotId: 'google_123',
            maxCombo: 4,
        });
        expect(secondShip.isNewGlobalRecord).toBe(false);
        expect(secondShip.isNewShipRecord).toBe(true);
        expect(secondShip.rank).toBe(2);

        expect(highScoreService.getBestScore('VIPER')).toBe(5000);
        expect(highScoreService.getBestScore('TITAN')).toBe(3000);
        expect(highScoreService.getBestForShip('TITAN')?.pilotName).toBe('Sébastien');
        expect(highScoreService.getBestForShip('PHANTOM')).toBeNull();
    });

    it('falls back safely when localStorage contains invalid JSON or wrong schema version', () => {
        localStorage.setItem(HIGHSCORES_STORAGE_KEY, '{corrupted-json');
        expect(highScoreService.getTop10()).toEqual([]);
        expect(highScoreService.getBestScore('VIPER')).toBe(0);

        localStorage.setItem(
            HIGHSCORES_STORAGE_KEY,
            JSON.stringify({ version: HIGHSCORES_SCHEMA_VERSION + 99, top10: [{ score: 9999 }] })
        );
        expect(highScoreService.getTop10()).toEqual([]);

        const res = highScoreService.recordScore({
            score: 1500,
            level: 1,
            shipId: 'VIPER',
            pilotName: 'GUEST PILOT',
            pilotId: 'guest_pilot',
        });
        expect(res.isNewGlobalRecord).toBe(true);
        expect(highScoreService.getTop10()).toHaveLength(1);
    });

    it('does not record zero or negative scores', () => {
        const res = highScoreService.recordScore({
            score: 0,
            level: 1,
            shipId: 'VIPER',
            pilotName: 'GUEST PILOT',
            pilotId: 'guest_pilot',
        });
        expect(res.isNewGlobalRecord).toBe(false);
        expect(res.isNewShipRecord).toBe(false);
        expect(res.rank).toBeNull();
        expect(highScoreService.getTop10()).toEqual([]);
    });
});
