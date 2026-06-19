import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Splash from '@/components/Splash';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import SideNav from '@/components/SideNav';
import Toast from '@/components/Toast';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import POS from '@/pages/POS';
import Records from '@/pages/Records';
import Insights from '@/pages/Insights';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Onboarding from '@/components/Onboarding';
import { useIsMobile } from '@/hooks/use-mobile';

function AppContent() {
  const { state, completeOnboarding } = useApp();
  const isMobile = useIsMobile();

  if (!state.user) {
    return <Login />;
  }

  // Show onboarding for first-time users
  if (!state.hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} userName={state.user.name} />;
  }

  const renderPage = () => {
    switch (state.activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'pos': return <POS />;
      case 'records': return <Records />;
      case 'insights': return <Insights />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };
 
  // Mobile: < 768px — BottomNav + TopNav
  if (isMobile) {
  return (
    <div className="min-h-dvh w-full bg-[#F5F8FC] flex flex-col overflow-x-hidden">
      <TopNav />
      <main className="flex-1 flex flex-col min-h-0 w-full overflow-y-auto overscroll-contain">
        {renderPage()}
      </main>

      <BottomNav />
      <Toast />
    </div>
  );
}

  // Tablet + Desktop: >= 768px — SideNav + TopNav
  // h-dvh (tinggi tetap, bukan min-h) agar area konten bisa scroll internal.
  return (
    <div className="h-dvh w-full bg-[#EEF3F8] flex overflow-hidden">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <TopNav isDesktop />
        <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          {renderPage()}
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  // Splash pembuka singkat saat aplikasi pertama dimuat.
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (booting) return <Splash />;
  return <AppContent />;
}
