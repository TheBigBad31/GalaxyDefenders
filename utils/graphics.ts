import { PALETTES } from '../constants/palettes';
import { SPRITES } from '../constants/sprites';

// HD Ship Images Cache
export const HD_SHIPS: Record<string, HTMLImageElement> = {};
export const HD_ENEMIES: Record<string, HTMLCanvasElement> = {};

const shipPaths: Record<string, string> = {
    'MATTEWS': '/assets/ships/ship_mattews.png',
    'TOPHE': '/assets/ships/ship_tophe.png',
    'BOLTON': '/assets/ships/ship_bolton.png',
    'JEFF': '/assets/ships/ship_jeff.png',
    'MICKA': '/assets/ships/ship_micka.png',
    'BALI': '/assets/ships/ship_bali.png',
};

// Preload HD ship PNG assets
if (typeof window !== 'undefined') {
    Object.entries(shipPaths).forEach(([shipId, path]) => {
        const img = new Image();
        img.src = path;
        HD_SHIPS[shipId] = img;
    });
}

// Procedural HD Generator for Cyber-Military Enemy Fleet (Style Guide Compliant)
export const createHDEnemyCanvas = (type: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const size = type === 'BOSS' || type === 'MOTHERSHIP' ? 256 : 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const cx = size / 2;
    const cy = size / 2;

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';

    // Carbon Metal Gradient
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, size);
    bodyGrad.addColorStop(0, '#334155');
    bodyGrad.addColorStop(0.3, '#1e293b');
    bodyGrad.addColorStop(0.8, '#0f172a');
    bodyGrad.addColorStop(1, '#020617');

    switch (type) {
        case 'SCOUT': {
            // Fast V-shaped Cyber-Interceptor pointing DOWN
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.85); // Nose facing down
            ctx.lineTo(cx + size * 0.35, size * 0.25);
            ctx.lineTo(cx + size * 0.15, size * 0.15);
            ctx.lineTo(cx, size * 0.22);
            ctx.lineTo(cx - size * 0.15, size * 0.15);
            ctx.lineTo(cx - size * 0.35, size * 0.25);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#f59e0b'; // Gold trim
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Crimson Laser Eye Bar
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff0044';
            ctx.fillRect(cx - 12, size * 0.6, 24, 5);
            break;
        }
        case 'FIGHTER': {
            // Symmetrical Arrowhead Dreadnought Fighter
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.88);
            ctx.lineTo(cx + size * 0.38, size * 0.38);
            ctx.lineTo(cx + size * 0.25, size * 0.12);
            ctx.lineTo(cx - size * 0.25, size * 0.12);
            ctx.lineTo(cx - size * 0.38, size * 0.38);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Dual Sensor Bar
            ctx.fillStyle = '#ff0044';
            ctx.shadowBlur = 15;
            ctx.fillRect(cx - 16, size * 0.55, 32, 6);
            break;
        }
        case 'ASSAULT': {
            // Heavy Hexagonal Armored Ship
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.9);
            ctx.lineTo(cx + size * 0.42, size * 0.6);
            ctx.lineTo(cx + size * 0.35, size * 0.12);
            ctx.lineTo(cx - size * 0.35, size * 0.12);
            ctx.lineTo(cx - size * 0.42, size * 0.6);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // Triple Crimson Sensor Array
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.fillRect(cx - 20, size * 0.5, 40, 8);
            break;
        }
        case 'REFLECTOR': {
            // Circular Mirror Shield Cruiser
            ctx.beginPath();
            ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#38bdf8'; // Shield Cyan Rim
            ctx.lineWidth = 4;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 20;
            ctx.stroke();

            // Central Red Core
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'SNIPER': {
            // Needle-Nose Sniper Ship with Long Focal Eye
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.92);
            ctx.lineTo(cx + size * 0.18, size * 0.25);
            ctx.lineTo(cx + size * 0.32, size * 0.12);
            ctx.lineTo(cx - size * 0.32, size * 0.12);
            ctx.lineTo(cx - size * 0.18, size * 0.25);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Long Focal Crimson Lens
            ctx.fillStyle = '#ff0044';
            ctx.shadowBlur = 20;
            ctx.fillRect(cx - 4, size * 0.4, 8, 35);
            break;
        }
        case 'BOSS':
        case 'MOTHERSHIP': {
            // Massive Super-Dreadnought Flagship
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.92);
            ctx.lineTo(cx + size * 0.45, size * 0.55);
            ctx.lineTo(cx + size * 0.38, size * 0.1);
            ctx.lineTo(cx - size * 0.38, size * 0.1);
            ctx.lineTo(cx - size * 0.45, size * 0.55);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 5;
            ctx.stroke();

            // Glowing Crimson Core Array
            ctx.fillStyle = '#ff0044';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0044';
            ctx.beginPath();
            ctx.arc(cx, cy, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 35, size * 0.7, 70, 8);
            break;
        }
        default: {
            // Generic Cyber-Military Frigate
            ctx.beginPath();
            ctx.moveTo(cx, size * 0.85);
            ctx.lineTo(cx + size * 0.35, size * 0.2);
            ctx.lineTo(cx - size * 0.35, size * 0.2);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cx - 12, size * 0.5, 24, 6);
            break;
        }
    }

    ctx.restore();
    return canvas;
};

