export interface StockLine {
  id: string;
  isin: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  lastUpdated?: number;
}

export interface BitcoinHolding {
  amount: number;
  purchasePriceEur: number;
  currentPriceEur: number;
}

export interface SimpleAssetLine {
  id: string;
  name: string;
  value: number;
  annualReturnRate: number; // e.g. 3.0 for 3%
}

export interface RealEstateLine {
  id: string;
  name: string;
  estimatedValue: number;
  remainingDebt: number; // capital restant dû
  annualReturnRate: number; // e.g. 2.5 for 2.5%
}

export interface ProjectionSettings {
  years: number;
  annualReturnRate: number; // e.g. 7.0 for 7%
  monthlyInvestment: number; // e.g. 500 €
}

export interface WealthData {
  peaLines: StockLine[];
  ctoLines: StockLine[];
  bitcoin: BitcoinHolding;
  peeLines: SimpleAssetLine[];
  livretLines: SimpleAssetLine[];
  assuranceVieLines: SimpleAssetLine[];
  realEstateLines: RealEstateLine[];
  projectionSettings: ProjectionSettings;
  lastModified?: number;
}

export const DEFAULT_WEALTH_DATA: WealthData = {
  peaLines: [
    { id: 'pea-1', isin: 'IE000BI8OT95', name: 'Amundi Core MSCI World UCITS ETF', quantity: 800, purchasePrice: 24.50, currentPrice: 26.80 },
    { id: 'pea-2', isin: 'FR0000120172', name: 'LVMH Moët Hennessy', quantity: 6, purchasePrice: 750.0, currentPrice: 780.5 }
  ],
  ctoLines: [
    { id: 'cto-1', isin: 'FR0000121014', name: 'TotalEnergies', quantity: 50, purchasePrice: 58.0, currentPrice: 62.4 }
  ],
  bitcoin: {
    amount: 0.85,
    purchasePriceEur: 42000,
    currentPriceEur: 64500
  },
  peeLines: [
    { id: 'pee-1', name: 'PEE Entreprise - Fonds Actions', value: 12500, annualReturnRate: 6.5 }
  ],
  livretLines: [
    { id: 'livret-1', name: 'Livret A', value: 22950, annualReturnRate: 3.0 },
    { id: 'livret-2', name: 'LDDS', value: 12000, annualReturnRate: 3.0 },
    { id: 'livret-3', name: 'Livret Epargne Sécurité', value: 10000, annualReturnRate: 2.5 }
  ],
  assuranceVieLines: [
    { id: 'assurance-1', name: 'Assurance Vie - Fonds Euros & UC', value: 48000, annualReturnRate: 4.2 }
  ],
  realEstateLines: [
    { id: 'immo-1', name: 'Résidence Principale', estimatedValue: 350000, remainingDebt: 245000, annualReturnRate: 2.0 },
    { id: 'immo-2', name: 'Appartement Locatif T2', estimatedValue: 160000, remainingDebt: 110000, annualReturnRate: 3.5 }
  ],
  projectionSettings: {
    years: 15,
    annualReturnRate: 6.5,
    monthlyInvestment: 800
  }
};
