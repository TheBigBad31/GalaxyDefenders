
import React, { useEffect, useState, useRef } from 'react';
import PixelSprite from './PixelSprite';
import { PlayerStats } from '../types';
import { HealthGauge, ShieldGauge, MissileGauge } from './ui/StatusGauges';
import { Zap, Crosshair, Hexagon, Rocket, Flame, Radio, Scan, Trophy, Activity, Shield, Swords } from 'lucide-react';
import { WEAPON_BALANCE } from '../constants';

interface ShipBlueprintProps {
    stats: PlayerStats;
    score: number;
    level: number;
    hp: number;
    maxHp: number;
    shieldEnergy: number;
    missileProgress: number;
}

// Configuration des modules pour l'affichage (position relative au conteneur du vaisseau)
const MODULES = [
    { id: 'beam', label: 'BEAM CANON', prop: 'beamLevel', max: 5, color: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-400', icon: Zap, pos: 'top-4 left-1/2 -translate-x-1/2' },
    { id: 'sidewinder', label: 'SIDEWINDER', prop: 'sidewinderLevel', max: 3, color: 'text-purple-400', bg: 'bg-purple-400', border: 'border-purple-400', icon: Radio, pos: 'top-[80px] left-1' },
    { id: 'spread', label: 'SPREAD GUN', prop: 'spreadLevel', max: 5, color: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-400', icon: Scan, pos: 'top-[80px] right-1 text-right items-end' },
    { id: 'flame', label: 'FLAME THROWER', prop: 'flameLevel', max: 3, color: 'text-orange-400', bg: 'bg-orange-400', border: 'border-orange-400', icon: Flame, pos: 'bottom-[80px] left-1' },
    { id: 'missile', label: 'WARHEADS', prop: 'missileLevel', max: 8, color: 'text-red-400', bg: 'bg-red-400', border: 'border-red-400', icon: Rocket, pos: 'bottom-[80px] right-1 text-right items-end' },
];

export const ShipBlueprint: React.FC<ShipBlueprintProps> = ({ 
    stats, score, level, hp, maxHp, shieldEnergy, missileProgress 
}) => {
    // State to track which modules just leveled up for animation
    const [levelUpState, setLevelUpState] = useState<Record<string, boolean>>({});
    const prevStats = useRef<PlayerStats>(stats);

    useEffect(() => {
        const changes: Record<string, boolean> = {};
        let hasUpgrade = false;

        (Object.keys(stats) as Array<keyof PlayerStats>).forEach((key) => {
            // Check if level increased
            if (stats[key] > prevStats.current[key]) {
                changes[key] = true;
                hasUpgrade = true;
            }
        });

        if (hasUpgrade) {
            setLevelUpState(prev => ({ ...prev, ...changes }));
            setTimeout(() => {
                setLevelUpState(prev => {
                    const next = { ...prev };
                    Object.keys(changes).forEach(k => delete next[k]);
                    return next;
                });
            }, 1500);
        }
        prevStats.current = stats;
    }, [stats]);
    
    const calculateDPS = () => {
        const FPS = 60;
        let dps = 0;

        // BEAM
        const beamLvl = stats.beamLevel;
        const beamConf = WEAPON_BALANCE.BEAM;
        const beamCd = beamConf.COOLDOWNS[Math.min(beamLvl, beamConf.COOLDOWNS.length - 1)];
        let beamCount = 1;
        if (beamLvl >= 2) beamCount = 2;
        if (beamLvl >= 4) beamCount = 3;
        if (beamLvl >= 6) beamCount = 5;
        // Adjust for level stats
        dps += (beamConf.DAMAGE * beamCount * (FPS / beamCd));

        // SPREAD
        const spreadLvl = stats.spreadLevel;
        if (spreadLvl > 0) {
            const conf = WEAPON_BALANCE.SPREAD;
            const pairs = Math.min(spreadLvl, conf.MAX_PAIRS);
            let dmg = conf.DAMAGE;
            // High level bonus damage logic
            if (spreadLvl > conf.MAX_PAIRS) {
                dmg *= (1 + (spreadLvl - conf.MAX_PAIRS) * 0.2);
            }
            dps += (dmg * (pairs * 2) * (FPS / conf.COOLDOWN));
        }

        // FLAME
        const flameLvl = stats.flameLevel;
        if (flameLvl > 0) {
            const conf = WEAPON_BALANCE.FLAME;
            let shotCount = 1;
            if (flameLvl >= 2) shotCount += 2;
            if (flameLvl >= 3) shotCount += 3;
            dps += (conf.DAMAGE * shotCount * (FPS / conf.COOLDOWN));
        }

        // SIDEWINDER
        const sideLvl = stats.sidewinderLevel;
        if (sideLvl > 0) {
            const conf = WEAPON_BALANCE.SIDEWINDER;
            const cdIdx = Math.min(sideLvl, conf.COOLDOWNS.length) - 1;
            const cd = conf.COOLDOWNS[Math.max(0, cdIdx)];
            let shotCount = 2;
            if (sideLvl >= 2) shotCount = 4;
            dps += (conf.DAMAGE * shotCount * (FPS / cd));
        }

        return dps.toFixed(1);
    };

    const currentDps = calculateDPS();

    const renderPips = (current: number, max: number, activeClass: string) => {
        return (
            <div className="flex gap-[2px] mt-1">
                {Array.from({ length: max }).map((_, i) => (
                    <div 
                        key={i}
                        className={`h-1.5 w-full rounded-[1px] transition-all duration-300 ${
                            i < current 
                            ? `${activeClass} shadow-[0_0_5px_currentColor]` 
                            : 'bg-gray-800'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
      <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden">
         
         {/* --- TOP SECTION: GLOBAL STATS --- */}
         <div className="p-4 bg-gray-900/50 border-b border-cyan-900/50 flex flex-col gap-3 z-20 shadow-md">
            
            {/* Score & Level Row */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Score</div>
                    <div className="text-xl tracking-wider text-green-400 font-bold drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] flex items-center gap-2">
                         <Trophy size={14} className="text-yellow-500"/>
                         {score.toString().padStart(6, '0')}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Sector</div>
                    <div className="text-xl text-cyan-400 font-bold">{level}</div>
                </div>
            </div>

            {/* Gauges */}
            <div className="flex flex-col gap-2 mt-1">
                <HealthGauge value={hp} max={maxHp} />
                <ShieldGauge value={shieldEnergy} max={100} />
                {stats.missileLevel > 0 && (
                    <MissileGauge value={missileProgress} max={100} />
                )}
            </div>

            {/* DPS Indicator */}
            <div className="mt-1 flex items-center justify-between bg-black/40 border border-gray-800 p-2 rounded">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold tracking-wider">
                    <Swords size={12} className="text-yellow-500" />
                    TOTAL OUTPUT
                </div>
                <div className="text-yellow-400 font-mono font-bold text-sm drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                    {currentDps} <span className="text-[9px] text-gray-500 ml-0.5">DPS</span>
                </div>
            </div>

         </div>

         {/* --- BOTTOM SECTION: SHIP SCHEMATIC --- */}
         <div className="relative flex-1 bg-gray-950 overflow-hidden group">
             
             {/* Background Grid */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ 
                      backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', 
                      backgroundSize: '20px 20px',
                      maskImage: 'radial-gradient(circle, black 40%, transparent 80%)'
                  }}>
             </div>
             
             {/* Center Ship */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-80 transition-transform duration-700 group-hover:scale-105">
                 <div className="relative">
                     <div className="absolute inset-0 bg-cyan-500 blur-[40px] opacity-10 animate-pulse"></div>
                     <PixelSprite spriteKey="PLAYER" scale={3} />
                 </div>
             </div>
             
             {/* Connecting Circle (Decor) */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] border border-cyan-500/10 rounded-full z-0 pointer-events-none animate-spin-slow" style={{ animationDuration: '20s' }}></div>

             {/* Modules Overlay */}
             {MODULES.map((mod) => {
                 const level = (stats as any)[mod.prop];
                 const isActive = level > 0;
                 const isLevelingUp = levelUpState[mod.prop];
                 
                 let containerClass = isActive 
                    ? `border-l-2 ${mod.border} bg-gray-900/80` 
                    : `border-l-2 border-gray-800 bg-gray-900/40 opacity-40 grayscale`;
                 
                 if (isLevelingUp) {
                     containerClass = `border-l-4 border-white bg-gray-800 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 z-50`;
                 }
                 
                 const textClass = isActive ? mod.color : 'text-gray-500';
                 const Icon = mod.icon;
                 const isCentered = mod.pos.includes('translate-x-1/2');
                 const widthClass = isCentered ? 'min-w-[120px]' : 'w-[90px]';

                 return (
                     <div key={mod.id} className={`absolute ${mod.pos} ${widthClass} p-1.5 backdrop-blur-sm rounded-r-sm transition-all duration-300 ${containerClass} flex flex-col z-10`}>
                         <div className={`flex items-center gap-1.5 ${textClass} mb-0.5 ${mod.pos.includes('right') ? 'flex-row-reverse' : ''} ${isCentered ? 'justify-center' : ''}`}>
                             <Icon size={12} className={isLevelingUp ? 'animate-bounce text-white' : ''} />
                             <span className={`text-[9px] font-bold tracking-wider whitespace-nowrap ${isLevelingUp ? 'text-white' : ''}`}>{mod.label}</span>
                         </div>
                         
                         <div className={`flex justify-between items-end text-[8px] font-mono text-gray-400 leading-none mb-1 ${mod.pos.includes('right') ? 'flex-row-reverse' : ''}`}>
                             <span className={isLevelingUp ? 'text-white font-bold' : ''}>MK.{level}</span>
                             {isActive && <span className="opacity-50">ONLINE</span>}
                         </div>

                         <div className="relative">
                            {renderPips(level, mod.max, mod.bg)}
                            {isLevelingUp && (
                                <div className="absolute inset-0 -top-2 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-white drop-shadow-[0_0_2px_black] tracking-widest animate-pulse bg-black/50 px-1 rounded">
                                        {level === mod.max ? 'MAXED!' : 'UPGRADE'}
                                    </span>
                                </div>
                            )}
                         </div>
                     </div>
                 );
             })}
             
             {/* Footer Status */}
             <div className="absolute bottom-1 w-full text-center">
                 <div className="inline-block px-3 py-0.5 bg-cyan-950/50 border border-cyan-900/50 rounded-full text-[8px] text-cyan-500/70 font-mono tracking-[0.2em]">
                     BLUEPRINT VIEW
                 </div>
             </div>
         </div>
  
      </div>
    );
};
