import React from 'react';
import { Rocket, HelpCircle, Gamepad2 } from 'lucide-react';

interface MainMenuProps {
    onStart: () => void;
    onHelp: () => void;
    gamepadConnected: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHelp, gamepadConnected }) => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
        <Rocket className="w-24 h-24 text-cyan-500 mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            SHOOT'M UP
        </h1>
        <p className="text-blue-300 mb-8 tracking-[0.2em] text-sm">VERTICAL ASSAULT MISSION</p>

        <button
            onClick={onStart}
            className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,255,0.4)] border border-cyan-400"
        >
            ENGAGE THRUSTERS
        </button>

        <button
            onClick={onHelp}
            className="mt-4 flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 text-sm font-bold rounded-full border border-gray-600 transition-colors"
        >
            <HelpCircle size={16} /> DATABASE
        </button>

        <div className="mt-8 text-gray-400 text-xs grid grid-cols-2 gap-x-8 gap-y-2 text-center">
            <span>ARROWS to Move</span>
            <span>SPACE to Fire</span>
            <span className="text-cyan-400">HOLD [R] ACTIVE DEFLECTOR</span>
            <span className="text-orange-400">PRESS [X] MISSILE SYSTEM</span>
        </div>

        {gamepadConnected && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30">
                <Gamepad2 size={16} />
                <span className="text-[10px] font-bold tracking-wider">CONTROLLER DETECTED</span>
            </div>
        )}
    </div>
);