import { describe, it, expect, vi } from 'vitest';
import {
    COMBO_MAX_TIMER,
    createComboState,
    getComboMultiplier,
    incrementCombo,
    tickCombo,
    penalizeComboOnDamage
} from '../combo';
import { isBossPhase2, checkBossPhaseTransition } from '../aliens/bossPhase';
import { Alien, AlienType, MovementType } from '../../types';

describe('Combo & Multiplier System', () => {
    it('computes the expected multiplier tiers', () => {
        expect(getComboMultiplier(0)).toBe(1);
        expect(getComboMultiplier(2)).toBe(1);
        expect(getComboMultiplier(3)).toBe(2);
        expect(getComboMultiplier(8)).toBe(3);
        expect(getComboMultiplier(15)).toBe(4);
        expect(getComboMultiplier(25)).toBe(6);
        expect(getComboMultiplier(40)).toBe(8);
    });

    it('increments combo on kills and deflects (+2) and resets timer', () => {
        let state = createComboState();
        state = incrementCombo(state, 1);
        expect(state.count).toBe(1);
        expect(state.multiplier).toBe(1);
        expect(state.timer).toBe(COMBO_MAX_TIMER);

        state = incrementCombo(state, 2);
        expect(state.count).toBe(3);
        expect(state.multiplier).toBe(2);
        expect(state.timer).toBe(COMBO_MAX_TIMER);
    });

    it('decays timer and resets combo when timer expires', () => {
        let state = incrementCombo(createComboState(), 10);
        expect(state.multiplier).toBe(3);
        for (let i = 0; i < COMBO_MAX_TIMER; i++) {
            state = tickCombo(state);
        }
        expect(state.count).toBe(0);
        expect(state.multiplier).toBe(1);
        expect(state.timer).toBe(0);
    });

    it('halves combo count on hull damage', () => {
        let state = incrementCombo(createComboState(), 16);
        expect(state.multiplier).toBe(4);
        state = penalizeComboOnDamage(state);
        expect(state.count).toBe(8);
        expect(state.multiplier).toBe(3);
    });
});

describe('Boss Phase 2 Transition', () => {
    const makeBoss = (hp: number, maxHp: number): Alien => ({
        id: 'boss-1',
        pos: { x: 300, y: 50 },
        width: 120,
        height: 100,
        color: '#f97316',
        active: true,
        type: AlienType.BOSS,
        scoreValue: 5000,
        hp,
        maxHp,
        movementType: MovementType.HOVER,
        vy: 0,
        startX: 300,
        timeOffset: 0
    });

    it('detects phase 2 only at or below 50% HP', () => {
        expect(isBossPhase2(makeBoss(51, 100))).toBe(false);
        expect(isBossPhase2(makeBoss(50, 100))).toBe(true);
        expect(isBossPhase2(makeBoss(10, 100))).toBe(true);
    });

    it('triggers shockwave explosion and sound once on transition to phase 2', () => {
        const boss = makeBoss(50, 100);
        const createExplosion = vi.fn();
        const playSound = vi.fn();

        expect(checkBossPhaseTransition(boss, createExplosion, playSound)).toBe(true);
        expect(boss.bossPhase).toBe(2);
        expect(createExplosion).toHaveBeenCalledTimes(1);
        expect(playSound).toHaveBeenCalledWith('EXPLOSION');

        // Subsequent checks do not re-trigger
        expect(checkBossPhaseTransition(boss, createExplosion, playSound)).toBe(false);
        expect(createExplosion).toHaveBeenCalledTimes(1);
    });
});
