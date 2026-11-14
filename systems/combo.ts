export interface ComboState {
    count: number;
    multiplier: number;
    timer: number;
    maxTimer: number;
}

export const COMBO_DURATION = 240; // ~4 seconds at 60Hz

const COMBO_TIERS: ReadonlyArray<{ minCount: number; multiplier: number }> = [
    { minCount: 22, multiplier: 8 },
    { minCount: 15, multiplier: 6 },
    { minCount: 10, multiplier: 4 },
    { minCount: 6, multiplier: 3 },
    { minCount: 3, multiplier: 2 },
    { minCount: 0, multiplier: 1 },
];

export function createComboState(maxTimer: number = COMBO_DURATION): ComboState {
    return {
        count: 0,
        multiplier: 1,
        timer: 0,
        maxTimer,
    };
}

export function getMultiplierForCount(count: number): number {
    for (const tier of COMBO_TIERS) {
        if (count >= tier.minCount) {
            return tier.multiplier;
        }
    }
    return 1;
}

export function registerComboKill(state: ComboState): ComboState {
    state.count += 1;
    state.multiplier = getMultiplierForCount(state.count);
    state.timer = state.maxTimer;
    return state;
}

export function registerComboDeflect(state: ComboState): ComboState {
    state.count += 2;
    state.multiplier = getMultiplierForCount(state.count);
    state.timer = state.maxTimer;
    return state;
}

export function registerComboHit(state: ComboState): ComboState {
    state.count = Math.floor(state.count / 2);
    state.multiplier = getMultiplierForCount(state.count);
    if (state.count === 0) {
        state.timer = 0;
    }
    return state;
}

export function updateCombo(state: ComboState, dt: number = 1): ComboState {
    if (state.count > 0 && state.timer > 0) {
        state.timer -= dt;
        if (state.timer <= 0) {
            state.count = 0;
            state.multiplier = 1;
            state.timer = 0;
        }
    }
    return state;
}

export function calculateComboScore(baseScore: number, state: ComboState): number {
    return Math.round(baseScore * state.multiplier);
}
