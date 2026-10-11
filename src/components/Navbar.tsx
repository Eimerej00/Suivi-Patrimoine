import React from 'react';
import { LayoutDashboard, Wallet, Settings, LogOut, ShieldCheck, RefreshCw, Sun, Moon } from 'lucide-react';
import { User } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { PWAInstallButton } from './PWAInstallButton';

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
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <header className={`${isLight ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm' : 'bg-slate-900/90 border-slate-800 text-white'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Patrimoine & Wealth
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/25">
                  Pro
                </span>
              </h1>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Suivi en temps réel & projections privées</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className={`hidden md:flex items-center space-x-1 p-1 rounded-2xl border ${
            isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Vue Globale
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Portefeuille
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isLight ? 'Passer au mode sombre' : 'Passer au mode clair'}
              className={`p-2 rounded-xl border transition flex items-center justify-center ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Refresh Quotes Button */}
            <button
              onClick={onRefreshPrices}
              disabled={isRefreshing}
              title="Actualiser les cotations (Euronext Paris & Bitcoin)"
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="compact" />

            {/* Online status */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isOnline ? 'Synchronisé' : 'Hors-ligne'}
            </div>

            {user && (
              <div className={`flex items-center gap-2 pl-2 border-l ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="hidden sm:block text-right">
                  <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{user.displayName || 'Jérémie'}</div>
                  <div className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 justify-end font-medium">
                    <ShieldCheck className="w-3 h-3" /> Whitelist
                  </div>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className={`w-9 h-9 rounded-full border ${isLight ? 'border-slate-300' : 'border-slate-700'}`} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
                    {user.email?.[0].toUpperCase() || 'J'}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  title="Se déconnecter"
                  className={`p-2 rounded-xl border transition ${
                    isLight
                      ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                      : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden flex items-center justify-around border-t py-2.5 px-4 fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md ${
        isLight ? 'bg-white/95 border-slate-200 shadow-lg' : 'bg-slate-900/95 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400' : isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Globale</span>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            activeTab === 'portfolio' ? 'text-blue-600 dark:text-blue-400' : isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Portefeuille</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </button>
      </div>
    </header>
  );
};
