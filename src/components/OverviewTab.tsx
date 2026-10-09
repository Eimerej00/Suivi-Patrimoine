import React, { useState } from 'react';
import { WealthData } from '../types';
import { calculateTotals, computeProjectionData } from '../utils/calculations';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  ShieldAlert,
  Building,
  Coins,
  ArrowUpRight,
  Sliders,
  Calendar,
  Percent
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface OverviewTabProps {
  data: WealthData;
  onUpdateProjection: (years: number, annualReturnRate: number, monthlyInvestment: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onUpdateProjection }) => {
  const totals = calculateTotals(data);

  const [years, setYears] = useState(data.projectionSettings.years);
  const [returnRate, setReturnRate] = useState(data.projectionSettings.annualReturnRate);
  const [monthlyInv, setMonthlyInv] = useState(data.projectionSettings.monthlyInvestment);

  const handleProjectionChange = (newYears: number, newRate: number, newMonthly: number) => {
    setYears(newYears);
    setReturnRate(newRate);
    setMonthlyInv(newMonthly);
    onUpdateProjection(newYears, newRate, newMonthly);
  };

  const projectionChartData = computeProjectionData(totals.netWorth, monthlyInv, returnRate, years);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Worth */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Patrimoine Net (Actif - Dette)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totals.netWorth)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Net de dettes
            </span>
            <span className="text-slate-400">Dettes totales: {formatCurrency(totals.totalDebt)}</span>
          </div>
        </div>

        {/* Gross Worth */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Patrimoine Brut Total</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totals.grossWorth)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Actifs financiers + Immobilier brut</span>
          </div>
        </div>

        {/* Financial + Crypto */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Actifs Financiers & Épargne</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totals.financialGross)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>PEA, CTO, Bitcoin, Livrets, PEE, AV</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation breakdown list */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Répartition du Patrimoine</h3>
            </div>
            <div className="space-y-3">
              {totals.allocations.map((item, idx) => {
                const percentage = totals.grossWorth > 0 ? ((item.value / totals.grossWorth) * 100).toFixed(1) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{formatCurrency(item.value)}</div>
                      <div className="text-xs text-slate-400">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Immobilier Net de dette</span>
            <span className="font-semibold text-white">{formatCurrency(totals.realEstateNet)}</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Visualisation des Actifs</h3>
            <span className="text-xs text-slate-400">Basé sur les cours actuels</span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totals.allocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {totals.allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/50">
              <div className="text-xs text-slate-400">PEA / CTO</div>
              <div className="text-sm font-bold text-blue-400 mt-0.5">{formatCurrency(totals.peaGross + totals.ctoGross)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/50">
              <div className="text-xs text-slate-400">Bitcoin</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(totals.bitcoinGross)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/50">
              <div className="text-xs text-slate-400">Épargne & Livrets</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(totals.livretsGross + totals.peeGross + totals.assuranceVieGross)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/50">
              <div className="text-xs text-slate-400">Immobilier Net</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{formatCurrency(totals.realEstateNet)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wealth Projection Simulator Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Simulateur de Projection & Intérêts Composés</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Projetez l'évolution de votre patrimoine net sur plusieurs années avec épargne mensuelle et taux de rendement personnalisable.
            </p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
          {/* Years Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" /> Horizon de temps
              </span>
              <span className="font-bold text-white bg-blue-600/20 px-2 py-0.5 rounded-md border border-blue-500/30">
                {years} ans
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => handleProjectionChange(Number(e.target.value), returnRate, monthlyInv)}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 an</span>
              <span>20 ans</span>
              <span>40 ans</span>
            </div>
          </div>

          {/* Return Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" /> Taux Annuel Estimé
              </span>
              <span className="font-bold text-white bg-emerald-600/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {returnRate}% / an
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={returnRate}
              onChange={(e) => handleProjectionChange(years, Number(e.target.value), monthlyInv)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Sans rendement)</span>
              <span>7.5% (Moyen boursier)</span>
              <span>15%</span>
            </div>
          </div>

          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" /> Investissement Mensuel
              </span>
              <span className="font-bold text-white bg-amber-600/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                {formatCurrency(monthlyInv)} / mois
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={monthlyInv}
              onChange={(e) => handleProjectionChange(years, returnRate, Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 €</span>
              <span>2 500 €</span>
              <span>5 000 €</span>
            </div>
          </div>
        </div>

        {/* Projection Area Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(val) => `${Math.round(val / 1000)}k€`} />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0)}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="patrimoineNet" name="Patrimoine Net Projeté" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              <Area type="monotone" dataKey="capitalInveste" name="Capital Total Investi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projection summary final value */}
        {projectionChartData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="text-xs text-slate-400">Patrimoine en {projectionChartData[projectionChartData.length - 1].year}</div>
              <div className="text-xl font-extrabold text-blue-400 mt-1">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].patrimoineNet)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="text-xs text-slate-400">Total Versé / Investi</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].capitalInveste)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="text-xs text-slate-400">Plus-values cumulées</div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].plusValues)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
