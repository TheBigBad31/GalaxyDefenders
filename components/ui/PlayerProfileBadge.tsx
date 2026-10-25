import React, { useState } from 'react';
import { UserProfile, authService } from '../../services/authService';
import { User, LogOut, CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';

interface PlayerProfileBadgeProps {
  user: UserProfile;
  onLoginClick?: () => void;
  compact?: boolean;
}

export const PlayerProfileBadge: React.FC<PlayerProfileBadgeProps> = ({ user, onLoginClick, compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      authService.promptGoogleAccountChooser();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {user.isGuest ? (
          <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-700/80 rounded-xl px-3 py-1.5 shadow-[0_0_12px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-600">
              <ShieldAlert size={18} className="text-amber-400" />
            </div>
            {!compact && (
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-bold tracking-wider text-gray-300">GUEST PILOT</span>
                <span className="text-[8px] font-mono text-gray-500">NON CONNECTÉ</span>
              </div>
            )}
            <button
              onClick={handleLogin}
              className="ml-1 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all transform hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-400/50"
              title="Se connecter avec Google (Account Chooser)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>LOGIN</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-gray-900/90 border border-cyan-500/50 rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 group text-left hover:opacity-90 transition-opacity"
              title="Voir le profil pilote"
            >
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border-2 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center">
                    <User size={18} className="text-cyan-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-gray-900 flex items-center justify-center shadow-[0_0_5px_#10b981]" />
              </div>

              {!compact && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
                      {user.name}
                    </span>
                    <CheckCircle2 size={12} className="text-emerald-400 inline" />
                  </div>
                  <span className="text-[8px] font-mono text-cyan-500/80 uppercase">
                    {user.provider === 'sso_apphub' ? 'SSO APPHUB' : 'GOOGLE ID'}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-red-950/80 border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all ml-1"
              title="Déconnexion"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL PROFIL PILOTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-gray-950 border-2 border-cyan-500/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.4)] text-white font-mono">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center">
                  <User size={32} className="text-cyan-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-cyan-400 tracking-wider">{user.name}</h3>
                  <Sparkles size={16} className="text-yellow-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{user.email || 'Pilote Certifié Galaxy Defenders'}</p>
                <div className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                  {user.provider === 'sso_apphub' ? 'AUTHENTIFIÉ VIA APPHUB' : 'COMPTE GOOGLE VALIDÉ'}
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">IDENTIFIANT PILOTE :</span>
                <span className="text-cyan-300 font-bold">{user.id.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">STATUT SESSION :</span>
                <span className="text-emerald-400 font-bold">ACTIF / PRÊT AU COMBAT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">STOCKAGE LOCAL :</span>
                <span className="text-gray-300">Synchronisé</span>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs transition-all"
              >
                <LogOut size={16} />
                <span>DÉCONNEXION</span>
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
