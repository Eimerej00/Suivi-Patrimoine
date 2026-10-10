import React, { useState } from 'react';
import { StockLine, SimpleAssetLine, RealEstateLine } from '../types';
import { X, Check, Pencil } from 'lucide-react';

/* -------------------------------------------------------------
   EDIT STOCK MODAL (PEA & CTO)
------------------------------------------------------------- */
interface EditStockModalProps {
  stock: StockLine;
  accountType: 'pea' | 'cto';
  onClose: () => void;
  onSave: (updated: StockLine) => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({
  stock,
  accountType,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(stock.name);
  const [isin, setIsin] = useState(stock.isin);
  const [quantity, setQuantity] = useState(stock.quantity);
  const [purchasePrice, setPurchasePrice] = useState(stock.purchasePrice);
  const [currentPrice, setCurrentPrice] = useState(stock.currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...stock,
      name: name.trim() || stock.name,
      isin: isin.trim().toUpperCase() || stock.isin,
      quantity: Number(quantity) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      currentPrice: Number(currentPrice) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Modifier la ligne {accountType.toUpperCase()}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nom / Libellé</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Code ISIN</label>
            <input
              type="text"
              value={isin}
              onChange={(e) => setIsin(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de parts</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">PRU (€)</label>
              <input
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cours actuel (€)</label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Check className="w-3.5 h-3.5" /> Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------
   EDIT SIMPLE ASSET MODAL (Livrets, PEE, Assurance Vie)
------------------------------------------------------------- */
interface EditSimpleAssetModalProps {
  asset: SimpleAssetLine;
  categoryLabel: string;
  onClose: () => void;
  onSave: (updated: SimpleAssetLine) => void;
}

export const EditSimpleAssetModal: React.FC<EditSimpleAssetModalProps> = ({
  asset,
  categoryLabel,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(asset.name);
  const [value, setValue] = useState(asset.value);
  const [annualReturnRate, setAnnualReturnRate] = useState(asset.annualReturnRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...asset,
      name: name.trim() || asset.name,
      value: Number(value) || 0,
      annualReturnRate: Number(annualReturnRate) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Modifier : {categoryLabel}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nom du compte / placement</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valeur actuelle (€)</label>
              <input
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Rendement net (%/an)</label>
              <input
                type="number"
                step="0.01"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Check className="w-3.5 h-3.5" /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------
   EDIT REAL ESTATE MODAL
------------------------------------------------------------- */
interface EditRealEstateModalProps {
  realEstate: RealEstateLine;
  onClose: () => void;
  onSave: (updated: RealEstateLine) => void;
}

export const EditRealEstateModal: React.FC<EditRealEstateModalProps> = ({
  realEstate,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(realEstate.name);
  const [estimatedValue, setEstimatedValue] = useState(realEstate.estimatedValue);
  const [remainingDebt, setRemainingDebt] = useState(realEstate.remainingDebt);
  const [annualReturnRate, setAnnualReturnRate] = useState(realEstate.annualReturnRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...realEstate,
      name: name.trim() || realEstate.name,
      estimatedValue: Number(estimatedValue) || 0,
      remainingDebt: Number(remainingDebt) || 0,
      annualReturnRate: Number(annualReturnRate) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Modifier le bien immobilier
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nom du bien</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valeur estimée (€)</label>
              <input
                type="number"
                step="any"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Capital restant dû (€)</label>
              <input
                type="number"
                step="any"
                value={remainingDebt}
                onChange={(e) => setRemainingDebt(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rendement annuel (%)</label>
            <input
              type="number"
              step="0.01"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs flex justify-between">
            <span className="text-slate-400">Valeur nette calculée :</span>
            <span className="font-bold text-cyan-400 font-mono">
              {(Number(estimatedValue) - Number(remainingDebt)).toLocaleString('fr-FR')} €
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
            >
              <Check className="w-3.5 h-3.5" /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
