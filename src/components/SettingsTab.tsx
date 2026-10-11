import React, { useRef } from 'react';
import { WealthData } from '../types';
import { Download, Upload, RotateCcw, ShieldCheck, User as UserIcon, Database, CheckCircle2, Cloud, Sparkles, Smartphone } from 'lucide-react';
import { User, ALLOWED_EMAIL } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';

interface SettingsTabProps {
  data: WealthData;
  onDataChange: (newData: WealthData) => void;
  onResetDefault: () => void;
  user: User | null;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  data,
  onDataChange,
  onResetDefault,
  user
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardClass = isLight
    ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
    : 'bg-slate-900 border-slate-800 shadow-xl';

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `patrimoine_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.peaLines && parsed.bitcoin) {
            onDataChange(parsed);
            alert('Données importées avec succès !');
          } else {
            alert('Format de fichier JSON invalide.');
          }
        } catch (err) {
          alert('Erreur lors de la lecture du fichier JSON.');
        }
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Account & Security Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all space-y-6 ${cardClass}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isLight ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Sécurité & Synchronisation Cloud
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Gestion des accès, compte whitelisté et persistance Firestore
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <UserIcon className="w-4 h-4 text-slate-400" /> Compte utilisateur
            </span>
            <span className={`font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {user?.email ? user.email : 'Mode local (Invité)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Whitelist de sécurité
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {ALLOWED_EMAIL}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <Database className="w-4 h-4 text-blue-500" /> Base de données
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {user ? 'Firebase Firestore (Temps réel connecté)' : 'Stockage Local (Navigateur sécurisé)'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Export / Import Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all space-y-6 ${cardClass}`}>
        <div>
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Sauvegarde & Restauration des Données
          </h3>
          <p className={`text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Exportez l'intégralité de vos actifs, transactions, investissements et projections sous forme de fichier JSON sécurisé, ou restaurez une sauvegarde précédente.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={handleExportJson}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-md shadow-blue-600/25 text-sm"
          >
            <Download className="w-4 h-4" /> Exporter la sauvegarde (JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2 border text-sm ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-500" /> Importer un fichier JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Defaults Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all space-y-4 ${cardClass}`}>
        <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
          Réinitialisation des Données
        </h3>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Remettre à zéro et recharger le jeu de données d'exemple avec les cotations de démonstration.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Voulez-vous vraiment réinitialiser toutes vos données avec les valeurs par défaut ?')) {
              onResetDefault();
            }
          }}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser aux valeurs d'exemple
        </button>
      </div>
    </div>
  );
};
