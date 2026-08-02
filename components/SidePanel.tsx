import React from 'react';
import { Component, Terminal, Volume2, Volume1, VolumeX } from 'lucide-react';
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
            case 2: return <Volume2 className="text-cyan-400 group-hover:text-cyan-300" size={16} />;
            case 1: return <Volume1 className="text-cyan-400/70 group-hover:text-cyan-300" size={16} />;
            default: return <VolumeX className="text-red-400 group-hover:text-red-300" size={16} />;
        }
    };

    return (
        <div id="ship-panel" className="w-[280px] bg-gray-900 border border-cyan-900 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col z-20 h-[600px] mt-[52px]">
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
            <div className="bg-gray-950 p-3 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
                <div className="flex items-center gap-2">
                    <Component size={12}/>
                    <span>SYS.ONLINE</span>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={onCheat}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors group flex items-center gap-2 border border-gray-800 hover:border-yellow-700 text-yellow-600 hover:text-yellow-400"
                        title="Spawn Random Powerup"
                    >
                        <Terminal size={14} />
                    </button>

                    <button 
                        onClick={onToggleVolume}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors group flex items-center gap-2 border border-gray-800 hover:border-cyan-700"
                        title="Toggle Volume"
                    >
                        {getVolumeIcon()}
                        <span className="font-bold">AUDIO</span>
                    </button>
                </div>
            </div>
        </div>
    );
};