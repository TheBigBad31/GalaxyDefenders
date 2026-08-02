
import { Alien } from '../../types';
import { AlienUpdateContext } from './types';
import { AlienEntity } from './entity';

export const updateAlien = (alien: Alien, ctx: AlienUpdateContext) => {
    // Shared Logic: Return Timer (e.g. for loopers off screen)
    if (alien.returnTimer !== undefined && alien.returnTimer > 0) {
        alien.returnTimer--;
        return;
    }

    // Polymorphic Update
    // We cast to AlienEntity because the Spawner now guarantees all aliens are Entities.
    if (alien instanceof AlienEntity) {
        alien.update(ctx);
    } else {
        console.warn('Non-Entity Alien detected in update loop:', alien.type);
    }
};
