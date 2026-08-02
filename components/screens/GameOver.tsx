import React from 'react';
import { Skull, Zap, RotateCcw } from 'lucide-react';

interface GameOverProps {
    score: number;
    level: number;
    taunt: string;
    onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, level, taunt, onRestart }) => (
    <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-10 p-8 text-center backdrop-blur-sm">
        <Skull className="w-20 h-20 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-5xl font-bold mb-2 text-red-100 tracking-tighter">MISSION FAILED</h2>
        <div className="flex gap-8 mt-4 mb-8">
            <div>
                <p className="text-xs text-red-400 uppercase">Final Score</p>
                <p className="text-2xl font-bold text-white">{score}</p>
            </div>
            <div>
                <p className="text-xs text-cyan-400 uppercase">Waves Cleared</p>
                <p className="text-2xl font-bold text-white">{level}</p>
            </div>
        </div>

        <div className="mb-8 p-6 bg-black/60 border-l-4 border-red-500 rounded w-full max-w-lg shadow-inner">
            <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-[10px] text-red-400 uppercase tracking-widest">Incoming Alien Transmission</p>
            </div>
            <p className="text-lg italic text-yellow-300 font-serif leading-relaxed">
                {taunt ? `"${taunt}"` : "Decoding signal..."}
            </p>
        </div>

        <button
            onClick={onRestart}
            className="flex items-center gap-2 px-8 py-3 bg-red-700 hover:bg-red-600 text-white text-lg font-bold rounded transition-all border border-red-500"
        >
            <RotateCcw className="w-5 h-5" /> REBOOT SYSTEMS
        </button>
    </div>
);