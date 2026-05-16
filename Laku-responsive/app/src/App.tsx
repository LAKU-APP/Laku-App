import { useApp } from '@/context/AppContext';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import SideNav from '@/components/SideNav';
import Toast from '@/components/Toast';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import POS from '@/pages/POS';
import Records from '@/pages/Records';
import Insights from '@/pages/Insights';
import Login from '@/pages/Login';
import { useIsMobile } from '@/hooks/use-mobile';

function AppContent() {
  const { state } = useApp();
  const isMobile = useIsMobile();

  if (!state.user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (state.activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'pos': return <POS />;
      case 'records': return <Records />;
      case 'insights': return <Insights />;
      default: return <Dashboard />;
    }
  };

  if (isMobile) {
    return (
      <div
        className="w-full bg-[#F8F9FD] flex flex-col"
        style={{ height: '100dvh', overflow: 'hidden' }}
      >
        <TopNav />
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {renderPage()}
        </main>
        <BottomNav />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#E8EDF8] flex">
      <SideNav />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopNav isDesktop />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderPage()}
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
