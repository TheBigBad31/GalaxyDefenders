import { describe, it, expect } from 'vitest';
import { checkBossPhaseTransition } from './bossPhase';

describe('Boss Phase Transition', () => {
    it('stays in phase 1 above 50% HP', () => {
        const boss = { hp: 501, maxHp: 1000, bossPhase: 1 as const };
        expect(checkBossPhaseTransition(boss)).toBe(false);
        expect(boss.bossPhase).toBe(1);
    });

    it('transitions to phase 2 at or below 50% HP exactly once', () => {
        const boss = { hp: 500, maxHp: 1000, bossPhase: 1 as 1 | 2 };
        expect(checkBossPhaseTransition(boss)).toBe(true);
        expect(boss.bossPhase).toBe(2);

        // Subsequent frames should not re-trigger the transition
        expect(checkBossPhaseTransition(boss)).toBe(false);
        expect(boss.bossPhase).toBe(2);
    });

    it('handles undefined initial bossPhase as phase 1', () => {
        const boss: { hp: number; maxHp: number; bossPhase?: 1 | 2 } = { hp: 400, maxHp: 1000 };
        expect(checkBossPhaseTransition(boss)).toBe(true);
        expect(boss.bossPhase).toBe(2);
    });
});
