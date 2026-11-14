import React, { useEffect, useState } from 'react';
import { Skull, Zap, RotateCcw, Trophy, Award } from 'lucide-react';
import { highScoreService, RecordScoreResult } from '../../services/highScoreService';

interface GameOverProps {
    score: number;
    level: number;
    shipId: string;
    pilotName: string;
    pilotId: string;
    maxCombo?: number;
    taunt: string;
    onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
    score,
    level,
    shipId,
    pilotName,
    pilotId,
    maxCombo = 0,
    taunt,
    onRestart,
}) => {
    const [recordResult, setRecordResult] = useState<RecordScoreResult | null>(null);

    useEffect(() => {
        const result = highScoreService.recordScore({
            score,
            level,
            shipId,
            pilotName,
            pilotId,
            maxCombo,
        });
        setRecordResult(result);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-10 p-8 text-center backdrop-blur-sm">
            <Skull className="w-20 h-20 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-5xl font-bold mb-2 text-red-100 tracking-tighter">MISSION FAILED</h2>

            {/* Record / Rank Badges */}
            {recordResult && (recordResult.isNewRecord || recordResult.isShipRecord || recordResult.rank !== null) && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 mb-2">
                    {recordResult.isNewRecord && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-black tracking-widest animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                            <Trophy className="w-3.5 h-3.5" /> NEW RECORD!
                        </span>
                    )}
                    {!recordResult.isNewRecord && recordResult.isShipRecord && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold tracking-widest">
                            <Award className="w-3.5 h-3.5" /> SHIP RECORD!
                        </span>
                    )}
                    {recordResult.rank !== null && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/70 text-emerald-300 text-xs font-mono font-bold tracking-wider">
                            RANK #{recordResult.rank}
                        </span>
                    )}
                </div>
            )}

            <div className="flex gap-8 mt-4 mb-8">
                <div>
                    <p className="text-xs text-red-400 uppercase">Final Score</p>
                    <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
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
};