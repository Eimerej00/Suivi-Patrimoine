import React, { useState } from 'react';
import { StockLine, StockTransaction } from '../types';
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

    // Calculate new total quantity and new weighted PRU
    const currentQty = stock.quantity;
    const currentPRU = stock.purchasePrice;
    const newTotalQty = currentQty + qty;

    // Weighted average purchase price (PRU)
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
    // Reset form
    setQuantity(10);
    setFees(0);
    setNote('');
  };

  const handleDeleteTransaction = (txId: string) => {
    if (!window.confirm('Voulez-vous supprimer cet ordre de l\'historique ?')) return;

    const txToDelete = transactions.find(t => t.id === txId);
    const newTransactions = transactions.filter(t => t.id !== txId);

    // If we delete a transaction, adjust quantity and PRU
    let updatedQty = stock.quantity;
    let updatedPRU = stock.purchasePrice;

    if (txToDelete) {
      updatedQty = Math.max(0, stock.quantity - txToDelete.quantity);
      // Recalculate PRU from remaining transactions if any exist
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{stock.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-medium">
                  {accountType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{stock.isin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block">Total parts</span>
              <span className="text-base font-bold text-white font-mono">{stock.quantity}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block">PRU moyen</span>
              <span className="text-base font-bold text-blue-400 font-mono">{formatCurrency(stock.purchasePrice)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block">Cours actuel</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{formatCurrency(stock.currentPrice)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block">Valeur ligne</span>
              <span className="text-base font-bold text-white font-mono">{formatCurrency(stock.quantity * stock.currentPrice)}</span>
            </div>
          </div>

          {/* Form to add an investment */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Ajouter un achat / investissement (DCA)</h4>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Date de l'opération
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de parts</label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    placeholder="ex: 15"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Prix d'achat unitaire (€)</label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Frais éventuels (€)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Commentaire / Libellé</label>
                  <input
                    type="text"
                    placeholder="ex: DCA Mensuel Bourse"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  Montant de l'opération :{' '}
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency((quantity * price) + (fees || 0))}
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 text-xs shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Enregistrer l'achat & recalculer PRU
                </button>
              </div>
            </form>
          </div>

          {/* Investment History List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Historique des versements ({transactions.length})</span>
              </h4>
              {transactions.length > 0 && (
                <span className="text-xs text-slate-400">
                  Total investi dans l'historique : <span className="font-bold text-white font-mono">{formatCurrency(totalInvestedInHistory)}</span>
                </span>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-6 bg-slate-800/20 rounded-2xl border border-slate-800/80 text-xs text-slate-500">
                Aucun ordre dans l'historique pour le moment. Enregistrez votre premier achat ci-dessus.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const total = (tx.quantity * tx.price) + (tx.fees || 0);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 transition text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{tx.date}</span>
                          {tx.note && (
                            <span className="text-slate-400 text-[11px] bg-slate-800 px-2 py-0.5 rounded-md">
                              {tx.note}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-mono">
                          +{tx.quantity} parts à {formatCurrency(tx.price)}/part
                          {tx.fees ? ` (frais: ${formatCurrency(tx.fees)})` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-white font-mono">{formatCurrency(total)}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          title="Supprimer cet ordre"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
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
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
