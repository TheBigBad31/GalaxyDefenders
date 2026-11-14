import { describe, it, expect } from 'vitest';
import {
    createComboState,
    getMultiplierForCount,
    registerComboKill,
    registerComboDeflect,
    registerComboHit,
    updateCombo,
    calculateComboScore,
    COMBO_DURATION,
} from './combo';

describe('Combo System', () => {
    it('computes multiplier tiers from x1 to x8', () => {
        expect(getMultiplierForCount(0)).toBe(1);
        expect(getMultiplierForCount(2)).toBe(1);
        expect(getMultiplierForCount(3)).toBe(2);
        expect(getMultiplierForCount(6)).toBe(3);
        expect(getMultiplierForCount(10)).toBe(4);
        expect(getMultiplierForCount(15)).toBe(6);
        expect(getMultiplierForCount(22)).toBe(8);
        expect(getMultiplierForCount(50)).toBe(8);
    });

    it('increments combo on kill (+1) and deflect (+2) and refreshes timer', () => {
        const state = createComboState();
        registerComboKill(state);
        expect(state.count).toBe(1);
        expect(state.multiplier).toBe(1);
        expect(state.timer).toBe(COMBO_DURATION);

        registerComboDeflect(state);
        expect(state.count).toBe(3);
        expect(state.multiplier).toBe(2);
        expect(state.timer).toBe(COMBO_DURATION);
    });

    it('halves combo on player hit and resets timer if count reaches 0', () => {
        const state = createComboState();
        for (let i = 0; i < 6; i++) registerComboKill(state);
        expect(state.count).toBe(6);
        expect(state.multiplier).toBe(3);

        registerComboHit(state);
        expect(state.count).toBe(3);
        expect(state.multiplier).toBe(2);

        const lowState = createComboState();
        registerComboKill(lowState);
        registerComboHit(lowState);
        expect(lowState.count).toBe(0);
        expect(lowState.timer).toBe(0);
    });

    it('decays timer and resets combo when timer expires', () => {
        const state = createComboState(10);
        registerComboKill(state);
        updateCombo(state, 5);
        expect(state.timer).toBe(5);
        expect(state.count).toBe(1);

        updateCombo(state, 5);
        expect(state.timer).toBe(0);
        expect(state.count).toBe(0);
        expect(state.multiplier).toBe(1);
    });

    it('applies multiplier to score calculation', () => {
        const state = createComboState();
        for (let i = 0; i < 10; i++) registerComboKill(state);
        expect(state.multiplier).toBe(4);
        expect(calculateComboScore(100, state)).toBe(400);
    });
});
