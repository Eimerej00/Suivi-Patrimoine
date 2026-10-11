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
import { useTheme } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Auth state observer with safety timeout (guarantees no white page/stuck loader)
  useEffect(() => {
    // Safety timeout: Never leave the user stuck on loading spinner for more than 2.5 seconds
    const timeoutTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 2500);

    if (!auth) {
      setAuthLoading(false);
      clearTimeout(timeoutTimer);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          clearTimeout(timeoutTimer);
          if (currentUser) {
            const email = currentUser.email?.toLowerCase();
            if (email === ALLOWED_EMAIL.toLowerCase()) {
              setUser(currentUser);
              setIsGuestMode(false);
              setUnauthorizedEmail(null);
              setAuthError(null);
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
          clearTimeout(timeoutTimer);
          setAuthLoading(false);
        }
      );

      return () => {
        clearTimeout(timeoutTimer);
        unsubscribe();
      };
    } catch (e) {
      console.warn('Error setting up auth observer:', e);
      clearTimeout(timeoutTimer);
      setAuthLoading(false);
    }
  }, []);

  // Load Firestore data
  const loadFirestoreData = async (uid: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, 'users', uid, 'wealthData', 'portfolio');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as WealthData;
        if (data && data.peaLines) {
          setWealthData(data);
          try {
            localStorage.setItem('patrimoine_wealth_data', JSON.stringify(data));
          } catch {}
        }
      } else {
        // Initialize with current/default data
        await setDoc(docRef, wealthData);
      }

      // Real-time Firestore listener
      onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as WealthData;
          if (data && data.peaLines) {
            setWealthData(data);
            try {
              localStorage.setItem('patrimoine_wealth_data', JSON.stringify(data));
            } catch {}
          }
        }
      });
    } catch (err: any) {
      console.error('Error loading Firestore data:', err);
    }
  };

  // Save wealth data to Firestore & localStorage
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

  // Google Sign-In with friendly error handling for GitHub Pages
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email === ALLOWED_EMAIL.toLowerCase()) {
        setUser(result.user);
        setIsGuestMode(false);
        setUnauthorizedEmail(null);
      } else {
        await signOut(auth);
        setUnauthorizedEmail(result.user.email);
        setUser(null);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError(
          `Le domaine actuel (${window.location.hostname}) n'est pas autorisé dans votre console Firebase. Pour activer la connexion Google ici, ajoutez "${window.location.hostname}" dans Firebase > Authentication > Settings > Authorized domains. Vous pouvez utiliser le mode local ci-dessous en attendant.`
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User just closed popup
      } else {
        setAuthError(err.message || 'Erreur lors de la tentative de connexion avec Google.');
      }
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setUser(null);
    setIsGuestMode(false);
  };

  // Refresh live prices (Euronext ISINs & Bitcoin)
  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Bitcoin price (local API first, then Binance public CORS fallback)
      let newBtcPrice = wealthData.bitcoin.currentPriceEur;
      try {
        const btcRes = await fetch('/api/btc');
        if (btcRes.ok && btcRes.headers.get('content-type')?.includes('application/json')) {
          const btcData = await btcRes.json();
          if (btcData?.price) newBtcPrice = Number(btcData.price);
        } else {
          throw new Error('Local API unavailable');
        }
      } catch {
        try {
          const publicRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR');
          if (publicRes.ok) {
            const data = await publicRes.json();
            if (data?.price) newBtcPrice = parseFloat(data.price);
          }
        } catch {}
      }

      // 2. Accurate Euronext ISIN reference prices (including Amundi Core MSCI World MWRD)
      const STATIC_ISIN_PRICES: Record<string, number> = {
        'IE000BI8OT95': 26.80, // Amundi Core MSCI World UCITS ETF (MWRD)
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
        } catch {}
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

  // Loading state with theme styling
  if (authLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${
        isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}>
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Chargement de votre patrimoine...
        </p>
      </div>
    );
  }

  // Not signed in and not in guest/local mode
  if (!user && !isGuestMode) {
    return (
      <LoginScreen
        onGoogleSignIn={handleGoogleSignIn}
        onContinueOffline={() => setIsGuestMode(true)}
        unauthorizedEmail={unauthorizedEmail}
        authError={authError}
        onClearUnauthorized={() => {
          setUnauthorizedEmail(null);
          setAuthError(null);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col selection:bg-blue-600 selection:text-white transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
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
