
import { PLAYER } from './base';
import { PLAYER_LEFT } from './left';
import { PLAYER_RIGHT } from './right';

export const PLAYER_SPRITES: Record<string, string[]> = {
    PLAYER,
    PLAYER_LEFT,
    PLAYER_LEFT_HARD: PLAYER_LEFT, // Use the new banked sprite for hard turns too
    PLAYER_RIGHT,
    PLAYER_RIGHT_HARD: PLAYER_RIGHT // Use the new banked sprite for hard turns too
};
