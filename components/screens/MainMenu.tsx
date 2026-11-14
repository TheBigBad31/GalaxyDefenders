import React, { useState, useEffect } from 'react';
import { Rocket, HelpCircle, Gamepad2, Play, Trophy, X } from 'lucide-react';
import { UserProfile, authService } from '../../services/authService';
import { PlayerProfileBadge } from '../ui/PlayerProfileBadge';
import { GoogleLoginButton } from '../ui/GoogleLoginButton';
import { highScoreService, HighScoreEntry } from '../../services/highScoreService';

interface MainMenuProps {
    onStart: () => void;
    onHelp: () => void;
    gamepadConnected: boolean;
    user?: UserProfile;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHelp, gamepadConnected, user }) => {
    const currentUser = user || authService.getCurrentUser();
    const [showHallOfFame, setShowHallOfFame] = useState(false);
    const [topScores, setTopScores] = useState<HighScoreEntry[]>([]);

    useEffect(() => {
        if (showHallOfFame) {
            setTopScores(highScoreService.getTop10());
        }
    }, [showHallOfFame]);

    useEffect(() => {
        if (!showHallOfFame) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowHallOfFame(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showHallOfFame]);

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

            {/* Help / Codex & Hall of Fame Buttons */}
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

            {/* Hall of Fame Modal */}
            {showHallOfFame && (
                <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md z-30 flex items-center justify-center p-6">
                    <div className="w-full max-w-xl bg-gray-900/95 border-2 border-amber-500/40 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gray-950/80">
                            <div className="flex items-center gap-2.5">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h2 className="text-lg font-black tracking-widest text-amber-300 font-mono">
                                    HALL OF FAME — TOP 10
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowHallOfFame(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                aria-label="Close Hall of Fame"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 max-h-[380px] overflow-y-auto">
                            {topScores.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-mono text-sm">
                                    NO MISSION RECORDS YET. DEPLOY AND SET THE FIRST HIGH SCORE!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {topScores.map((entry, idx) => (
                                        <div
                                            key={`${entry.pilotId}-${entry.date}-${idx}`}
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border font-mono text-xs ${
                                                idx === 0
                                                    ? 'bg-amber-500/10 border-amber-400/50 text-amber-200'
                                                    : 'bg-gray-950/60 border-gray-800 text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={`w-6 font-black ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                                                    #{idx + 1}
                                                </span>
                                                <span className="font-bold truncate max-w-[160px]" title={entry.pilotName}>
                                                    {entry.pilotName}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-cyan-300">
                                                    {entry.shipId}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-gray-400 text-[10px]">SEC {entry.level}</span>
                                                <span className="font-black text-emerald-400 text-sm">
                                                    {entry.score.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
