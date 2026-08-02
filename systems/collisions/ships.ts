
import { CollisionContext } from './types';
import { checkCollision } from './utils';
import { AlienType, Alien } from '../../types';

export const handleShipCollisions = (ctx: CollisionContext) => {
    const { player, handleAlienHit, handlePlayerHit, createExplosion, grid } = ctx;

    if (!player.active) return;

    // OPTIMIZATION: Retrieve aliens near the player from the grid
    const nearbyAliens = grid.retrieve(player);

    nearbyAliens.forEach(entity => {
        const alien = entity as Alien;
        if (!alien.active) return;
        if (alien.returnTimer && alien.returnTimer > 0) return;

        if (checkCollision(alien, player)) {
            // Kill Alien
            alien.hp = 0;
            handleAlienHit(alien); 
            
            // Damage Player
            const damageSource = alien.type === AlienType.KAMIKAZE ? 'KAMIKAZE_COLLISION' : 'DEFAULT_COLLISION';
            handlePlayerHit(damageSource);

            // FX
            createExplosion(
                (alien.pos.x + player.pos.x) / 2, 
                (alien.pos.y + player.pos.y) / 2, 
                '#ff8800', 
                'LARGE'
            );
        }
    });
};
