import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ShipConfig } from '../../types';
import PixelSprite from '../PixelSprite';

interface ShipSelectionProps {
    ships: ShipConfig[];
    onSelect: (ship: ShipConfig) => void;
}

export const ShipSelection: React.FC<ShipSelectionProps> = ({ ships, onSelect }) => (
    <div className="absolute inset-0 bg-gray-950/95 z-20 flex flex-col items-center justify-center p-8 backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400 tracking-wider">SELECT YOUR PILOT</h2>

        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
            {ships.map((ship) => (
                <button
                    key={ship.id}
                    onClick={() => onSelect(ship)}
                    className={`
                        relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-300 group
                        ${ship.id === 'MICKA' ? 'col-span-1 col-start-2 bg-gray-900/50' : 'bg-gray-900/80'}
                        hover:bg-gray-800 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
                        border-gray-700 hover:border-white
                    `}
                >
                    <div className="w-16 h-16 flex items-center justify-center">
                        <div className={`${ship.color} drop-shadow-[0_0_8px_currentColor]`}>
                            <PixelSprite spriteKey="PLAYER" scale={ship.scale ? 2 : 2.5} />
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className={`font-bold text-lg ${ship.color}`}>{ship.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{ship.role}</p>
                        <p className="text-[10px] text-gray-300 leading-tight h-8">{ship.description}</p>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle size={16} className={ship.color} />
                    </div>
                </button>
            ))}
        </div>

        <div className="mt-8 text-xs text-gray-500">
            SELECT A SHIP TO LAUNCH MISSION
        </div>
    </div>
);