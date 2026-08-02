
import { GameConfig, AlienType, AlienConfig, BulletVariant, PowerUpType, MissileSize, PowerUpCategory } from './types';
export { PALETTES } from './constants/palettes';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// --- CENTRALIZED BALANCING CONFIGURATION ---

export const PLAYER_BALANCE = {
    SPEED: 1.5,
    MAX_HP: 500,
    INITIAL_SHIELD: 100,
    HITBOX: {
        X_REDUCTION: 0.35, // 35% smaller width for collision
        Y_REDUCTION: 0.25  // 25% smaller height for collision
    },
    SHIELD: {
        MAX_ENERGY: 100,
        DRAIN_RATE: 0.5,
        REGEN_RATE: 0.025,
        REGEN_BONUS: 0.005,
        RADIUS_MULT: 1.5, // Visual size relative to ship width
        HEAL_ON_DEFLECT: 5
    }
};

export const WEAPON_BALANCE = {
    // BEAM (Primary)
    BEAM: {
        DAMAGE: 1.5,
        SPEED: 5.5,
        // Cooldowns per level: [Lvl 0, Lvl 1, ..., Lvl 5, Max]
        COOLDOWNS: [28, 14, 19, 14, 17, 14, 20] 
    },
    // SPREAD (Crowd Control)
    SPREAD: {
        DAMAGE: 0.5,
        SPEED: 5.5,
        COOLDOWN: 25,
        MAX_PAIRS: 9,
        BASE_ANGLE: 0.35,
        ANGLE_INCREMENT: 0.08
    },
    // FLAME (Close Range DPS)
    FLAME: {
        DAMAGE: 0.45,
        COOLDOWN: 4,
        SPEED_MIN: 7.0,
        SPEED_VAR: 2.0,
        LIFE: 1.0,
        LIFETIME_DECAY: 0.05
    },
    // SIDEWINDER (Flank)
    SIDEWINDER: {
        DAMAGE: 1.0,
        // Cooldowns for [Lvl 1, Lvl 2, Lvl 3]
        COOLDOWNS: [40, 50, 35],
        SPEED_Y_BASE: 0, // Starts horizontal
        WIDTH_OSC: 4     // Oscillation magnitude
    },
    // MISSILE (Ultimate)
    MISSILE: {
        RELOAD_TIME: 240, // Frames (4 seconds at 60fps)
        BLAST_DURATION: 0.015, // Fade speed
        BLAST_DAMAGE_INTERVAL: 6,
        STATS: {
            SMALL: { width: 7, height: 14, radius: 30, damage: 2.0, color: '#fca5a5' },
            MEDIUM: { width: 11, height: 17, radius: 45, damage: 5.0, color: '#ef4444' },
            LARGE: { width: 15, height: 18, radius: 75, damage: 10.0, color: '#991b1b' }
        } as Record<MissileSize, { width: number, height: number, radius: number, damage: number, color: string }>
    }
};

export const ENEMY_BALANCE = {
    BASE_SPEED: 0.20,
    BULLET_SPEED: 5.5,
    ALIEN_HITBOX: {
        SMALL_REDUCTION: 0.4,
        LARGE_REDUCTION: 0.15,
        DEFAULT_REDUCTION: 0.25
    }
};

export const POWERUP_BALANCE = {
    SPEED: 0.6,
    CHANCE: 0.02,
    CYCLE_TIME: 240,
    DURATION: 900,
    REPAIR_AMOUNT: 150
};

// --- LEGACY EXPORTS (Kept for compatibility, mapped to new structures) ---

export const CONFIG: GameConfig = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  playerSpeed: PLAYER_BALANCE.SPEED, 
  bulletSpeed: WEAPON_BALANCE.BEAM.SPEED, 
  alienBaseSpeed: ENEMY_BALANCE.BASE_SPEED, 
};

export const PLAYER_MAX_HP = PLAYER_BALANCE.MAX_HP; 
export const REPAIR_AMOUNT = POWERUP_BALANCE.REPAIR_AMOUNT; 

