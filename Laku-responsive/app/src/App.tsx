import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Splash from '@/components/branding/Splash';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import SideNav from '@/components/navigation/SideNav';
import Toast from '@/components/feedback/Toast';
import Dashboard from '@/pages/Dashboard/DashboardPage';
import Products from '@/pages/Products/ProductsPage';
import POS from '@/pages/POS/POSPage';
import Records from '@/pages/Records/RecordsPage';
import Insights from '@/pages/Insights/InsightsPage';
import Settings from '@/pages/Settings/SettingsPage';
import Login from '@/pages/Auth/LoginPage';
import Onboarding from '@/pages/Onboarding/OnboardingPage';
import { useIsMobile } from '@/hooks/useMobile';

function AppContent() {
  const { state, completeOnboarding } = useApp();
  const isMobile = useIsMobile();

  if (!state.user) {
    return <Login />;
  }

  // Show onboarding for first-time users
  if (!state.hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} userName={state.user.name} initialStoreName={state.user.name} />;
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
