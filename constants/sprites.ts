import { PLAYER_SPRITES } from './sprites_lib/player';
import { 
    PLAYER_MATTEWS_BASE, 
    PLAYER_TOPHE_BASE, 
    PLAYER_BOLTON_BASE, 
    PLAYER_JEFF_BASE, 
    PLAYER_MICKA_BASE, 
    PLAYER_BALI_BASE 
} from './sprites_lib/player_ships';
import { ALIEN_SPRITES } from './sprites_lib/aliens';
import { BOSS_SPRITES } from './sprites_lib/bosses';
import { POWERUP_SPRITES } from './sprites_lib/powerups';
import { PROJECTILE_SPRITES } from './sprites_lib/projectiles';

// Exportation directe des données matricielles (Pixel Art Strings)
export const SPRITES: Record<string, string[]> = {
  ...PLAYER_SPRITES,
  PLAYER_MATTEWS_BASE,
  PLAYER_TOPHE_BASE,
  PLAYER_BOLTON_BASE,
  PLAYER_JEFF_BASE,
  PLAYER_MICKA_BASE,
  PLAYER_BALI_BASE,
  ...ALIEN_SPRITES,
  ...BOSS_SPRITES,
  ...POWERUP_SPRITES,
  ...PROJECTILE_SPRITES
};