import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface VictoryScreenProps {
    score: number;
    level: number;
    onPlayAgain: () => void;
    onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
    score, level, onPlayAgain, onMainMenu
}) => (
    <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-lg z-30 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 p-4 rounded-full bg-yellow-500/10 border border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            <Trophy size={48} className="text-yellow-400 animate-bounce" />
        </div>

        <h2 className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] mb-2">
            VICTORY
        </h2>
        <p className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-6">
            GALAXY SECURED • ALL SECTORS CLEARED
        </p>

        <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl px-8 py-5 mb-8 flex gap-8">
            <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-3xl font-black text-green-400 font-mono">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Sector</div>
                <div className="text-3xl font-black text-cyan-400 font-mono">{level}</div>
            </div>
        </div>

        <div className="flex gap-4">
            <button
                onClick={onPlayAgain}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold tracking-widest text-sm hover:bg-cyan-900/70 hover:scale-105 transition-all"
            >
                <RotateCcw size={16} /> REJOUER
            </button>
            <button
                onClick={onMainMenu}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-600 bg-gray-900/80 text-gray-300 font-bold tracking-widest text-sm hover:border-gray-400 hover:scale-105 transition-all"
            >
                <Home size={16} /> MENU PRINCIPAL
            </button>
        </div>

        <p className="mt-6 text-[11px] font-mono text-cyan-400/60 tracking-widest animate-pulse">
            ► PRESS SPACE FOR MAIN MENU
        </p>
    </div>
);
