import React from 'react';
import { LayoutDashboard, Wallet, Settings, LogOut, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
import { User } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'overview' | 'portfolio' | 'settings';
  setActiveTab: (tab: 'overview' | 'portfolio' | 'settings') => void;
  user: User | null;
  onSignOut: () => void;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignOut,
  onRefreshPrices,
  isRefreshing,
  isOnline
}) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Patrimoine PWA
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                  Pro
                </span>
              </h1>
              <p className="text-xs text-slate-400">Suivi en temps réel & projections</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Vue Globale
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Portefeuille
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefreshPrices}
              disabled={isRefreshing}
              title="Actualiser les cotations (Euronext & Bitcoin)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            {/* Online status */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isOnline ? 'Synchronisé' : 'Hors-ligne'}
            </div>

            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-200">{user.displayName || 'Jérémie'}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 justify-end">
                    <ShieldCheck className="w-3 h-3" /> Whitelist
                  </div>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.email?.[0].toUpperCase() || 'J'}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  title="Se déconnecter"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2.5 px-4 fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            activeTab === 'overview' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Globale</span>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            activeTab === 'portfolio' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Portefeuille</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            activeTab === 'settings' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </button>
      </div>
    </header>
  );
};
