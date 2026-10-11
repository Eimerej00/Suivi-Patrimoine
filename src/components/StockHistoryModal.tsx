import React, { useState } from 'react';
import { StockLine, StockTransaction } from '../types';
import { useTheme } from '../context/ThemeContext';
import { X, Plus, Calendar, DollarSign, History, Trash2, ArrowUpRight, TrendingUp, Info } from 'lucide-react';

interface StockHistoryModalProps {
  stock: StockLine;
  accountType: 'pea' | 'cto';
  onClose: () => void;
  onSave: (updatedStock: StockLine) => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  stock,
  accountType,
  onClose,
  onSave
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(stock.currentPrice || stock.purchasePrice || 25);
  const [fees, setFees] = useState<number>(0);
  const [note, setNote] = useState<string>('Versement régulier DCA');

  const transactions = stock.transactions || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(val);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    const pr = Number(price);
    const fee = Number(fees) || 0;

    if (qty <= 0 || pr <= 0) return;

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      date: date || new Date().toISOString().slice(0, 10),
      quantity: qty,
      price: pr,
      fees: fee,
      note: note.trim() || undefined
    };

    const currentQty = stock.quantity;
    const currentPRU = stock.purchasePrice;
    const newTotalQty = currentQty + qty;

    const totalInvestedBefore = currentQty * currentPRU;
    const addedInvested = (qty * pr) + fee;
    const newPRU = newTotalQty > 0 ? (totalInvestedBefore + addedInvested) / newTotalQty : pr;

    const updatedStock: StockLine = {
      ...stock,
      quantity: newTotalQty,
      purchasePrice: Math.round(newPRU * 100) / 100,
      transactions: [newTx, ...transactions]
    };

    onSave(updatedStock);
    setQuantity(10);
    setFees(0);
    setNote('');
  };

  const handleDeleteTransaction = (txId: string) => {
    if (!window.confirm("Voulez-vous supprimer cet ordre de l'historique ?")) return;

    const txToDelete = transactions.find(t => t.id === txId);
    const newTransactions = transactions.filter(t => t.id !== txId);

    let updatedQty = stock.quantity;
    let updatedPRU = stock.purchasePrice;

    if (txToDelete) {
      updatedQty = Math.max(0, stock.quantity - txToDelete.quantity);
      if (newTransactions.length > 0) {
        const totalInvested = newTransactions.reduce((sum, t) => sum + (t.quantity * t.price) + (t.fees || 0), 0);
        const totalQty = newTransactions.reduce((sum, t) => sum + t.quantity, 0);
        if (totalQty > 0) {
          updatedPRU = totalInvested / totalQty;
        }
      }
    }

    onSave({
      ...stock,
      quantity: updatedQty,
      purchasePrice: Math.round(updatedPRU * 100) / 100,
      transactions: newTransactions
    });
  };

  const totalInvestedInHistory = transactions.reduce((sum, t) => sum + (t.quantity * t.price) + (t.fees || 0), 0);

  const inputBgClass = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
    : 'bg-slate-800 border-slate-700 text-white focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-3xl w-full max-w-2xl border shadow-2xl overflow-hidden my-8 transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{stock.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold border border-blue-500/25">
                  {accountType.toUpperCase()}
                </span>
              </div>
              <p className={`text-xs font-mono font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{stock.isin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <span className={`text-[11px] block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total parts</span>
              <span className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{stock.quantity}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <span className={`text-[11px] block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PRU moyen</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">{formatCurrency(stock.purchasePrice)}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <span className={`text-[11px] block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cours actuel</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(stock.currentPrice)}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <span className={`text-[11px] block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Valeur ligne</span>
              <span className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(stock.quantity * stock.currentPrice)}</span>
            </div>
          </div>

          {/* Form to add an investment */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
          }`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Ajouter un achat / investissement (DCA)</h4>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    <Calendar className="w-3 h-3 text-slate-400" /> Date de l'opération
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none font-mono ${inputBgClass}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Nombre de parts</label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    placeholder="ex: 15"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none font-mono ${inputBgClass}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Prix d'achat unitaire (€)</label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none font-mono ${inputBgClass}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Frais éventuels (€)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none font-mono ${inputBgClass}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Commentaire / Libellé</label>
                  <input
                    type="text"
                    placeholder="ex: DCA Mensuel Bourse"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${inputBgClass}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Montant de l'opération :{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency((quantity * price) + (fees || 0))}
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 text-xs shadow-md shadow-emerald-600/25"
                >
                  <Plus className="w-3.5 h-3.5" /> Enregistrer l'achat & recalculer PRU
                </button>
              </div>
            </form>
          </div>

          {/* Investment History List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Historique des versements ({transactions.length})
              </h4>
              {transactions.length > 0 && (
                <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Total investi : <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(totalInvestedInHistory)}</span>
                </span>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className={`text-center py-6 rounded-2xl border text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-800/20 border-slate-800/80 text-slate-500'
              }`}>
                Aucun ordre dans l'historique pour le moment. Enregistrez votre premier achat ci-dessus.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const total = (tx.quantity * tx.price) + (tx.fees || 0);
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70' : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{tx.date}</span>
                          {tx.note && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                              isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {tx.note}
                            </span>
                          )}
                        </div>
                        <div className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          +{tx.quantity} parts à {formatCurrency(tx.price)}/part
                          {tx.fees ? ` (frais: ${formatCurrency(tx.fees)})` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(total)}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          title="Supprimer cet ordre"
                          className={`p-1.5 rounded-lg border transition ${
                            isLight
                              ? 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200'
                              : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
