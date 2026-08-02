

import { 
    Player, 
    Alien, 
    Bullet, 
    Particle, 
    PowerUp, 
    PowerUpType,
    AlienType,
    BlastZone,
    Star,
    Nebula,
    GameState
} from '../types';
import { 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    COLORS, 
    PALETTES
} from '../constants';

// --- HELPERS ---

const drawCachedSprite = (
    ctx: CanvasRenderingContext2D, 
    cache: Record<string, HTMLCanvasElement>, 
    key: string, 
    x: number, 
    y: number, 
    w: number, 
    h: number
) => {
    if (cache[key]) {
        ctx.drawImage(cache[key], x, y, w, h);
        return;
    }
    if (key.includes('_')) {
        const baseKey = key.split('_')[0];
        if (cache[baseKey]) {
             ctx.drawImage(cache[baseKey], x, y, w, h);
             return;
        }
    }
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x, y, w, h);
};

// --- SUB-RENDERERS ---

const renderBackground = (ctx: CanvasRenderingContext2D, stars: Star[], nebulas: Nebula[]) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#050010');
    gradient.addColorStop(1, '#100025');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    nebulas.forEach(neb => {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.size, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.size);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    });

    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
};

const renderBlastZones = (ctx: CanvasRenderingContext2D, blastZones: BlastZone[], gameTime: number) => {
    blastZones.forEach(zone => {
        ctx.save();
        ctx.translate(zone.x, zone.y);
        const pulse = 1 + Math.sin(gameTime * 0.2) * 0.1;
        const currentRadius = zone.radius * pulse;

        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
        radGrad.addColorStop(0, '#fff7ed');
        radGrad.addColorStop(0.4, '#facc15');
        radGrad.addColorStop(0.7, '#ef4444');
        radGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = zone.life;
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
};

const renderBullet = (ctx: CanvasRenderingContext2D, b: Bullet, gameTime: number, player: Player, cache: Record<string, HTMLCanvasElement>) => {
    let jitterX = 0;
    let jitterY = 0;

    if (b.isEnemy && player.active && player.isShielding && player.shieldEnergy > 0) {
        const cx = b.pos.x + b.width / 2;
        const cy = b.pos.y + b.height / 2;
        const pcx = player.pos.x + player.width / 2;
        const pcy = player.pos.y + player.height / 2;
        const dist = Math.hypot(cx - pcx, cy - pcy);
        
        if (dist < 120) { 
             jitterX = (Math.random() - 0.5) * 6;
             jitterY = (Math.random() - 0.5) * 6;
        }
    }

    ctx.save();
    ctx.translate(jitterX, jitterY);

    if (b.variant === 'PLAYER_MISSILE') {
        ctx.shadowBlur = 5;
        ctx.shadowColor = PALETTES.MISSILE['3'];
        let rotation = b.missilePhase === 'DROP' ? b.vx * 0.2 : 0;
        ctx.translate(b.pos.x + b.width/2, b.pos.y + b.height/2);
        ctx.rotate(rotation);
        let spriteKey = 'MISSILE_SMALL';
        if (b.missileSize === 'MEDIUM') spriteKey = 'MISSILE_MEDIUM';
        if (b.missileSize === 'LARGE') spriteKey = 'MISSILE_LARGE';
        drawCachedSprite(ctx, cache, spriteKey, -b.width/2, -b.height/2, b.width, b.height);
        ctx.restore();
        return;
    }
    
    if (b.variant === 'PLAYER_FLAME') {
        ctx.globalAlpha = b.life || 1;
        ctx.fillStyle = COLORS.powerupFlame;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#facc15';
        ctx.beginPath();
        ctx.arc(b.pos.x + b.width/2, b.pos.y + b.height/2, b.width/2 + Math.random()*2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.pos.x + b.width/2, b.pos.y + b.height/2, b.width/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    if (b.variant === 'UFO_BEAM') {
        const grad = ctx.createLinearGradient(b.pos.x, 0, b.pos.x + b.width, 0);
        const pulse = Math.abs(Math.sin(gameTime * 0.8));
        grad.addColorStop(0, `rgba(248, 113, 113, 0)`);
        grad.addColorStop(0.2, `rgba(248, 113, 113, ${0.5 + pulse * 0.5})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`);
        grad.addColorStop(0.8, `rgba(248, 113, 113, ${0.5 + pulse * 0.5})`);
        grad.addColorStop(1, `rgba(248, 113, 113, 0)`);
        
        ctx.fillStyle = grad;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = '#ff0000';
        ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height);
        ctx.restore();
        return;
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;

    const cx = b.pos.x + b.width / 2;
    const cy = b.pos.y + b.height / 2;

    switch (b.variant) {
        case 'PLAYER_BEAM':
            ctx.shadowColor = COLORS.powerupBeam;
            ctx.fillStyle = COLORS.powerupBeam;
            ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(b.pos.x + 1, b.pos.y, b.width - 2, b.height);
            break;
        case 'PLAYER_SPREAD':
            ctx.translate(cx, cy);
            ctx.rotate(Math.atan2(b.velocity, b.vx) - Math.PI / 2);
            ctx.shadowColor = COLORS.powerupSpread;
            ctx.fillStyle = COLORS.powerupSpread;
            ctx.beginPath();
            ctx.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 1.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'PLAYER_SIDEWINDER':
            ctx.translate(cx, cy);
            ctx.rotate(gameTime * 0.2); 
            ctx.shadowColor = COLORS.powerupSidewinder;
            ctx.fillStyle = COLORS.powerupSidewinder;
            ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-2, 0, 3, 0, Math.PI * 2); ctx.fill();
            break;
        case 'ENEMY_NORMAL':
            drawCachedSprite(ctx, cache, 'BULLET_NORMAL', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_FAST':
            drawCachedSprite(ctx, cache, 'BULLET_FAST', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_HEAVY':
            drawCachedSprite(ctx, cache, 'BULLET_HEAVY', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'BOSS':
            ctx.shadowBlur = 15; ctx.shadowColor = '#ff0000';
            ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.arc(cx, cy, b.width / 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy, b.width / 2 - 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            if (gameTime % 4 < 2) ctx.fillRect(cx - 2, cy - 2, 4, 4);
            break;
        case 'ENEMY_SNIPER':
            drawCachedSprite(ctx, cache, 'BULLET_SNIPER', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_DESTRUCTIBLE':
            drawCachedSprite(ctx, cache, 'BULLET_DESTRUCTIBLE', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_GALAXY':
            drawCachedSprite(ctx, cache, 'BULLET_GALAXY', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_POD':
            drawCachedSprite(ctx, cache, 'BULLET_POD', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_HOMING':
            ctx.shadowBlur = 15 * (1.0 + Math.sin(gameTime * 0.2) * 0.3);
            drawCachedSprite(ctx, cache, 'BULLET_HOMING', b.pos.x, b.pos.y, b.width, b.height);
            ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.7;
            ctx.beginPath(); ctx.arc(cx, cy, b.width/4, 0, Math.PI * 2); ctx.fill();
            break;
        default:
            ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height);
            break;
    }
    ctx.restore();
};

const renderPlayer = (ctx: CanvasRenderingContext2D, player: Player, gameTime: number, cache: Record<string, HTMLCanvasElement>) => {
    if (!player.active) return;

    if (player.isShielding && player.shieldEnergy > 0) {
        const cx = player.pos.x + player.width/2;
        const cy = player.pos.y + player.height/2;
        const radius = (player.width / 2) * 1.5;

        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.shieldAura;
        ctx.beginPath();
        ctx.strokeStyle = COLORS.shieldAura;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.arc(cx, cy, radius, gameTime * 0.1, gameTime * 0.1 + Math.PI * 1.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#cffafe'; 
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.arc(cx, cy, radius + 4, -gameTime * 0.15, -gameTime * 0.15 + Math.PI);
        ctx.stroke();
        
        ctx.fillStyle = COLORS.shieldAura;
        ctx.globalAlpha = 0.1 + Math.sin(gameTime * 0.1) * 0.05;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    
    let spriteKey = 'PLAYER';
    if (player.lean < -1.5) spriteKey = 'PLAYER_LEFT_HARD';
    else if (player.lean < -0.5) spriteKey = 'PLAYER_LEFT';
    else if (player.lean > 1.5) spriteKey = 'PLAYER_RIGHT_HARD';
    else if (player.lean > 0.5) spriteKey = 'PLAYER_RIGHT';

    const palettePrefix = `PLAYER_${player.shipId}`;
    if (cache[`${palettePrefix}_${spriteKey.replace('PLAYER_', '')}`] || cache[`${palettePrefix}`]) {
        spriteKey = spriteKey.replace('PLAYER', palettePrefix);
    }

    ctx.translate(player.pos.x + player.width / 2, player.pos.y + player.height / 2);
    drawCachedSprite(ctx, cache, spriteKey, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
};

const renderAlien = (ctx: CanvasRenderingContext2D, alien: Alien, gameTime: number, player: Player, cache: Record<string, HTMLCanvasElement>) => {
    if (!alien.active) return;
    
    ctx.save();
    
    if (alien.type === AlienType.SNIPER && alien.aimAngle !== undefined) {
        const startX = alien.pos.x + alien.width / 2;
        const startY = alien.pos.y + alien.height;
        const endX = startX + Math.cos(alien.aimAngle) * 1000;
        const endY = startY + Math.sin(alien.aimAngle) * 1000;

        if (alien.sniperPhase === 'AIMING') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#ff0044';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3 + Math.sin(gameTime * 0.2) * 0.1;
            ctx.stroke();
            ctx.globalAlpha = 1;
        } else if (alien.sniperPhase === 'LOCKED') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.globalAlpha = Math.floor(gameTime / 4) % 2 === 0 ? 0.8 : 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = alien.color;
    
    let spriteKey = alien.type.toString();
    const hpRatio = alien.hp / alien.maxHp;
    if (hpRatio <= 0.20) spriteKey += '_CRITICAL';
    else if (hpRatio <= 0.40) spriteKey += '_HEAVY';
    else if (hpRatio <= 0.60) spriteKey += '_DAMAGED';
    else if (hpRatio <= 0.80) spriteKey += '_LIGHT';

    if (alien.type === AlienType.REFLECTOR && (alien.shieldHp || 0) > 0) {
        ctx.beginPath();
        ctx.arc(alien.pos.x + alien.width/2, alien.pos.y + alien.height/2, alien.width/2 + 5, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTES.REFLECTOR['3'];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    if (alien.type === AlienType.UFO) {
        const ufoCx = alien.pos.x + alien.width / 2;
        ctx.save();
        ctx.translate(ufoCx, alien.pos.y + alien.height - 5);
        ctx.strokeStyle = PALETTES.UFO['3'] || '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.shadowColor = PALETTES.UFO['1'];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.scale(1, 0.3);
        ctx.arc(0, 0, 15 + Math.sin(gameTime * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = PALETTES.UFO['1'] || '#22d3ee';
        ctx.arc(0, 0, 25, gameTime * 0.1, gameTime * 0.1 + Math.PI * 1.5);
        ctx.stroke();
        if (alien.ufoState === 'CHARGE') {
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 8 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    if (alien.type === AlienType.BOSS) ctx.shadowBlur = 20; 
    drawCachedSprite(ctx, cache, spriteKey, alien.pos.x, alien.pos.y, alien.width, alien.height);
    ctx.restore();
};

const renderPowerUps = (ctx: CanvasRenderingContext2D, powerUps: PowerUp[], gameTime: number, cache: Record<string, HTMLCanvasElement>) => {
    powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
        const scale = 1.0 + Math.sin(gameTime * 0.1 + p.timeOffset) * 0.1;
        ctx.scale(scale, scale);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; 
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        let spriteKey = 'POWERUP_BEAM';
        if (p.type === PowerUpType.SPREAD_GUN) spriteKey = 'POWERUP_SPREAD';
        else if (p.type === PowerUpType.SHIELD_REFILL) spriteKey = 'POWERUP_SHIELD';
        else if (p.type === PowerUpType.MISSILE_PACK) spriteKey = 'POWERUP_MISSILE';
        else if (p.type === PowerUpType.FLAME_THROWER) spriteKey = 'POWERUP_FLAME';
        else if (p.type === PowerUpType.SIDEWINDER) spriteKey = 'POWERUP_SIDEWINDER';
        else if (p.type === PowerUpType.REPAIR_KIT) spriteKey = 'POWERUP_REPAIR';
        
        drawCachedSprite(ctx, cache, spriteKey, -11, -11, 22, 22);
        ctx.restore();
    });
};

const renderParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        
        if (p.type === 'FLASH') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'SMOKE') {
            const s = p.size + (1 - p.life) * 10;
            ctx.fillRect(p.pos.x - s/2, p.pos.y - s/2, s, s);
        } else if (p.type === 'SPARK') {
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;
            ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size);
        } else {
            ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size);
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1;
};

const renderOverlays = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < CANVAS_HEIGHT; i += 2) {
        ctx.fillRect(0, i, CANVAS_WIDTH, 1);
    }
    const rad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT/3, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT);
    rad.addColorStop(0, 'rgba(0,0,0,0)');
    rad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

// --- MAIN RENDERER ---

export const drawGame = (
    ctx: CanvasRenderingContext2D,
    gameState: {
        player: Player;
        aliens: Alien[];
        bullets: Bullet[];
        powerUps: PowerUp[];
        particles: Particle[];
        blastZones: BlastZone[];
        stars: Star[];
        nebulas: Nebula[];
        ufo: Alien | null; 
        bossActive: boolean;
        gameTime: number;
        level: number;
        state: GameState;
    },
    cache: Record<string, HTMLCanvasElement>
) => {
    ctx.imageSmoothingEnabled = false;

    renderBackground(ctx, gameState.stars, gameState.nebulas);
    renderBlastZones(ctx, gameState.blastZones, gameState.gameTime);
    
    if (gameState.player.active) {
        gameState.bullets.forEach(b => renderBullet(ctx, b, gameState.gameTime, gameState.player, cache));
        renderPlayer(ctx, gameState.player, gameState.gameTime, cache);
    }
    
    gameState.aliens.forEach(a => renderAlien(ctx, a, gameState.gameTime, gameState.player, cache));
    renderPowerUps(ctx, gameState.powerUps, gameState.gameTime, cache);
    renderParticles(ctx, gameState.particles);
    renderOverlays(ctx);
};
