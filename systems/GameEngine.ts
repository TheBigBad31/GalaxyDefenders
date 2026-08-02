
import { 
  GameState, Player, Alien, Bullet, Particle, PowerUp, PowerUpType, AlienType,
  MovementType, BlastZone, Star, Nebula, MissileSize, PlayerStats, PowerUpCategory,
  ShipConfig, BossStatus
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, BULLET_SIZE, 
  POWERUP_SIZE, ALIEN_CONFIGS, DIFFICULTY_SCALE, WAVE_CONFIG, 
  COLORS, PLAYER_BALANCE, WEAPON_BALANCE, ENEMY_BALANCE,
  DAMAGE_VALUES
} from '../constants';
import { PALETTES } from '../constants/palettes';
import { generateAllSprites } from '../utils/graphics';
import { createPowerUp, spawnWaveEnemies } from './spawning';
import { drawGame } from './renderer';
import { playSound } from '../services/audioService';
import { updateAlien } from './aliens/manager';
import { updateBullet } from './bullets/manager';
import { getInputState, InputState } from './input';
import { handleCollisions } from './collisions';
import { SpatialGrid } from './collisions/SpatialGrid';

export interface GameCallbacks {
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
    onGameOver: (reason: string) => void;
}

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private callbacks: GameCallbacks;
    
    // Game State
    public gameState: GameState = GameState.MENU;
    public score: number = 0;
    public level: number = 1;
    
    // Entities
    public player: Player;
    public aliens: Alien[] = [];
    public bullets: Bullet[] = [];
    public particles: Particle[] = [];
    public powerUps: PowerUp[] = [];
    public blastZones: BlastZone[] = [];
    public stars: Star[] = [];
    public nebulas: Nebula[] = [];

    // System State
    private spriteCache: Record<string, HTMLCanvasElement> = {};
    private grid: SpatialGrid;
    private bossActive: boolean = false;
    private lastBossHp: number = -1;
    
    // Wave Management
    private wave: number = 0;
    private waveTimer: number = 60;
    
    // Loop & Time
    private animationFrameId: number = 0;
    private lastTime: number = 0;
    private gameTime: number = 0;
    
    // Inputs
    private keys: { [key: string]: boolean } = {};
    private prevGamepadState: { [key: string]: boolean } = {};
    private lastGamepadConnected: boolean = false;

    // UI Throttling
    private lastUiShield: number = -1;
    private lastUiMissile: number = -1;

    constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;
        this.callbacks = callbacks;
        
        // Initialize Spatial Grid (Cell size 100 seems good for 800x600)
        this.grid = new SpatialGrid(100);

        // Initial Dummy Player
        this.player = this.createDefaultPlayer();

        // Initialize Input Listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('gamepadconnected', this.handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);

        // Initialize Graphics & Background
        this.initGraphics();
    }

    private createDefaultPlayer(): Player {
        return {
            id: 'player', shipId: 'MATTEWS',
            pos: { x: CANVAS_WIDTH / 2 - PLAYER_SIZE.width / 2, y: CANVAS_HEIGHT - 60 },
            width: PLAYER_SIZE.width, height: PLAYER_SIZE.height, color: '#0ea5e9',
            active: true, velocity: 0,
            beamTimer: 0, spreadTimer: 0, flameTimer: 0, sidewinderTimer: 0,
            beamLevel: 0, spreadLevel: 0, flameLevel: 0, sidewinderLevel: 0, missileLevel: 0,
            missileCooldown: 0, missileSequenceActive: false, missileWaveStep: 0, missileWaveTimer: 0,
            hp: PLAYER_BALANCE.MAX_HP, maxHp: PLAYER_BALANCE.MAX_HP,
            shieldEnergy: PLAYER_BALANCE.SHIELD.MAX_ENERGY, maxShieldEnergy: PLAYER_BALANCE.SHIELD.MAX_ENERGY,
            shieldRegenRate: PLAYER_BALANCE.SHIELD.REGEN_RATE, isShielding: false, lean: 0
        };
    }

    private initGraphics() {
        try {
            this.spriteCache = generateAllSprites();
        } catch (e) {
            console.error("Critical error generating sprites:", e);
            this.spriteCache = {};
        }

        // Init Background
        this.stars = [];
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() > 0.9 ? 2 : 1, speed: Math.random() * 1.5 + 0.2, alpha: Math.random() * 0.8 + 0.2
            });
        }
        this.nebulas = [];
        const nebulaColors = ['#1a0b2e', '#0b1a2e', '#2e0b1a'];
        for (let i = 0; i < 6; i++) {
            this.nebulas.push({
                x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 150 + 100, color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)], speed: Math.random() * 0.2 + 0.05
            });
        }
    }

    public dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        cancelAnimationFrame(this.animationFrameId);
    }

    // --- INPUT HANDLERS ---
    private handleKeyDown = (e: KeyboardEvent) => { this.keys[e.key] = true; };
    private handleKeyUp = (e: KeyboardEvent) => { this.keys[e.key] = false; };
    private handleGamepadConnected = () => { this.callbacks.setGamepadConnected(true); playSound('SHIELD'); };
    private handleGamepadDisconnected = () => {
        const gps = navigator.getGamepads();
        if (!Array.from(gps).some(gp => gp && gp.connected)) this.callbacks.setGamepadConnected(false);
    };

    // --- GAME CONTROL ---

    public start() {
        if (!this.animationFrameId) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    public stop() {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = 0;
    }

    public initGame(selectedShip: ShipConfig) {
        // Determine Ship Scale
        const scale = selectedShip.scale || 1.0;
        const w = PLAYER_SIZE.width * scale;
        const h = PLAYER_SIZE.height * scale;

        this.player = {
            id: 'player', 
            shipId: selectedShip.id,
            pos: { x: CANVAS_WIDTH / 2 - w / 2, y: CANVAS_HEIGHT - 60 },
            width: w, 
            height: h, 
            color: PALETTES[selectedShip.paletteKey as keyof typeof PALETTES]?.['3'] || '#0ea5e9',
            active: true, velocity: 0,
            beamTimer: 0, spreadTimer: 0, flameTimer: 0, sidewinderTimer: 0,
            beamLevel: 0, spreadLevel: 0, flameLevel: 0, sidewinderLevel: 0, missileLevel: 0,
            missileCooldown: 0, missileSequenceActive: false, missileWaveStep: 0, missileWaveTimer: 0,
            hp: PLAYER_BALANCE.MAX_HP, maxHp: PLAYER_BALANCE.MAX_HP,
            shieldEnergy: PLAYER_BALANCE.SHIELD.MAX_ENERGY, maxShieldEnergy: PLAYER_BALANCE.SHIELD.MAX_ENERGY,
            shieldRegenRate: PLAYER_BALANCE.SHIELD.REGEN_RATE, isShielding: false, lean: 0,
            magnetRadius: selectedShip.magnetRadius
        };

        if (selectedShip.baseStats) {
            Object.assign(this.player, selectedShip.baseStats);
        }

        this.level = 1;
        this.wave = 0;
        this.waveTimer = 60;
        this.score = 0;
        this.gameTime = 0;
        
        // Reset Entities
        this.aliens = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.blastZones = [];
        this.bossActive = false;
        
        // Reset UI
        this.callbacks.setLevel(1);
        this.callbacks.setHp(this.player.hp);
        this.callbacks.setMaxHp(this.player.maxHp);
        this.callbacks.setShieldEnergy(this.player.shieldEnergy);
        this.callbacks.setMissileProgress(100);
        this.callbacks.setBossStatus({ active: false, name: '', hp: 0, maxHp: 1, color: '' });
        this.callbacks.setScore(0);
        this.callbacks.setTaunt("");
        
        this.updatePlayerStatsUI();
        
        this.lastUiShield = -1;
        this.lastUiMissile = -1;
        this.lastBossHp = -1;
    }

    public spawnAlien(type: AlienType) {
        const config = ALIEN_CONFIGS[type];
        const startX = CANVAS_WIDTH / 2 - 20;
        this.aliens.push({
            id: `debug-${Date.now()}`, pos: { x: startX, y: 100 },
            width: 36, height: 36, color: config.color, active: true,
            type: type, scoreValue: config.score, hp: config.hp, maxHp: config.hp,
            movementType: MovementType.STRAIGHT, startX: startX, timeOffset: 0, vy: 0.5, squadId: 'debug'
        });
    }

    public spawnPowerUp(x?: number, y?: number, specificType?: PowerUpType, specificCategory?: PowerUpCategory) {
        const px = x ?? Math.random() * (CANVAS_WIDTH - POWERUP_SIZE.width - 40) + 20;
        const py = y ?? -50;
        this.powerUps.push(createPowerUp(px, py, specificType, specificCategory));
    }

    // --- MAIN LOOP ---

    private loop = (time: number) => {
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        this.animationFrameId = requestAnimationFrame(this.loop);
    };

    private update(dt: number) {
        this.gameTime++;
        const input = getInputState(this.keys, this.prevGamepadState, this.callbacks.setGamepadConnected, this.lastGamepadConnected);
        
        if (input.source === 'GAMEPAD' && !this.lastGamepadConnected) this.lastGamepadConnected = true;

        if (this.gameState !== GameState.PLAYING) {
             // Handle menu navigation inputs if needed, though handled by React usually
             return;
        }

        // --- UPDATE LOGIC (Ported from GameCanvas) ---
        
        this.updateBossStatus();
        this.updatePlayer(input);
        this.updateBackground();
        this.updateWaveLogic();
        this.updateShooting(input);
        this.updateEntities();
        this.updateCollisions();
        this.cleanupEntities();
    }

    private draw() {
        const ufo = this.aliens.find(a => a.type === AlienType.UFO) || null;
        drawGame(this.ctx, {
            player: this.player,
            aliens: this.aliens,
            bullets: this.bullets,
            powerUps: this.powerUps,
            particles: this.particles,
            blastZones: this.blastZones,
            stars: this.stars,
            nebulas: this.nebulas,
            ufo: ufo,
            bossActive: this.bossActive,
            gameTime: this.gameTime,
            level: this.level,
            state: this.gameState
        }, this.spriteCache);
    }

    // --- UPDATE SUB-SYSTEMS ---

    private updateBossStatus() {
        const boss = this.aliens.find(a => 
            a.active && 
            (a.type === AlienType.BOSS || a.type === AlienType.SUPREME_MOTHERSHIP || a.type === AlienType.SUPREME_ARTILLERY)
        );

        if (boss) {
            if (this.lastBossHp !== boss.hp) {
                 this.callbacks.setBossStatus({
                     active: true,
                     name: boss.type.replace(/_/g, ' '),
                     hp: boss.hp,
                     maxHp: boss.maxHp,
                     color: boss.color
                 });
                 this.lastBossHp = boss.hp;
            }
        } else {
            if (this.lastBossHp !== -1) {
                this.callbacks.setBossStatus({ active: false, name: '', hp: 0, maxHp: 1, color: '' });
                this.lastBossHp = -1;
            }
        }
    }

    private updatePlayer(input: InputState) {
        const player = this.player;
        player.pos.x += input.dx * PLAYER_BALANCE.SPEED;
        player.pos.y += input.dy * PLAYER_BALANCE.SPEED;
        player.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.pos.x));
        player.pos.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.pos.y));

        // Lean
        if (input.dx < -0.1) player.lean = Math.max(-2, player.lean - 0.2); 
        else if (input.dx > 0.1) player.lean = Math.min(2, player.lean + 0.2); 
        else {
            if (player.lean > 0.1) player.lean -= 0.2;
            else if (player.lean < -0.1) player.lean += 0.2;
            else player.lean = 0;
        }

        // Shield
        if (input.shield && player.shieldEnergy > 0) {
            player.isShielding = true;
            player.shieldEnergy -= PLAYER_BALANCE.SHIELD.DRAIN_RATE;
            if (player.shieldEnergy < 0) player.shieldEnergy = 0;
            if (this.gameTime % 15 === 0) playSound('SHIELD');
        } else {
            player.isShielding = false;
            if (player.shieldEnergy < player.maxShieldEnergy) player.shieldEnergy += player.shieldRegenRate; 
        }

        // UI Throttling: Shield
        if (this.gameTime % 4 === 0 || player.shieldEnergy <= 0 || player.shieldEnergy >= player.maxShieldEnergy) {
            if (Math.abs(player.shieldEnergy - this.lastUiShield) > 0.5) {
                this.callbacks.setShieldEnergy(player.shieldEnergy);
                this.lastUiShield = player.shieldEnergy;
            }
        }

        // Magnet
        if (player.magnetRadius && player.magnetRadius > 0) {
            this.powerUps.forEach(p => {
                if (!p.active) return;
                const cx = player.pos.x + player.width/2;
                const cy = player.pos.y + player.height/2;
                const pcx = p.pos.x + p.width/2;
                const pcy = p.pos.y + p.height/2;
                const dist = Math.hypot(cx - pcx, cy - pcy);
                
                if (dist < player.magnetRadius!) {
                    const angle = Math.atan2(cy - pcy, cx - pcx);
                    const magnetSpeed = 12;
                    const pullStrength = 0.15;
                    const targetVx = Math.cos(angle) * magnetSpeed;
                    const targetVy = Math.sin(angle) * magnetSpeed;
                    p.vx = p.vx * (1 - pullStrength) + targetVx * pullStrength;
                    p.vy = p.vy * (1 - pullStrength) + targetVy * pullStrength;
                }
            });
        }

        // Cooldowns
        if (player.missileCooldown > 0) player.missileCooldown--;
        if (player.flameTimer > 0) player.flameTimer--;
        if (player.sidewinderTimer > 0) player.sidewinderTimer--;
        if (player.beamTimer > 0) player.beamTimer--;
        if (player.spreadTimer > 0) player.spreadTimer--;

        // UI Throttling: Missiles
        if (this.gameTime % 4 === 0 || player.missileCooldown <= 0) {
            let currentProgress = 100;
            if (player.missileCooldown > 0) {
                currentProgress = Math.max(0, 100 - (player.missileCooldown / WEAPON_BALANCE.MISSILE.RELOAD_TIME) * 100);
            }
            if (Math.abs(currentProgress - this.lastUiMissile) > 0.5) {
                this.callbacks.setMissileProgress(currentProgress);
                this.lastUiMissile = currentProgress;
            }
        }
    }

    private updateBackground() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CANVAS_HEIGHT) { star.y = 0; star.x = Math.random() * CANVAS_WIDTH; }
        });
        this.nebulas.forEach(neb => {
            neb.y += neb.speed;
            if (neb.y > CANVAS_HEIGHT + neb.size) { neb.y = -neb.size; neb.x = Math.random() * CANVAS_WIDTH; }
        });
        if (this.gameTime % 3 === 0 && this.player.active) {
            this.particles.push({
                id: 'trail-' + Math.random(), pos: { x: this.player.pos.x + this.player.width / 2 - 2, y: this.player.pos.y + this.player.height },
                velocity: { x: (Math.random() - 0.5), y: Math.random() * 2 + 2 }, life: 0.8, color: PALETTES.PLAYER['4'], size: Math.random() * 3 + 2
            });
        }
    }

    private updateWaveLogic() {
        if (!this.bossActive) {
            if (this.wave < WAVE_CONFIG.wavesPerLevel) {
                this.waveTimer--;
                if (this.waveTimer <= 0) {
                    this.wave++;
                    const newEnemies = spawnWaveEnemies(this.level, this.wave);
                    this.aliens.push(...newEnemies);
                    
                    const bossTypes = [AlienType.BOSS, AlienType.SUPREME_MOTHERSHIP, AlienType.SUPREME_ARTILLERY];
                    const hasBoss = newEnemies.some(a => bossTypes.includes(a.type));
                    
                    if (hasBoss) {
                        this.bossActive = true;
                        this.createExplosion(CANVAS_WIDTH/2, 100, '#ff0000', 'MASSIVE');
                        playSound('BOSS_SPAWN'); 
                    }

                    const levelMod = Math.min(200, (this.level - 1) * 20);
                    this.waveTimer = Math.max(WAVE_CONFIG.minInterval, WAVE_CONFIG.baseInterval - levelMod);
                }
            } else if (this.aliens.length === 0) {
                 this.level += 1;
                 this.wave = 0; 
                 this.callbacks.setLevel(this.level);
                 this.createExplosion(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, '#00ffff', 'MASSIVE');
                 this.score += DIFFICULTY_SCALE.levelBonus * this.level;
                 this.callbacks.setScore(this.score);
                 this.waveTimer = 180; 
            }
        }
    }

    private updateShooting(input: InputState) {
        const player = this.player;

        if (input.fire) {
            let shotFired = false;
            // Beam (Centralized Logic)
            if (player.beamTimer <= 0) {
                const fireBeam = (offsetX: number) => {
                    this.bullets.push({
                        id: Math.random().toString(), pos: { x: player.pos.x + player.width / 2 - BULLET_SIZE.width / 2 + offsetX, y: player.pos.y },
                        width: BULLET_SIZE.width, height: BULLET_SIZE.height, color: COLORS.bullet, active: true,
                        velocity: -WEAPON_BALANCE.BEAM.SPEED, vx: 0, isEnemy: false, variant: 'PLAYER_BEAM', damage: WEAPON_BALANCE.BEAM.DAMAGE
                    });
                };
                
                // Get timer based on level (clamp to max index)
                const beamCooldowns = WEAPON_BALANCE.BEAM.COOLDOWNS;
                const cooldownIndex = Math.min(player.beamLevel, beamCooldowns.length - 1);
                player.beamTimer = beamCooldowns[cooldownIndex];

                if (player.beamLevel === 0) { fireBeam(0); }
                else if (player.beamLevel === 1) { fireBeam(0); }
                else if (player.beamLevel === 2) { fireBeam(-4); fireBeam(4); }
                else if (player.beamLevel === 3) { fireBeam(-4); fireBeam(4); }
                else if (player.beamLevel === 4) { fireBeam(0); fireBeam(-6); fireBeam(6); }
                else if (player.beamLevel === 5) { fireBeam(0); fireBeam(-6); fireBeam(6); }
                else { fireBeam(0); fireBeam(-6); fireBeam(6); fireBeam(-12); fireBeam(12); }
                shotFired = true;
            }
            
            // Spread
            if (player.spreadLevel > 0 && player.spreadTimer <= 0) {
                const conf = WEAPON_BALANCE.SPREAD;
                const currentCount = Math.min(player.spreadLevel, conf.MAX_PAIRS);
                
                let damage = conf.DAMAGE;
                if (player.spreadLevel > conf.MAX_PAIRS) {
                    damage *= (1 + (player.spreadLevel - conf.MAX_PAIRS) * 0.2);
                }
                
                for (let i = 0; i < currentCount; i++) {
                    const angle = conf.BASE_ANGLE + (i * conf.ANGLE_INCREMENT);
                    const spawnSpread = (a: number) => {
                        this.bullets.push({
                            id: Math.random().toString(), pos: { x: player.pos.x + player.width / 2 - BULLET_SIZE.width / 2, y: player.pos.y },
                            width: BULLET_SIZE.width, height: BULLET_SIZE.height, color: COLORS.bullet, active: true,
                            velocity: -Math.cos(a) * conf.SPEED, vx: Math.sin(a) * conf.SPEED, isEnemy: false, variant: 'PLAYER_SPREAD', damage: damage
                        });
                    }
                    spawnSpread(angle); spawnSpread(-angle);
                }
                player.spreadTimer = conf.COOLDOWN; 
                shotFired = true;
            }

            // Flame
            if (player.flameLevel > 0 && player.flameTimer <= 0) {
                 const conf = WEAPON_BALANCE.FLAME;
                 const spawnFlame = (angleOffset: number) => {
                     const speed = conf.SPEED_MIN + Math.random() * conf.SPEED_VAR;
                     const angle = -Math.PI / 2 + angleOffset;
                     this.bullets.push({
                         id: Math.random().toString(), pos: { x: player.pos.x + player.width/2 - 4, y: player.pos.y },
                         width: 8, height: 8, color: COLORS.powerupFlame, active: true,
                         velocity: Math.sin(angle) * speed, vx: Math.cos(angle) * speed, 
                         isEnemy: false, variant: 'PLAYER_FLAME', life: conf.LIFE, damage: conf.DAMAGE
                     });
                 };
                 spawnFlame((Math.random() - 0.5) * 0.1); 
                 if (player.flameLevel >= 2) { spawnFlame((Math.random() - 0.5) * 0.3); spawnFlame((Math.random() - 0.5) * 0.3); }
                 if (player.flameLevel >= 3) { spawnFlame(-0.2); spawnFlame(0.2); spawnFlame((Math.random() - 0.5) * 0.5); }
                 player.flameTimer = conf.COOLDOWN;
            }

            // Sidewinder
            if (player.sidewinderLevel > 0 && player.sidewinderTimer <= 0) {
                 const conf = WEAPON_BALANCE.SIDEWINDER;
                 const spawnSidewinder = (vx: number, vy: number) => {
                     this.bullets.push({
                         id: Math.random().toString(), pos: { x: vx > 0 ? player.pos.x + player.width : player.pos.x, y: player.pos.y + player.height/2 },
                         width: 8, height: 8, color: COLORS.powerupSidewinder, active: true,
                         velocity: vy, vx: vx, isEnemy: false, variant: 'PLAYER_SIDEWINDER', damage: conf.DAMAGE
                     });
                 };
                 
                 // Get Timer
                 const cooldownIdx = Math.min(player.sidewinderLevel, conf.COOLDOWNS.length) - 1;
                 const cooldown = conf.COOLDOWNS[Math.max(0, cooldownIdx)] || 40;
                 player.sidewinderTimer = cooldown;

                 if (player.sidewinderLevel === 1) { spawnSidewinder(-6, 0); spawnSidewinder(6, 0); }
                 else if (player.sidewinderLevel === 2) { spawnSidewinder(-6, 0.5); spawnSidewinder(6, 0.5); spawnSidewinder(-5.8, 1.5); spawnSidewinder(5.8, 1.5); }
                 else { spawnSidewinder(-6, 1.0); spawnSidewinder(6, 1.0); spawnSidewinder(-5.2, 3.0); spawnSidewinder(5.2, 3.0); }
                 shotFired = true;
            }

            if (shotFired && this.gameTime % 4 === 0) playSound('SHOOT');
        }

        // Missile Trigger
        if (input.missile && player.missileCooldown <= 0) {
            if (player.missileLevel > 0 && !player.missileSequenceActive) {
                player.missileSequenceActive = true;
                player.missileWaveStep = 0;
                player.missileWaveTimer = 0;
                player.missileCooldown = WEAPON_BALANCE.MISSILE.RELOAD_TIME;
            }
        }
        
        // Missile Sequence
        if (player.missileSequenceActive) {
            player.missileWaveTimer--;
            if (player.missileWaveTimer <= 0) {
                 this.fireMissileSalvo();
            }
        }
    }

    private fireMissileSalvo() {
        const player = this.player;
        const spawnMissile = (targetOffsetX: number, size: MissileSize = 'SMALL') => { 
            const stats = WEAPON_BALANCE.MISSILE.STATS[size];
            const hardpointOffset = targetOffsetX >= 0 ? 24 : -24; 
            const startX = player.pos.x + player.width/2 + hardpointOffset - stats.width/2;
            const startY = player.pos.y + 15; 
            const direction = targetOffsetX >= 0 ? 1 : -1;
            const vx = direction * 0.5; 
            this.bullets.push({
                id: Math.random().toString(), pos: { x: startX, y: startY },
                width: stats.width, height: stats.height, color: stats.color, active: true,
                velocity: 6.0, vx: vx, isEnemy: false, variant: 'PLAYER_MISSILE',
                missilePhase: 'DROP', missileTimer: 45, missileSize: size, damage: stats.damage
            });
        };

        const lvl = player.missileLevel;
        let sequenceDone = false;
        
        if (player.missileWaveStep === 0) {
            if (lvl <= 1) { spawnMissile(-20, 'SMALL'); spawnMissile(20, 'SMALL'); sequenceDone = true; }
            else if (lvl <= 2) { spawnMissile(-20, 'MEDIUM'); spawnMissile(20, 'MEDIUM'); sequenceDone = true; }
            else { spawnMissile(-20, 'MEDIUM'); spawnMissile(20, 'MEDIUM'); } 
        } 
        else if (player.missileWaveStep === 1) {
             if (lvl <= 4) { spawnMissile(-45, 'MEDIUM'); spawnMissile(45, 'MEDIUM'); sequenceDone = true; }
             else { spawnMissile(-50, 'LARGE'); spawnMissile(50, 'LARGE'); } 
        }
        else if (player.missileWaveStep === 2) {
             spawnMissile(-80, 'LARGE'); spawnMissile(80, 'LARGE'); sequenceDone = true;
        }

        if (sequenceDone) player.missileSequenceActive = false;
        else { player.missileWaveStep++; player.missileWaveTimer = 12; }
    }

    private updateEntities() {
        // UFO Beam cleanup
        this.bullets.forEach(b => { if (b.variant === 'UFO_BEAM') b.active = false; });

        // Aliens
        this.aliens.forEach(alien => {
            if (!alien.active) return;
            updateAlien(alien, {
                gameTime: this.gameTime, currentLevel: this.level,
                player: this.player, aliens: this.aliens,
                bullets: this.bullets, particles: this.particles,
                playSound, createExplosion: this.createExplosion.bind(this)
            });
            const isBoss = [AlienType.BOSS, AlienType.SUPREME_MOTHERSHIP, AlienType.SUPREME_ARTILLERY].includes(alien.type);
            const isOffScreen = alien.pos.y > CANVAS_HEIGHT + 200 || alien.pos.y < -300;
            const isLooper = alien.movementType === MovementType.CROSS_SCREEN || (alien.returnTimer && alien.returnTimer > 0);
            if (!isBoss && isOffScreen && !isLooper) alien.active = false;
        });

        // Bullets
        this.bullets.forEach(bullet => {
            updateBullet({ bullet, gameTime: this.gameTime, particles: this.particles, playSound, player: this.player });
        });

        // Particles
        this.particles.forEach(p => {
            p.pos.x += p.velocity.x;
            p.pos.y += p.velocity.y;
            if (p.type === 'SPARK') { p.velocity.x *= 0.95; p.velocity.y *= 0.95; }
            if (p.type === 'SMOKE') { p.velocity.x *= 0.9; p.velocity.y *= 0.9; }
            p.life -= (p.decay || 0.04);
        });
    }

    private cleanupEntities() {
        this.aliens = this.aliens.filter(a => a.active);
        this.bullets = this.bullets.filter(b => b.active);
        this.powerUps = this.powerUps.filter(p => p.active);
        this.particles = this.particles.filter(p => p.life > 0);
        this.blastZones = this.blastZones.filter(z => z.life > 0);
    }

    // --- COLLISIONS & EVENTS ---

    private updateCollisions() {
        // 1. Reset Grid
        this.grid.clear();
        
        // 2. Populate Grid with Aliens (Optimization: Only active ones)
        for (const alien of this.aliens) {
            if (alien.active && (!alien.returnTimer || alien.returnTimer <= 0)) {
                this.grid.insert(alien);
            }
        }

        handleCollisions({
            player: this.player, aliens: this.aliens, bullets: this.bullets,
            blastZones: this.blastZones, particles: this.particles, powerUps: this.powerUps,
            grid: this.grid, // Pass the populated grid
            gameTime: this.gameTime, 
            scoreRef: { current: this.score },
            setScore: (s) => { this.score = s; this.callbacks.setScore(s); },
            setHp: (hp) => { this.player.hp = hp; this.callbacks.setHp(hp); },
            createExplosion: this.createExplosion.bind(this),
            playSound,
            triggerMissileBlast: this.triggerMissileBlast.bind(this),
            handleGameOver: this.handleGameOver.bind(this),
            handleAlienHit: this.handleAlienHit.bind(this),
            handlePlayerHit: this.handlePlayerHit.bind(this),
            onCollectPowerUp: this.callbacks.onCollectPowerUp,
            updateStats: this.updatePlayerStatsUI.bind(this),
            bossActiveRef: { current: this.bossActive },
            canvasRef: { current: this.canvas }
        });
    }

    private createExplosion(x: number, y: number, color: string, intensity: 'SMALL' | 'MEDIUM' | 'LARGE' | 'MASSIVE' = 'MEDIUM') {
        let count = 8;
        let sizeBase = 3;
        if (intensity === 'SMALL') count = 5;
        if (intensity === 'MEDIUM') count = 12;
        if (intensity === 'LARGE') { count = 25; sizeBase = 4; }
        if (intensity === 'MASSIVE') { count = 50; sizeBase = 6; }
    
        if (intensity !== 'SMALL') {
           this.particles.push({
               id: 'flash-' + Math.random(), pos: { x, y }, velocity: { x: 0, y: 0 }, life: 1.0,
               color: '#ffffff', size: intensity === 'MASSIVE' ? 60 : 30, type: 'FLASH', decay: 0.15
           });
        }
    
        for (let i = 0; i < count; i++) {
          const speed = (Math.random() * 2 + 1) * (intensity === 'MASSIVE' ? 3 : 1.5);
          const angle = Math.random() * Math.PI * 2;
          this.particles.push({
            id: Math.random().toString(), pos: { x, y },
            velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            life: 1.0, color: Math.random() > 0.5 ? color : '#ffffff', size: Math.random() * sizeBase + 1,
            type: 'SPARK', decay: Math.random() * 0.05 + 0.02
          });
        }
        const smokeCount = Math.floor(count / 2);
        for (let i = 0; i < smokeCount; i++) {
           const speed = Math.random() * 1;
           const angle = Math.random() * Math.PI * 2;
           this.particles.push({
              id: 'smoke-' + Math.random(), pos: { x, y },
              velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
              life: 1.0, color: color, size: Math.random() * sizeBase * 2 + 4, type: 'SMOKE', decay: Math.random() * 0.03 + 0.01
           });
        }
    }

    private triggerMissileBlast(x: number, y: number, size: MissileSize = 'SMALL') {
        const stats = WEAPON_BALANCE.MISSILE.STATS[size];
        this.createExplosion(x, y, '#ff4400', size === 'LARGE' ? 'MASSIVE' : (size === 'MEDIUM' ? 'LARGE' : 'MEDIUM')); 
        playSound('EXPLOSION');
        this.blastZones.push({
            id: `blast-${Date.now()}-${Math.random()}`, x: x, y: y,
            radius: stats.radius, maxRadius: stats.radius, life: 1.0,
            decay: WEAPON_BALANCE.MISSILE.BLAST_DURATION, color: '#f97316', damage: stats.damage,
            damageTimer: 0, damageInterval: WEAPON_BALANCE.MISSILE.BLAST_DAMAGE_INTERVAL
        });
    }

    private handleAlienHit(alien: Alien) {
        alien.hp -= 1;
        let explosionColor = alien.color;
        if ((PALETTES as any)[alien.type]) explosionColor = (PALETTES as any)[alien.type]['1'];
        this.createExplosion(alien.pos.x + alien.width/2, alien.pos.y + alien.height/2, explosionColor, 'SMALL');

        if (alien.hp <= 0) {
            alien.active = false;
            this.score += alien.scoreValue;
            this.callbacks.setScore(this.score);
            this.createExplosion(alien.pos.x + alien.width/2, alien.pos.y + alien.height/2, explosionColor, 'LARGE');
            playSound('EXPLOSION'); 
            
            const bossTypes = [AlienType.BOSS, AlienType.SUPREME_MOTHERSHIP, AlienType.SUPREME_ARTILLERY];
            if (bossTypes.includes(alien.type)) {
                this.bossActive = false;
                this.callbacks.setBossStatus({ active: false, name: '', hp: 0, maxHp: 1, color: '' });
                this.aliens.forEach(other => {
                    if (other.id !== alien.id && other.active) {
                        other.hp = 0;
                        other.active = false;
                        this.createExplosion(other.pos.x + other.width/2, other.pos.y + other.height/2, other.color, 'SMALL');
                    }
                });
                this.spawnPowerUp(alien.pos.x + alien.width/2 - POWERUP_SIZE.width/2, alien.pos.y + alien.height/2, undefined, 'SECONDARY');
            }
            else if (alien.type === AlienType.ELITE) {
                this.spawnPowerUp(alien.pos.x + alien.width/2 - POWERUP_SIZE.width/2, alien.pos.y + alien.height/2, undefined, 'PRIMARY');
            }
            else if (alien.type === AlienType.GUNNER || alien.type === AlienType.MOTHERSHIP || alien.type === AlienType.ARTILLERY || alien.type === AlienType.UFO) {
                if (Math.random() < 0.20) {
                    this.spawnPowerUp(alien.pos.x + alien.width/2 - POWERUP_SIZE.width/2, alien.pos.y + alien.height/2, undefined, 'SECONDARY');
                }
            } 
            else if (alien.type === AlienType.REFLECTOR) {
                const remaining = this.aliens.filter(a => a.active && a.type === AlienType.REFLECTOR && a.squadId === alien.squadId && a.id !== alien.id);
                if (remaining.length === 0) this.spawnPowerUp(alien.pos.x + alien.width/2 - POWERUP_SIZE.width/2, alien.pos.y + alien.height/2, undefined, 'SUPPORT');
            }
        }
    }

    private handlePlayerHit(sourceVariant: string) {
        const damage = DAMAGE_VALUES[sourceVariant] || DAMAGE_VALUES['DEFAULT_COLLISION'];
        this.player.hp -= damage;
        this.callbacks.setHp(this.player.hp);
        playSound('PLAYER_HIT');
        this.createExplosion(this.player.pos.x + this.player.width/2, this.player.pos.y + this.player.height/2, '#f43f5e', 'LARGE');
        if (this.player.hp <= 0) {
            this.createExplosion(this.player.pos.x + this.player.width/2, this.player.pos.y + this.player.height/2, '#f43f5e', 'MASSIVE');
            playSound('GAME_OVER');
            this.handleGameOver('hull_breach');
        }
    }

    private handleGameOver(reason: string) {
        this.gameState = GameState.GAME_OVER;
        this.callbacks.setBossStatus({ active: false, name: '', hp: 0, maxHp: 1, color: '' });
        this.callbacks.onGameOver(reason);
    }

    private updatePlayerStatsUI() {
        this.callbacks.setPlayerStats({
            beamLevel: this.player.beamLevel, spreadLevel: this.player.spreadLevel,
            missileLevel: this.player.missileLevel, flameLevel: this.player.flameLevel,
            sidewinderLevel: this.player.sidewinderLevel
        });
    }
}
