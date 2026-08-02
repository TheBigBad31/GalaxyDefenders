
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  GameState, AlienType, PowerUpType, PlayerStats, ShipConfig, BossStatus
} from '../types';
import { GameEngine } from '../systems/GameEngine';
import { generateAlienTaunt } from '../services/geminiService';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setTaunt: (taunt: string) => void;
  setLevel: (level: number) => void;
  setHp: (hp: number) => void;
  setMaxHp: (maxHp: number) => void;
  setGamepadConnected: (connected: boolean) => void;
  setShieldEnergy: (energy: number) => void;
  setPlayerStats: (stats: PlayerStats) => void;
  onCollectPowerUp: (x: number, y: number, type: PowerUpType, color: string) => void;
  setMissileProgress: (progress: number) => void;
  setBossStatus: (status: BossStatus) => void;
  selectedShip: ShipConfig;
}

export interface GameCanvasRef {
  spawnAlien: (type: AlienType) => void;
  spawnPowerUp: () => void;
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ 
  gameState, setGameState, setScore, setTaunt, setLevel, setHp, setMaxHp,
  setGamepadConnected, setShieldEnergy, setPlayerStats, onCollectPowerUp, setMissileProgress,
  setBossStatus, selectedShip
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const prevGameStateRef = useRef<GameState>(GameState.MENU);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    spawnAlien: (type: AlienType) => {
      engineRef.current?.spawnAlien(type);
    },
    spawnPowerUp: () => {
      engineRef.current?.spawnPowerUp();
    }
  }));

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create Engine with callbacks bound to React setters
    const engine = new GameEngine(canvasRef.current, {
        setScore,
        setTaunt,
        setLevel,
        setHp,
        setMaxHp,
        setGamepadConnected,
        setShieldEnergy,
        setPlayerStats,
        onCollectPowerUp,
        setMissileProgress,
        setBossStatus,
        onGameOver: async (reason: string) => {
             setGameState(GameState.GAME_OVER);
             setTaunt("Game Over. Try again!");
             try {
                 // Note: We use engine.score/level if possible, but here we can just use the last propagated val if needed
                 // or engineRef access. The engine updates internal state before calling this.
                 // For now, let's just pass the call up. 
                 // NOTE: `generateAlienTaunt` is async.
                 if (engineRef.current) {
                     const tauntText = await generateAlienTaunt(engineRef.current.score, engineRef.current.level, reason === 'hull_breach' ? 'alien' : 'kamikaze');
                     setTaunt(tauntText);
                 }
             } catch (e) {
                 console.error("Taunt generation failed", e);
             }
        }
    });

    engineRef.current = engine;
    
    // Start loop
    engine.start();

    return () => {
        engine.stop();
        engine.dispose();
        engineRef.current = null;
    };
  }, []); // Run once on mount

  // Watch for Game State Changes
  useEffect(() => {
    if (!engineRef.current) return;
    
    // Sync React state to Engine state
    engineRef.current.gameState = gameState;

    if (gameState === GameState.PLAYING && prevGameStateRef.current !== GameState.PLAYING) {
        engineRef.current.initGame(selectedShip);
    }
    prevGameStateRef.current = gameState;
    
  }, [gameState, selectedShip]);

  return (
    <canvas ref={canvasRef} width={800} height={600} className="rounded-xl shadow-[0_0_50px_rgba(0,255,255,0.2)] bg-black cursor-none" />
  );
});

export default GameCanvas;
