import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API: Get live Bitcoin price in EUR
  app.get('/api/btc', async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!response.ok) throw new Error('CoinGecko fetch failed');
      const data = await response.json();
      const priceEur = data?.bitcoin?.eur;
      if (!priceEur) throw new Error('Invalid price data');
      res.json({ price: Number(priceEur), currency: 'EUR', timestamp: Date.now() });
    } catch (err) {
      // Fallback via Binance public API
      try {
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR');
        if (binanceRes.ok) {
          const bData = await binanceRes.json();
          if (bData?.price) {
            res.json({ price: parseFloat(bData.price), currency: 'EUR', source: 'binance', timestamp: Date.now() });
            return;
          }
        }
      } catch {}
      res.json({ price: 64500, currency: 'EUR', fallback: true, timestamp: Date.now() });
    }
  });

  const POPULAR_ISINS: Record<string, { ticker: string, name: string, defaultPrice: number }> = {
    // ETFs PEA & Monde
    'FR001400U5Q4': { ticker: 'DCAM.PA', name: 'Amundi PEA Monde (MSCI World) UCITS ETF (DCAM)', defaultPrice: 6.396 },
    'IE000BI8OT95': { ticker: 'MWRD.PA', name: 'Amundi Core MSCI World UCITS ETF', defaultPrice: 165.46 },
    'LU1681043599': { ticker: 'CW8.PA', name: 'Amundi MSCI World Swap UCITS ETF', defaultPrice: 715.80 },
    'FR0007050076': { ticker: 'CAC.PA', name: 'Amundi CAC 40 UCITS ETF Dist', defaultPrice: 78.96 },
    'FR0010315775': { ticker: 'ESE.PA', name: 'BNP Paribas Easy S&P 500 UCITS ETF', defaultPrice: 35.31 },
    'FR0011869353': { ticker: 'ESE.PA', name: 'BNP Paribas Easy S&P 500 UCITS ETF', defaultPrice: 35.31 },
    'FR0013412020': { ticker: 'PEA.PA', name: 'Amundi PEA MSCI USA UCITS ETF', defaultPrice: 48.20 },

    // Actions Françaises (PEA / CTO)
    'FR0000120172': { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', defaultPrice: 380.00 },
    'FR0000121014': { ticker: 'TTE.PA', name: 'TotalEnergies', defaultPrice: 78.53 },
    'FR0000120321': { ticker: 'OR.PA', name: "L'Oréal", defaultPrice: 381.20 },
    'FR0000133308': { ticker: 'AI.PA', name: 'Air Liquide', defaultPrice: 169.68 },
    'FR0000120578': { ticker: 'SU.PA', name: 'Schneider Electric', defaultPrice: 266.40 },
    'FR0000131104': { ticker: 'BN.PA', name: 'Danone', defaultPrice: 58.70 },
    'FR0000120271': { ticker: 'SAN.PA', name: 'Sanofi', defaultPrice: 71.52 },
    'FR0000120628': { ticker: 'CS.PA', name: 'AXA', defaultPrice: 41.52 },
    'FR0000125007': { ticker: 'SGO.PA', name: 'Saint-Gobain', defaultPrice: 64.94 },
    'FR0000131906': { ticker: 'RNO.PA', name: 'Renault', defaultPrice: 26.50 },
    'FR0000120644': { ticker: 'BNP.PA', name: 'BNP Paribas', defaultPrice: 68.40 },
    'FR0000121972': { ticker: 'RMS.PA', name: 'Hermès International', defaultPrice: 1980.00 },
    'FR0000120537': { ticker: 'CAP.PA', name: 'Capgemini', defaultPrice: 165.20 },
    'FR0000120073': { ticker: 'AIR.PA', name: 'Airbus', defaultPrice: 142.30 },
    'FR0000120222': { ticker: 'SAF.PA', name: 'Safran', defaultPrice: 220.50 },
    'FR0000125486': { ticker: 'DG.PA', name: 'Vinci', defaultPrice: 112.50 },
    'FR0010251152': { ticker: 'EL.PA', name: 'EssilorLuxottica', defaultPrice: 215.00 },

    // Actions US (CTO)
    'US0378331005': { ticker: 'AAPL', name: 'Apple Inc.', defaultPrice: 236.64 },
    'US5949181045': { ticker: 'MSFT', name: 'Microsoft Corporation', defaultPrice: 435.07 },
    'US67066G1040': { ticker: 'NVDA', name: 'NVIDIA Corporation', defaultPrice: 129.28 },
    'US02079K3059': { ticker: 'GOOGL', name: 'Alphabet Inc.', defaultPrice: 175.66 },
    'US0231351067': { ticker: 'AMZN', name: 'Amazon.com, Inc.', defaultPrice: 185.43 },
    'US88160R1014': { ticker: 'TSLA', name: 'Tesla, Inc.', defaultPrice: 220.70 },
    'US30303M1027': { ticker: 'META', name: 'Meta Platforms, Inc.', defaultPrice: 580.67 }
  };

  // API: Get live quote for any stock ISIN or ticker
  app.get('/api/quote', async (req, res) => {
    const isin = (req.query.isin as string || '').toUpperCase().trim();
    const info = POPULAR_ISINS[isin];

    const tickerToFetch = info ? info.ticker : (isin.includes('.') ? isin : null);
    
    if (!tickerToFetch) {
      const fallbackPrice = info?.defaultPrice || 100.0;
      res.json({
        isin,
        name: info?.name || isin || 'Titre',
        price: fallbackPrice,
        timestamp: Date.now(),
        fallback: true
      });
      return;
    }

    try {
      // Use range=5d&interval=1d to always get closing prices even on weekends or market holidays
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${tickerToFetch}?range=5d&interval=1d`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      
      if (!response.ok) throw new Error(`Yahoo Finance responded with status ${response.status}`);
      
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      
      // Determine best real-time price
      let livePrice: number | null = null;
      if (typeof meta?.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
        livePrice = meta.regularMarketPrice;
      } else if (typeof meta?.chartPreviousClose === 'number' && meta.chartPreviousClose > 0) {
        livePrice = meta.chartPreviousClose;
      } else {
        const quote = result?.indicators?.quote?.[0];
        const closes = quote?.close?.filter((c: number | null) => typeof c === 'number' && c > 0) || [];
        if (closes.length > 0) {
          livePrice = closes[closes.length - 1];
        }
      }

      const finalPrice = livePrice 
        ? Number(livePrice < 10 ? livePrice.toFixed(3) : livePrice.toFixed(2)) 
        : (info?.defaultPrice || 100.0);
      const stockName = meta?.shortName || info?.name || isin;

      res.json({
        isin,
        ticker: tickerToFetch,
        name: stockName,
        price: finalPrice,
        timestamp: Date.now()
      });
    } catch (err: any) {
      console.warn(`Quote fetch fallback for ${isin} (${tickerToFetch}):`, err.message);
      res.json({
        isin,
        ticker: tickerToFetch,
        name: info?.name || isin,
        price: info?.defaultPrice || 100.0,
        fallback: true,
        timestamp: Date.now()
      });
    }
  });

  // Serve static assets from public folder (icons, manifest, etc.)
  app.use(express.static(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
