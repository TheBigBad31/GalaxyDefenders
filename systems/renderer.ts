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
import { HD_SHIPS, HD_ENEMIES, getTransparentImageCanvas } from '../utils/graphics';

// --- OFFSCREEN CACHES & HELPERS ---

const hexToRgba = (color: string, alpha: number): string => {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const full = hex.length === 3
            ? hex.split('').map(c => c + c).join('')
            : hex;
        const r = parseInt(full.slice(0, 2), 16) || 0;
        const g = parseInt(full.slice(2, 4), 16) || 0;
        const b = parseInt(full.slice(4, 6), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    return color;
};

let bgCacheCanvas: HTMLCanvasElement | null = null;
const getBackgroundCanvas = (): HTMLCanvasElement => {
    if (bgCacheCanvas) return bgCacheCanvas;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#03000a');
        gradient.addColorStop(0.5, '#0b001a');
        gradient.addColorStop(1, '#15002e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    bgCacheCanvas = canvas;
    return canvas;
};

const nebulaCache: Record<string, HTMLCanvasElement> = {};
const getNebulaCanvas = (color: string, size: number): HTMLCanvasElement => {
    const key = `${color}_${size}`;
    if (nebulaCache[key]) return nebulaCache[key];
    const d = Math.ceil(size * 2);
    const canvas = document.createElement('canvas');
    canvas.width = d;
    canvas.height = d;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(size, size, 0, size, size, size);
        grad.addColorStop(0, color);
        grad.addColorStop(0.6, hexToRgba(color, 0.3));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d, d);
    }
    nebulaCache[key] = canvas;
    return canvas;
};

let overlayCacheCanvas: HTMLCanvasElement | null = null;
const getOverlayCanvas = (): HTMLCanvasElement => {
    if (overlayCacheCanvas) return overlayCacheCanvas;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // CRT Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
            ctx.fillRect(0, i, CANVAS_WIDTH, 1);
        }
        // Deep Space Radial Vignette
        const rad = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 3,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT
        );
        rad.addColorStop(0, 'rgba(0,0,0,0)');
        rad.addColorStop(1, 'rgba(3,0,12,0.65)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    overlayCacheCanvas = canvas;
    return canvas;
};

const glowCache: Record<string, HTMLCanvasElement> = {};
const getGlowSprite = (color: string): HTMLCanvasElement => {
    if (glowCache[color]) return glowCache[color];
    const size = 64;
    const half = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, hexToRgba(color, 0.9));
        grad.addColorStop(0.35, hexToRgba(color, 0.45));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }
    glowCache[color] = canvas;
    return canvas;
};

