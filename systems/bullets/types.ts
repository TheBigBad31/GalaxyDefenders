
import { Bullet, Particle, Player, SoundType } from '../../types';

export interface BulletUpdateContext {
    bullet: Bullet;
    gameTime: number;
    particles: Particle[];
    playSound: (type: SoundType) => void;
    player: Player;
}
