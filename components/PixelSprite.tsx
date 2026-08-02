import React, { useEffect, useRef } from 'react';
import { SPRITES } from '../constants/sprites';
import { generateSpriteCanvas } from '../utils/graphics';

interface PixelSpriteProps {
  spriteKey: string;
  paletteKey?: string; 
  scale?: number;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ spriteKey, scale = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resolve Data
    let key = spriteKey;
    let data = SPRITES[key];

    // Fallback logic for keys like PLAYER_LEFT (if missing in SPRITES but present as base)
    if (!data && key.includes('_')) {
        const baseKey = key.split('_')[0];
        if (SPRITES[baseKey]) {
            data = SPRITES[baseKey];
            key = baseKey; // Use base key for generation
        }
    }

    if (!data) {
        // Render Pink Square Error
        canvas.width = 32 * scale;
        canvas.height = 32 * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    // Generate offscreen source canvas
    const generated = generateSpriteCanvas(key, data);
    
    // Resize destination canvas
    // Note: 'generated' is already scaled by 2 inside graphics.ts
    // We want final visual size to be `generated.width * (scale / 2)` roughly
    
    canvas.width = generated.width * (scale / 2); 
    canvas.height = generated.height * (scale / 2);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled = false; // Keep pixelated
        ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);
    }

  }, [spriteKey, scale]);

  return (
    <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />
  );
};

export default PixelSprite;