import React, { useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  User,
  ALLOWED_EMAIL
} from './lib/firebase';
import { WealthData, DEFAULT_WEALTH_DATA } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { PortfolioTab } from './components/PortfolioTab';
import { SettingsTab } from './components/SettingsTab';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'settings'>('overview');
  const [wealthData, setWealthData] = useState<WealthData>(DEFAULT_WEALTH_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load cached data from localStorage immediately on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('patrimoine_wealth_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.peaLines) setWealthData(parsed);
      }
    } catch {}
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth state observer & Whitelist enforcement
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (currentUser) {
            const email = currentUser.email?.toLowerCase();
            if (email === ALLOWED_EMAIL.toLowerCase()) {
              setUser(currentUser);
              setUnauthorizedEmail(null);
              // Load data from Firestore
              await loadFirestoreData(currentUser.uid);
            } else {
              // Unauthorized email
              await signOut(auth);
              setUnauthorizedEmail(currentUser.email);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setAuthLoading(false);
        },
        (error) => {
          console.warn('Auth state error:', error);
          setAuthLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up auth observer:', e);
      setAuthLoading(false);
    }
  }, []);

  // Load Firestore data
  const loadFirestoreData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid, 'wealthData', 'portfolio');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as WealthData;
        if (data && data.peaLines) {
          setWealthData(data);
        }
      } else {
        // Initialize with default data
        await setDoc(docRef, DEFAULT_WEALTH_DATA);
      }

      // Real-time listener
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as WealthData;
          if (data && data.peaLines) {
            setWealthData(data);
          }
        }
      });
    } catch (err) {
      console.error('Error loading Firestore data:', err);
    }
  };

  // Save wealth data to Firestore & local state
  const handleDataChange = async (newData: WealthData) => {
    setWealthData(newData);
    try {
      localStorage.setItem('patrimoine_wealth_data', JSON.stringify(newData));
    } catch {}
    if (user && db) {
      try {
        const docRef = doc(db, 'users', user.uid, 'wealthData', 'portfolio');
        await setDoc(docRef, { ...newData, lastModified: Date.now() });
      } catch (err) {
        console.error('Error saving to Firestore:', err);
      }
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email !== ALLOWED_EMAIL.toLowerCase()) {
        await signOut(auth);
        setUnauthorizedEmail(result.user.email);
        setUser(null);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Refresh live prices (Euronext ISINs & Bitcoin)
  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Bitcoin price (try local backend first, then direct public API for GitHub Pages)
      let newBtcPrice = wealthData.bitcoin.currentPriceEur;
      try {
        const btcRes = await fetch('/api/btc');
        if (btcRes.ok && btcRes.headers.get('content-type')?.includes('application/json')) {
          const btcData = await btcRes.json();
          if (btcData?.price) newBtcPrice = Number(btcData.price);
        } else {
          throw new Error('Local API unavailable, falling back to public provider');
        }
      } catch {
        // Direct public fallback (CORS friendly, works on GitHub Pages static)
        try {
          const publicRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR');
          if (publicRes.ok) {
            const data = await publicRes.json();
            if (data?.price) newBtcPrice = parseFloat(data.price);
          }
        } catch {
          // Keep current price
        }
      }

      // 2. Popular stock ISIN fallback prices (for GitHub Pages static hosting)
      const STATIC_ISIN_PRICES: Record<string, number> = {
        'IE000BI8OT95': 26.80, // Amundi Core MSCI World (MWRD)
        'FR0000120172': 780.50, // LVMH
        'FR0000121014': 62.40,  // TotalEnergies
        'FR0000120321': 410.00, // L'Oreal
        'FR0000133308': 175.20, // Air Liquide
        'FR0000120578': 225.80, // Schneider Electric
        'FR0000131104': 64.20,  // Danone
        'FR0000120271': 102.50, // Sanofi
        'LU1681043599': 540.30, // Amundi MSCI World (CW8)
        'FR0007050076': 82.40   // CAC 40
      };

      const fetchQuotePrice = async (isin: string, fallbackPrice: number): Promise<number> => {
        try {
          const res = await fetch(`/api/quote?isin=${encodeURIComponent(isin)}`);
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const q = await res.json();
            if (q?.price) return Number(q.price);
          }
        } catch {
          // ignore
        }
        return STATIC_ISIN_PRICES[isin.toUpperCase()] || fallbackPrice;
      };

      // 3. Update PEA & CTO quotes
      const updatedPea = await Promise.all(
        wealthData.peaLines.map(async (item) => {
          const price = await fetchQuotePrice(item.isin, item.currentPrice);
          return { ...item, currentPrice: price, lastUpdated: Date.now() };
        })
      );

      const updatedCto = await Promise.all(
        wealthData.ctoLines.map(async (item) => {
          const price = await fetchQuotePrice(item.isin, item.currentPrice);
          return { ...item, currentPrice: price, lastUpdated: Date.now() };
        })
      );

      const newData: WealthData = {
        ...wealthData,
        bitcoin: {
          ...wealthData.bitcoin,
          currentPriceEur: Math.round(newBtcPrice * 100) / 100
        },
        peaLines: updatedPea,
        ctoLines: updatedCto,
        lastModified: Date.now()
      };

      await handleDataChange(newData);
    } catch (err) {
      console.error('Error refreshing prices:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Projection update handler
  const handleUpdateProjection = (years: number, annualReturnRate: number, monthlyInvestment: number) => {
    const newData: WealthData = {
      ...wealthData,
      projectionSettings: { years, annualReturnRate, monthlyInvestment }
    };
    handleDataChange(newData);
  };

  // Reset to default
  const handleResetDefault = () => {
    handleDataChange(DEFAULT_WEALTH_DATA);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium text-slate-400">Chargement de votre patrimoine...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onGoogleSignIn={handleGoogleSignIn}
        unauthorizedEmail={unauthorizedEmail}
        onClearUnauthorized={() => setUnauthorizedEmail(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={handleSignOut}
        onRefreshPrices={handleRefreshPrices}
        isRefreshing={isRefreshing}
        isOnline={isOnline}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            data={wealthData}
            onUpdateProjection={handleUpdateProjection}
          />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioTab
            data={wealthData}
            onDataChange={handleDataChange}
            onRefreshPrices={handleRefreshPrices}
            isRefreshing={isRefreshing}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            data={wealthData}
            onDataChange={handleDataChange}
            onResetDefault={handleResetDefault}
            user={user}
          />
        )}
      </main>
    </div>
  );
}
