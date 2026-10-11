import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTheme } from '../context/ThemeContext';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // If already running as an installed PWA on the home screen / desktop window, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Installer l'application sur votre appareil"
        className={`flex items-center gap-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
          isLight
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
        } ${variant === 'compact' ? 'px-3 py-2' : 'w-full px-4 py-3 justify-center text-sm'} ${className}`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>{variant === 'compact' ? 'Installer' : 'Installer l\'application'}</span>
      </button>

      {/* Guide Modal for iOS or manual instructions */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <button
              onClick={() => setShowGuideModal(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg border transition ${
                isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-500' : 'border-slate-700 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Installer Patrimoine App</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Accès rapide depuis votre écran d'accueil</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3.5 my-4 text-xs">
                <p className={`p-3 rounded-xl border ${isLight ? 'bg-blue-50/60 border-blue-100 text-blue-900' : 'bg-blue-950/40 border-blue-900/50 text-blue-200'}`}>
                  Sur iPhone ou iPad (Safari), l'installation se fait en 2 étapes simples :
                </p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div className="leading-relaxed">
                    Appuyez sur l'icône <strong className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"><Share2 className="w-3.5 h-3.5" /> Partager</strong> dans la barre du bas de Safari.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div className="leading-relaxed">
                    Faites défiler la liste vers le bas et sélectionnez <strong className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"><PlusSquare className="w-3.5 h-3.5" /> Sur l'écran d'accueil</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </span>
                  <div className="leading-relaxed text-slate-600 dark:text-slate-300">
                    Cliquez sur <strong>Ajouter</strong> en haut à droite. L'icône sera instantanément sur votre écran d'accueil !
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-4 text-xs">
                <p className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
                  Sur Chrome, Edge ou Android :
                </p>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <span>Sur ordinateur : cliquez sur l'icône <strong>Installer l'application</strong> située tout à droite dans la barre d'adresse de votre navigateur.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <span>Sur mobile Android : appuyez sur le menu (les 3 points) puis sélectionnez <strong>Ajouter à l'écran d'accueil</strong> ou <strong>Installer l'application</strong>.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
