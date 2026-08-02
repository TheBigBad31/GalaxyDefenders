import { PLAYER_SPRITES } from './sprites_lib/player';
import { ALIEN_SPRITES } from './sprites_lib/aliens';
import { BOSS_SPRITES } from './sprites_lib/bosses';
import { POWERUP_SPRITES } from './sprites_lib/powerups';
import { PROJECTILE_SPRITES } from './sprites_lib/projectiles';

// Exportation directe des données matricielles (Pixel Art Strings)
export const SPRITES: Record<string, string[]> = {
  ...PLAYER_SPRITES,
  ...ALIEN_SPRITES,
  ...BOSS_SPRITES,
  ...POWERUP_SPRITES,
  ...PROJECTILE_SPRITES
};