export const WEAPON_DAMAGE = {
    BEAM: WEAPON_BALANCE.BEAM.DAMAGE,
    SPREAD: WEAPON_BALANCE.SPREAD.DAMAGE,
    SIDEWINDER: WEAPON_BALANCE.SIDEWINDER.DAMAGE,
    FLAME: WEAPON_BALANCE.FLAME.DAMAGE
};

export const SHIELD_MAX_ENERGY = PLAYER_BALANCE.SHIELD.MAX_ENERGY;
export const SHIELD_DRAIN_RATE = PLAYER_BALANCE.SHIELD.DRAIN_RATE; 
export const SHIELD_REGEN_RATE = PLAYER_BALANCE.SHIELD.REGEN_RATE; 
export const SHIELD_REGEN_BONUS = PLAYER_BALANCE.SHIELD.REGEN_BONUS; 

export const MISSILE_RELOAD_TIME = WEAPON_BALANCE.MISSILE.RELOAD_TIME; 
export const BLAST_DAMAGE_INTERVAL = WEAPON_BALANCE.MISSILE.BLAST_DAMAGE_INTERVAL; 
export const MISSILE_BLAST_DURATION = WEAPON_BALANCE.MISSILE.BLAST_DURATION; 
export const MISSILE_STATS = WEAPON_BALANCE.MISSILE.STATS;

// Sniper Timing (Frames at 60fps)
export const SNIPER_AIM_DURATION = 120; 
export const SNIPER_LOCK_DURATION = 40;  
export const SNIPER_COOLDOWN = 180;      

// Damage Config
export const DAMAGE_VALUES: Record<string, number> = {
    'ENEMY_NORMAL': 10,
    'ENEMY_FAST': 15,
    'ENEMY_HEAVY': 20,
    'ENEMY_SNIPER': 25,
    'ENEMY_DESTRUCTIBLE': 15,
    'ENEMY_HOMING': 15,
    'UFO_BEAM': 2, 
    'BOSS': 30,
    'KAMIKAZE_COLLISION': 40,
    'DEFAULT_COLLISION': 20
};

// Difficulty Scaling
export const DIFFICULTY_SCALE = {
  speedMultiplier: 0.025,     
  fireRateMultiplier: 1.05,   
  hpMultiplier: 0.2,          
  spawnRateReduction: 3,      
  levelBonus: 500
};

export const WAVE_CONFIG = {
  baseInterval: 720, // 12 Seconds (60fps)
  minInterval: 240,  // Minimum 4 Seconds cap
  wavesPerLevel: 15, 
  maxAliensBase: 3,  
  maxAliensInc: 2    
};

export const BOSS_SCORE_THRESHOLD = 9999999; 

export const PLAYER_SIZE = { width: 64, height: 64 };
export const ALIEN_SIZE = { width: 36, height: 36 };
export const GUNNER_SIZE = { width: 48, height: 40 }; 
export const ARTILLERY_SIZE = { width: 60, height: 50 }; 
export const ELITE_SIZE = { width: 64, height: 64 };
export const MOTHERSHIP_SIZE = { width: 90, height: 50 }; 
export const KAMIKAZE_SIZE = { width: 20, height: 20 }; 
export const BOSS_SIZE = { width: 120, height: 100 };
export const UFO_SIZE = { width: 60, height: 30 };
export const BULLET_SIZE = { width: 6, height: 16 };
export const BULLET_HOMING_SPEED = 2.5;

export const POWERUP_SIZE = { width: 24, height: 24 };
export const POWERUP_SPEED = POWERUP_BALANCE.SPEED; 
export const POWERUP_CHANCE = POWERUP_BALANCE.CHANCE; 
export const POWERUP_CYCLE_TIME = POWERUP_BALANCE.CYCLE_TIME; 

