
import { AlienUpdateContext } from './types';
import { CANVAS_WIDTH } from '../../constants';
import { AlienEntity } from './entity';

export class UfoAlien extends AlienEntity {
    update(ctx: AlienUpdateContext) {
        const alien = this;
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

}
