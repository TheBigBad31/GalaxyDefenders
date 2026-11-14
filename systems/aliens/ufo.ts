import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../../constants';

export const updateUfo = (alien: Alien, ctx: AlienUpdateContext) => {
    if (!alien.ufoState) alien.ufoState = 'PATROL';
    alien.beamTimer = (alien.beamTimer || 0) + 1;

    if (alien.ufoState === 'PATROL') {
        // Movement: Patrol Ping Pong
        alien.pos.x += alien.vx || 2;
        if (alien.pos.x > CANVAS_WIDTH - alien.width && (alien.vx || 0) > 0) {
            alien.vx = -Math.abs(alien.vx || 2);
        }
        if (alien.pos.x < 0 && (alien.vx || 0) < 0) {
            alien.vx = Math.abs(alien.vx || 2);
        }

        // Hover Effect
        alien.pos.y = 180 + Math.sin(ctx.gameTime * 0.05) * 20;

        if (alien.beamTimer >= 180) {
            alien.ufoState = 'CHARGE';
            alien.beamTimer = 0;
        }
    } else if (alien.ufoState === 'CHARGE') {
        if (alien.beamTimer >= 60) {
            alien.ufoState = 'BEAM';
            alien.beamTimer = 0;
        }
    } else if (alien.ufoState === 'BEAM') {
        if (alien.beamTimer === 1 || alien.beamTimer % 15 === 0) {
            ctx.bullets.push({
                id: `ufo-beam-${Date.now()}-${Math.random()}`,
                pos: { x: alien.pos.x + alien.width / 2 - 12, y: alien.pos.y + alien.height },
                width: 24,
                height: Math.max(40, CANVAS_HEIGHT - (alien.pos.y + alien.height)),
                velocity: 12,
                vx: 0,
                isEnemy: true,
                active: true,
                color: COLORS.enemyBulletFast,
                variant: 'UFO_BEAM',
                damage: 1
            });
        }
        if (alien.beamTimer >= 90) {
            alien.ufoState = 'PATROL';
            alien.beamTimer = 0;
        }
    }
};
