import React from 'react';
import { Shield, Lock, AlertTriangle, ArrowRight, Wallet } from 'lucide-react';
import { ALLOWED_EMAIL } from '../lib/firebase';

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  unauthorizedEmail: string | null;
  onClearUnauthorized: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  unauthorizedEmail,
  onClearUnauthorized
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-blue-950/50 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Patrimoine & Wealth Tracker</h2>
          <p className="text-sm text-slate-400 mt-2">
            Application sécurisée de gestion et projection de patrimoine privé.
          </p>
        </div>

        {unauthorizedEmail && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Accès refusé</p>
              <p className="text-xs text-rose-300/80 mt-1">
                Le compte <span className="underline font-mono">{unauthorizedEmail}</span> n'est pas autorisé. Seul le propriétaire (<span className="font-mono">{ALLOWED_EMAIL}</span>) a accès à ce carnet de patrimoine.
              </p>
              <button
                onClick={onClearUnauthorized}
                className="mt-3 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1 rounded-lg transition"
              >
                Réessayer avec un autre compte
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400" />
              Sécurité stricte par Whitelist Google
            </div>
            <p className="text-slate-400 leading-relaxed">
              Authentification Google requise. Réservée exclusivement à l'adresse administrateur configurée.
            </p>
          </div>

          <button
            onClick={onGoogleSignIn}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl shadow-lg transition flex items-center justify-center gap-3 group"
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
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-600" />
          Chiffrement SSL & Synchronisation Cloud Firestore
        </div>
      </div>
    </div>
  );
};
