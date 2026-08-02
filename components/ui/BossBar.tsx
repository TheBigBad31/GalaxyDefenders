
import React from 'react';
import { BossStatus } from '../../types';
import { AlertTriangle } from 'lucide-react';

export const BossBar: React.FC<{ status: BossStatus }> = ({ status }) => {
    if (!status.active) return <div className="h-[44px] mb-2 w-full max-w-[800px] invisible"></div>; 

    const percent = Math.max(0, (status.hp / status.maxHp) * 100);
    const isCritical = percent < 25;
    
    return (
        <div className="w-full max-w-[800px] mb-2 animate-in fade-in slide-in-from-top-4 duration-500 h-[44px]">
            <div className="flex justify-between items-end mb-1 px-1">
                <div className={`flex items-center gap-2 ${isCritical ? 'text-red-500' : 'text-red-400'} font-bold tracking-[0.2em] text-sm animate-pulse`}>
                    <AlertTriangle size={16} />
                    WARNING: {status.name}
                </div>
                <div className="text-red-400 font-mono text-xs">
                    {Math.ceil(status.hp)} / {status.maxHp}
                </div>
            </div>
            
            <div className="relative h-6 bg-black/80 border-2 border-red-900 rounded-sm skew-x-[-15deg] overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,0,0.1)_25%,rgba(255,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(255,0,0,0.1)_75%,rgba(255,0,0,0.1)_100%)] bg-[length:10px_10px]" />
                
                {/* Bar */}
                <div 
                    className={`h-full transition-all duration-200 ease-out relative ${isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-red-900 via-red-600 to-orange-600'}`}
                    style={{ width: `${percent}%` }}
                >
                    {/* Gloss */}
                    <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/20" />
                    
                    {/* Scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]" />
                </div>
            </div>
        </div>
    );
};
