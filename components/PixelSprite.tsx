import React, { useEffect, useRef } from 'react';
import { SPRITES } from '../constants/sprites';
import { generateSpriteCanvas, HD_SHIPS, HD_ENEMIES, getTransparentImageCanvas } from '../utils/graphics';

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

    // Check if there is an HD PNG Image available for this player ship
    const shipId = spriteKey.replace('PLAYER_', '').replace('_BASE', '').replace('_LEFT', '').replace('_RIGHT', '').replace('_HARD', '');
    if (HD_SHIPS[shipId]) {
      const img = HD_SHIPS[shipId];
      const drawHD = () => {
        if (img.naturalWidth > 0) {
          canvas.width = 64 * scale;
          canvas.height = 64 * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        drawHD();
        return;
      } else {
        img.addEventListener('load', drawHD);
        return () => img.removeEventListener('load', drawHD);
      }
    }

    // Check if there is an HD PNG Image available for this enemy
    const enemyImg = HD_ENEMIES[spriteKey];
    if (enemyImg) {
      const drawHDEnemy = () => {
        if (enemyImg.naturalWidth > 0) {
          const transparentCanvas = getTransparentImageCanvas(spriteKey, enemyImg);
          const source = transparentCanvas || enemyImg;
          canvas.width = 48 * scale;
          canvas.height = 48 * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
          }
        }
      };

      if (enemyImg.complete && enemyImg.naturalWidth > 0) {
        drawHDEnemy();
        return;
      } else {
        enemyImg.addEventListener('load', drawHDEnemy);
        return () => enemyImg.removeEventListener('load', drawHDEnemy);
      }
    }

    // Fallback to procedural matrix sprite
    let key = spriteKey;
    let data = SPRITES[key];

    if (!data && key.includes('_')) {
        const baseKey = key.split('_')[0];
        if (SPRITES[baseKey]) {
            data = SPRITES[baseKey];
            key = baseKey;
        }
    }

    if (!data) {
        canvas.width = 32 * scale;
        canvas.height = 32 * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    const generated = generateSpriteCanvas(key, data);
    canvas.width = generated.width * (scale / 2); 
    canvas.height = generated.height * (scale / 2);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);
    }

  }, [spriteKey, scale]);

  return (
    <canvas ref={canvasRef} />
  );
};

export default PixelSprite;