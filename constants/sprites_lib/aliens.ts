
import { SCOUT_SPRITES } from './aliens/scout';
import { FIGHTER_SPRITES } from './aliens/fighter';
import { ASSAULT_SPRITES } from './aliens/assault';
import { REFLECTOR_SPRITES } from './aliens/reflector';
import { SNIPER_SPRITES } from './aliens/sniper';
import { GUNNER_SPRITES } from './aliens/gunner';
import { ARTILLERY_SPRITES } from './aliens/artillery';
import { KAMIKAZE_SPRITES } from './aliens/kamikaze';
import { ELITE_SPRITES } from './aliens/elite';
import { JELLYFISH_SPRITES } from './aliens/jellyfish';
import { UFO_SPRITES } from './aliens/ufo';

export const ALIEN_SPRITES: Record<string, string[]> = {
  ...SCOUT_SPRITES,
  ...FIGHTER_SPRITES,
  ...ASSAULT_SPRITES,
  ...REFLECTOR_SPRITES,
  ...SNIPER_SPRITES,
  ...GUNNER_SPRITES,
  ...ARTILLERY_SPRITES,
  ...KAMIKAZE_SPRITES,
  ...ELITE_SPRITES,
  ...JELLYFISH_SPRITES,
  ...UFO_SPRITES
};
