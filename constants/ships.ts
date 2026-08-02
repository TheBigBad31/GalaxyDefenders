

import { ShipConfig } from '../types';
import { SHIELD_MAX_ENERGY } from '../constants';

export const SHIPS: ShipConfig[] = [
    {
        id: 'MATTEWS',
        name: 'MATTEWS',
        role: 'DEMOLITION',
        description: 'Expert en explosifs (Rouge). Commence avec le système de missiles activé.',
        color: 'text-red-400',
        paletteKey: 'PLAYER_MATTEWS',
        baseStats: {
            missileLevel: 1
        }
    },
    {
        id: 'TOPHE',
        name: 'TOPHE',
        role: 'LOGISTICS',
        description: 'Expert défensif (Cyan). Bouclier avancé (200%) et régénération rapide.',
        color: 'text-cyan-400',
        paletteKey: 'PLAYER_TOPHE',
        baseStats: {
            maxShieldEnergy: SHIELD_MAX_ENERGY * 2,
            shieldRegenRate: 0.05 // Double default
        }
    },
    {
        id: 'BOLTON',
        name: 'BOLTON',
        role: 'PYROTECHNIC',
        description: 'Maniac du feu (Orange). Commence avec le Lance-Flammes.',
        color: 'text-orange-400',
        paletteKey: 'PLAYER_BOLTON',
        baseStats: {
            flameLevel: 1
        }
    },
    {
        id: 'JEFF',
        name: 'JEFF',
        role: 'TACTICAL',
        description: 'Expert en armes guidées (Violet). Commence avec le Sidewinder.',
        color: 'text-purple-400',
        paletteKey: 'PLAYER_JEFF',
        baseStats: {
            sidewinderLevel: 1
        }
    },
    {
        id: 'MICKA',
        name: 'MICKA',
        role: 'TARGET DUMMY',
        description: 'Gros, gris et triste. Expert en rien. 4x plus gros, mais attire les bonus.',
        color: 'text-gray-400',
        paletteKey: 'PLAYER_MICKA',
        baseStats: {
            // No weapon bonus
        },
        scale: 2.0, // 2x width/height = 4x area
        magnetRadius: 1200 // Effectively Full Screen
    },
    {
        id: 'BALI',
        name: 'BALI',
        role: 'GALACTIC STAR',
        description: 'Sang et Or. La légende. Commence avec TOUTES les armes au niveau 1.',
        color: 'text-yellow-500',
        paletteKey: 'PLAYER_BALI',
        baseStats: {
            beamLevel: 1,
            spreadLevel: 1,
            missileLevel: 1,
            flameLevel: 1,
            sidewinderLevel: 1
        }
    }
];