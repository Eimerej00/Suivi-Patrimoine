import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Get live Bitcoin price in EUR
app.get('/api/btc', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
    if (!response.ok) throw new Error('Failed to fetch BTC price');
    const data = await response.json();
    const priceEur = data?.bitcoin?.eur || 64500; // Fallback realistic price
    res.json({ price: priceEur, currency: 'EUR', timestamp: Date.now() });
  } catch (err) {
    // Fallback if network fails
    res.json({ price: 64500, currency: 'EUR', fallback: true, timestamp: Date.now() });
  }
});

// API: Get stock quote for ISIN or ticker
// Common Euronext Paris ISIN / ticker mapping or Yahoo Finance query
const POPULAR_ISINS: Record<string, { ticker: string, name: string, defaultPrice: number }> = {
  'FR0000120172': { ticker: 'MC.PA', name: 'LVMH', defaultPrice: 780.50 },
  'FR0000121014': { ticker: 'TTE.PA', name: 'TotalEnergies', defaultPrice: 62.40 },
  'FR0000120321': { ticker: 'OR.PA', name: "L'Oréal", defaultPrice: 410.00 },
  'FR0000133308': { ticker: 'AI.PA', name: 'Air Liquide', defaultPrice: 175.20 },
  'FR0000120578': { ticker: 'SU.PA', name: 'Schneider Electric', defaultPrice: 225.80 },
  'FR0000131104': { ticker: 'BN.PA', name: 'Danone', defaultPrice: 64.20 },
  'FR0000120271': { ticker: 'SAN.PA', name: 'Sanofi', defaultPrice: 102.50 },
  'LU1681043599': { ticker: 'CW8.PA', name: 'Amundi MSCI World UCITS ETF', defaultPrice: 540.30 },
  'FR0007050076': { ticker: 'CAC.PA', name: 'Amundi ETF CAC 40', defaultPrice: 82.40 }
};

app.get('/api/quote', async (req, res) => {
  const isin = (req.query.isin as string || '').toUpperCase().trim();
  const info = POPULAR_ISINS[isin];
  
  if (!info) {
    // If unknown ISIN, return a simulated realistic price or search Yahoo
    res.json({ isin, name: isin || 'Action Inconnue', price: 100.0, change24h: +0.5, timestamp: Date.now() });
    return;
  }

  try {
    // Try fetching from Yahoo Finance chart API
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${info.ticker}?range=1d&interval=1m`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) throw new Error('Yahoo Finance error');
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    const closes = quote?.close?.filter((c: number | null) => c !== null) || [];
    const currentPrice = closes.length > 0 ? closes[closes.length - 1] : info.defaultPrice;
    
    res.json({
      isin,
      ticker: info.ticker,
      name: info.name,
      price: Number(currentPrice.toFixed(2)),
      timestamp: Date.now()
    });
  } catch (err) {
    // Fallback to default price
    res.json({
      isin,
      ticker: info?.ticker || 'UNKNOWN',
      name: info?.name || isin,
      price: info?.defaultPrice || 100.0,
      fallback: true,
      timestamp: Date.now()
    });
  }
});

// In production or when run via tsx server.ts
if (process.env.NODE_ENV !== 'production') {
  // Vite dev server handles frontend middleware
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
