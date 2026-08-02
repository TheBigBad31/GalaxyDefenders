import React from 'react';
import { Component, Terminal, Volume2, Volume1, VolumeX, Cpu } from 'lucide-react';
import { ShipBlueprint } from './ShipBlueprint';
import { PlayerStats } from '../types';

interface SidePanelProps {
    playerStats: PlayerStats;
    score: number;
    level: number;
    hp: number;
    maxHp: number;
    shieldEnergy: number;
    missileProgress: number;
    volumeLevel: number;
    onCheat: () => void;
    onToggleVolume: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
    playerStats, score, level, hp, maxHp, shieldEnergy, missileProgress,
    volumeLevel, onCheat, onToggleVolume
}) => {
    
    const getVolumeIcon = () => {
        switch(volumeLevel) {
            case 2: return <Volume2 className="text-cyan-400 group-hover:text-cyan-300 drop-shadow-[0_0_5px_cyan]" size={16} />;
            case 1: return <Volume1 className="text-cyan-400/70 group-hover:text-cyan-300" size={16} />;
            default: return <VolumeX className="text-red-400 group-hover:text-red-300 drop-shadow-[0_0_5px_red]" size={16} />;
        }
    };

    return (
        <div id="ship-panel" className="w-[290px] bg-gray-950/85 backdrop-blur-xl border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col z-20 h-[600px] mt-[52px] transition-all">
            {/* Main HUD Component */}
            <ShipBlueprint 
                stats={playerStats} 
                score={score}
                level={level}
                hp={hp}
                maxHp={maxHp}
                shieldEnergy={shieldEnergy}
                missileProgress={missileProgress}
            />
            
            {/* Footer / Utility Panel */}
            <div className="bg-gray-950/90 p-3 border-t border-cyan-900/50 flex justify-between items-center text-[10px] font-mono text-cyan-400/70">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-cyan-400 animate-pulse"/>
                    <span className="tracking-widest font-bold">CORE ONLINE</span>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={onCheat}
                        className="p-1.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 transition-all group flex items-center gap-2 border border-yellow-600/50 hover:border-yellow-400 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                        title="Spawn Random Powerup"
                    >
                        <Terminal size={14} />
                    </button>

                    <button 
                        onClick={onToggleVolume}
                        className="p-1.5 px-2.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 transition-all group flex items-center gap-2 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                        title="Toggle Volume"
                    >
                        {getVolumeIcon()}
                        <span className="font-bold tracking-wider text-[10px]">AUDIO</span>
                    </button>
                </div>
            </div>
        </div>
    );
};