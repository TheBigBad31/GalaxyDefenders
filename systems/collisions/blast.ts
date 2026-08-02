
import { Alien } from '../../types';
import { CollisionContext } from './types';

export const handleBlastZones = (ctx: CollisionContext) => {
    const { blastZones, particles, handleAlienHit, createExplosion, grid } = ctx;

    blastZones.forEach(zone => {
        zone.life -= zone.decay;
        
        // Visual effects for the blast
        if (Math.random() > 0.5) {
             const angle = Math.random() * Math.PI * 2;
             const dist = Math.random() * zone.radius;
             particles.push({
                 id: 'plasma-' + Math.random(),
                 pos: { x: zone.x + Math.cos(angle) * dist, y: zone.y + Math.sin(angle) * dist },
                 velocity: { x: 0, y: -1 },
                 life: 0.6,
                 color: Math.random() > 0.5 ? '#facc15' : '#ef4444',
                 size: Math.random() * 4 + 2,
                 type: 'SMOKE',
                 decay: 0.05
             });
        }

        // Damage Tick
        zone.damageTimer--;
        if (zone.damageTimer <= 0) {
            zone.damageTimer = zone.damageInterval; 
            
            // Construct a temporary entity for the blast zone to query the grid
            // We use a square bounding box around the circle
            const blastArea = {
                pos: { x: zone.x - zone.radius, y: zone.y - zone.radius },
                width: zone.radius * 2,
                height: zone.radius * 2
            };

            const nearbyAliens = grid.retrieve(blastArea);

            nearbyAliens.forEach(entity => {
                const alien = entity as Alien;
                if (!alien.active) return;
                if (alien.returnTimer && alien.returnTimer > 0) return;

                const center = { x: alien.pos.x + alien.width/2, y: alien.pos.y + alien.height/2 };
                const dist = Math.hypot(center.x - zone.x, center.y - zone.y);
                
                if (dist < zone.radius) {
                    alien.hp -= zone.damage || 0.5; 
                    if (alien.hp <= 0) handleAlienHit(alien);
                    else createExplosion(center.x, center.y, '#ff0000', 'SMALL');
                }
            });
        }
    });

    // Cleanup dead zones
    for (let i = blastZones.length - 1; i >= 0; i--) {
        if (blastZones[i].life <= 0) blastZones.splice(i, 1);
    }
};
