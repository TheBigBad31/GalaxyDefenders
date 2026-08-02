
import React from 'react';
import { Alien, Bullet, Player, Particle, BlastZone, MissileSize, PowerUp, PowerUpType } from '../../types';
import { SpatialGrid } from './SpatialGrid';

export interface CollisionContext {
    player: Player;
    aliens: Alien[];
    bullets: Bullet[];
    blastZones: BlastZone[];
    particles: Particle[];
    powerUps: PowerUp[];
    grid: SpatialGrid; // Added Grid
    gameTime: number;
    scoreRef: { current: number };
    setScore: (s: number) => void;
    setHp: (hp: number) => void;
    createExplosion: (x: number, y: number, color: string, intensity: 'SMALL' | 'MEDIUM' | 'LARGE' | 'MASSIVE') => void;
    playSound: (type: any) => void;
    triggerMissileBlast: (x: number, y: number, size: MissileSize) => void;
    handleGameOver: (reason: string) => void;
    handleAlienHit: (alien: Alien) => void;
    handlePlayerHit: (sourceVariant: string) => void;
    onCollectPowerUp: (x: number, y: number, type: PowerUpType, color: string) => void;
    updateStats: () => void;
    bossActiveRef: { current: boolean };
    canvasRef: React.RefObject<HTMLCanvasElement>;
}
