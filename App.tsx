import React, { useState, useEffect, useRef } from 'react';
import GameCanvas, { GameCanvasRef } from './components/GameCanvas';
import { GameHelp } from './components/GameHelp';
import { GameState, PlayerStats, PowerUpType, ShipConfig, BossStatus } from './types';
import { Zap } from 'lucide-react';
import { initAudio, setVolume } from './services/audioService';
import { SHIPS } from './constants/ships';
import { BossBar } from './components/ui/BossBar';
import { MainMenu } from './components/screens/MainMenu';
import { ShipSelection } from './components/screens/ShipSelection';
import { GameOver } from './components/screens/GameOver';
import { SidePanel } from './components/SidePanel';
import { FlyingIcons, FlyingPowerUp } from './components/ui/FlyingIcons';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [taunt, setTaunt] = useState<string>("");
  const [volumeLevel, setVolumeLevel] = useState(2); // 0: Mute, 1: Low, 2: High
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [shieldEnergy, setShieldEnergy] = useState(100); // For active shield gauge
  const [missileProgress, setMissileProgress] = useState(100); // Missile Reload Percentage
  const [showHelp, setShowHelp] = useState(false);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [flyingPowerUps, setFlyingPowerUps] = useState<FlyingPowerUp[]>([]);
  const [selectedShip, setSelectedShip] = useState<ShipConfig>(SHIPS[0]);
  const [bossStatus, setBossStatus] = useState<BossStatus>({ active: false, name: '', hp: 0, maxHp: 1, color: '' });
  
  const gameCanvasRef = useRef<GameCanvasRef>(null);
  
  // Player Stats for Equipment Panel
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
      beamLevel: 0,
      spreadLevel: 0,
      missileLevel: 1,
      flameLevel: 0,
      sidewinderLevel: 0
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      initAudio();
      if (e.code === 'Space' || e.key === ' ') {
        if (!showHelp) {
            if (gameState === GameState.MENU) {
              setGameState(GameState.SHIP_SELECT);
            } else if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
              setGameState(GameState.MENU);
            }
        }
      }
      if (e.key === 'Escape') {
          setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, showHelp]);

  const toggleVolume = () => {
      const nextLevel = (volumeLevel + 1) % 3;
      setVolumeLevel(nextLevel);
      const gainScale = nextLevel === 2 ? 1.0 : (nextLevel === 1 ? 0.3 : 0.0);
      setVolume(gainScale);
      (document.activeElement as HTMLElement)?.blur();
  };

  const handleCheat = () => {
      if (gameCanvasRef.current && gameState === GameState.PLAYING) {
          gameCanvasRef.current.spawnPowerUp();
          (document.activeElement as HTMLElement)?.blur(); // Remove focus
      }
  };

  const handlePowerUpCollection = (x: number, y: number, type: PowerUpType, color: string) => {
      // Find Target based on Side Panel
      const targetEl = document.getElementById('ship-panel');
      let targetX = window.innerWidth - 120; 
      let targetY = window.innerHeight / 2;

      if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
      }

      setFlyingPowerUps(prev => [
          ...prev, 
          {
              id: Date.now(),
              startX: x,
              startY: y,
              targetX,
              targetY,
              color,
              icon: <Zap size={20} fill={color} />
          }
      ]);
      setTimeout(() => setFlyingPowerUps(prev => prev.slice(1)), 600);
  };

  const handleShipSelect = (ship: ShipConfig) => {
      setSelectedShip(ship);
      setGameState(GameState.PLAYING);
  };

  const handleStartGame = () => {
      initAudio();
      setGameState(GameState.SHIP_SELECT);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4 font-mono overflow-hidden">
      
      {/* Main Game Layout */}
      <div className="flex gap-4 items-stretch relative">
        
        {/* Game Container Wrapper */}
        <div className="flex flex-col gap-2">
            
            {/* BOSS BAR OVERLAY (Above Canvas) */}
            <BossBar status={bossStatus} />

            <div className="relative z-10 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <GameCanvas 
                    ref={gameCanvasRef}
                    gameState={gameState} 
                    setGameState={setGameState} 
                    setScore={setScore}
                    setTaunt={setTaunt}
                    setLevel={setLevel}
                    setHp={setHp}
                    setMaxHp={setMaxHp}
                    setGamepadConnected={setGamepadConnected}
                    setShieldEnergy={setShieldEnergy}
                    setPlayerStats={setPlayerStats}
                    onCollectPowerUp={handlePowerUpCollection}
                    setMissileProgress={setMissileProgress}
                    setBossStatus={setBossStatus}
                    selectedShip={selectedShip}
                />

                {/* Menu Overlay */}
                {gameState === GameState.MENU && !showHelp && (
                    <MainMenu 
                        onStart={handleStartGame}
                        onHelp={() => setShowHelp(true)}
                        gamepadConnected={gamepadConnected}
                    />
                )}

                {/* SHIP SELECTION OVERLAY */}
                {gameState === GameState.SHIP_SELECT && (
                    <ShipSelection 
                        ships={SHIPS}
                        onSelect={handleShipSelect}
                    />
                )}

                {/* HELP / CODEX Overlay */}
                {showHelp && <GameHelp onClose={() => setShowHelp(false)} />}

                {/* Game Over Overlay */}
                {gameState === GameState.GAME_OVER && (
                    <GameOver 
                        score={score}
                        level={level}
                        taunt={taunt}
                        onRestart={() => setGameState(GameState.MENU)}
                    />
                )}
            </div>
        </div>

        {/* SIDEBAR / HUD */}
        <SidePanel 
            playerStats={playerStats}
            score={score}
            level={level}
            hp={hp}
            maxHp={maxHp}
            shieldEnergy={shieldEnergy}
            missileProgress={missileProgress}
            volumeLevel={volumeLevel}
            onCheat={handleCheat}
            onToggleVolume={toggleVolume}
        />

      </div>
      
      {/* FLYING POWERUPS OVERLAY */}
      <FlyingIcons items={flyingPowerUps} />
    </div>
  );
};

export default App;