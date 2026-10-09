import React, { useState } from 'react';
import { WealthData, StockLine, SimpleAssetLine, RealEstateLine } from '../types';
import {
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  Coins,
  Building2,
  Briefcase,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

interface PortfolioTabProps {
  data: WealthData;
  onDataChange: (newData: WealthData) => void;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
}

const POPULAR_PRESETS = [
  { isin: 'LU1681043599', name: 'Amundi MSCI World UCITS ETF' },
  { isin: 'FR0000120172', name: 'LVMH Moët Hennessy' },
  { isin: 'FR0000121014', name: 'TotalEnergies' },
  { isin: 'FR0000120321', name: "L'Oréal" },
  { isin: 'FR0000133308', name: 'Air Liquide' },
  { isin: 'FR0000120578', name: 'Schneider Electric' },
  { isin: 'FR0007050076', name: 'Amundi ETF CAC 40' }
];

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  data,
  onDataChange,
  onRefreshPrices,
  isRefreshing
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pea_cto' | 'crypto' | 'epargne' | 'immobilier'>('pea_cto');

  // Stock modal / form state
  const [stockType, setStockType] = useState<'pea' | 'cto'>('pea');
  const [newIsin, setNewIsin] = useState('');
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState<number>(10);
  const [newPurchasePrice, setNewPurchasePrice] = useState<number>(100);

  // Bitcoin form state
  const [btcAmount, setBtcAmount] = useState<number>(data.bitcoin.amount);
  const [btcPurchasePrice, setBtcPurchasePrice] = useState<number>(data.bitcoin.purchasePriceEur);

  // Simple asset form
  const [assetCategory, setAssetCategory] = useState<'pee' | 'livret' | 'assuranceVie'>('livret');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState<number>(5000);
  const [newAssetRate, setNewAssetRate] = useState<number>(3.0);

  // Real estate form
  const [newImmoName, setNewImmoName] = useState('');
  const [newImmoVal, setNewImmoVal] = useState<number>(250000);
  const [newImmoDebt, setNewImmoDebt] = useState<number>(180000);
  const [newImmoRate, setNewImmoRate] = useState<number>(2.5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(val);
  };

  // Add stock line
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsin && !newName) return;
    const item: StockLine = {
      id: `stock-${Date.now()}`,
      isin: newIsin.toUpperCase() || 'FR0000000000',
      name: newName || newIsin,
      quantity: Number(newQty) || 0,
      purchasePrice: Number(newPurchasePrice) || 0,
      currentPrice: Number(newPurchasePrice) || 0
    };

    const updated = { ...data };
    if (stockType === 'pea') {
      updated.peaLines = [...updated.peaLines, item];
    } else {
      updated.ctoLines = [...updated.ctoLines, item];
    }
    onDataChange(updated);
    setNewIsin('');
    setNewName('');
  };

  const handleRemoveStock = (type: 'pea' | 'cto', id: string) => {
    const updated = { ...data };
    if (type === 'pea') {
      updated.peaLines = updated.peaLines.filter(i => i.id !== id);
    } else {
      updated.ctoLines = updated.ctoLines.filter(i => i.id !== id);
    }
    onDataChange(updated);
  };

  const handlePresetSelect = (preset: { isin: string; name: string }) => {
    setNewIsin(preset.isin);
    setNewName(preset.name);
  };

  // Bitcoin update
  const handleUpdateBtc = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...data,
      bitcoin: {
        ...data.bitcoin,
        amount: Number(btcAmount),
        purchasePriceEur: Number(btcPurchasePrice)
      }
    };
    onDataChange(updated);
    alert('Position Bitcoin mise à jour avec succès !');
  };

  // Add simple asset (PEE / Livret / Assurance Vie)
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName) return;
    const item: SimpleAssetLine = {
      id: `asset-${Date.now()}`,
      name: newAssetName,
      value: Number(newAssetValue),
      annualReturnRate: Number(newAssetRate)
    };
    const updated = { ...data };
    if (assetCategory === 'pee') updated.peeLines = [...updated.peeLines, item];
    else if (assetCategory === 'livret') updated.livretLines = [...updated.livretLines, item];
    else updated.assuranceVieLines = [...updated.assuranceVieLines, item];

    onDataChange(updated);
    setNewAssetName('');
  };

  const handleRemoveAsset = (category: 'pee' | 'livret' | 'assuranceVie', id: string) => {
    const updated = { ...data };
    if (category === 'pee') updated.peeLines = updated.peeLines.filter(i => i.id !== id);
    else if (category === 'livret') updated.livretLines = updated.livretLines.filter(i => i.id !== id);
    else updated.assuranceVieLines = updated.assuranceVieLines.filter(i => i.id !== id);
    onDataChange(updated);
  };

  // Add Real Estate
  const handleAddImmo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImmoName) return;
    const item: RealEstateLine = {
      id: `immo-${Date.now()}`,
      name: newImmoName,
      estimatedValue: Number(newImmoVal),
      remainingDebt: Number(newImmoDebt),
      annualReturnRate: Number(newImmoRate)
    };
    const updated = {
      ...data,
      realEstateLines: [...data.realEstateLines, item]
    };
    onDataChange(updated);
    setNewImmoName('');
  };

  const handleRemoveImmo = (id: string) => {
    const updated = {
      ...data,
      realEstateLines: data.realEstateLines.filter(i => i.id !== id)
    };
    onDataChange(updated);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('pea_cto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'pea_cto' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          PEA & CTO (Euronext)
        </button>
        <button
          onClick={() => setActiveSubTab('crypto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'crypto' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          Bitcoin & Crypto
        </button>
        <button
          onClick={() => setActiveSubTab('epargne')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'epargne' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          PEE, Livrets & Assurances Vie
        </button>
        <button
          onClick={() => setActiveSubTab('immobilier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'immobilier' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Immobilier & Crédits
        </button>
      </div>

      {/* SUB-TAB 1: PEA & CTO */}
      {activeSubTab === 'pea_cto' && (
        <div className="space-y-6">
          {/* Add Stock Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter une ligne d'action / ETF (PEA ou CTO)</h3>
            
            {/* Presets */}
            <div className="mb-4">
              <span className="text-xs text-slate-400 block mb-2">Suggestions populaires Euronext Paris (cliquez pour remplir) :</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    {p.name} <span className="text-blue-400 font-mono">({p.isin})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddStock} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Type de compte</label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value as 'pea' | 'cto')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="pea">PEA</option>
                  <option value="cto">CTO (Compte Titres)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Code ISIN</label>
                <input
                  type="text"
                  placeholder="ex: LU1681043599"
                  value={newIsin}
                  onChange={(e) => setNewIsin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nom / Libellé</label>
                <input
                  type="text"
                  placeholder="ex: Amundi MSCI World"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de parts</label>
                <input
                  type="number"
                  step="any"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prix d'achat unitaire (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newPurchasePrice}
                  onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/30 text-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter au portefeuille
                </button>
              </div>
            </form>
          </div>

          {/* PEA Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> PEA (Plan d'Épargne en Actions)
              </h4>
              <button
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser les cours Euronext
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Titre / ISIN</th>
                    <th className="pb-3 font-semibold text-right">Qté</th>
                    <th className="pb-3 font-semibold text-right">Cours actuel</th>
                    <th className="pb-3 font-semibold text-right">Valeur totale</th>
                    <th className="pb-3 font-semibold text-right">Plus-value</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.peaLines.map((item) => {
                    const totalVal = item.quantity * item.currentPrice;
                    const investedVal = item.quantity * item.purchasePrice;
                    const gain = totalVal - investedVal;
                    const gainPct = investedVal > 0 ? (gain / investedVal) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-xs font-mono text-blue-400">{item.isin}</div>
                        </td>
                        <td className="py-4 text-right font-medium text-slate-200">{item.quantity}</td>
                        <td className="py-4 text-right font-mono text-slate-200">{formatCurrency(item.currentPrice)}</td>
                        <td className="py-4 text-right font-bold text-white">{formatCurrency(totalVal)}</td>
                        <td className={`py-4 text-right font-semibold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveStock('pea', item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.peaLines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                        Aucune ligne dans le PEA. Ajoutez votre premier titre ci-dessus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTO Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" /> CTO (Compte Titres Ordinaire)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Titre / ISIN</th>
                    <th className="pb-3 font-semibold text-right">Qté</th>
                    <th className="pb-3 font-semibold text-right">Cours actuel</th>
                    <th className="pb-3 font-semibold text-right">Valeur totale</th>
                    <th className="pb-3 font-semibold text-right">Plus-value</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.ctoLines.map((item) => {
                    const totalVal = item.quantity * item.currentPrice;
                    const investedVal = item.quantity * item.purchasePrice;
                    const gain = totalVal - investedVal;
                    const gainPct = investedVal > 0 ? (gain / investedVal) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-xs font-mono text-indigo-400">{item.isin}</div>
                        </td>
                        <td className="py-4 text-right font-medium text-slate-200">{item.quantity}</td>
                        <td className="py-4 text-right font-mono text-slate-200">{formatCurrency(item.currentPrice)}</td>
                        <td className="py-4 text-right font-bold text-white">{formatCurrency(totalVal)}</td>
                        <td className={`py-4 text-right font-semibold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveStock('cto', item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.ctoLines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                        Aucune ligne dans le CTO.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BITCOIN & CRYPTO */}
      {activeSubTab === 'crypto' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
                  ₿
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Position Bitcoin (BTC/EUR)</h3>
                  <p className="text-xs text-slate-400">Cours en temps réel synchronisé (Paymium / CoinGecko)</p>
                </div>
              </div>
              <button
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser le cours BTC
              </button>
            </div>

            {/* Bitcoin Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 mb-6">
              <div>
                <span className="text-xs text-slate-400">Quantité détenue</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{data.bitcoin.amount} BTC</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Cours actuel (EUR)</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{formatCurrency(data.bitcoin.currentPriceEur)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Valeur totale</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{formatCurrency(data.bitcoin.amount * data.bitcoin.currentPriceEur)}</div>
              </div>
            </div>

            {/* Form to update BTC */}
            <form onSubmit={handleUpdateBtc} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de Bitcoins (BTC)</label>
                <input
                  type="number"
                  step="any"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prix d'achat moyen (Pru en €)</label>
                <input
                  type="number"
                  step="any"
                  value={btcPurchasePrice}
                  onChange={(e) => setBtcPurchasePrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-amber-600/30 text-sm"
                >
                  Enregistrer les modifications Bitcoin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PEE, LIVRETS & ASSURANCES VIE */}
      {activeSubTab === 'epargne' && (
        <div className="space-y-6">
          {/* Add Asset Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter un Livret, PEE ou Assurance Vie</h3>
            <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Catégorie</label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value as 'pee' | 'livret' | 'assuranceVie')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="livret">Livret & Épargne (Livret A, LDDS...)</option>
                  <option value="assuranceVie">Assurance Vie</option>
                  <option value="pee">PEE (Plan d'Épargne Entreprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nom du compte</label>
                <input
                  type="text"
                  placeholder="ex: Livret A / AV Boursorama"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valeur actuelle (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newAssetValue}
                  onChange={(e) => setNewAssetValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rendement net estimé (%/an)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newAssetRate}
                  onChange={(e) => setNewAssetRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter l'épargne
                </button>
              </div>
            </form>
          </div>

          {/* Livrets Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-md font-bold text-white mb-4">Livrets & Épargne de Précaution</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Nom</th>
                    <th className="pb-3 font-semibold text-right">Rendement net</th>
                    <th className="pb-3 font-semibold text-right">Valeur actuelle</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.livretLines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 font-bold text-white">{item.name}</td>
                      <td className="py-4 text-right text-emerald-400 font-semibold">{item.annualReturnRate}% / an</td>
                      <td className="py-4 text-right font-bold text-white">{formatCurrency(item.value)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleRemoveAsset('livret', item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assurance Vie Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-md font-bold text-white mb-4">Assurance Vie</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Nom</th>
                    <th className="pb-3 font-semibold text-right">Rendement net</th>
                    <th className="pb-3 font-semibold text-right">Valeur actuelle</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.assuranceVieLines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 font-bold text-white">{item.name}</td>
                      <td className="py-4 text-right text-emerald-400 font-semibold">{item.annualReturnRate}% / an</td>
                      <td className="py-4 text-right font-bold text-white">{formatCurrency(item.value)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleRemoveAsset('assuranceVie', item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PEE Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-md font-bold text-white mb-4">PEE (Plan d'Épargne Entreprise)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Nom</th>
                    <th className="pb-3 font-semibold text-right">Rendement net</th>
                    <th className="pb-3 font-semibold text-right">Valeur actuelle</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.peeLines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 font-bold text-white">{item.name}</td>
                      <td className="py-4 text-right text-emerald-400 font-semibold">{item.annualReturnRate}% / an</td>
                      <td className="py-4 text-right font-bold text-white">{formatCurrency(item.value)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleRemoveAsset('pee', item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: IMMOBILIER */}
      {activeSubTab === 'immobilier' && (
        <div className="space-y-6">
          {/* Add Real Estate Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter un bien immobilier & crédit associé</h3>
            <form onSubmit={handleAddImmo} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Nom du bien</label>
                <input
                  type="text"
                  placeholder="ex: Résidence Principale / Appartement Locatif"
                  value={newImmoName}
                  onChange={(e) => setNewImmoName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valeur estimée actuelle (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newImmoVal}
                  onChange={(e) => setNewImmoVal(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Capital restant dû (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newImmoDebt}
                  onChange={(e) => setNewImmoDebt(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rendement annuel (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newImmoRate}
                  onChange={(e) => setNewImmoRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/30 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter le bien immobilier
                </button>
              </div>
            </form>
          </div>

          {/* Real Estate Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-md font-bold text-white mb-4">Patrimoine Immobilier & Crédits en cours</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Bien</th>
                    <th className="pb-3 font-semibold text-right">Valeur estimée</th>
                    <th className="pb-3 font-semibold text-right">Capital restant dû</th>
                    <th className="pb-3 font-semibold text-right">Valeur nette</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.realEstateLines.map((item) => {
                    const netVal = item.estimatedValue - item.remainingDebt;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 text-right font-mono text-slate-200">{formatCurrency(item.estimatedValue)}</td>
                        <td className="py-4 text-right font-mono text-rose-400">-{formatCurrency(item.remainingDebt)}</td>
                        <td className="py-4 text-right font-bold text-cyan-400">{formatCurrency(netVal)}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveImmo(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.realEstateLines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                        Aucun bien immobilier enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
