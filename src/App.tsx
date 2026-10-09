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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
    });

    return () => unsubscribe();
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
    if (user) {
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
      // 1. Fetch Bitcoin price
      const btcRes = await fetch('/api/btc');
      const btcData = await btcRes.json();
      const newBtcPrice = btcData.price || wealthData.bitcoin.currentPriceEur;

      // 2. Fetch PEA & CTO quotes
      const updatedPea = await Promise.all(
        wealthData.peaLines.map(async (item) => {
          try {
            const res = await fetch(`/api/quote?isin=${item.isin}`);
            const q = await res.json();
            return { ...item, currentPrice: q.price || item.currentPrice, lastUpdated: Date.now() };
          } catch {
            return item;
          }
        })
      );

      const updatedCto = await Promise.all(
        wealthData.ctoLines.map(async (item) => {
          try {
            const res = await fetch(`/api/quote?isin=${item.isin}`);
            const q = await res.json();
            return { ...item, currentPrice: q.price || item.currentPrice, lastUpdated: Date.now() };
          } catch {
            return item;
          }
        })
      );

      const newData: WealthData = {
        ...wealthData,
        bitcoin: {
          ...wealthData.bitcoin,
          currentPriceEur: newBtcPrice
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
