
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { CANVAS_WIDTH } from '../../constants';

export const updateUfo = (alien: Alien, ctx: AlienUpdateContext) => {
    // Movement: Patrol Ping Pong
    alien.pos.x += alien.vx || 0;
    
    if (alien.pos.x > CANVAS_WIDTH - alien.width && (alien.vx || 0) > 0) {
        alien.vx = -Math.abs(alien.vx || 0);
    }
    if (alien.pos.x < 0 && (alien.vx || 0) < 0) {
        alien.vx = Math.abs(alien.vx || 0);
    }
    
    // Hover Effect
    alien.pos.y = 180 + Math.sin(ctx.gameTime * 0.05) * 20;
    
    // UFO does not fire bullets itself, it reflects them (handled in collision)
};
