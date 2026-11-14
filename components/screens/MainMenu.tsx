import React, { useState } from 'react';
import { Rocket, HelpCircle, Gamepad2, Play, Trophy, X } from 'lucide-react';
import { UserProfile, authService } from '../../services/authService';
import { highScoreService } from '../../services/highScoreService';
import { PlayerProfileBadge } from '../ui/PlayerProfileBadge';
import { GoogleLoginButton } from '../ui/GoogleLoginButton';

interface MainMenuProps {
    onStart: () => void;
    onHelp: () => void;
    gamepadConnected: boolean;
    user?: UserProfile;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHelp, gamepadConnected, user }) => {
    const currentUser = user || authService.getCurrentUser();
    const [showHallOfFame, setShowHallOfFame] = useState(false);
    const top10 = showHallOfFame ? highScoreService.getTop10() : [];

    return (
        <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center z-10 backdrop-blur-md">
            {/* Top Bar with Pilot Profile Badge */}
            <div className="absolute top-6 right-6 z-20">
                <PlayerProfileBadge 
                    user={currentUser} 
                    onLoginClick={() => authService.promptGoogleAccountChooser()} 
                />
            </div>

            {/* Glowing Logo Icon */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-2xl animate-pulse"></div>
                <Rocket className="w-24 h-24 text-cyan-400 relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
            </div>

            {/* Title */}
            <h1 className="text-6xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] tracking-widest">
                GALAXY DEFENDERS
            </h1>
            <p className="text-cyan-400/80 mb-8 tracking-[0.3em] text-xs font-mono font-bold uppercase drop-shadow-[0_0_5px_cyan]">
                NEO-ARCADE SPACE SHOOTER
            </p>

            {/* Google Login Banner if Guest */}
            {currentUser.isGuest && (
                <div className="mb-6 animate-fade-in">
                    <GoogleLoginButton 
                        onClick={() => authService.promptGoogleAccountChooser()} 
                        text="SE CONNECTER AVEC GOOGLE (ACCOUNT CHOOSER)"
                    />
                </div>
            )}

            {/* Primary Action Button */}
            <button
                onClick={onStart}
                className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-extrabold rounded-2xl transition-all transform hover:scale-105 shadow-[0_0_35px_rgba(6,182,212,0.6)] border-2 border-cyan-300/80 flex items-center gap-3"
            >
                <Play size={24} className="fill-white group-hover:translate-x-1 transition-transform" />
                <span className="tracking-wider">ENGAGE MISSION</span>
            </button>

            {/* Secondary Action Buttons */}
            <div className="mt-5 flex items-center gap-3">
                <button
                    onClick={onHelp}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900/80 hover:bg-gray-800 text-cyan-300 text-sm font-bold rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all backdrop-blur-sm shadow-md"
                >
                    <HelpCircle size={18} className="text-cyan-400" />
                    <span className="tracking-wider font-mono">DATABASE & HELP</span>
                </button>

                <button
                    onClick={() => setShowHallOfFame(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900/80 hover:bg-gray-800 text-amber-300 text-sm font-bold rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all backdrop-blur-sm shadow-md"
                >
                    <Trophy size={18} className="text-amber-400" />
                    <span className="tracking-wider font-mono">HALL OF FAME</span>
                </button>
            </div>

            {showHallOfFame && (
                <div className="absolute inset-0 bg-gray-950/95 z-30 flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="w-full max-w-xl bg-gray-900/90 border-2 border-amber-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(251,191,36,0.2)]">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                            <div className="flex items-center gap-2.5">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <h2 className="text-xl font-black tracking-widest text-amber-300 font-mono">
                                    HALL OF FAME — TOP 10
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowHallOfFame(false)}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                                aria-label="Close Hall of Fame"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {top10.length === 0 ? (
                            <p className="text-center text-gray-400 font-mono text-sm py-8">
                                NO MISSION RECORDS YET. ENGAGE MISSION TO SET THE FIRST RECORD!
                            </p>
                        ) : (
                            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                                {top10.map((entry, idx) => (
                                    <div
                                        key={`${entry.pilotId}-${entry.date}-${idx}`}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs border ${
                                            idx === 0
                                                ? 'bg-amber-500/10 border-amber-400/50 text-amber-200'
                                                : 'bg-gray-950/70 border-gray-800/80 text-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`w-6 font-black ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                                                #{idx + 1}
                                            </span>
                                            <span className="font-bold truncate max-w-[140px]">
                                                {entry.pilotName}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-cyan-300 uppercase">
                                                {entry.shipId}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-gray-400">SEC {entry.level}</span>
                                            {entry.maxCombo > 1 && (
                                                <span className="text-fuchsia-400">x{entry.maxCombo}</span>
                                            )}
                                            <span className="font-black text-green-400 w-16 text-right">
                                                {entry.score.toString().padStart(6, '0')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls Summary */}
            <div className="mt-8 text-gray-400 text-xs font-mono grid grid-cols-2 gap-x-8 gap-y-2 text-center bg-gray-900/50 p-4 rounded-xl border border-gray-800/80 backdrop-blur-sm">
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
};
