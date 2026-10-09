import { WealthData } from '../types';

export function calculateTotals(data: WealthData) {
  // PEA
  const peaGross = data.peaLines.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const peaInvested = data.peaLines.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  
  // CTO
  const ctoGross = data.ctoLines.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const ctoInvested = data.ctoLines.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

  // Bitcoin
  const bitcoinGross = data.bitcoin.amount * data.bitcoin.currentPriceEur;
  const bitcoinInvested = data.bitcoin.amount * data.bitcoin.purchasePriceEur;

  // PEE
  const peeGross = data.peeLines.reduce((sum, item) => sum + item.value, 0);

  // Livrets
  const livretsGross = data.livretLines.reduce((sum, item) => sum + item.value, 0);

  // Assurance Vie
  const assuranceVieGross = data.assuranceVieLines.reduce((sum, item) => sum + item.value, 0);

  // Real Estate
  const realEstateGross = data.realEstateLines.reduce((sum, item) => sum + item.estimatedValue, 0);
  const realEstateDebt = data.realEstateLines.reduce((sum, item) => sum + item.remainingDebt, 0);
  const realEstateNet = realEstateGross - realEstateDebt;

  // Total Financial (Investments + Livrets + PEE + Assurance Vie)
  const financialGross = peaGross + ctoGross + bitcoinGross + peeGross + livretsGross + assuranceVieGross;

  // Total Gross Worth
  const grossWorth = financialGross + realEstateGross;

  // Total Debt
  const totalDebt = realEstateDebt;

  // Total Net Worth (Net de dette)
  const netWorth = grossWorth - totalDebt;

  // Breakdown for pie / allocations
  const allocations = [
    { name: 'PEA', value: peaGross, color: '#3b82f6' }, // blue
    { name: 'CTO', value: ctoGross, color: '#6366f1' }, // indigo
    { name: 'Bitcoin', value: bitcoinGross, color: '#f59e0b' }, // amber
    { name: 'PEE', value: peeGross, color: '#8b5cf6' }, // purple
    { name: 'Livrets & Épargne', value: livretsGross, color: '#10b981' }, // emerald
    { name: 'Assurance Vie', value: assuranceVieGross, color: '#ec4899' }, // pink
    { name: 'Immobilier (Net)', value: realEstateNet, color: '#06b6d4' } // cyan
  ].filter(item => item.value > 0);

  return {
    peaGross,
    peaInvested,
    ctoGross,
    ctoInvested,
    bitcoinGross,
    bitcoinInvested,
    peeGross,
    livretsGross,
    assuranceVieGross,
    realEstateGross,
    realEstateDebt,
    realEstateNet,
    financialGross,
    grossWorth,
    totalDebt,
    netWorth,
    allocations
  };
}

export function computeProjectionData(
  currentNetWorth: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  years: number
) {
  const data = [];
  const monthlyRate = annualReturnRate / 100 / 12;
  let runningNetWorth = currentNetWorth;
  let totalInvested = currentNetWorth;

  const currentYear = new Date().getFullYear();

  for (let y = 0; y <= years; y++) {
    data.push({
      year: currentYear + y,
      patrimoineNet: Math.round(runningNetWorth),
      capitalInveste: Math.round(totalInvested),
      plusValues: Math.round(Math.max(0, runningNetWorth - totalInvested))
    });

    // Simulate next 12 months
    if (y < years) {
      for (let m = 0; m < 12; m++) {
        runningNetWorth = (runningNetWorth + monthlyInvestment) * (1 + monthlyRate);
        totalInvested += monthlyInvestment;
      }
    }
  }

  return data;
}
