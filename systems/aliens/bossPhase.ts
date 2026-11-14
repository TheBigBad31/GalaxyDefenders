import { Alien, SoundType } from '../../types';

/**
 * Checks if a boss alien should transition from Phase 1 to Phase 2 (<= 50% HP).
 * Returns true on the exact frame the transition occurs.
 */
export function checkBossPhaseTransition(alien: Pick<Alien, 'hp' | 'maxHp' | 'bossPhase'>): boolean {
    const currentPhase = alien.bossPhase ?? 1;
    if (currentPhase === 1 && alien.maxHp > 0 && alien.hp <= alien.maxHp * 0.5) {
        alien.bossPhase = 2;
        return true;
    }
    return false;
}

export function triggerBossPhase2Effects(
    alien: Pick<Alien, 'pos' | 'width' | 'height'>,
    createExplosion: (x: number, y: number, color: string, size?: 'SMALL' | 'MEDIUM' | 'LARGE') => void,
    playSound: (type: SoundType) => void,
    onPhase2?: () => void
) {
    const cx = alien.pos.x + alien.width / 2;
    const cy = alien.pos.y + alien.height / 2;
    createExplosion(cx, cy, '#f97316', 'LARGE');
    playSound('EXPLOSION');
    if (onPhase2) onPhase2();
}
