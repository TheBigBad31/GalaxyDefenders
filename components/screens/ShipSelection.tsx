import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { ShipConfig } from '../../types';
import PixelSprite from '../PixelSprite';

interface ShipSelectionProps {
    ships: ShipConfig[];
    onSelect: (ship: ShipConfig) => void;
}

export const ShipSelection: React.FC<ShipSelectionProps> = ({ ships, onSelect }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const cols = 3;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % ships.length);
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'q' || e.key === 'Q') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + ships.length) % ships.length);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + cols < ships.length ? prev + cols : prev % cols));
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                setSelectedIndex(prev => {
                    if (prev - cols >= 0) return prev - cols;
                    const col = prev % cols;
                    const lastRowStart = Math.floor((ships.length - 1) / cols) * cols;
                    return Math.min(lastRowStart + col, ships.length - 1);
                });
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                if (ships[selectedIndex]) {
                    onSelect(ships[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ships, selectedIndex, onSelect]);

    return (
    <div className="absolute inset-0 bg-gray-950/95 z-20 flex flex-col items-center justify-center p-8 backdrop-blur-lg">
        <div className="text-center mb-6">
            <h2 className="text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-yellow-400 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                SELECT YOUR SHIP
            </h2>
            <p className="text-xs text-cyan-500/70 font-mono tracking-[0.3em]">PILOT ARCHETYPE & WEAPON SYSTEM</p>
        </div>

        <div className="grid grid-cols-3 gap-5 w-full max-w-3xl">
            {ships.map((ship, idx) => {
                const spriteKey = `PLAYER_${ship.id}_BASE`;
                const isSelected = idx === selectedIndex;
                return (
                    <button
                        key={ship.id}
                        onClick={() => onSelect(ship)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                            relative p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 group
                            backdrop-blur-md shadow-xl
                            ${isSelected
                                ? 'bg-gray-800/90 scale-105 border-cyan-400 ring-2 ring-cyan-400/70 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                                : 'bg-gray-900/80 border-cyan-900/50 hover:bg-gray-800/90 hover:scale-105 hover:border-cyan-400'
                            }
                        `}
                    >
                        {/* Glow effect behind ship */}
                        <div className="w-20 h-20 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-400/20 transition-all"></div>
                            <div className={`${ship.color} drop-shadow-[0_0_12px_currentColor] transition-transform duration-300 group-hover:scale-110`}>
                                <PixelSprite spriteKey={spriteKey} scale={ship.scale ? 1.8 : 2.2} />
                            </div>
                        </div>

                        <div className="text-center w-full">
                            <h3 className={`font-black text-xl tracking-wider ${ship.color} drop-shadow-[0_0_8px_currentColor]`}>
                                {ship.name}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">
                                {ship.role}
                            </p>
                            <p className="text-[11px] text-gray-300 leading-tight h-10 px-1 font-mono">
                                {ship.description}
                            </p>
                        </div>

                        <div className={`absolute top-3 right-3 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <CheckCircle size={20} className={ship.color} />
                        </div>
                    </button>
                );
            })}
        </div>

        <div className="mt-6 text-xs font-mono text-cyan-400/60 animate-pulse tracking-widest">
            ► [↑/↓/←/→] NAVIGATE • PRESS ENTER / SPACE OR CLICK TO DEPLOY
        </div>
    </div>
    );
};