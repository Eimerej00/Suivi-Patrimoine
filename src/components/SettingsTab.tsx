import React, { useRef } from 'react';
import { WealthData } from '../types';
import { Download, Upload, RotateCcw, ShieldCheck, User as UserIcon, Database, CheckCircle2 } from 'lucide-react';
import { User, ALLOWED_EMAIL } from '../lib/firebase';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            alert('Format de fichier invalide.');
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sécurité & Compte Google</h3>
            <p className="text-xs text-slate-400">Gestion de l'accès whitelisté et synchronisation cloud</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-300" /> Compte connecté
            </span>
            <span className="font-mono text-white font-semibold">{user?.email || 'Non connecté'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statut Whitelist
            </span>
            <span className="text-emerald-400 font-medium">Autorisé ({ALLOWED_EMAIL})</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" /> Stockage Base de données
            </span>
            <span className="text-blue-400 font-medium">Firebase Firestore (Temps réel)</span>
          </div>
        </div>
      </div>

      {/* Data Export / Import Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white">Sauvegarde & Restauration des Données</h3>
        <p className="text-sm text-slate-400">
          Exportez l'intégralité de votre carnet de patrimoine au format JSON pour une sauvegarde locale ou un transfert, ou restaurez depuis une sauvegarde précédente.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={handleExportJson}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-lg shadow-blue-600/25 text-sm"
          >
            <Download className="w-4 h-4" /> Exporter en JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2 border border-slate-700 text-sm"
          >
            <Upload className="w-4 h-4 text-blue-400" /> Importer un JSON
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-rose-400">Réinitialisation des Données</h3>
        <p className="text-sm text-slate-400">
          Remettre les données par défaut d'exemple pour tester l'application.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Voulez-vous vraiment réinitialiser toutes vos données avec les valeurs par défaut ?')) {
              onResetDefault();
            }
          }}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser aux valeurs d'exemple
        </button>
      </div>
    </div>
  );
};
