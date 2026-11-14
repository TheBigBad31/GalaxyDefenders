import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Rocket, Home, Pause } from 'lucide-react';

interface PauseOverlayProps {
    score: number;
    level: number;
    onResume: () => void;
    onRestart: () => void;
    onChangeShip: () => void;
    onMainMenu: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
    score, level, onResume, onRestart, onChangeShip, onMainMenu
}) => {
    const [focusedIndex, setFocusedIndex] = useState(0);

    const actions = [
        { label: 'REPRENDRE', icon: Play, onClick: onResume, style: 'border-cyan-400 text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80' },
        { label: 'RECOMMENCER', icon: RotateCcw, onClick: onRestart, style: 'border-yellow-500/60 text-yellow-300 bg-gray-900/80 hover:bg-yellow-950/50' },
        { label: 'CHANGER DE VAISSEAU', icon: Rocket, onClick: onChangeShip, style: 'border-purple-500/60 text-purple-300 bg-gray-900/80 hover:bg-purple-950/50' },
        { label: 'MENU PRINCIPAL', icon: Home, onClick: onMainMenu, style: 'border-gray-600 text-gray-300 bg-gray-900/80 hover:bg-gray-800' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                setFocusedIndex(prev => (prev + 1) % actions.length);
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                setFocusedIndex(prev => (prev - 1 + actions.length) % actions.length);
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                actions[focusedIndex].onClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex]);

    return (
        <div className="absolute inset-0 bg-gray-950/85 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2 text-cyan-400">
                <Pause size={32} className="animate-pulse" />
                <h2 className="text-4xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    PAUSED
                </h2>
            </div>

            <div className="text-xs font-mono text-gray-400 tracking-widest mb-8">
                SECTOR {level} • SCORE {score.toString().padStart(6, '0')}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    const isFocused = idx === focusedIndex;
                    return (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            onMouseEnter={() => setFocusedIndex(idx)}
                            className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 font-bold tracking-wider text-sm transition-all duration-150 ${action.style} ${
                                isFocused ? 'scale-105 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'opacity-85'
                            }`}
                        >
                            <Icon size={18} />
                            {action.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 text-[11px] font-mono text-cyan-400/60 tracking-widest">
                [P] / [ESC] POUR REPRENDRE • [↑/↓] NAVIGUER • [ENTER] VALIDER
            </div>
        </div>
    );
};
