

export enum GameState {
  MENU = 'MENU',
  SHIP_SELECT = 'SHIP_SELECT',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface BossStatus {
    active: boolean;
    name: string;
    hp: number;
    maxHp: number;
    color: string;
}

export enum PowerUpType {
  BEAM_GUN = 'BEAM_GUN',     
  SPREAD_GUN = 'SPREAD_GUN', 
  MISSILE_PACK = 'MISSILE_PACK', 
  SHIELD_REFILL = 'SHIELD_REFILL', // Now recharges energy
  FLAME_THROWER = 'FLAME_THROWER', 
  SIDEWINDER = 'SIDEWINDER', 
  REPAIR_KIT = 'REPAIR_KIT' 
}

export type PowerUpCategory = 'PRIMARY' | 'SECONDARY' | 'SUPPORT';

export enum AlienType {
  SCOUT = 'SCOUT',
  FIGHTER = 'FIGHTER',
  ASSAULT = 'ASSAULT',
  REFLECTOR = 'REFLECTOR',
  GUNNER = 'GUNNER',
  SNIPER = 'SNIPER',
  ARTILLERY = 'ARTILLERY', 
  SUPREME_ARTILLERY = 'SUPREME_ARTILLERY',
  UFO = 'UFO',
  ELITE = 'ELITE',
  BOSS = 'BOSS',
  MOTHERSHIP = 'MOTHERSHIP', 
  SUPREME_MOTHERSHIP = 'SUPREME_MOTHERSHIP',
  KAMIKAZE = 'KAMIKAZE',
  JELLYFISH = 'JELLYFISH'      
}

export enum MovementType {
  STRAIGHT = 'STRAIGHT',
  SINE = 'SINE',
  ZIGZAG = 'ZIGZAG',
  SWOOP = 'SWOOP',
  TRACKING = 'TRACKING',
  HOMING = 'HOMING',
  HOVER = 'HOVER', 
  CROSS_SCREEN = 'CROSS_SCREEN' 
}

export type ShipId = 'MATTEWS' | 'TOPHE' | 'BOLTON' | 'JEFF' | 'MICKA' | 'BALI';

export interface ShipConfig {
    id: ShipId;
    name: string;
    role: string;
    description: string;
    color: string;
    paletteKey: string;
    baseStats: Partial<Player>;
    scale?: number; // 1 is default
    magnetRadius?: number; // 0 is default
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity {
  id: string;
  pos: Position;
  width: number;
  height: number;
  color: string;
  active: boolean;
}

export interface PlayerStats {
    beamLevel: number;
    spreadLevel: number;
    missileLevel: number;
    flameLevel: number;
    sidewinderLevel: number;
}

export interface Player extends Entity {
  shipId: ShipId; // Added shipId
  hp: number;
  maxHp: number;
  velocity: number;
  beamTimer: number;   
  spreadTimer: number; 
  flameTimer: number;
  sidewinderTimer: number; 
  beamLevel: number;   
  spreadLevel: number; 
  flameLevel: number;
  sidewinderLevel: number; 
  missileLevel: number; 
  missileCooldown: number; 
  
  // Visuals
  lean: number; // -2 to 2 (Left to Right)

  // Missile Sequence Logic
  missileSequenceActive: boolean;
  missileWaveStep: number;
  missileWaveTimer: number;

  // Shield / Deflector System
  shieldEnergy: number; // 0 to 100
  maxShieldEnergy: number;
  shieldRegenRate: number; // Dynamic regen rate
  isShielding: boolean; // Is the button held down?
  
  magnetRadius?: number; // For Micka
}

export interface Alien extends Entity {
  type: AlienType;
  scoreValue: number;
  hp: number;
  maxHp: number;
  shieldHp?: number; 
  movementType: MovementType;
  startX: number;
  baseY?: number; // Added for vertical oscillation reference
  timeOffset: number;
  vy: number;
  burstRemaining?: number;
  burstTimer?: number;
  spawnTimer?: number; 
  squadId?: string;
  vx?: number; 
  phase?: 'PROTECT' | 'TRACKING' | 'LOCKED' | 'CHARGE'; 
  parentAlienId?: string; 
  protectTimer?: number; 
  lockedVector?: { x: number, y: number }; 
  hasFired?: boolean; 
  returnTimer?: number; // Time until alien returns to screen (for loopers)
  spiralAngle?: number; // For boss patterns
  gatlingTimer?: number; // Boss gatling state timer
  isGatlingFiring?: boolean; // Boss gatling state
  
  // Sniper specific
  sniperPhase?: 'AIMING' | 'LOCKED' | 'COOLDOWN';
  aimAngle?: number;
  sniperTimer?: number;
  
  // UFO specific
  ufoState?: 'PATROL' | 'CHARGE' | 'BEAM';
  beamTimer?: number;
}

export type BulletVariant = 'PLAYER_BEAM' | 'PLAYER_SPREAD' | 'PLAYER_MISSILE' | 'PLAYER_FLAME' | 'PLAYER_SIDEWINDER' | 'ENEMY_NORMAL' | 'ENEMY_FAST' | 'ENEMY_HEAVY' | 'BOSS' | 'ENEMY_SNIPER' | 'ENEMY_DESTRUCTIBLE' | 'ENEMY_HOMING' | 'ENEMY_GALAXY' | 'ENEMY_POD' | 'UFO_BEAM';

export type MissileSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface Bullet extends Entity {
  velocity: number;
  vx: number;
  isEnemy: boolean;
  bulletType?: 'NORMAL' | 'FAST' | 'HEAVY' | 'DESTRUCTIBLE';
  variant: BulletVariant;
  missilePhase?: 'DROP' | 'IGNITE' | 'FLY';
  missileTimer?: number;
  missileSize?: MissileSize; // Added size property
  life?: number;
  damage?: number; // Added damage property
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  category: PowerUpCategory; 
  faceA: PowerUpType; // First random type
  faceB: PowerUpType; // Second random type
  vx: number; 
  vy: number;
  timeOffset: number; 
  lifeTime: number; 
  maxLifeTime: number;
  cycleTimer: number; // Timer for changing type
}

export interface Particle {
  id: string;
  pos: Position;
  velocity: { x: number; y: number };
  life: number;
  color: string;
  size: number;
  type?: 'SPARK' | 'SMOKE' | 'FLASH'; 
  decay?: number;
}

export interface BlastZone {
    id: string;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    life: number; 
    decay: number;
    color: string;
    damage: number; 
    damageTimer: number; // Timer to throttle damage frequency
    damageInterval: number; // Interval for damage ticks
}

export interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    alpha: number;
}

export interface Nebula {
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
}

export interface AlienConfig {
  hp: number;
  score: number;
  color: string;
  speed?: number;
  bulletSpeed?: number;
  fireChance?: number;
  damagedColor?: string;
  shieldHp?: number;
}

export interface GameConfig {
  width: number;
  height: number;
  playerSpeed: number;
  bulletSpeed: number;
  alienBaseSpeed: number;
}

export type SoundType = 'SHOOT' | 'EXPLOSION' | 'PLAYER_HIT' | 'POWERUP' | 'BOMB' | 'SHIELD' | 'GAME_OVER' | 'BOSS_SPAWN' | 'BEAM_GUN';