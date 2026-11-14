import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface VictoryScreenProps {
    score: number;
    level: number;
    onRestart: () => void;
    onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
    score, level, onRestart, onMainMenu
}) => (
    <div className="absolute inset-0 bg-gray-950/90 z-20 flex flex-col items-center justify-center p-8 backdrop-blur-md">
        <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce" />
        <h2 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-cyan-400 mb-2">
            VICTORY
        </h2>
        <p className="text-cyan-400/80 font-mono text-xs tracking-[0.3em] mb-8">
            GALAXY SECTOR {level} SECURED
        </p>

        <div className="bg-gray-900/80 border border-yellow-500/40 rounded-2xl px-10 py-6 text-center mb-8 shadow-[0_0_30px_rgba(250,204,21,0.15)]">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Final Score</div>
            <div className="text-4xl font-mono font-black text-green-400 tracking-wider">
                {score.toString().padStart(6, '0')}
            </div>
        </div>

        <div className="flex gap-4">
            <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 font-bold tracking-wider text-sm transition-all hover:scale-105"
            >
                <RotateCcw size={18} />
                REJOUER
            </button>
            <button
                onClick={onMainMenu}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-600 bg-gray-900/80 hover:bg-gray-800 text-gray-300 font-bold tracking-wider text-sm transition-all hover:scale-105"
            >
                <Home size={18} />
                MENU
            </button>
        </div>

        <div className="mt-6 text-xs font-mono text-cyan-400/60 animate-pulse tracking-widest">
            ► PRESS SPACE FOR MENU
        </div>
    </div>
);
