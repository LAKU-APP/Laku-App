import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import ModalSheet from '@/components/ModalSheet';
import { Wallet, ShoppingBag, TrendingUp, Target, Sparkles, Edit3, Check, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { state, setDailyTarget } = useApp();
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = state.transactions.filter(t => t.createdAt.startsWith(today));

  const todayRevenue = todayTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.totalPrice, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + Math.abs(t.totalPrice), 0);
  const todayProfit = todayRevenue - todayExpense * 0.2;
  const cashOnHand = 1200000 + todayRevenue - todayExpense;
  const targetProgress = state.dailyTarget > 0 ? (todayProfit / state.dailyTarget) * 100 : 0;
  const targetReached = todayProfit >= state.dailyTarget;

  const handleSaveTarget = () => {
    const newTarget = parseInt(targetInput);
    if (newTarget && newTarget > 0) {
      setDailyTarget(newTarget);
      setEditingTarget(false);
    }
  };

  const stats = [
    {
      key: 'laba', label: 'Laba Hari Ini',
      value: `Rp ${todayProfit.toLocaleString('id-ID')}`,
      bg: 'bg-[#1A56DB]', shadow: 'stat-blue-shadow', icon: Wallet,
      detailRows: [
        ['Total Penjualan', `Rp ${todayRevenue.toLocaleString('id-ID')}`],
        ['Total HPP', `Rp ${Math.floor(todayExpense * 0.2).toLocaleString('id-ID')}`],
        ['Laba Bersih', `Rp ${Math.floor(todayProfit).toLocaleString('id-ID')}`],
        ['Target Harian', `Rp ${state.dailyTarget.toLocaleString('id-ID')}`],
        ['Status', targetReached ? '✅ Tercapai' : '⏳ Belum Tercapai'],
      ],
    },
    {
      key: 'kas', label: 'Kas di Tangan',
      value: `Rp ${cashOnHand.toLocaleString('id-ID')}`,
      bg: 'bg-[#F97316]', shadow: 'stat-orange-shadow', icon: ShoppingBag,
      detailRows: [
        ['Saldo Awal', 'Rp 1.000.000'],
        ['Pemasukan Hari Ini', `Rp ${todayRevenue.toLocaleString('id-ID')}`],
        ['Pengeluaran Hari Ini', `Rp ${todayExpense.toLocaleString('id-ID')}`],
        ['Saldo Sekarang', `Rp ${cashOnHand.toLocaleString('id-ID')}`],
      ],
    },
  ];

  const openModal = (key: string) => {
    const stat = stats.find(s => s.key === key);
    if (!stat) return;
    setModalTitle(stat.label);
    setModalContent(
      <div>{stat.detailRows.map(([label, value], i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-[#EEF0F6] last:border-b-0">
          <span className="text-[13px] font-semibold text-[#3D4566]">{label}</span>
          <span className="text-[13px] font-bold text-[#1A1F3A]">{value}</span>
        </div>
      ))}</div>
    );
    setModalOpen(true);
  };

  const openInsightModal = () => {
    setModalTitle('🤖 AI Insight Minggu Depan');
    setModalContent(
      <div>{[
        ['Cabai Merah', '+12 kg'], ['Telur', '+5 kg'],
        ['Beras', 'Stok cukup'], ['Minyak Goreng', '+4 liter'],
        ['Prediksi Omzet', 'Rp 2.800.000'],
      ].map(([label, value], i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-[#EEF0F6] last:border-b-0">
          <span className="text-[13px] font-semibold text-[#3D4566]">{label}</span>
          <span className="text-[13px] font-bold text-[#1A1F3A]">{value}</span>
        </div>
      ))}</div>
    );
    setModalOpen(true);
  };

  const recentTx = useMemo(() => {
    return state.transactions.slice(0, isMobile ? 3 : 6).map(t => {
      const d = new Date(t.createdAt);
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (t.type === 'OUT') {
        return { time, desc: t.note || `Penjualan: ${t.qty}x ${t.productName}`, aiAmount: Math.floor(t.totalPrice * 0.8), type: 'sale' as const };
      }
      return { time, desc: t.note || `Pembelian: ${t.qty}x ${t.productName}`, aiAmount: Math.abs(t.totalPrice), type: 'purchase' as const };
    });
  }, [state.transactions, isMobile]);

  if (isMobile) {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3.5 px-4 py-4">
        {/* Welcome Header */}
        <div className="flex justify-between items-start animate-fade-up animate-delay-1">
          <div>
            <h2 className="text-lg font-extrabold text-[#1A1F3A] tracking-tight">
              {state.user?.name || 'Warung Saya'}
            </h2>
            <p className="text-xs text-[#9BA3BC] font-medium mt-0.5">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f9c97c] to-[#F97316] flex items-center justify-center shadow-md">
            <span className="text-lg">👋</span>
          </div>
        </div>

        {/* Target Progress Card */}
        <div className="bg-gradient-to-br from-[#1A56DB] to-[#1340b8] rounded-2xl p-4 relative overflow-hidden animate-fade-up animate-delay-2">
          <div className="absolute right-[-30px] top-[-30px] w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute left-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Target size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white/80">Target Harian</div>
                  {!editingTarget ? (
                    <div className="text-xl font-extrabold text-white tracking-tight">
                      Rp {state.dailyTarget.toLocaleString('id-ID')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="300000"
                        className="w-32 h-8 px-2 rounded-lg bg-white/20 text-white text-sm font-bold placeholder:text-white/40 outline-none focus:bg-white/30"
                        autoFocus
                      />
                      <button onClick={handleSaveTarget} className="w-7 h-7 rounded-lg bg-[#22c55e] flex items-center justify-center active:scale-95">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </button>
                      <button onClick={() => setEditingTarget(false)} className="w-7 h-7 rounded-lg bg-[#ef4444] flex items-center justify-center active:scale-95">
                        <X size={14} className="text-white" strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {!editingTarget && (
                <button
                  onClick={() => { setTargetInput(state.dailyTarget.toString()); setEditingTarget(true); }}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Edit3 size={14} className="text-white" strokeWidth={2} />
                </button>
              )}
            </div>
            {!editingTarget && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-white/70">Progress Hari Ini</span>
                  <span className="text-xs font-bold text-white">{Math.min(targetProgress, 100).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(targetProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-white/60">Laba: Rp {todayProfit.toLocaleString('id-ID')}</span>
                  {targetReached && <span className="text-xs font-bold text-[#22c55e] bg-white/20 px-2 py-0.5 rounded-full">✅ Tercapai!</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <button key={stat.key} onClick={() => openModal(stat.key)}
                className={`${stat.bg} ${stat.shadow} rounded-2xl p-4 flex flex-col gap-2 text-white text-left relative overflow-hidden active:scale-[0.97] transition-transform animate-fade-up ${i === 0 ? 'animate-delay-3' : 'animate-delay-4'}`}>
                <div className="absolute right-[-20px] top-[-20px] w-20 h-20 rounded-full bg-white/10" />
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                  <Icon size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="text-xs font-semibold opacity-90 relative z-10">{stat.label}</div>
                <div className="text-lg font-extrabold tracking-tight relative z-10 leading-tight">{stat.value}</div>
              </button>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center animate-fade-up animate-delay-5">
            <h3 className="text-sm font-extrabold text-[#1A1F3A]">Transaksi Terbaru</h3>
            <button onClick={() => {
              setModalTitle('Semua Transaksi');
              setModalContent(
                <div className="flex flex-col gap-2">
                  {state.transactions.map((tx, idx) => {
                    const d = new Date(tx.createdAt);
                    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    return (
                      <div key={idx} className="flex justify-between items-start py-3 border-b border-[#EEF0F6] last:border-b-0">
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-[#9BA3BC]">{time}</div>
                          <div className="text-xs font-semibold text-[#1A1F3A] mt-0.5">{tx.note || tx.productName}</div>
                          <div className={`text-[11px] font-bold mt-1 ${tx.type === 'OUT' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {tx.type === 'OUT' ? '+' : '-'}Rp {Math.abs(tx.totalPrice).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              setModalOpen(true);
            }} className="text-xs font-bold text-[#1A56DB] active:opacity-70">Lihat semua</button>
          </div>
          {recentTx.map((tx, i) => (
            <div key={i} className="bg-white rounded-xl p-3.5 flex gap-3 items-start card-shadow hover:card-shadow-hover active:scale-[0.98] transition-all animate-fade-up"
              style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
              <div className={`rounded-xl flex items-center justify-center shrink-0 w-11 h-11 ${tx.type === 'sale' ? 'bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]' : 'bg-gradient-to-br from-[#fee2e2] to-[#fecaca]'}`}>
                <span className="text-lg">{tx.type === 'sale' ? '💰' : '🛒'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs font-bold text-[#1A1F3A] leading-tight line-clamp-1">{tx.desc}</div>
                  <div className="text-[10px] font-bold text-[#9BA3BC] shrink-0 ml-2">{tx.time}</div>
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-md ${tx.type === 'sale' ? 'bg-[#dcfce7] text-[#22c55e]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                  {tx.type === 'sale' ? '+' : '-'}Rp {tx.aiAmount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <button onClick={openInsightModal}
          className="bg-gradient-to-r from-[#e8effe] to-[#f0f4ff] rounded-xl p-4 flex gap-3 items-center card-shadow border-l-4 border-[#1A56DB] active:scale-[0.98] transition-all animate-fade-up text-left"
          style={{ animationDelay: '0.45s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#1A56DB] to-[#1340b8] rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-[#1A56DB] mb-0.5">🤖 AI Insight</div>
            <div className="text-sm font-extrabold text-[#1A1F3A]">Prediksi Minggu Depan</div>
            <div className="text-[11px] text-[#9BA3BC] font-medium mt-0.5">Tap untuk lihat rekomendasi</div>
          </div>
          <TrendingUp size={18} className="text-[#1A56DB] shrink-0" strokeWidth={2.5} />
        </button>

        <ModalSheet open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
          {modalContent}
        </ModalSheet>
      </div>
    );
  }

  // Desktop layout - simplified, no mic feature
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-5 px-6 py-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <button key={stat.key} onClick={() => openModal(stat.key)}
              className={`${stat.bg} ${stat.shadow} rounded-2xl p-5 flex flex-col gap-2 text-white text-left relative overflow-hidden active:scale-[0.97] transition-transform animate-fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="absolute right-[-20px] top-[-20px] w-[90px] h-[90px] rounded-full bg-white/10" />
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                <Icon size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="text-xs font-semibold opacity-85 relative z-10">{stat.label}</div>
              <div className="text-2xl font-extrabold tracking-tight relative z-10">{stat.value}</div>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-[#1A1F3A]">Transaksi Terbaru</h3>
            <button onClick={() => {
              setModalTitle('Semua Transaksi');
              setModalContent(
                <div className="flex flex-col gap-2">
                  {state.transactions.map((tx, idx) => {
                    const d = new Date(tx.createdAt);
                    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    return (
                      <div key={idx} className="flex justify-between items-start py-3 border-b border-[#EEF0F6] last:border-b-0">
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-[#9BA3BC]">{time}</div>
                          <div className="text-xs font-semibold text-[#1A1F3A] mt-0.5">{tx.note || tx.productName}</div>
                          <div className={`text-[11px] font-bold mt-1 ${tx.type === 'OUT' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {tx.type === 'OUT' ? '+' : '-'}Rp {Math.abs(tx.totalPrice).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              setModalOpen(true);
            }} className="text-xs font-bold text-[#1A56DB] hover:underline">Lihat semua</button>
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {recentTx.map((tx, i) => (
              <div key={i} className="flex gap-3 items-center px-4 py-3.5 border-b border-[#EEF0F6] last:border-b-0 hover:bg-[#F8F9FD] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'sale' ? 'bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]' : 'bg-gradient-to-br from-[#fee2e2] to-[#fecaca]'}`}>
                  <span className="text-lg">{tx.type === 'sale' ? '💰' : '🛒'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#1A1F3A] truncate">{tx.desc}</div>
                  <div className="text-xs text-[#9BA3BC] font-medium mt-0.5">
                    {tx.type === 'sale'
                      ? <>Laba: <span className="text-[#22c55e] font-bold">+Rp {tx.aiAmount.toLocaleString('id-ID')}</span></>
                      : <>Biaya: <span className="text-[#ef4444] font-bold">-Rp {tx.aiAmount.toLocaleString('id-ID')}</span></>
                    }
                  </div>
                </div>
                <div className="text-xs font-bold text-[#9BA3BC] shrink-0">{tx.time}</div>
              </div>
            ))}
            {recentTx.length === 0 && (
              <div className="text-center py-12 text-[#9BA3BC] text-sm">Belum ada transaksi</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={openInsightModal}
            className="bg-white rounded-2xl p-4 card-shadow border-l-4 border-[#1A56DB] text-left hover:card-shadow-hover active:scale-[0.98] transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-[#e8effe] rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-[#1A56DB]" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-extrabold text-[#1A56DB] uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-sm font-semibold text-[#3D4566] leading-relaxed">
              Prediksi Belanja Minggu Depan: Cabai Merah (+12kg), Telur (+5 Papan), Minyak Goreng (+4L).
            </p>
          </button>

          <div className="bg-white rounded-2xl p-4 card-shadow">
            <h4 className="text-sm font-extrabold text-[#1A1F3A] mb-3">Ringkasan Hari Ini</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Penjualan', value: `Rp ${todayRevenue.toLocaleString('id-ID')}`, color: 'text-[#22c55e]', bg: 'bg-[#dcfce7]' },
                { label: 'Pengeluaran', value: `Rp ${todayExpense.toLocaleString('id-ID')}`, color: 'text-[#ef4444]', bg: 'bg-[#fee2e2]' },
                { label: 'Transaksi', value: `${todayTransactions.length} transaksi`, color: 'text-[#1A56DB]', bg: 'bg-[#e8effe]' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-[#9BA3BC] font-medium">{item.label}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${item.color} ${item.bg}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ModalSheet open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        {modalContent}
      </ModalSheet>
    </div>
  );
}
