import React from 'react';
import { Rocket, HelpCircle, Gamepad2, Shield, Play } from 'lucide-react';

interface MainMenuProps {
    onStart: () => void;
    onHelp: () => void;
    gamepadConnected: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHelp, gamepadConnected }) => (
    <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center z-10 backdrop-blur-md">
        {/* Glowing Logo Icon */}
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-2xl animate-pulse"></div>
            <Rocket className="w-24 h-24 text-cyan-400 relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] tracking-widest">
            GALAXY DEFENDERS
        </h1>
        <p className="text-cyan-400/80 mb-10 tracking-[0.3em] text-xs font-mono font-bold uppercase drop-shadow-[0_0_5px_cyan]">
            NEO-ARCADE SPACE SHOOTER
        </p>

        {/* Primary Action Button */}
        <button
            onClick={onStart}
            className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-extrabold rounded-2xl transition-all transform hover:scale-105 shadow-[0_0_35px_rgba(6,182,212,0.6)] border-2 border-cyan-300/80 flex items-center gap-3"
        >
            <Play size={24} className="fill-white group-hover:translate-x-1 transition-transform" />
            <span className="tracking-wider">ENGAGE MISSION</span>
        </button>

        {/* Help / Codex Button */}
        <button
            onClick={onHelp}
            className="mt-5 flex items-center gap-2 px-8 py-3 bg-gray-900/80 hover:bg-gray-800 text-cyan-300 text-sm font-bold rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all backdrop-blur-sm shadow-md"
        >
            <HelpCircle size={18} className="text-cyan-400" />
            <span className="tracking-wider font-mono">DATABASE & HELP</span>
        </button>

        {/* Controls Summary */}
        <div className="mt-10 text-gray-400 text-xs font-mono grid grid-cols-2 gap-x-8 gap-y-2 text-center bg-gray-900/50 p-4 rounded-xl border border-gray-800/80 backdrop-blur-sm">
            <span>ARROWS / WASD to Move</span>
            <span>SPACE to Fire</span>
            <span className="text-cyan-400 font-bold">HOLD SHIFT: DEFLECTOR SHIELD</span>
            <span className="text-orange-400 font-bold">PRESS X: MISSILES</span>
        </div>

        {gamepadConnected && (
            <div className="absolute bottom-6 right-6 flex items-center gap-2 text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <Gamepad2 size={18} className="animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider">CONTROLLER CONNECTED</span>
            </div>
        )}
    </div>
);