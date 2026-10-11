import React from 'react';
import { Shield, Lock, AlertTriangle, ArrowRight, Wallet, UserCheck, Sun, Moon, Info } from 'lucide-react';
import { ALLOWED_EMAIL } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  onContinueOffline: () => void;
  unauthorizedEmail: string | null;
  authError: string | null;
  onClearUnauthorized: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  onContinueOffline,
  unauthorizedEmail,
  authError,
  onClearUnauthorized
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Background ambient lighting */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity ${
        isLight ? 'bg-blue-200/50 opacity-70' : 'bg-blue-600/15 opacity-100'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity ${
        isLight ? 'bg-indigo-200/40 opacity-60' : 'bg-indigo-600/15 opacity-100'
      }`} />

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-2xl border transition-all shadow-sm flex items-center gap-2 text-xs font-semibold ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
        }`}
        title="Basculer le thème"
      >
        {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
        <span className="hidden sm:inline">{isLight ? 'Mode sombre' : 'Mode clair'}</span>
      </button>

      <div className={`max-w-md w-full rounded-3xl p-8 border shadow-2xl relative z-10 transition-all ${
        isLight
          ? 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-xl shadow-slate-200/60'
          : 'bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl shadow-blue-950/50'
      }`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Patrimoine & Wealth Tracker
          </h2>
          <p className={`text-sm mt-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Gestion, cotations en temps réel et projections patrimoniales privées.
          </p>
        </div>

        {/* Unauthorized Whitelist Alert */}
        {unauthorizedEmail && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Accès refusé</p>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                Le compte <span className="underline font-mono">{unauthorizedEmail}</span> n'est pas autorisé. Seul le propriétaire (<span className="font-mono">{ALLOWED_EMAIL}</span>) a accès à ce carnet.
              </p>
              <button
                onClick={onClearUnauthorized}
                className="mt-3 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-lg transition"
              >
                Réessayer avec un autre compte
              </button>
            </div>
          </div>
        )}

        {/* Auth Error Banner (e.g. Unauthorized Domain on GitHub Pages) */}
        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Information d'authentification</p>
              <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed">
                {authError}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
          }`}>
            <div className={`flex items-center gap-2 font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Shield className="w-4 h-4 text-emerald-500" />
              Sécurité stricte par Whitelist Google
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Authentification Google requise pour la synchronisation Cloud Firestore. Réservée à l'adresse <span className="font-mono font-semibold">{ALLOWED_EMAIL}</span>.
            </p>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={onGoogleSignIn}
            className={`w-full py-3.5 px-4 font-semibold rounded-2xl shadow-md transition flex items-center justify-center gap-3 group border ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:shadow-lg'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-transparent shadow-lg'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Se connecter avec Google</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Local / Offline mode fallback button */}
          <div className="pt-2 text-center">
            <button
              onClick={onContinueOffline}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-2xl border transition flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Consulter / Accéder en mode local (sans compte)</span>
            </button>
          </div>
        </div>

        <div className={`mt-8 text-center text-xs flex items-center justify-center gap-1.5 ${
          isLight ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Lock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
          Chiffrement SSL & Stockage sécurisé
        </div>
      </div>
    </div>
  );
};
