import React, { useState } from 'react';
import { WealthData, StockLine, SimpleAssetLine, RealEstateLine } from '../types';
import { useTheme } from '../context/ThemeContext';
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
  ExternalLink,
  Pencil,
  History
} from 'lucide-react';
import { StockHistoryModal } from './StockHistoryModal';
import { EditStockModal, EditSimpleAssetModal, EditRealEstateModal } from './EditModals';

interface PortfolioTabProps {
  data: WealthData;
  onDataChange: (newData: WealthData) => void;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
}

const POPULAR_PRESETS = [
  { isin: 'IE000BI8OT95', name: 'Amundi Core MSCI World UCITS ETF' },
  { isin: 'LU1681043599', name: 'Amundi MSCI World (CW8)' },
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeSubTab, setActiveSubTab] = useState<'pea_cto' | 'crypto' | 'epargne' | 'immobilier'>('pea_cto');

  // Modal states
  const [activeHistoryStock, setActiveHistoryStock] = useState<{ type: 'pea' | 'cto'; stock: StockLine } | null>(null);
  const [editingStock, setEditingStock] = useState<{ type: 'pea' | 'cto'; stock: StockLine } | null>(null);
  const [editingSimpleAsset, setEditingSimpleAsset] = useState<{
    category: 'pee' | 'livret' | 'assuranceVie';
    asset: SimpleAssetLine;
    label: string;
  } | null>(null);
  const [editingRealEstate, setEditingRealEstate] = useState<RealEstateLine | null>(null);

  // New stock form state
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
      currentPrice: Number(newPurchasePrice) || 0,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          quantity: Number(newQty) || 0,
          price: Number(newPurchasePrice) || 0,
          note: 'Achat initial'
        }
      ]
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

  const handleSaveStock = (type: 'pea' | 'cto', updatedStock: StockLine) => {
    const updated = { ...data };
    if (type === 'pea') {
      updated.peaLines = updated.peaLines.map(s => s.id === updatedStock.id ? updatedStock : s);
    } else {
      updated.ctoLines = updated.ctoLines.map(s => s.id === updatedStock.id ? updatedStock : s);
    }
    onDataChange(updated);
    if (activeHistoryStock && activeHistoryStock.stock.id === updatedStock.id) {
      setActiveHistoryStock({ type, stock: updatedStock });
    }
  };

  const handleRemoveStock = (type: 'pea' | 'cto', id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne du portefeuille ?')) return;
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
    alert('Position Bitcoin enregistrée avec succès !');
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

  const handleSaveSimpleAsset = (category: 'pee' | 'livret' | 'assuranceVie', updatedAsset: SimpleAssetLine) => {
    const updated = { ...data };
    if (category === 'pee') {
      updated.peeLines = updated.peeLines.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    } else if (category === 'livret') {
      updated.livretLines = updated.livretLines.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    } else {
      updated.assuranceVieLines = updated.assuranceVieLines.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    }
    onDataChange(updated);
  };

  const handleRemoveAsset = (category: 'pee' | 'livret' | 'assuranceVie', id: string) => {
    if (!window.confirm('Voulez-vous supprimer ce compte / livret ?')) return;
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

  const handleSaveRealEstate = (updatedImmo: RealEstateLine) => {
    const updated = {
      ...data,
      realEstateLines: data.realEstateLines.map(r => r.id === updatedImmo.id ? updatedImmo : r)
    };
    onDataChange(updated);
  };

  const handleRemoveImmo = (id: string) => {
    if (!window.confirm('Voulez-vous supprimer ce bien immobilier ?')) return;
    const updated = {
      ...data,
      realEstateLines: data.realEstateLines.filter(i => i.id !== id)
    };
    onDataChange(updated);
  };

  const cardBgClass = isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl';
  const inputBgClass = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
    : 'bg-slate-800 border-slate-700 text-white focus:border-blue-500';

  return (
    <div className="space-y-6 pb-16">
      {/* Sub-tab Navigation */}
      <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border transition ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveSubTab('pea_cto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSubTab === 'pea_cto'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          PEA & CTO (Euronext)
        </button>
        <button
          onClick={() => setActiveSubTab('crypto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSubTab === 'crypto'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          Bitcoin & Crypto
        </button>
        <button
          onClick={() => setActiveSubTab('epargne')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSubTab === 'epargne'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          PEE, Livrets & Assurance Vie
        </button>
        <button
          onClick={() => setActiveSubTab('immobilier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSubTab === 'immobilier'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h3 className={`text-base font-bold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Ajouter une ligne d'action / ETF (PEA ou CTO)
            </h3>
            
            {/* Presets */}
            <div className="mb-4">
              <span className={`text-xs block mb-2 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Suggestions rapides Euronext Paris (cliquez pour pré-remplir) :
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {p.name} <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">({p.isin})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddStock} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Type de compte</label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value as 'pea' | 'cto')}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${inputBgClass}`}
                >
                  <option value="pea">PEA</option>
                  <option value="cto">CTO (Compte Titres)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Code ISIN</label>
                <input
                  type="text"
                  placeholder="ex: IE000BI8OT95"
                  value={newIsin}
                  onChange={(e) => setNewIsin(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nom / Libellé</label>
                <input
                  type="text"
                  placeholder="ex: Amundi MSCI World"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nombre de parts</label>
                <input
                  type="number"
                  step="any"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Prix d'achat unitaire (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newPurchasePrice}
                  onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/30 text-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter au portefeuille
                </button>
              </div>
            </form>
          </div>

          {/* PEA Table */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" /> PEA (Plan d'Épargne en Actions)
              </h4>
              <button
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser les cours
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Titre / ISIN</th>
                    <th className="py-3 px-3 text-right">Qté</th>
                    <th className="py-3 px-3 text-right">PRU (€)</th>
                    <th className="py-3 px-3 text-right">Cours actuel</th>
                    <th className="py-3 px-3 text-right">Valeur totale</th>
                    <th className="py-3 px-3 text-right">Plus-value</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.peaLines.map((item) => {
                    const totalVal = item.quantity * item.currentPrice;
                    const investedVal = item.quantity * item.purchasePrice;
                    const gain = totalVal - investedVal;
                    const gainPct = investedVal > 0 ? (gain / investedVal) * 100 : 0;
                    const txCount = item.transactions?.length || 0;

                    return (
                      <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                        <td className="py-3.5 px-3">
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</div>
                          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 flex items-center gap-2 mt-0.5">
                            <span>{item.isin}</span>
                            {txCount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-sans font-medium ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {txCount} {txCount === 1 ? 'ordre' : 'ordres'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3.5 px-3 text-right font-medium font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{item.quantity}</td>
                        <td className={`py-3.5 px-3 text-right font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{formatCurrency(item.purchasePrice)}</td>
                        <td className={`py-3.5 px-3 text-right font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{formatCurrency(item.currentPrice)}</td>
                        <td className={`py-3.5 px-3 text-right font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(totalVal)}</td>
                        <td className={`py-3.5 px-3 text-right font-semibold font-mono ${gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveHistoryStock({ type: 'pea', stock: item })}
                              title="Ajouter un achat (DCA) & Voir l'historique"
                              className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                                isLight
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              <History className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Investir</span>
                            </button>

                            <button
                              onClick={() => setEditingStock({ type: 'pea', stock: item })}
                              title="Modifier cette ligne"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveStock('pea', item.id)}
                              title="Supprimer cette ligne"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                  : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {data.peaLines.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`py-8 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        Aucune ligne dans le PEA. Ajoutez votre premier titre ci-dessus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTO Table */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" /> CTO (Compte Titres Ordinaire)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Titre / ISIN</th>
                    <th className="py-3 px-3 text-right">Qté</th>
                    <th className="py-3 px-3 text-right">PRU (€)</th>
                    <th className="py-3 px-3 text-right">Cours actuel</th>
                    <th className="py-3 px-3 text-right">Valeur totale</th>
                    <th className="py-3 px-3 text-right">Plus-value</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.ctoLines.map((item) => {
                    const totalVal = item.quantity * item.currentPrice;
                    const investedVal = item.quantity * item.purchasePrice;
                    const gain = totalVal - investedVal;
                    const gainPct = investedVal > 0 ? (gain / investedVal) * 100 : 0;
                    const txCount = item.transactions?.length || 0;

                    return (
                      <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                        <td className="py-3.5 px-3">
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</div>
                          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mt-0.5">
                            <span>{item.isin}</span>
                            {txCount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-sans font-medium ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {txCount} {txCount === 1 ? 'ordre' : 'ordres'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3.5 px-3 text-right font-medium font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{item.quantity}</td>
                        <td className={`py-3.5 px-3 text-right font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{formatCurrency(item.purchasePrice)}</td>
                        <td className={`py-3.5 px-3 text-right font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{formatCurrency(item.currentPrice)}</td>
                        <td className={`py-3.5 px-3 text-right font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(totalVal)}</td>
                        <td className={`py-3.5 px-3 text-right font-semibold font-mono ${gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveHistoryStock({ type: 'cto', stock: item })}
                              title="Ajouter un achat (DCA) & Voir l'historique"
                              className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                                isLight
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              <History className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Investir</span>
                            </button>

                            <button
                              onClick={() => setEditingStock({ type: 'cto', stock: item })}
                              title="Modifier cette ligne"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveStock('cto', item.id)}
                              title="Supprimer cette ligne"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                  : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {data.ctoLines.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`py-8 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
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
          <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${cardBgClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border ${
                  isLight ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  ₿
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Position Bitcoin (BTC/EUR)</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cours en direct synchronisé (Binance / Paymium / CoinGecko)</p>
                </div>
              </div>
              <button
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-amber-600/25"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser le cours
              </button>
            </div>

            {/* Bitcoin Summary Card */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl border mb-6 ${
              isLight ? 'bg-amber-50/50 border-amber-200/80' : 'bg-slate-800/50 border-slate-700/60'
            }`}>
              <div>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Quantité détenue</span>
                <div className={`text-2xl font-extrabold mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.bitcoin.amount} BTC</div>
              </div>
              <div>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Cours actuel (EUR)</span>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">{formatCurrency(data.bitcoin.currentPriceEur)}</div>
              </div>
              <div>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Valeur totale estimée</span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{formatCurrency(data.bitcoin.amount * data.bitcoin.currentPriceEur)}</div>
              </div>
            </div>

            {/* Form to update BTC */}
            <form onSubmit={handleUpdateBtc} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nombre de Bitcoins (BTC)</label>
                <input
                  type="number"
                  step="any"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(Number(e.target.value))}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Prix d'achat moyen (PRU en €)</label>
                <input
                  type="number"
                  step="any"
                  value={btcPurchasePrice}
                  onChange={(e) => setBtcPurchasePrice(Number(e.target.value))}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>
              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-amber-600/30 text-sm"
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
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Ajouter un Livret, PEE ou Assurance Vie</h3>
            <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Catégorie</label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value as 'pee' | 'livret' | 'assuranceVie')}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${inputBgClass}`}
                >
                  <option value="livret">Livret & Épargne (Livret A, LDDS...)</option>
                  <option value="assuranceVie">Assurance Vie</option>
                  <option value="pee">PEE (Plan d'Épargne Entreprise)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nom du compte</label>
                <input
                  type="text"
                  placeholder="ex: Livret A / Assurance Vie Bourso"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Valeur actuelle (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newAssetValue}
                  onChange={(e) => setNewAssetValue(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Rendement net estimé (%/an)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newAssetRate}
                  onChange={(e) => setNewAssetRate(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/30 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter l'épargne
                </button>
              </div>
            </form>
          </div>

          {/* Livrets Section */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h4 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Livrets & Épargne de Précaution</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Nom</th>
                    <th className="py-3 px-3 text-right">Rendement net</th>
                    <th className="py-3 px-3 text-right">Valeur actuelle</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.livretLines.map((item) => (
                    <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                      <td className={`py-3.5 px-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{item.annualReturnRate}% / an</td>
                      <td className={`py-3.5 px-3 text-right font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(item.value)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingSimpleAsset({ category: 'livret', asset: item, label: 'Livret / Épargne' })}
                            title="Modifier ce livret"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveAsset('livret', item.id)}
                            title="Supprimer"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.livretLines.length === 0 && (
                    <tr>
                      <td colSpan={4} className={`py-6 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        Aucun livret enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assurance Vie Section */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h4 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Assurance Vie</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Nom</th>
                    <th className="py-3 px-3 text-right">Rendement net</th>
                    <th className="py-3 px-3 text-right">Valeur actuelle</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.assuranceVieLines.map((item) => (
                    <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                      <td className={`py-3.5 px-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{item.annualReturnRate}% / an</td>
                      <td className={`py-3.5 px-3 text-right font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(item.value)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingSimpleAsset({ category: 'assuranceVie', asset: item, label: 'Assurance Vie' })}
                            title="Modifier cette assurance vie"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveAsset('assuranceVie', item.id)}
                            title="Supprimer"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.assuranceVieLines.length === 0 && (
                    <tr>
                      <td colSpan={4} className={`py-6 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        Aucune assurance vie enregistrée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PEE Section */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h4 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>PEE (Plan d'Épargne Entreprise)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Nom</th>
                    <th className="py-3 px-3 text-right">Rendement net</th>
                    <th className="py-3 px-3 text-right">Valeur actuelle</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.peeLines.map((item) => (
                    <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                      <td className={`py-3.5 px-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{item.annualReturnRate}% / an</td>
                      <td className={`py-3.5 px-3 text-right font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(item.value)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingSimpleAsset({ category: 'pee', asset: item, label: 'PEE (Épargne Entreprise)' })}
                            title="Modifier ce PEE"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveAsset('pee', item.id)}
                            title="Supprimer"
                            className={`p-1.5 rounded-xl border transition ${
                              isLight
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.peeLines.length === 0 && (
                    <tr>
                      <td colSpan={4} className={`py-6 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        Aucun PEE enregistré.
                      </td>
                    </tr>
                  )}
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
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Ajouter un bien immobilier & crédit associé</h3>
            <form onSubmit={handleAddImmo} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nom du bien</label>
                <input
                  type="text"
                  placeholder="ex: Résidence Principale / Appartement Locatif"
                  value={newImmoName}
                  onChange={(e) => setNewImmoName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Valeur estimée actuelle (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newImmoVal}
                  onChange={(e) => setNewImmoVal(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Capital restant dû (€)</label>
                <input
                  type="number"
                  step="any"
                  value={newImmoDebt}
                  onChange={(e) => setNewImmoDebt(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Rendement annuel (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newImmoRate}
                  onChange={(e) => setNewImmoRate(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none font-mono ${inputBgClass}`}
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-cyan-600/30 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter le bien immobilier
                </button>
              </div>
            </form>
          </div>

          {/* Real Estate Table */}
          <div className={`rounded-3xl p-6 border transition-all ${cardBgClass}`}>
            <h4 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Patrimoine Immobilier & Crédits en cours</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-3">Bien</th>
                    <th className="py-3 px-3 text-right">Valeur estimée</th>
                    <th className="py-3 px-3 text-right">Capital restant dû</th>
                    <th className="py-3 px-3 text-right">Valeur nette</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
                  {data.realEstateLines.map((item) => {
                    const netVal = item.estimatedValue - item.remainingDebt;
                    return (
                      <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                        <td className={`py-3.5 px-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                        <td className={`py-3.5 px-3 text-right font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{formatCurrency(item.estimatedValue)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">-{formatCurrency(item.remainingDebt)}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400 font-mono">{formatCurrency(netVal)}</td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingRealEstate(item)}
                              title="Modifier ce bien immobilier"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveImmo(item.id)}
                              title="Supprimer"
                              className={`p-1.5 rounded-xl border transition ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                  : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {data.realEstateLines.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`py-8 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
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

      {/* MODAL 1: Stock DCA / Investment History Modal */}
      {activeHistoryStock && (
        <StockHistoryModal
          stock={activeHistoryStock.stock}
          accountType={activeHistoryStock.type}
          onClose={() => setActiveHistoryStock(null)}
          onSave={(updatedStock) => handleSaveStock(activeHistoryStock.type, updatedStock)}
        />
      )}

      {/* MODAL 2: Edit Stock Modal */}
      {editingStock && (
        <EditStockModal
          stock={editingStock.stock}
          accountType={editingStock.type}
          onClose={() => setEditingStock(null)}
          onSave={(updatedStock) => handleSaveStock(editingStock.type, updatedStock)}
        />
      )}

      {/* MODAL 3: Edit Simple Asset Modal */}
      {editingSimpleAsset && (
        <EditSimpleAssetModal
          asset={editingSimpleAsset.asset}
          categoryLabel={editingSimpleAsset.label}
          onClose={() => setEditingSimpleAsset(null)}
          onSave={(updatedAsset) => handleSaveSimpleAsset(editingSimpleAsset.category, updatedAsset)}
        />
      )}

      {/* MODAL 4: Edit Real Estate Modal */}
      {editingRealEstate && (
        <EditRealEstateModal
          realEstate={editingRealEstate}
          onClose={() => setEditingRealEstate(null)}
          onSave={(updatedImmo) => handleSaveRealEstate(updatedImmo)}
        />
      )}
    </div>
  );
};
