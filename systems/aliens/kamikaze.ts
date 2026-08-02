
import { AlienUpdateContext } from './types';
import { Alien } from '../../types';

export const updateKamikaze = (alien: Alien, ctx: AlienUpdateContext) => {
    const { player, gameTime, aliens } = ctx;
    const centerX = alien.pos.x + alien.width/2;
    const centerY = alien.pos.y + alien.height/2;

    if (alien.phase === 'PROTECT') {
        if (alien.protectTimer !== undefined) alien.protectTimer--;
        
        const parent = aliens.find(a => a.id === alien.parentAlienId && a.active);
        
        if (parent && (alien.protectTimer || 0) > 0) {
            const t = (gameTime + alien.timeOffset) * 0.05;
            const radius = 60 + Math.sin(t * 0.5) * 20;
            const targetX = (parent.pos.x + parent.width/2) + Math.cos(t) * radius - alien.width/2;
            const targetY = (parent.pos.y + parent.height/2) + Math.sin(t) * radius - alien.height/2;
            alien.pos.x += (targetX - alien.pos.x) * 0.1;
            alien.pos.y += (targetY - alien.pos.y) * 0.1;
        } else {
            alien.phase = 'TRACKING';
        }
    } else if (alien.phase === 'TRACKING') {
        const targetX = player.pos.x + player.width/2;
        const targetY = player.pos.y + player.height/2;
        const dist = Math.hypot(targetX - centerX, targetY - centerY);

        if (dist < 250) {
            alien.phase = 'LOCKED';
            const dx = targetX - centerX;
            const dy = targetY - centerY;
            const angle = Math.atan2(dy, dx);
            alien.lockedVector = { x: Math.cos(angle), y: Math.sin(angle) };
        } else {
            const dx = targetX - alien.pos.x;
            const dy = targetY - alien.pos.y;
            const angle = Math.atan2(dy, dx);
            const wiggle = Math.sin(gameTime * 0.2) * 2;
            const trackingSpeed = 1.5; 
            alien.pos.x += Math.cos(angle) * trackingSpeed + (Math.cos(angle + Math.PI/2) * wiggle * 0.5);
            alien.pos.y += Math.sin(angle) * trackingSpeed;
        }
    } else if (alien.phase === 'LOCKED' || alien.phase === 'CHARGE') {
       if (alien.lockedVector) {
           alien.pos.x += alien.lockedVector.x * 8.0;
           alien.pos.y += alien.lockedVector.y * 8.0;
       }
    }
};
