
import { Alien, Bullet, Particle, Player, SoundType } from '../../types';

export interface BulletUpdateContext {
    bullet: Bullet;
    bullets?: Bullet[];
    gameTime: number;
    particles: Particle[];
    playSound: (type: SoundType) => void;
    player: Player;
    aliens?: Alien[];
}
