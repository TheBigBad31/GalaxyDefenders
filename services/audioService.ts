
import { SoundType } from '../types';
import { initAudio, getAudioContext, getMasterGain, setVolume } from './audio/core';
import { playShoot, playBeam, playBombWhistle } from './audio/sfx/weapons';
import { playExplosion } from './audio/sfx/explosions';
import { playPowerUp, playGameOver, playBossSpawn } from './audio/sfx/ui';
import { playPlayerHit, playShield } from './audio/sfx/player';

export { initAudio, setVolume };

export const playSound = (type: SoundType) => {
    // 1. Force init if missing
    const ctx = getAudioContext();
    if (!ctx) {
        initAudio();
        // Retry get context after init attempt
        if (!getAudioContext()) return;
    }
    const audioCtx = getAudioContext()!;
    const masterGain = getMasterGain()!;

    if (!audioCtx || !masterGain) return;

    // 2. Force resume if suspended (Critical for Chrome/Edge)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    switch (type) {
        case 'SHOOT':
            playShoot(audioCtx, masterGain);
            break;

        case 'EXPLOSION':
            playExplosion(audioCtx, masterGain);
            break;

        case 'POWERUP':
            playPowerUp(audioCtx, masterGain);
            break;

        case 'PLAYER_HIT':
             playPlayerHit(audioCtx, masterGain);
             break;

        case 'BOMB':
             playBombWhistle(audioCtx, masterGain);
             // Layer explosion
             playExplosion(audioCtx, masterGain);
             break;
        
        case 'SHIELD':
             playShield(audioCtx, masterGain);
             break;
             
        case 'GAME_OVER':
             playGameOver(audioCtx, masterGain);
             break;
             
        case 'BOSS_SPAWN':
             playBossSpawn(audioCtx, masterGain);
             break;

        case 'BEAM_GUN':
             playBeam(audioCtx, masterGain);
             break;
    }
};
