

import React, { useState } from 'react';
import PixelSprite from './PixelSprite';
import { HelpCircle, X, Crosshair, Zap, BarChart3 } from 'lucide-react';

const ALIEN_DEX = [
    { key: 'SCOUT', name: 'SCOUT (Recon)', desc: 'Unité de reconnaissance rapide. Se déplace en ondulant. Faible menace individuelle.' },
    { key: 'FIGHTER', name: 'FIGHTER (Infantry)', desc: 'Soldat standard. Se déplace parfois en zigzag. Forme le gros des troupes.' },
    { key: 'ASSAULT', name: 'ASSAULT (Tank)', desc: 'Unité lourde. Plus de PV que la moyenne. Tire des balles lourdes.' },
    { key: 'REFLECTOR', name: 'REFLECTOR', desc: 'Possède un BOUCLIER qui renvoie vos tirs ! Ne tirez pas quand son bouclier brille.' },
    { key: 'SNIPER', name: 'SNIPER', desc: 'Reste en haut de l\'écran. Vise directement votre vaisseau avec des tirs rapides.' },
    { key: 'GUNNER', name: 'GUNNER', desc: 'Unité de poursuite. S\'aligne avec vous et tire des rafales de 3 balles.' },
    { key: 'ARTILLERY', name: 'ARTILLERY', desc: 'Tire un mur de feu destructible. Tirez sur ses balles oranges pour percer sa défense.' },
    { key: 'SUPREME_ARTILLERY', name: 'SIEGE TANK (Supreme)', desc: 'Colosse d\'émeraude. Tire un barrage massif destructible et des obus lourds.' },
    { key: 'MOTHERSHIP', name: 'MOTHERSHIP', desc: 'Gros transporteur. Ne tire pas mais relâche des vagues de Kamikazes.' },
    { key: 'SUPREME_MOTHERSHIP', name: 'CARRIER (Supreme)', desc: 'Forteresse volante sombre. Relâche 4 Kamikazes et tire des missiles guidés.' },
    { key: 'KAMIKAZE', name: 'KAMIKAZE', desc: 'Petit et rapide. Fonce sur vous pour exploser au contact. Priorité absolue.' },
    { key: 'JELLYFISH', name: 'BIO-BOMBER', desc: 'Flotte en hauteur. Largue des capsules qui explosent en 8 projectiles.' },
    { key: 'UFO', name: 'UFO (Commander)', desc: 'Unité spéciale. Patrouille l\'écran et tire un RAYON LASER dévastateur.' },
    { key: 'ELITE', name: 'ELITE (Golden)', desc: 'Commandant d\'escadrille. Tire 3 balles simultanées. Détruisez-le pour obtenir un BONUS.' },
    { key: 'BOSS', name: 'DREADNOUGHT', desc: 'Le boss de fin de niveau. Armement massif. Nécessite puissance de feu extrême.' },
];

const PLAYER_WEAPON_DEX = [
    { 
        key: 'POWERUP_BEAM', 
        name: 'CANON PRINCIPAL', 
        desc: 'Tir laser standard (Jaune). Cadence élevée. Extrêmement puissant contre les cibles uniques.',
        stats: { type: 'DPS Constant', value: '3.2 → 22.5', detail: 'LVL 0: ~3.2 DPS\nLVL 3: ~12.8 DPS\nMAX: ~22.5 DPS' }
    },
    { 
        key: 'POWERUP_SPREAD', 
        name: 'TIR DISPERSÉ', 
        desc: 'Tire des projectiles bleus en éventail. Dégâts faibles, mais touche tout l\'écran.',
        stats: { type: 'DPS Potentiel', value: '2.4 / Lvl', detail: 'LVL 1: ~2.4 DPS (Global)\nLVL 5: ~12.0 DPS (Global)\nNote: Dégâts répartis' }
    },
    { 
        key: 'POWERUP_MISSILE', 
        name: 'SYSTÈME MISSILE [X]', 
        desc: 'Salve explosive activable. Dégâts de zone massifs. Recharge requise.',
        stats: { type: 'Dégâts Burst', value: '4 → 120+', detail: 'LVL 1: 4 Dégâts\nLVL 4: 20 Dégâts\nMAX: 120+ (Pluie)' }
    },
    { 
        key: 'POWERUP_FLAME', 
        name: 'LANCE-FLAMMES', 
        desc: 'Jet de feu à courte portée. Dégâts extrêmes et pénétration totale.',
        stats: { type: 'DPS Contact', value: '6.8 → 20.2', detail: 'LVL 1: ~6.8 DPS\nLVL 2: ~15.2 DPS\nLVL 3: ~20.2 DPS' }
    },
    { 
        key: 'POWERUP_SIDEWINDER', 
        name: 'SIDEWINDER', 
        desc: 'Tirs latéraux violets. Protège les flancs et touche les cibles difficiles.',
        stats: { type: 'DPS Latéral', value: '3.0 → 6.8', detail: 'LVL 1: 3.0 DPS\nLVL 2: 4.8 DPS\nLVL 3: 6.8 DPS' }
    },
    { 
        key: 'POWERUP_SHIELD', 
        name: 'DÉFLECTEUR [R]', 
        desc: 'Bouclier énergétique actif. Maintenez [R] pour renvoyer les tirs et régénérer la coque.',
        stats: { type: 'Défense', value: 'Actif', detail: 'Consomme énergie\nRenvoie les balles\nSoin: 5 PV par renvoi' }
    },
    { 
        key: 'POWERUP_REPAIR', 
        name: 'RÉPARATION', 
        desc: 'Kit de nanobots verts. Restaure immédiatement l\'intégrité de la coque.',
        stats: { type: 'Soin', value: '+150 PV', detail: 'Usage unique\nInstantanné' }
    }
];

