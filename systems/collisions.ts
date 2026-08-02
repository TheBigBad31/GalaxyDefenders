
import { CollisionContext } from './collisions/types';
import { handleBlastZones } from './collisions/blast';
import { handlePowerUps } from './collisions/powerups';
import { handleShipCollisions } from './collisions/ships';
import { handleBulletCollisions } from './collisions/bullets';

export const handleCollisions = (ctx: CollisionContext) => {
    handleBlastZones(ctx);
    handlePowerUps(ctx);
    handleShipCollisions(ctx);
    handleBulletCollisions(ctx);
};
