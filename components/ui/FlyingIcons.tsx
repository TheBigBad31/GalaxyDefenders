import React from 'react';

export interface FlyingPowerUp {
    id: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    color: string;
    icon: React.ReactNode;
}

export const FlyingIcons: React.FC<{ items: FlyingPowerUp[] }> = ({ items }) => {
    return (
        <>
            {items.map(p => (
                <div
                    key={p.id}
                    className="fixed pointer-events-none z-50 transition-all duration-500 ease-in-out"
                    style={{
                        left: 0, top: 0,
                        transform: `translate(${p.targetX}px, ${p.targetY}px) scale(0.5)`,
                    }}
                >
                    <style>{`
                @keyframes fly-${p.id} {
                    0% { transform: translate(${p.startX}px, ${p.startY}px) scale(1.5); opacity: 1; }
                    80% { transform: translate(${p.targetX}px, ${p.targetY}px) scale(1); opacity: 1; }
                    100% { transform: translate(${p.targetX}px, ${p.targetY}px) scale(2); opacity: 0; }
                }
             `}</style>
                    <div style={{ animation: `fly-${p.id} 0.5s ease-in-out forwards` }} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        {p.icon}
                    </div>
                </div>
            ))}
        </>
    );
};