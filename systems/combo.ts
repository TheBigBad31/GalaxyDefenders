export interface ComboState {
    count: number;
    multiplier: number;
    timer: number;
    maxTimer: number;
}

export const COMBO_MAX_TIMER = 240; // 4 seconds at 60Hz

export function getComboMultiplier(count: number): number {
    if (count >= 40) return 8;
    if (count >= 25) return 6;
    if (count >= 15) return 4;
    if (count >= 8) return 3;
    if (count >= 3) return 2;
    return 1;
}

export function createComboState(): ComboState {
    return {
        count: 0,
        multiplier: 1,
        timer: 0,
        maxTimer: COMBO_MAX_TIMER
    };
}

export function incrementCombo(state: ComboState, amount: number = 1): ComboState {
    const nextCount = state.count + amount;
    return {
        count: nextCount,
        multiplier: getComboMultiplier(nextCount),
        timer: COMBO_MAX_TIMER,
        maxTimer: COMBO_MAX_TIMER
    };
}

export function tickCombo(state: ComboState): ComboState {
    if (state.timer <= 0) return state;
    const nextTimer = state.timer - 1;
    if (nextTimer <= 0) {
        return {
            count: 0,
            multiplier: 1,
            timer: 0,
            maxTimer: state.maxTimer
        };
    }
    return {
        ...state,
        timer: nextTimer
    };
}

export function penalizeComboOnDamage(state: ComboState): ComboState {
    const nextCount = Math.floor(state.count / 2);
    return {
        count: nextCount,
        multiplier: getComboMultiplier(nextCount),
        timer: nextCount > 0 ? Math.min(state.timer, Math.floor(COMBO_MAX_TIMER / 2)) : 0,
        maxTimer: state.maxTimer
    };
}
