import React, { useState } from 'react';
import { WealthData } from '../types';
import { calculateTotals, computeProjectionData } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Building,
  Coins,
  ArrowUpRight,
  Sliders,
  Calendar,
  Percent,
  Layers,
  Sparkles
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

  const projectionChartData = computeProjectionData(totals.financialGross, monthlyInv, returnRate, years);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  const tooltipStyle = isLight
    ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '1rem', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }
    : { backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '1rem', color: '#ffffff' };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Worth */}
        <div className={`rounded-3xl p-6 border transition-all relative overflow-hidden group ${
          isLight
            ? 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border-blue-200/70 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-br from-slate-900 to-slate-900/90 border-slate-800 shadow-xl'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-blue-700' : 'text-slate-400'}`}>
              Patrimoine Net (Actif - Dettes)
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-blue-600/10 text-blue-600 border border-blue-200' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatCurrency(totals.netWorth)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium">
            <span className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
              isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <ArrowUpRight className="w-3.5 h-3.5" /> Net de dettes
            </span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              Dettes : {formatCurrency(totals.totalDebt)}
            </span>
          </div>
        </div>

        {/* Gross Worth */}
        <div className={`rounded-3xl p-6 border transition-all relative overflow-hidden group ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
            : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Patrimoine Brut Total
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatCurrency(totals.grossWorth)}
          </div>
          <div className={`mt-3 flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Actifs financiers + Immobilier brut estimé</span>
          </div>
        </div>

        {/* Financial Assets */}
        <div className={`rounded-3xl p-6 border transition-all relative overflow-hidden group ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
            : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Actifs Financiers & Épargne
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatCurrency(totals.financialGross)}
          </div>
          <div className={`mt-3 flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>PEA, CTO, Bitcoin, Livrets, PEE, Assurance Vie</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation breakdown list */}
        <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className={`p-2 rounded-xl ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Répartition du Patrimoine</h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ventilation par catégorie d'actif</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {totals.allocations.map((item, idx) => {
                const percentage = totals.grossWorth > 0 ? ((item.value / totals.grossWorth) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      isLight ? 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/70' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(item.value)}</div>
                      <div className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t text-xs flex items-center justify-between ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
          }`}>
            <span className="font-medium">Immobilier Net de dette</span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(totals.realEstateNet)}</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className={`lg:col-span-2 rounded-3xl p-6 border flex flex-col justify-between transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Visualisation Graphique</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Calculé en temps réel selon les cotations</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-xl font-medium border ${
              isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {totals.allocations.length} catégories
            </span>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={isLight ? '#ffffff' : '#0f172a'} strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-blue-800' : 'text-slate-400'}`}>PEA & CTO</div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">{formatCurrency(totals.peaGross + totals.ctoGross)}</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-amber-800' : 'text-slate-400'}`}>Bitcoin</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{formatCurrency(totals.bitcoinGross)}</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Livrets & Épargne</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{formatCurrency(totals.livretsGross + totals.peeGross + totals.assuranceVieGross)}</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-cyan-50/50 border-cyan-100' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-cyan-800' : 'text-slate-400'}`}>Immobilier Net</div>
              <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 font-mono">{formatCurrency(totals.realEstateNet)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wealth Projection Simulator Section */}
      <div className={`rounded-3xl p-6 sm:p-8 border space-y-6 transition-all ${
        isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Simulateur de Projection & Intérêts Composés
              </h3>
            </div>
            <p className={`text-xs sm:text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Évolution projetée de votre patrimoine financier (hors immobilier) avec épargne mensuelle et taux de rendement personnalisé.
            </p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl border ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'
        }`}>
          {/* Years Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Calendar className="w-4 h-4 text-blue-500" /> Horizon de temps
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-lg border text-xs font-mono ${
                isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-600/20 text-white border-blue-500/30'
              }`}>
                {years} ans
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => handleProjectionChange(Number(e.target.value), returnRate, monthlyInv)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className={`flex justify-between text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              <span>1 an</span>
              <span>20 ans</span>
              <span>40 ans</span>
            </div>
          </div>

          {/* Return Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <Percent className="w-4 h-4 text-emerald-500" /> Taux Annuel Estimé
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-lg border text-xs font-mono ${
                isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-600/20 text-white border-emerald-500/30'
              }`}>
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
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className={`flex justify-between text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              <span>0% (Prudent)</span>
              <span>7.5% (Moyen)</span>
              <span>15%</span>
            </div>
          </div>

          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <DollarSign className="w-4 h-4 text-amber-500" /> Investissement Mensuel
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-lg border text-xs font-mono ${
                isLight ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-600/20 text-white border-amber-500/30'
              }`}>
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
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className={`flex justify-between text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
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
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} opacity={0.6} />
              <XAxis dataKey="year" stroke={isLight ? '#64748b' : '#94a3b8'} />
              <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} tickFormatter={(val) => `${Math.round(val / 1000)}k€`} />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0)}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Area type="monotone" dataKey="patrimoineNet" name="Patrimoine Financier Projeté" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              <Area type="monotone" dataKey="capitalInveste" name="Total Capital Investi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projection summary final value */}
        {projectionChartData.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t text-center ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
              <div className={`text-xs font-semibold ${isLight ? 'text-blue-700' : 'text-slate-400'}`}>
                Patrimoine en {projectionChartData[projectionChartData.length - 1].year}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].patrimoineNet)}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
              <div className={`text-xs font-semibold ${isLight ? 'text-emerald-700' : 'text-slate-400'}`}>
                Total Versé / Investi
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].capitalInveste)}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
              <div className={`text-xs font-semibold ${isLight ? 'text-amber-700' : 'text-slate-400'}`}>
                Plus-values cumulées
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {formatCurrency(projectionChartData[projectionChartData.length - 1].plusValues)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
