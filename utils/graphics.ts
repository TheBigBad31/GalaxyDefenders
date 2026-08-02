

import { PALETTES } from '../constants/palettes';
import { SPRITES } from '../constants/sprites';

// Generates a Canvas element from a pixel string array
export const generateSpriteCanvas = (key: string, data: string[], paletteKey?: string): HTMLCanvasElement => {
    // Determine palette based on key naming convention OR explicit paletteKey
    let palette: Record<string, string> = PALETTES.PLAYER;
    
    if (paletteKey && (PALETTES as any)[paletteKey]) {
        palette = (PALETTES as any)[paletteKey];
    } else {
        if (key.startsWith('PLAYER')) palette = PALETTES.PLAYER; // Fallback
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

    // Safety fallback for missing data or invalid structure
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

    // High Res Scale for crispy look on canvas
    const scale = 2; 
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
            }
        }
    }

    return canvas;
};

// Synchronously generate all sprites into a cache
export const generateAllSprites = (): Record<string, HTMLCanvasElement> => {
    const cache: Record<string, HTMLCanvasElement> = {};
    console.log(`[GRAPHICS] Generating sprites...`);
    
    // 1. Standard Sprites
    Object.entries(SPRITES).forEach(([key, data]) => {
        cache[key] = generateSpriteCanvas(key, data);
    });

    // 2. Generate Player Variants for each Palette
    // Include HARD variants explicitly so they get colored
    const playerBaseKeys = ['PLAYER', 'PLAYER_LEFT', 'PLAYER_RIGHT', 'PLAYER_LEFT_HARD', 'PLAYER_RIGHT_HARD'];
    const shipPalettes = ['PLAYER_MATTEWS', 'PLAYER_TOPHE', 'PLAYER_BOLTON', 'PLAYER_JEFF', 'PLAYER_MICKA', 'PLAYER_BALI'];

    shipPalettes.forEach(paletteKey => {
        playerBaseKeys.forEach(baseKey => {
            const data = SPRITES[baseKey];
            if (data) {
                // Construct new key: e.g., PLAYER_MATTEWS_LEFT
                // Remove 'PLAYER' from baseKey to get suffix: '', '_LEFT', '_RIGHT'
                const suffix = baseKey.replace('PLAYER', ''); 
                const newKey = `${paletteKey}${suffix}`; // PLAYER_MATTEWS_LEFT
                cache[newKey] = generateSpriteCanvas(baseKey, data, paletteKey);
            }
        });
    });
    
    console.log(`[GRAPHICS] Generation complete. Keys: ${Object.keys(cache).length}`);
    return cache;
};