export const POWERUP_CYCLES: Record<PowerUpCategory, PowerUpType[]> = {
    PRIMARY: [
        PowerUpType.BEAM_GUN,
        PowerUpType.SPREAD_GUN,
        PowerUpType.MISSILE_PACK
    ],
    SECONDARY: [
        PowerUpType.FLAME_THROWER,
        PowerUpType.SIDEWINDER
    ],
    SUPPORT: [
        PowerUpType.REPAIR_KIT,
        PowerUpType.SHIELD_REFILL
    ]
};

export const ALIEN_CONFIGS: Record<AlienType, AlienConfig> = {
  [AlienType.SCOUT]: { hp: 1, score: 50, color: '#d946ef', speed: 0.5, bulletSpeed: 2.2, fireChance: 0.001 }, 
  [AlienType.FIGHTER]: { hp: 2, score: 100, color: '#22d3ee', speed: 0.5, bulletSpeed: 2.0, fireChance: 0.002 },
  [AlienType.ASSAULT]: { hp: 6, score: 200, color: '#a3e635', speed: 0.3, bulletSpeed: 1.8, fireChance: 0.003, damagedColor: '#fef08a' },
  [AlienType.REFLECTOR]: { hp: 5, score: 300, color: '#94a3b8', speed: 0.35, bulletSpeed: 2.2, fireChance: 0.003, shieldHp: 5 },
  [AlienType.GUNNER]: { hp: 25, score: 800, color: '#f97316', speed: 0.15, bulletSpeed: 3.5, fireChance: 0.006 }, 
  [AlienType.SNIPER]: { hp: 4, score: 400, color: '#7c3aed', speed: 0.5, bulletSpeed: 12.0, fireChance: 0.0 }, 
  [AlienType.ELITE]: { hp: 30, score: 1000, color: '#facc15', speed: 0.15, bulletSpeed: 2.5, fireChance: 0.0005, damagedColor: '#fca5a5' },
  
  [AlienType.MOTHERSHIP]: { hp: 60, score: 2000, color: '#4c1d95', speed: 0.2, bulletSpeed: 0, fireChance: 0 }, 
  [AlienType.ARTILLERY]: { hp: 50, score: 1200, color: '#10b981', speed: 0.2, bulletSpeed: 2.2, fireChance: 0.005 },
  
  [AlienType.SUPREME_MOTHERSHIP]: { hp: 250, score: 5000, color: '#2e1065', speed: 0.1, bulletSpeed: 0, fireChance: 0.02 }, 
  [AlienType.SUPREME_ARTILLERY]: { hp: 350, score: 6000, color: '#059669', speed: 0.1, bulletSpeed: 2.5, fireChance: 0.01 }, 
  [AlienType.BOSS]: { hp: 500, score: 10000, color: '#ea580c', speed: 0.1, bulletSpeed: 3.0, fireChance: 0.08, damagedColor: '#fbbf24' },

  [AlienType.KAMIKAZE]: { hp: 1, score: 50, color: '#ef4444', speed: 2.0, bulletSpeed: 0, fireChance: 0 }, 
  [AlienType.JELLYFISH]: { hp: 5, score: 500, color: '#e879f9', speed: 0.3, bulletSpeed: 0, fireChance: 0.005 },
  [AlienType.UFO]: { hp: 15, score: 1000, color: '#06b6d4', speed: 0.8, bulletSpeed: 0, fireChance: 0 },
};

export const COLORS = {
  bullet: '#ccffcc',
  enemyBullet: '#ff4444',
  enemyBulletFast: '#ff00ff',
  enemyBulletHeavy: '#ffaa00',
  enemyBulletSniper: '#ff0044',
  enemyBulletDestructible: '#fdba74', 
  text: '#ffffff',
  powerupBeam: '#f59e0b',    
  powerupSpread: '#0ea5e9',  
  powerupMissile: '#ef4444', 
  powerupShield: '#06b6d4',
  powerupFlame: '#f97316', 
  powerupSidewinder: '#a855f7', 
  powerupRepair: '#84cc16', 
  shieldAura: '#06b6d4',
  bombFlash: '#f0f9ff'
};
