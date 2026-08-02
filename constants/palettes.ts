

export const PALETTES = {
  // MATTEWS (Red - Missiles)
  PLAYER_MATTEWS: {
    '1': '#ef4444', // Highlight (Red 500)
    '2': '#991b1b', // Main Body (Red 800)
    '3': '#fca5a5', 
    '4': '#f87171', 
    '5': '#fbbf24', 
    '6': '#450a0a', // Mechanical (Red 950) - Dark Center
    '7': '#450a0a', 
    '8': '#450a0a', 
    '9': '#ffffff',
    'A': '#fef2f2',
    'B': '#fee2e2'
  },
  // TOPHE (Cyan - Shield)
  PLAYER_TOPHE: {
    '1': '#06b6d4', // Highlight (Cyan 500)
    '2': '#155e75', // Main Body (Cyan 800)
    '3': '#67e8f9', 
    '4': '#22d3ee', 
    '5': '#cffafe', 
    '6': '#083344', // Mechanical (Cyan 950) - Dark Center
    '7': '#0e7490', 
    '8': '#083344', 
    '9': '#ffffff',
    'A': '#ecfeff', 
    'B': '#cffafe'
  },
  // BOLTON (Orange - Flame)
  PLAYER_BOLTON: {
    '1': '#f97316', // Highlight (Orange 500)
    '2': '#9a3412', // Main Body (Orange 800)
    '3': '#fdba74', 
    '4': '#fb923c', 
    '5': '#fcd34d', 
    '6': '#431407', // Mechanical (Orange 950) - Dark Center
    '7': '#7c2d12', 
    '8': '#431407', 
    '9': '#ffffff',
    'A': '#ffedd5',
    'B': '#fed7aa'
  },
  // JEFF (Purple - Sidewinder)
  PLAYER_JEFF: {
    '1': '#a855f7', // Highlight (Purple 500)
    '2': '#6b21a8', // Main Body (Purple 800)
    '3': '#d8b4fe', 
    '4': '#e879f9', 
    '5': '#f0abfc', 
    '6': '#3b0764', // Mechanical (Purple 950) - Dark Center
    '7': '#4c1d95', 
    '8': '#2e1065', 
    '9': '#ffffff', 
    'A': '#f5d0fe', 
    'B': '#e9d5ff'
  },
  // MICKA (Grey/Silver - No Weapon/Base)
  PLAYER_MICKA: {
    '1': '#9ca3af', 
    '2': '#4b5563', // Main Body (Gray 600)
    '3': '#e5e7eb', 
    '4': '#d1d5db', 
    '5': '#6b7280', 
    '6': '#111827', // Mechanical (Gray 900) - Dark Center
    '7': '#1f2937', 
    '8': '#111827', 
    '9': '#ffffff',
    'A': '#f3f4f6',
    'B': '#f9fafb'
  },
  // BALI (Sang et Or - All Weapons)
  PLAYER_BALI: {
    '1': '#facc15', // Highlight (Gold)
    '2': '#991b1b', // Main Body (Blood Red)
    '3': '#ef4444', // Bright Red
    '4': '#fbbf24', // Gold Trim
    '5': '#fef08a', // Pale Gold
    '6': '#450a0a', // Mechanical (Dark Red)
    '7': '#7f1d1d', 
    '8': '#2e1065', // Dark Contrast
    '9': '#ffffff',
    'A': '#fef9c3',
    'B': '#fee2e2'
  },
  
  // Legacy Mapping for safety if accessed directly
  PLAYER: {
    '1': '#7e22ce', '2': '#3b0764', '3': '#a855f7', '4': '#d946ef', 
    '5': '#f0abfc', '6': '#1e1b4b', '7': '#581c87', '8': '#020617', 
    '9': '#ffffff', 'A': '#f5d0fe', 'B': '#e9d5ff'
  },

  SCOUT: {
    '1': '#d946ef', 
    '2': '#701a75', 
    '3': '#a3e635', 
    '4': '#f5d0fe', 
  },
  FIGHTER: {
    '1': '#06b6d4', 
    '2': '#164e63', 
    '3': '#f59e0b', 
    '4': '#cffafe', 
  },
  ASSAULT: {
    '1': '#84cc16', 
    '2': '#365314', 
    '3': '#ef4444', 
    '4': '#ecfccb', 
  },
  ASSAULT_DAMAGED: {
    '1': '#facc15', 
    '2': '#713f12', 
    '3': '#ef4444', 
    '4': '#ffffff', 
  },
  REFLECTOR: {
    '1': '#cbd5e1', 
    '2': '#475569', 
    '3': '#0ea5e9', 
    '4': '#f0f9ff', 
  },
  GUNNER: {
    '1': '#ea580c', 
    '2': '#7c2d12', 
    '3': '#fbbf24', 
    '4': '#fed7aa', 
    '5': '#44403c', 
  },
  SNIPER: {
    '1': '#7c3aed', 
    '2': '#4c1d95', 
    '3': '#ef4444', 
    '4': '#991b1b', 
    '5': '#ddd6fe'  
  },
  ARTILLERY: {
    '1': '#059669', 
    '2': '#064e3b', 
    '3': '#d1fae5', 
    '4': '#374151', 
    '5': '#fbbf24'  
  },
  SUPREME_ARTILLERY: {
    '1': '#d946ef', // Bright Pink (Glow)
    '2': '#2e1065', // Dark Purple (Base)
    '3': '#a855f7', // Purple (Mid)
    '4': '#f5d0fe', // Pale Pink (Highlight)
    '5': '#4c1d95'  // Indigo (Shadow)
  },
  MOTHERSHIP: {
    '1': '#4c1d95', 
    '2': '#2e1065', 
    '3': '#a3e635', 
    '4': '#c084fc', 
    '5': '#581c87'  
  },
  SUPREME_MOTHERSHIP: {
    '1': '#2e1065', // Dark Purple
    '2': '#000000', // Black
    '3': '#f59e0b', // Gold
    '4': '#c084fc', // Light Purple
    '5': '#a3e635'  // Toxic Green
  },
  KAMIKAZE: {
    '1': '#ef4444', 
    '2': '#991b1b', 
    '3': '#f97316', 
    '4': '#fee2e2'  
  },
  JELLYFISH: {
    '1': '#e879f9',
    '2': '#22d3ee',
    '3': '#fae8ff',
    '4': '#a21caf',
    '5': '#0e7490'
  },
  UFO: {
    '1': '#22d3ee', // Cyan Neon (Glass/Lights)
    '2': '#475569', // Slate (Hull)
    '3': '#0ea5e9', // Deep Blue (Rim/Details)
    '4': '#ffffff'  // White (Highlights)
  },
  ELITE: {
    '1': '#eab308', 
    '2': '#78350f', 
    '3': '#ef4444', 
    '4': '#cbd5e1', 
    '5': '#3b82f6', 
  },
  BOSS: {
    '1': '#ea580c',  // Orange (Primary)
    '2': '#7c2d12',  // Dark Rust
    '3': '#fbbf24',  // Yellow Lights
    '4': '#44403c',  // Grey/Black Armor
    '5': '#fed7aa',  // Highlights
    '6': '#c2410c'   // Dark Orange
  },
  POWERUP_BEAM: {
    '1': '#fbbf24', 
    '2': '#b45309', 
    '3': '#ffffff'  
  },
  POWERUP_SPREAD: {
    '1': '#38bdf8', 
    '2': '#0369a1', 
    '3': '#ffffff'  
  },
  POWERUP_MISSILE: {
    '1': '#ef4444', 
    '2': '#991b1b', 
    '3': '#ffffff', 
    '4': '#fbbf24'  
  },
  POWERUP_SHIELD: {
    '1': '#06b6d4', 
    '2': '#155e75', 
    '3': '#ffffff'  
  },
  POWERUP_FLAME: {
    '1': '#f97316', 
    '2': '#c2410c', 
    '3': '#ffffff', 
    '4': '#fcd34d'  
  },
  POWERUP_SIDEWINDER: {
    '1': '#a855f7', 
    '2': '#6b21a8', 
    '3': '#ffffff', 
    '4': '#e9d5ff'  
  },
  POWERUP_REPAIR: {
    '1': '#84cc16', 
    '2': '#3f6212', 
    '3': '#ffffff', 
    '4': '#bef264'  
  },
  MISSILE: {
    '1': '#fca5a5',
    '2': '#ef4444',
    '3': '#b91c1c',
    '4': '#fbbf24',
    '5': '#7f1d1d'
  },
  ENEMY_PROJECTILES: {
    '1': '#ccffcc', // Normal
    '2': '#ff00ff', // Fast
    '3': '#ffaa00', // Heavy
    '4': '#ff0044', // Sniper
    '5': '#fdba74', // Destructible
    '6': '#a855f7', // Homing
    '7': '#0ea5e9', // Galaxy
    '8': '#e879f9', // Pod
    '9': '#f0abfc'  // Pod inner
  }
};