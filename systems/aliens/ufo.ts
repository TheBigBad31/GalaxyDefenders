
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export const updateUfo = (alien: Alien, ctx: AlienUpdateContext) => {
    if (!alien.ufoState) {
        alien.ufoState = 'PATROL';
        alien.beamTimer = 0;
    }

    // Hover Effect
    alien.pos.y = 180 + Math.sin(ctx.gameTime * 0.05) * 20;

    if (alien.ufoState === 'PATROL') {
        // Movement: Patrol Ping Pong
        alien.pos.x += alien.vx || 0;

        if (alien.pos.x > CANVAS_WIDTH - alien.width && (alien.vx || 0) > 0) {
            alien.vx = -Math.abs(alien.vx || 0);
        }
        if (alien.pos.x < 0 && (alien.vx || 0) < 0) {
            alien.vx = Math.abs(alien.vx || 0);
        }

        alien.beamTimer = (alien.beamTimer || 0) + 1;
        if (alien.beamTimer >= 120) {
            alien.ufoState = 'CHARGE';
            alien.beamTimer = 60;
        }
    } else if (alien.ufoState === 'CHARGE') {
        alien.beamTimer = (alien.beamTimer ?? 60) - 1;
        if (alien.beamTimer <= 0) {
            alien.ufoState = 'BEAM';
            alien.beamTimer = 90;
            const beamWidth = 30;
            const beamY = alien.pos.y + alien.height;
            ctx.bullets.push({
                id: `ufo-beam-${Date.now()}-${Math.random()}`,
                pos: { x: alien.pos.x + alien.width / 2 - beamWidth / 2, y: beamY },
                width: beamWidth,
                height: CANVAS_HEIGHT - beamY,
                color: '#ef4444',
                active: true,
                velocity: 0,
                vx: 0,
                isEnemy: true,
                variant: 'UFO_BEAM',
                lifeTime: 90,
            });
        }
    } else if (alien.ufoState === 'BEAM') {
        alien.beamTimer = (alien.beamTimer ?? 90) - 1;
        if (alien.beamTimer <= 0) {
            alien.ufoState = 'PATROL';
            alien.beamTimer = 0;
        }
    }
};
