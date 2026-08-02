
import React from 'react';
import { BossStatus } from '../../types';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const BossBar: React.FC<{ status: BossStatus }> = ({ status }) => {
    if (!status.active) return <div className="h-[44px] mb-2 w-full max-w-[800px] invisible"></div>; 

    const percent = Math.max(0, (status.hp / status.maxHp) * 100);
    const isCritical = percent < 25;
    
    return (
        <div className="w-full max-w-[800px] mb-2 animate-in fade-in slide-in-from-top-4 duration-500 h-[44px] z-30">
            <div className="flex justify-between items-end mb-1 px-2">
                <div className={`flex items-center gap-2 ${isCritical ? 'text-red-500' : 'text-red-400'} font-black tracking-[0.25em] text-sm animate-pulse drop-shadow-[0_0_10px_red]`}>
                    <ShieldAlert size={18} className="animate-bounce" />
                    <span>WARNING — {status.name || 'TARGET BOSS'}</span>
                </div>
                <div className="text-red-300 font-mono text-xs font-bold drop-shadow-[0_0_5px_red]">
                    {Math.ceil(status.hp)} / {status.maxHp} HP
                </div>
            </div>
            
            <div className="relative h-6 bg-gray-950/90 border-2 border-red-500/80 rounded-lg skew-x-[-12deg] overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,0,0.15)_25%,rgba(255,0,0,0.15)_50%,transparent_50%,transparent_75%,rgba(255,0,0,0.15)_75%,rgba(255,0,0,0.15)_100%)] bg-[length:12px_12px]" />
                
                {/* Bar */}
                <div 
                    className={`h-full transition-all duration-200 ease-out relative ${
                        isCritical 
                        ? 'bg-red-600 shadow-[0_0_20px_#ef4444] animate-pulse' 
                        : 'bg-gradient-to-r from-red-800 via-red-500 to-amber-400'
                    }`}
                    style={{ width: `${percent}%` }}
                >
                    {/* Gloss */}
                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/30" />
                    
                    {/* Scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
                </div>
            </div>
        </div>
    );
};