// Pre-generate HD Cyber-Military enemy textures
if (typeof window !== 'undefined') {
    const enemyTypes = ['SCOUT', 'FIGHTER', 'ASSAULT', 'REFLECTOR', 'GUNNER', 'SNIPER', 'ARTILLERY', 'UFO', 'ELITE', 'KAMIKAZE', 'JELLYFISH', 'BOSS', 'MOTHERSHIP'];
    enemyTypes.forEach(t => {
        HD_ENEMIES[t] = createHDEnemyCanvas(t);
    });
}

// Generates a Canvas element from a pixel string array
export const generateSpriteCanvas = (key: string, data: string[], paletteKey?: string): HTMLCanvasElement => {
    let palette: Record<string, string> = PALETTES.PLAYER;
    
    if (paletteKey && (PALETTES as any)[paletteKey]) {
        palette = (PALETTES as any)[paletteKey];
    } else {
        if (key.startsWith('PLAYER')) palette = PALETTES.PLAYER; 
        else if (key.startsWith('SCOUT')) palette = PALETTES.SCOUT;
        else if (key.startsWith('FIGHTER')) palette = PALETTES.FIGHTER;
        else if (key.startsWith('ASSAULT')) palette = key.includes('DAMAGED') ? PALETTES.ASSAULT_DAMAGED : PALETTES.ASSAULT;
        else if (key.startsWith('REFLECTOR')) palette = PALETTES.REFLECTOR;
        else if (key.startsWith('GUNNER')) palette = PALETTES.GUNNER;
        else if (key.startsWith('SNIPER')) palette = PALETTES.SNIPER;
        else if (key.startsWith('ARTILLERY')) palette = PALETTES.ARTILLERY;
        else if (key.startsWith('ELITE')) palette = PALETTES.ELITE;
        else if (key.startsWith('KAMIKAZE')) palette = PALETTES.KAMIKAZE;
        else if (key.startsWith('JELLYFISH')) palette = PALETTES.JELLYFISH;
        else if (key.startsWith('UFO')) palette = PALETTES.UFO; 
        else if (key.startsWith('BOSS')) palette = PALETTES.BOSS;
        else if (key.startsWith('SUPREME_ARTILLERY')) palette = PALETTES.SUPREME_ARTILLERY;
        else if (key.startsWith('SUPREME_MOTHERSHIP')) palette = PALETTES.SUPREME_MOTHERSHIP;
        else if (key.startsWith('MOTHERSHIP')) palette = PALETTES.MOTHERSHIP;
        else if (key.startsWith('POWERUP')) {
            if (key.includes('BEAM')) palette = PALETTES.POWERUP_BEAM;
            else if (key.includes('SPREAD')) palette = PALETTES.POWERUP_SPREAD;
            else if (key.includes('MISSILE')) palette = PALETTES.POWERUP_MISSILE;
            else if (key.includes('SHIELD')) palette = PALETTES.POWERUP_SHIELD;
            else if (key.includes('FLAME')) palette = PALETTES.POWERUP_FLAME;
            else if (key.includes('SIDEWINDER')) palette = PALETTES.POWERUP_SIDEWINDER;
            else if (key.includes('REPAIR')) palette = PALETTES.POWERUP_REPAIR;
        }
        else if (key.startsWith('MISSILE')) palette = PALETTES.MISSILE;
        else if (key.startsWith('BULLET')) palette = PALETTES.ENEMY_PROJECTILES;
    }

    if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
        const errCanvas = document.createElement('canvas');
        errCanvas.width = 32; errCanvas.height = 32;
        const ctx = errCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, 0, 32, 32);
        }
        return errCanvas;
    }

    const scale = 4; 
    const height = data.length;
    const width = data[0].length;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return canvas;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = data[y][x];
            if (char !== '0' && char !== ' ') {
                const color = palette[char] || '#ff00ff';
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);

                if (char === '9' || char === '1' || char === '5' || char === 'A' || char === '3') {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                    ctx.fillRect(x * scale, y * scale, scale, 1);
                    ctx.fillRect(x * scale, y * scale, 1, scale);
                }
            }
        }
    }

    return canvas;
};

// Synchronously generate all sprites into a cache
export const generateAllSprites = (): Record<string, HTMLCanvasElement> => {
    const cache: Record<string, HTMLCanvasElement> = {};
    console.log(`[GRAPHICS] Generating HD sprites & preloading HD ships...`);
    
    // 1. Standard Sprites
    Object.entries(SPRITES).forEach(([key, data]) => {
        cache[key] = generateSpriteCanvas(key, data);
    });

    // 2. Generate Player Variants for each Palette
    const playerBaseKeys = ['PLAYER', 'PLAYER_LEFT', 'PLAYER_RIGHT', 'PLAYER_LEFT_HARD', 'PLAYER_RIGHT_HARD'];
    const shipPalettes = ['PLAYER_MATTEWS', 'PLAYER_TOPHE', 'PLAYER_BOLTON', 'PLAYER_JEFF', 'PLAYER_MICKA', 'PLAYER_BALI'];

    shipPalettes.forEach(paletteKey => {
        playerBaseKeys.forEach(baseKey => {
            const data = SPRITES[baseKey];
            if (data) {
                const suffix = baseKey.replace('PLAYER', ''); 
                const newKey = `${paletteKey}${suffix}`; 
                cache[newKey] = generateSpriteCanvas(baseKey, data, paletteKey);
            }
        });
    });
    
    console.log(`[GRAPHICS] Generation complete. Cached Sprites: ${Object.keys(cache).length}`);
    return cache;
};