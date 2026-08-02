
import { Alien, Bullet, Player, Particle, SoundType } from '../../types';

export interface AlienUpdateContext {
  gameTime: number;
  currentLevel: number;
  player: Player;
  aliens: Alien[]; // Référence au tableau d'aliens (pour spawn)
  bullets: Bullet[]; // Référence au tableau de balles (pour tirer)
  particles: Particle[]; // Pour les effets visuels
  playSound: (type: SoundType) => void;
  createExplosion: (x: number, y: number, color: string, intensity: 'SMALL' | 'MEDIUM' | 'LARGE' | 'MASSIVE') => void;
}
