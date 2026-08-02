
import React from 'react';
import { Activity, Shield, Bomb, Zap } from 'lucide-react';

interface GaugeProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

// 1. HULL INTEGRITY (Segmented Block Style)
export const HealthGauge: React.FC<GaugeProps> = ({ value, max, className }) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const segments = 20; // 20 blocks of 5%
  const activeSegments = Math.ceil((percent / 100) * segments);
  const isCritical = percent < 30;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-end text-xs uppercase tracking-widest font-bold">
        <span className={`flex items-center gap-2 ${isCritical ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
          <Activity size={14} /> Hull
        </span>
        <span className="text-red-300 font-mono">{Math.ceil(value)}/{max}</span>
      </div>
      
      {/* Container with skewed look */}
      <div className="h-4 flex gap-1 transform -skew-x-12">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[1px] transition-all duration-300 ${
              i < activeSegments
                ? isCritical 
                    ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' 
                    : 'bg-gradient-to-t from-red-600 to-red-400 border-t border-red-300'
                : 'bg-gray-800/50 border border-gray-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// 2. ACTIVE DEFLECTOR (Continuous Energy Bar)
export const ShieldGauge: React.FC<GaugeProps> = ({ value, max, className }) => {
  // Value is already 0-100 usually for energy, but let's be safe
  const percent = Math.max(0, Math.min(100, value)); // Assuming value is % for shield energy

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-end text-xs uppercase tracking-widest font-bold">
        <span className="flex items-center gap-2 text-cyan-400">
          <Shield size={14} /> Deflector
        </span>
        <span className="text-cyan-300 font-mono">{Math.floor(percent)}%</span>
      </div>

      <div className="relative h-4 bg-gray-900 border border-gray-700 rounded-sm transform skew-x-12 overflow-hidden shadow-inner">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:4px_4px]" />
        
        {/* Fill Bar */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-700 via-cyan-500 to-cyan-400 transition-all duration-100 ease-out"
          style={{ width: `${percent}%` }}
        >
            {/* Gloss effect */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/20" />
        </div>
        
        {/* Glow Overlay when fullish */}
        {percent > 90 && (
             <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />
        )}
      </div>
    </div>
  );
};

// 3. MISSILE SYSTEM (Loader Style)
export const MissileGauge: React.FC<GaugeProps> = ({ value, className }) => {
  // Value is 0 to 100 progress
  const isReady = value >= 100;
  
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-end text-xs uppercase tracking-widest font-bold">
        <span className={`flex items-center gap-2 ${isReady ? 'text-orange-400' : 'text-orange-700'}`}>
          <Bomb size={14} /> Payload
        </span>
        {isReady ? (
            <span className="text-orange-400 font-mono animate-pulse bg-orange-900/30 px-1 rounded">READY [X]</span>
        ) : (
            <span className="text-gray-600 font-mono text-[10px]">RELOADING</span>
        )}
      </div>

      <div className="relative h-4 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden">
        {/* Striped Background for empty space */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#f97316_5px,#f97316_10px)]" />

        {/* Bar */}
        <div 
          className={`h-full transition-all duration-200 ease-linear flex items-center justify-end pr-1 ${
              isReady 
              ? 'bg-gradient-to-r from-orange-600 to-yellow-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]' 
              : 'bg-orange-800/60'
          }`}
          style={{ width: `${value}%` }}
        >
            {/* Tech details on the bar itself */}
            <div className="h-[2px] w-full bg-white/20 mb-[1px]" />
        </div>
      </div>
    </div>
  );
};
