import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Rocket, Home } from 'lucide-react';

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
        { label: 'REPRENDRE', icon: Play, onClick: onResume, style: 'border-cyan-500/60 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60' },
        { label: 'RECOMMENCER', icon: RotateCcw, onClick: onRestart, style: 'border-yellow-500/50 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/50' },
        { label: 'CHANGER DE VAISSEAU', icon: Rocket, onClick: onChangeShip, style: 'border-purple-500/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50' },
        { label: 'MENU PRINCIPAL', icon: Home, onClick: onMainMenu, style: 'border-red-500/50 bg-red-950/40 text-red-300 hover:bg-red-900/50' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
                e.preventDefault();
                setFocusedIndex(prev => (prev - 1 + actions.length) % actions.length);
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                e.preventDefault();
                setFocusedIndex(prev => (prev + 1) % actions.length);
            } else if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                actions[focusedIndex].onClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, actions.length]);

    return (
        <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-6">
                <h2 className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    PAUSED
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-2 tracking-widest">
                    SECTOR {level} • SCORE {score.toString().padStart(6, '0')}
                </p>
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
                            className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 font-bold tracking-widest text-sm transition-all duration-150 ${action.style} ${
                                isFocused ? 'scale-105 ring-2 ring-white/70 shadow-[0_0_20px_rgba(34,211,238,0.35)]' : 'opacity-85'
                            }`}
                        >
                            <Icon size={18} />
                            {action.label}
                        </button>
                    );
                })}
            </div>

            <p className="mt-6 text-[11px] font-mono text-cyan-400/60 tracking-widest">
                [P] / [ESC] REPRENDRE • [↑↓] NAVIGUER • [ENTER] VALIDER
            </p>
        </div>
    );
};
