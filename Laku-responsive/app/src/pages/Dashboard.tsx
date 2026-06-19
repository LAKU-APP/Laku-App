import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import ModalSheet from '@/components/ModalSheet';
import { Wallet, Target, Check, X, Receipt, Store, CircleCheck, ArrowUpRight, ArrowDownLeft, Package, ShoppingCart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { calcRevenue, calcExpense, calcGrossProfit, calcCashOnHand, transactionProfit, formatRupiah } from '@/lib/finance';

export default function Dashboard() {
  const { state, dispatch, setDailyTarget } = useApp();
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = state.transactions.filter(t => t.createdAt.startsWith(today));

  // Semua angka uang dihitung lewat modul finance agar konsisten di seluruh app.
  const todayRevenue = calcRevenue(todayTransactions);
  const todayExpense = calcExpense(todayTransactions);
  const todayProfit = calcGrossProfit(todayTransactions, state.products);
  const cashOnHand = calcCashOnHand(state.storeSettings.initialCash, state.transactions);
  const targetProgress = state.dailyTarget > 0 ? (todayProfit / state.dailyTarget) * 100 : 0;
  const targetReached = todayProfit >= state.dailyTarget && state.dailyTarget > 0;

  const handleSaveTarget = () => {
    const newTarget = parseInt(targetInput);
    if (newTarget && newTarget > 0) {
      setDailyTarget(newTarget);
      setEditingTarget(false);
    }
  };

  // CTA empty state: arahkan ke langkah berikutnya yang masuk akal —
  // tambah produk dulu bila belum ada, jika sudah ada langsung ke kasir.
  const goToFirstAction = () => {
    dispatch({ type: 'SET_TAB', payload: state.products.length > 0 ? 'pos' : 'products' });
  };

  const smallStats = [
    {
      key: 'kas', label: 'Kas di Tangan',
      value: `Rp ${cashOnHand.toLocaleString('id-ID')}`,
      bg: 'bg-gradient-to-br from-[#0B3A8D] via-[#1A56DB] to-[#2563EB]',
      shadow: 'stat-blue-shadow',
      icon: Wallet,
      detailRows: [
        ['Saldo Awal', formatRupiah(state.storeSettings.initialCash)],
        ['Total Pemasukan', formatRupiah(calcRevenue(state.transactions))],
        ['Total Pengeluaran', formatRupiah(calcExpense(state.transactions))],
        ['Saldo Sekarang', formatRupiah(cashOnHand)],
      ],
    },
    {
      key: 'transaksi', label: 'Transaksi',
      value: `${todayTransactions.length}`,
      bg: 'bg-gradient-to-br from-[#172554] via-[#1E3A8A] to-[#1D4ED8]',
      shadow: 'stat-navy-shadow',
      icon: Receipt,
      detailRows: [
        ['Total Transaksi', `${todayTransactions.length} transaksi`],
        ['Penjualan', `${todayTransactions.filter(t => t.type === 'OUT').length} transaksi`],
        ['Pembelian', `${todayTransactions.filter(t => t.type === 'IN').length} transaksi`],
      ],
    },
  ];

  const openModal = (key: string) => {
    const stat = smallStats.find(s => s.key === key);
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

  const recentTx = useMemo(() => {
    return state.transactions.slice(0, isMobile ? 3 : 6).map(t => {
      const d = new Date(t.createdAt);
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (t.type === 'OUT') {
        return {
          time,
          desc: t.note || `Penjualan: ${t.qty}x ${t.productName}`,
          amount: t.totalPrice,
          profit: transactionProfit(t, state.products),
          type: 'sale' as const,
        };
      }
      return {
        time,
        desc: t.note || `Pembelian: ${t.qty}x ${t.productName}`,
        amount: Math.abs(t.totalPrice),
        profit: 0,
        type: 'purchase' as const,
      };
    });
  }, [state.transactions, state.products, isMobile]);

  const getTransactionVisual = (type: 'sale' | 'purchase' | 'OUT' | 'IN') => {
    const isSale = type === 'sale' || type === 'OUT';
    return {
      Icon: isSale ? ArrowUpRight : ArrowDownLeft,
      iconBg: isSale ? 'bg-[#E8F1FF]' : 'bg-[#FFF4E8]',
      iconColor: isSale ? 'text-[#1A56DB]' : 'text-[#B45309]',
      amountColor: isSale ? 'text-[#16a34a]' : 'text-[#dc2626]',
    };
  };

  // Laba + Target card — dipakai di mobile & desktop
  const labaTargetCard = (
    <div className="bg-gradient-to-br from-[#0B3A8D] via-[#1A56DB] to-[#2563EB] rounded-2xl p-4 relative overflow-hidden border border-white/10">
      <div className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-white/[0.04] pointer-events-none" />
      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-white/80">Laba Hari Ini</span>
          </div>
          {!editingTarget && (
            <button
              onClick={() => { setTargetInput(state.dailyTarget.toString()); setEditingTarget(true); }}
              className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1.5 active:scale-95 transition-transform"
            >
              <Target size={12} className="text-white/80" strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-white/80">Edit Target</span>
            </button>
          )}
        </div>

        {/* Laba value */}
        <div className="text-2xl font-extrabold text-white tracking-tight mb-3">
          Rp {Math.floor(todayProfit).toLocaleString('id-ID')}
        </div>

        {/* Edit target input */}
        {editingTarget && (
          <div className="flex items-center gap-1.5 mb-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan target..."
              className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-white/20 text-white text-sm font-bold placeholder:text-white/40 outline-none focus:bg-white/30"
              autoFocus
            />
            <button onClick={handleSaveTarget} className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center active:scale-95 shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </button>
            <button onClick={() => setEditingTarget(false)} className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center active:scale-95 shrink-0">
              <X size={16} className="text-white" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Progress bar */}
        {!editingTarget && (
          <>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-white/70 shrink-0">
                Target: Rp {state.dailyTarget.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] font-bold text-white shrink-0">
                {state.dailyTarget > 0 ? `${Math.min(targetProgress, 100).toFixed(0)}%` : '-'}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
            {targetReached && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#16a34a]/25 rounded-lg px-2 py-1">
                <CircleCheck size={12} className="text-[#bbf7d0]" strokeWidth={2.5} />
                Target tercapai
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-3 px-4 pt-3 pb-24 w-full overscroll-contain">
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
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E4EAF5] flex items-center justify-center card-shadow">
            <Store size={19} className="text-[#1A56DB]" strokeWidth={2.4} />
          </div>
        </div>

        {/* Laba + Target */}
        <div className="animate-fade-up animate-delay-2">
          {labaTargetCard}
        </div>

        {/* Kas & Transaksi */}
        <div className="grid grid-cols-2 gap-2.5 auto-rows-fr">
          {smallStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <button key={stat.key} onClick={() => openModal(stat.key)}
                className={`${stat.bg} ${stat.shadow} rounded-2xl p-3 h-full flex flex-col gap-1.5 text-white text-left relative overflow-hidden active:scale-[0.97] transition-transform animate-fade-up`}
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                <div className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-14 bg-white/[0.04] pointer-events-none" />
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center relative z-10 shrink-0">
                  <Icon size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="text-[11px] font-semibold opacity-90 relative z-10 leading-tight">{stat.label}</div>
                <div className="text-[13px] font-extrabold tracking-tight relative z-10 leading-tight break-all">{stat.value}</div>
              </button>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col gap-2 animate-fade-up animate-delay-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-[#1A1F3A]">Transaksi Hari Ini</h3>
            <button onClick={() => {
              setModalTitle('Semua Transaksi');
              setModalContent(
                <div className="flex flex-col">
                  {state.transactions.length === 0 && (
                    <div className="text-center py-8 text-[#9BA3BC] text-sm">Belum ada transaksi</div>
                  )}
                  {state.transactions.map((tx, idx) => {
                    const d = new Date(tx.createdAt);
                    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    const visual = getTransactionVisual(tx.type);
                    const TxIcon = visual.Icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 py-3 border-b border-[#EEF0F6] last:border-b-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${visual.iconBg}`}>
                          <TxIcon size={16} className={visual.iconColor} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#1A1F3A] truncate">{tx.note || tx.productName}</div>
                          <div className="text-[10px] text-[#9BA3BC] font-medium">{time}</div>
                        </div>
                        <div className={`text-xs font-extrabold shrink-0 ${visual.amountColor}`}>
                          {tx.type === 'OUT' ? '+' : '-'}Rp {Math.abs(tx.totalPrice).toLocaleString('id-ID')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              setModalOpen(true);
            }} className="text-xs font-bold text-[#1A56DB] active:opacity-70">Lihat semua</button>
          </div>

          {/* Summary strip */}
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <div className="flex divide-x divide-[#EEF0F6]">
              <div className="flex-1 px-2 py-2 text-center">
                <div className="text-[10px] font-bold text-[#9BA3BC] mb-0.5">Transaksi</div>
                <div className="text-sm font-extrabold text-[#1A1F3A]">{todayTransactions.length}</div>
              </div>
              <div className="flex-1 px-2 py-2 text-center">
                <div className="text-[10px] font-bold text-[#9BA3BC] mb-0.5">Penjualan</div>
                <div className="text-sm font-extrabold text-[#22c55e]">Rp {(todayRevenue / 1000).toFixed(0)}k</div>
              </div>
              <div className="flex-1 px-2 py-2 text-center">
                <div className="text-[10px] font-bold text-[#9BA3BC] mb-0.5">Pengeluaran</div>
                <div className="text-sm font-extrabold text-[#ef4444]">Rp {(todayExpense / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </div>

          {/* Transaction list */}
          {recentTx.length === 0 ? (
            <DashboardEmptyState hasProducts={state.products.length > 0} onAction={goToFirstAction} />
          ) : (
            recentTx.map((tx, i) => {
              const visual = getTransactionVisual(tx.type);
              const TxIcon = visual.Icon;
              return (
                <div key={i} className="bg-white rounded-xl px-3.5 py-3 flex gap-3 items-center card-shadow active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visual.iconBg}`}>
                    <TxIcon size={17} className={visual.iconColor} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1A1F3A] truncate">{tx.desc}</div>
                    <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">{tx.time}</div>
                  </div>
                  <div className={`text-xs font-extrabold shrink-0 ${visual.amountColor}`}>
                    {tx.type === 'sale' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <ModalSheet open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
          {modalContent}
        </ModalSheet>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-5 px-6 py-6">
      {/* Top row: Laba+Target full width + 2 stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          {labaTargetCard}
        </div>
        {smallStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <button key={stat.key} onClick={() => openModal(stat.key)}
              className={`${stat.bg} ${stat.shadow} rounded-2xl p-5 flex flex-col gap-2 text-white text-left relative overflow-hidden active:scale-[0.97] transition-transform animate-fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-20 bg-white/[0.04] pointer-events-none" />
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                <Icon size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="text-xs font-semibold opacity-85 relative z-10">{stat.label}</div>
              <div className="text-2xl font-extrabold tracking-tight relative z-10">{stat.value}</div>
            </button>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3.5 border-b border-[#EEF0F6]">
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
        {recentTx.map((tx, i) => {
          const visual = getTransactionVisual(tx.type);
          const TxIcon = visual.Icon;
          return (
            <div key={i} className="flex gap-3 items-center px-4 py-3.5 border-b border-[#EEF0F6] last:border-b-0 hover:bg-[#F8F9FD] transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visual.iconBg}`}>
                <TxIcon size={17} className={visual.iconColor} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#1A1F3A] truncate">{tx.desc}</div>
                <div className="text-xs text-[#9BA3BC] font-medium mt-0.5">
                  {tx.type === 'sale'
                    ? <>Laba: <span className="text-[#16a34a] font-bold">+{formatRupiah(tx.profit)}</span></>
                    : <>Biaya: <span className="text-[#dc2626] font-bold">-{formatRupiah(tx.amount)}</span></>
                  }
                </div>
              </div>
              <div className="text-xs font-bold text-[#9BA3BC] shrink-0">{tx.time}</div>
            </div>
          );
        })}
        {recentTx.length === 0 && (
          <div className="px-4 py-10">
            <DashboardEmptyState hasProducts={state.products.length > 0} onAction={goToFirstAction} />
          </div>
        )}
      </div>

      <ModalSheet open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        {modalContent}
      </ModalSheet>
    </div>
  );
}

// Empty state Dashboard dengan ajakan bertindak (CTA). Pesannya menyesuaikan:
// belum punya produk → ajak tambah produk; sudah punya → ajak buat transaksi.
function DashboardEmptyState({ hasProducts, onAction }: { hasProducts: boolean; onAction: () => void }) {
  const Icon = hasProducts ? ShoppingCart : Package;
  return (
    <div className="bg-white rounded-2xl card-shadow py-8 px-5 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#E8F1FF] flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#1A56DB]" strokeWidth={2} />
      </div>
      <div className="text-sm font-extrabold text-[#1A1F3A]">
        {hasProducts ? 'Belum ada transaksi hari ini' : 'Mulai kelola warungmu'}
      </div>
      <div className="text-xs font-medium text-[#9BA3BC] mt-1 max-w-[260px]">
        {hasProducts
          ? 'Catat penjualan pertamamu lewat kasir untuk melihat ringkasannya di sini.'
          : 'Tambahkan produk terlebih dahulu, lalu catat transaksi penjualanmu.'}
      </div>
      <button
        onClick={onAction}
        className="mt-4 h-10 px-5 rounded-xl bg-[#1A56DB] text-white text-sm font-bold flex items-center gap-2 active:scale-[0.97] transition-transform"
        style={{ boxShadow: '0 4px 16px rgba(26,79,214,0.3)' }}
      >
        <Icon size={16} strokeWidth={2.5} />
        {hasProducts ? 'Buka Kasir' : 'Tambah Produk'}
      </button>
    </div>
  );
}