const drawGlow = (
    ctx: CanvasRenderingContext2D,
    color: string,
    cx: number,
    cy: number,
    radius: number,
    alpha = 1
) => {
    const prevComp = ctx.globalCompositeOperation;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = prevAlpha * alpha;
    const sprite = getGlowSprite(color);
    ctx.drawImage(sprite, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.globalCompositeOperation = prevComp;
    ctx.globalAlpha = prevAlpha;
};

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

const renderBackground = (ctx: CanvasRenderingContext2D, stars: Star[], nebulas: Nebula[], gameTime: number) => {
    // Cached Deep Space Cyberpunk Synthwave Gradient
    ctx.drawImage(getBackgroundCanvas(), 0, 0);

    // Cached Glowing Nebulae
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < nebulas.length; i++) {
        const neb = nebulas[i];
        const nebCanvas = getNebulaCanvas(neb.color, neb.size);
        ctx.drawImage(nebCanvas, neb.x - neb.size, neb.y - neb.size);
    }

    // Twinkling Starfield (no save/restore or shadowBlur)
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const pulse = Math.sin(gameTime * 0.05 + star.x) * 0.3 + 0.7;
        ctx.globalAlpha = star.alpha * pulse;
        if (star.size > 2) {
            ctx.fillStyle = star.speed > 2 ? '#cffafe' : '#fae8ff';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
};

const renderBlastZones = (ctx: CanvasRenderingContext2D, blastZones: BlastZone[], gameTime: number) => {
    blastZones.forEach(zone => {
        ctx.save();
        ctx.translate(zone.x, zone.y);
        const pulse = 1 + Math.sin(gameTime * 0.2) * 0.1;
        const currentRadius = zone.radius * pulse;

        ctx.globalAlpha = zone.life;
        drawGlow(ctx, '#ef4444', 0, 0, currentRadius * 1.15, 0.85);
        drawGlow(ctx, '#f97316', 0, 0, currentRadius * 0.85, 0.9);
        drawGlow(ctx, '#facc15', 0, 0, currentRadius * 0.5, 0.95);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.22, 0, Math.PI * 2);
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
        let rotation = b.missilePhase === 'DROP' ? b.vx * 0.2 : 0;
        ctx.translate(b.pos.x + b.width/2, b.pos.y + b.height/2);
        ctx.rotate(rotation);
        drawGlow(ctx, '#f87171', 0, 0, Math.max(b.width, b.height) * 0.85, 0.55);
        let spriteKey = 'MISSILE_SMALL';
        if (b.missileSize === 'MEDIUM') spriteKey = 'MISSILE_MEDIUM';
        if (b.missileSize === 'LARGE') spriteKey = 'MISSILE_LARGE';
        drawCachedSprite(ctx, cache, spriteKey, -b.width/2, -b.height/2, b.width, b.height);
        
        // Thruster smoke trail for player missile
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-2, b.height/2, 4, 6 + Math.random()*4);
        ctx.restore();
        return;
    }
    
    if (b.variant === 'PLAYER_FLAME') {
        ctx.globalAlpha = b.life || 1;
        const cx = b.pos.x + b.width/2;
        const cy = b.pos.y + b.height/2;
        const radius = b.width/2 + Math.random()*3;

        drawGlow(ctx, '#ea580c', cx, cy, radius * 1.4, 0.8);
        drawGlow(ctx, '#facc15', cx, cy, radius * 0.9, 0.9);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    if (b.variant === 'UFO_BEAM') {
        const pulse = Math.abs(Math.sin(gameTime * 0.8));
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.35 + pulse * 0.25})`;
        ctx.fillRect(b.pos.x - 4, b.pos.y, b.width + 8, b.height);
        ctx.fillStyle = `rgba(248, 113, 113, ${0.6 + pulse * 0.3})`;
        ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 + pulse * 0.15})`;
        ctx.fillRect(b.pos.x + b.width * 0.25, b.pos.y, b.width * 0.5, b.height);
        ctx.restore();
        return;
    }

    const cx = b.pos.x + b.width / 2;
    const cy = b.pos.y + b.height / 2;

    switch (b.variant) {
        case 'PLAYER_BEAM':
            // Outer Glowing Beam (no shadowBlur)
            ctx.fillStyle = hexToRgba(COLORS.powerupBeam, 0.35);
            ctx.fillRect(b.pos.x - 3, b.pos.y, b.width + 6, b.height);
            ctx.fillStyle = COLORS.powerupBeam;
            ctx.fillRect(b.pos.x - 1, b.pos.y, b.width + 2, b.height);
            // Incandescent White Core
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(b.pos.x + 1, b.pos.y, b.width - 2, b.height);
            break;
        case 'PLAYER_SPREAD':
            ctx.translate(cx, cy);
            ctx.rotate(Math.atan2(b.velocity, b.vx) - Math.PI / 2);
            drawGlow(ctx, COLORS.powerupSpread, 0, 0, 12, 0.65);
            ctx.fillStyle = COLORS.powerupSpread;
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'PLAYER_SIDEWINDER':
            ctx.translate(cx, cy);
            ctx.rotate(gameTime * 0.25); 
            drawGlow(ctx, COLORS.powerupSidewinder, 0, 0, 14, 0.7);
            ctx.fillStyle = COLORS.powerupSidewinder;
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
            break;
        case 'ENEMY_NORMAL':
            drawGlow(ctx, '#4ade80', cx, cy, Math.max(b.width, b.height) * 0.9, 0.45);
            drawCachedSprite(ctx, cache, 'BULLET_NORMAL', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_FAST':
            drawGlow(ctx, '#e879f9', cx, cy, Math.max(b.width, b.height) * 0.95, 0.5);
            drawCachedSprite(ctx, cache, 'BULLET_FAST', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_HEAVY':
            drawGlow(ctx, '#fbbf24', cx, cy, Math.max(b.width, b.height) * 1.0, 0.55);
            drawCachedSprite(ctx, cache, 'BULLET_HEAVY', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'BOSS':
            drawGlow(ctx, '#ef4444', cx, cy, b.width * 1.1, 0.75);
            ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.arc(cx, cy, b.width / 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy, b.width / 2 - 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            if (gameTime % 4 < 2) ctx.fillRect(cx - 2, cy - 2, 4, 4);
            break;
        case 'ENEMY_SNIPER':
            drawGlow(ctx, '#f43f5e', cx, cy, Math.max(b.width, b.height) * 1.1, 0.6);
            drawCachedSprite(ctx, cache, 'BULLET_SNIPER', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_DESTRUCTIBLE':
            drawGlow(ctx, '#f97316', cx, cy, Math.max(b.width, b.height) * 0.95, 0.5);
            drawCachedSprite(ctx, cache, 'BULLET_DESTRUCTIBLE', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_GALAXY':
            drawGlow(ctx, '#0ea5e9', cx, cy, Math.max(b.width, b.height) * 1.0, 0.55);
            drawCachedSprite(ctx, cache, 'BULLET_GALAXY', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_POD':
            drawGlow(ctx, '#a855f7', cx, cy, Math.max(b.width, b.height) * 0.95, 0.5);
            drawCachedSprite(ctx, cache, 'BULLET_POD', b.pos.x, b.pos.y, b.width, b.height);
            break;
        case 'ENEMY_HOMING':
            drawGlow(ctx, '#ec4899', cx, cy, Math.max(b.width, b.height) * (1.1 + Math.sin(gameTime * 0.2) * 0.2), 0.7);
            drawCachedSprite(ctx, cache, 'BULLET_HOMING', b.pos.x, b.pos.y, b.width, b.height);
            ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.arc(cx, cy, b.width/4, 0, Math.PI * 2); ctx.fill();
            break;
        default:
            drawGlow(ctx, b.color, cx, cy, Math.max(b.width, b.height) * 0.9, 0.45);
            ctx.fillStyle = b.color;
            ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height);
            break;
    }
    ctx.restore();
};

const renderPlayer = (ctx: CanvasRenderingContext2D, player: Player, gameTime: number, cache: Record<string, HTMLCanvasElement>) => {
    if (!player.active) return;

    const cx = player.pos.x + player.width / 2;
    const cy = player.pos.y + player.height / 2;

    // Glowing Thruster Flames under ship (no createLinearGradient / shadowBlur)
    const flameHeight = 10 + Math.random() * 8;
    const flameColor = player.shipId === 'TOPHE' ? '#06b6d4' : (player.shipId === 'JEFF' ? '#a855f7' : (player.shipId === 'BOLTON' ? '#f97316' : '#ef4444'));
    drawGlow(ctx, flameColor, cx, player.pos.y + player.height + flameHeight * 0.4, 14, 0.65);
    ctx.fillStyle = flameColor;
    ctx.fillRect(cx - 5, player.pos.y + player.height - 2, 10, flameHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, player.pos.y + player.height - 2, 4, flameHeight * 0.55);

    // Shield Aura Hexagonal / Elliptical Dome
    if (player.isShielding && player.shieldEnergy > 0) {
        const radius = (player.width / 2) * 1.6;

        ctx.save();
        drawGlow(ctx, COLORS.shieldAura, cx, cy, radius * 1.25, 0.35);
        ctx.beginPath();
        ctx.strokeStyle = COLORS.shieldAura;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.85;
        ctx.arc(cx, cy, radius, gameTime * 0.1, gameTime * 0.1 + Math.PI * 1.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#cffafe'; 
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.arc(cx, cy, radius + 4, -gameTime * 0.15, -gameTime * 0.15 + Math.PI);
        ctx.stroke();
        
        ctx.fillStyle = COLORS.shieldAura;
        ctx.globalAlpha = 0.15 + Math.sin(gameTime * 0.1) * 0.08;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Ship Sprite Render
    ctx.save();
    drawGlow(ctx, player.color, cx, cy, player.width * 0.8, 0.35);
    ctx.translate(cx, cy);

    // Lean rotation angle for smooth steering animation (-15 deg to +15 deg)
    const leanAngle = (player.lean / 2) * (Math.PI / 12);
    ctx.rotate(leanAngle);

    const hdImg = HD_SHIPS[player.shipId];
    if (hdImg && hdImg.complete && hdImg.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(hdImg, -player.width / 2, -player.height / 2, player.width, player.height);
    } else {
        let spriteKey = 'PLAYER';
        if (player.lean < -1.5) spriteKey = 'PLAYER_LEFT_HARD';
        else if (player.lean < -0.5) spriteKey = 'PLAYER_LEFT';
        else if (player.lean > 1.5) spriteKey = 'PLAYER_RIGHT_HARD';
        else if (player.lean > 0.5) spriteKey = 'PLAYER_RIGHT';

        const palettePrefix = `PLAYER_${player.shipId}`;
        if (cache[`${palettePrefix}_${spriteKey.replace('PLAYER_', '')}`] || cache[`${palettePrefix}`]) {
            spriteKey = spriteKey.replace('PLAYER', palettePrefix);
        }

        drawCachedSprite(ctx, cache, spriteKey, -player.width / 2, -player.height / 2, player.width, player.height);
    }
    
    ctx.restore();
};

const renderAlien = (ctx: CanvasRenderingContext2D, alien: Alien, gameTime: number, player: Player, cache: Record<string, HTMLCanvasElement>) => {
    if (!alien.active) return;
    
    ctx.save();
    
    // Sniper Aim Laser Sight
    if (alien.type === AlienType.SNIPER && alien.aimAngle !== undefined) {
        const startX = alien.pos.x + alien.width / 2;
        const startY = alien.pos.y + alien.height;
        const endX = startX + Math.cos(alien.aimAngle) * 1000;
        const endY = startY + Math.sin(alien.aimAngle) * 1000;

        if (alien.sniperPhase === 'AIMING') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4 + Math.sin(gameTime * 0.2) * 0.15;
            ctx.stroke();
            ctx.globalAlpha = 1;
        } else if (alien.sniperPhase === 'LOCKED') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#ff0044';
            ctx.lineWidth = 4.5;
            ctx.globalAlpha = 0.35;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = Math.floor(gameTime / 3) % 2 === 0 ? 0.9 : 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    const isSupreme = alien.type === AlienType.SUPREME_MOTHERSHIP || alien.type === AlienType.SUPREME_ARTILLERY;
    if (isSupreme) {
        const pulse = 0.55 + Math.sin(gameTime * 0.12) * 0.25;
        drawGlow(ctx, '#f59e0b', alien.pos.x + alien.width / 2, alien.pos.y + alien.height / 2, Math.max(alien.width, alien.height) * 0.85, pulse);
        drawGlow(ctx, '#ef4444', alien.pos.x + alien.width / 2, alien.pos.y + alien.height / 2, Math.max(alien.width, alien.height) * 0.65, pulse * 0.8);
    }
    
    let spriteKey = alien.type.toString();
    const hpRatio = alien.hp / alien.maxHp;
    if (hpRatio <= 0.20) spriteKey += '_CRITICAL';
    else if (hpRatio <= 0.40) spriteKey += '_HEAVY';
    else if (hpRatio <= 0.60) spriteKey += '_DAMAGED';
    else if (hpRatio <= 0.80) spriteKey += '_LIGHT';

    if (alien.type === AlienType.REFLECTOR && (alien.shieldHp || 0) > 0) {
        ctx.beginPath();
        ctx.arc(alien.pos.x + alien.width/2, alien.pos.y + alien.height/2, alien.width/2 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTES.REFLECTOR['3'];
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    if (alien.type === AlienType.UFO) {
        const ufoCx = alien.pos.x + alien.width / 2;
        ctx.save();
        ctx.translate(ufoCx, alien.pos.y + alien.height - 5);
        ctx.strokeStyle = PALETTES.UFO['3'] || '#0ea5e9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.scale(1, 0.3);
        ctx.arc(0, 0, 16 + Math.sin(gameTime * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = PALETTES.UFO['1'] || '#22d3ee';
        ctx.arc(0, 0, 26, gameTime * 0.1, gameTime * 0.1 + Math.PI * 1.5);
        ctx.stroke();
        if (alien.ufoState === 'CHARGE') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 9 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    const hdEnemy = HD_ENEMIES[alien.type.toString()];
    if (hdEnemy && hdEnemy.complete && hdEnemy.naturalWidth > 0) {
        const transparentCanvas = getTransparentImageCanvas(alien.type.toString(), hdEnemy);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(transparentCanvas || hdEnemy, alien.pos.x, alien.pos.y, alien.width, alien.height);
    } else {
        drawCachedSprite(ctx, cache, spriteKey, alien.pos.x, alien.pos.y, alien.width, alien.height);
    }
    ctx.restore();
};

const renderPowerUps = (ctx: CanvasRenderingContext2D, powerUps: PowerUp[], gameTime: number, cache: Record<string, HTMLCanvasElement>) => {
    powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
        const scale = 1.05 + Math.sin(gameTime * 0.12 + p.timeOffset) * 0.1;
        ctx.scale(scale, scale);
        
        drawGlow(ctx, p.color, 0, 0, 26, 0.65);
        ctx.fillStyle = 'rgba(10, 5, 25, 0.75)'; 
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
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
            drawGlow(ctx, '#ffffff', p.pos.x, p.pos.y, p.size * p.life * 2, p.life);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.size * p.life * 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'SMOKE') {
            const s = p.size + (1 - p.life) * 12;
            ctx.fillStyle = 'rgba(150, 150, 170, 0.4)';
            ctx.fillRect(p.pos.x - s/2, p.pos.y - s/2, s, s);
        } else if (p.type === 'SPARK') {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size);
        } else if (p.type === 'TEXT' && p.text) {
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = p.color;
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.pos.x, p.pos.y);
        } else {
            ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size);
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1;
};

const renderOverlays = (ctx: CanvasRenderingContext2D) => {
    ctx.drawImage(getOverlayCanvas(), 0, 0);
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

    renderBackground(ctx, gameState.stars, gameState.nebulas, gameState.gameTime);
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
