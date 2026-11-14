import React, { useEffect, useRef, useState } from 'react';
import { Skull, Zap, RotateCcw, Trophy, Award } from 'lucide-react';
import { highScoreService, RecordScoreResult } from '../../services/highScoreService';

interface GameOverProps {
    score: number;
    level: number;
    taunt: string;
    onRestart: () => void;
    shipId?: string;
    pilotName?: string;
    pilotId?: string;
    maxCombo?: number;
}

export const GameOver: React.FC<GameOverProps> = ({
    score,
    level,
    taunt,
    onRestart,
    shipId = 'VIPER',
    pilotName = 'GUEST PILOT',
    pilotId = 'guest_pilot',
    maxCombo = 1,
}) => {
    const [recordResult, setRecordResult] = useState<RecordScoreResult | null>(null);
    const recordedRef = useRef(false);

    useEffect(() => {
        if (recordedRef.current) return;
        recordedRef.current = true;
        const result = highScoreService.recordScore({
            score,
            level,
            shipId,
            pilotName,
            pilotId,
            maxCombo,
        });
        setRecordResult(result);
    }, [score, level, shipId, pilotName, pilotId, maxCombo]);

    const isNewRecord = Boolean(recordResult?.isNewGlobalRecord || recordResult?.isNewShipRecord);

    return (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-10 p-8 text-center backdrop-blur-sm">
            <Skull className="w-20 h-20 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-5xl font-bold mb-2 text-red-100 tracking-tighter">MISSION FAILED</h2>

            {isNewRecord && (
                <div className="mt-2 mb-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-extrabold tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.45)] animate-pulse">
                    <Trophy className="w-4 h-4 text-amber-300" />
                    NEW RECORD!
                </div>
            )}

            <div className="flex gap-8 mt-4 mb-8">
                <div>
                    <p className="text-xs text-red-400 uppercase">Final Score</p>
                    <p className="text-2xl font-bold text-white">{score.toString().padStart(6, '0')}</p>
                </div>
                <div>
                    <p className="text-xs text-cyan-400 uppercase">Waves Cleared</p>
                    <p className="text-2xl font-bold text-white">{level}</p>
                </div>
                {recordResult?.rank !== null && recordResult?.rank !== undefined && (
                    <div>
                        <p className="text-xs text-amber-400 uppercase">Hall of Fame</p>
                        <p className="text-2xl font-bold text-amber-300 flex items-center justify-center gap-1">
                            <Award className="w-5 h-5" /> #{recordResult.rank}
                        </p>
                    </div>
                )}
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