const BULLET_DEX = [
    { key: 'BULLET_NORMAL', name: 'PLASMA BOLT', desc: 'Tir standard. Vitesse moyenne. Dégâts modérés.' },
    { key: 'BULLET_FAST', name: 'NEEDLE LASER', desc: 'Tir très rapide (violet). Faible dégâts mais difficile à esquiver.' },
    { key: 'BULLET_HEAVY', name: 'HEAVY SHELL', desc: 'Grosse munition orange. Lente mais inflige de gros dégâts.' },
    { key: 'BULLET_SNIPER', name: 'SNIPER RAY', desc: 'Rayon concentré ultra-rapide. Précédé d\'une visée laser.' },
    { key: 'BULLET_DESTRUCTIBLE', name: 'FLAK (Destructible)', desc: 'Munition explosive. PEUT ÊTRE DÉTRUITE par vos tirs. Créez un chemin !' },
    { key: 'BULLET_GALAXY', name: 'GALAXY ORB', desc: 'Projectile tourbillonnant des Reflectors.' },
    { key: 'BULLET_HOMING', name: 'SEEKER MISSILE', desc: 'Missile guidé violet. Suit lentement vos mouvements.' },
    { key: 'BULLET_POD', name: 'CLUSTER POD', desc: 'Capsule larguée par le Jellyfish. Explose en 8 projectiles.' },
];

interface GameHelpProps {
  onClose: () => void;
}

export const GameHelp: React.FC<GameHelpProps> = ({ onClose }) => {
    const [helpTab, setHelpTab] = useState<'ALIENS' | 'ARSENAL' | 'THREATS'>('ALIENS');

    return (
        <div className="absolute inset-0 bg-black/95 z-20 rounded-lg p-6 flex flex-col overflow-hidden border-2 border-cyan-900">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                    <HelpCircle /> DATABASE
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            
            {/* TABS */}
            <div className="flex gap-4 mb-4 border-b border-gray-800">
                <button 
                    onClick={() => setHelpTab('ALIENS')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${helpTab === 'ALIENS' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    ENEMIES
                </button>
                <button 
                    onClick={() => setHelpTab('ARSENAL')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${helpTab === 'ARSENAL' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    ARSENAL
                </button>
                <button 
                    onClick={() => setHelpTab('THREATS')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${helpTab === 'THREATS' ? 'border-red-400 text-red-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    THREATS
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {helpTab === 'ALIENS' && (
                    ALIEN_DEX.map((alien, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-900/50 p-4 rounded border border-gray-800 hover:border-cyan-700 transition-colors">
                            <div className="w-16 h-16 flex items-center justify-center bg-black rounded shadow-inner border border-gray-800 shrink-0">
                                <PixelSprite 
                                    spriteKey={alien.key} 
                                    scale={2} 
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-yellow-400 font-bold text-sm mb-1">{alien.name}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">{alien.desc}</p>
                            </div>
                        </div>
                    ))
                )}

                {helpTab === 'ARSENAL' && (
                    <div className="grid grid-cols-1 gap-4">
                        {PLAYER_WEAPON_DEX.map((wpn, idx) => (
                            <div key={idx} className="bg-gray-900/50 p-3 rounded border border-gray-800 hover:border-yellow-600 transition-colors flex gap-4">
                                <div className="w-16 h-16 flex items-center justify-center bg-black rounded shadow-inner border border-gray-800 shrink-0 self-start mt-1">
                                    <PixelSprite 
                                        spriteKey={wpn.key} 
                                        scale={2} 
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div>
                                        <h3 className="text-green-400 font-bold text-sm">{wpn.name}</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed mt-1">{wpn.desc}</p>
                                    </div>
                                    
                                    {wpn.stats && (
                                        <div className="bg-black/40 p-2 rounded border border-gray-800 flex gap-4 items-center">
                                            <div className="flex-1 border-r border-gray-700 pr-4">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                    <BarChart3 size={10} /> {wpn.stats.type}
                                                </div>
                                                <div className="text-yellow-400 font-mono text-sm font-bold">
                                                    {wpn.stats.value}
                                                </div>
                                            </div>
                                            <div className="flex-[2] text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-tight">
                                                {wpn.stats.detail}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {helpTab === 'THREATS' && (
                    BULLET_DEX.map((bullet, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-900/50 p-4 rounded border border-gray-800 hover:border-red-700 transition-colors">
                            <div className="w-16 h-16 flex items-center justify-center bg-black rounded shadow-inner border border-gray-800 shrink-0">
                                <PixelSprite 
                                    spriteKey={bullet.key} 
                                    scale={2} 
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-red-400 font-bold text-sm mb-1">{bullet.name}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">{bullet.desc}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
                PRESS ESC TO CLOSE
            </div>
        </div>
    );
};