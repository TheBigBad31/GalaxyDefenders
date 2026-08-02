import { PLAYER } from './player/base';
import { PLAYER_LEFT } from './player/left';
import { PLAYER_RIGHT } from './player/right';

export const PLAYER_SPRITES: Record<string, string[]> = {
    PLAYER: PLAYER,
    PLAYER_LEFT: PLAYER_LEFT,
    PLAYER_RIGHT: PLAYER_RIGHT,
    // Re-use left/right sprites for hard turns (renderer can rotate them or use these as distinct keys)
    PLAYER_LEFT_HARD: PLAYER_LEFT, 
    PLAYER_RIGHT_HARD: PLAYER_RIGHT 
};