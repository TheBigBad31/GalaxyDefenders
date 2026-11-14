import { Alien, SoundType } from '../../types';

export function isBossPhase2(alien: Alien): boolean {
    return alien.maxHp > 0 && alien.hp <= alien.maxHp * 0.5;
}

export function checkBossPhaseTransition(
    alien: Alien,
    createExplosion?: (x: number, y: number, color: string, intensity: 'SMALL' | 'MEDIUM' | 'LARGE' | 'MASSIVE') => void,
    playSound?: (type: SoundType) => void
): boolean {
    if (alien.bossPhase !== 2 && isBossPhase2(alien)) {
        alien.bossPhase = 2;
        if (createExplosion) {
            createExplosion(
                alien.pos.x + alien.width / 2,
                alien.pos.y + alien.height / 2,
                '#f43f5e',
                'MASSIVE'
            );
        }
        playSound?.('EXPLOSION');
        return true;
    }
    return false;
}
