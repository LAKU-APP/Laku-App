import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, TrendingDown, Receipt, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function Records() {
  const { state } = useApp();
  const isMobile = useIsMobile();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const filteredTransactions = useMemo(() => {
    const nowMs = now.getTime();
    switch (timeFilter) {
      case 'today': return state.transactions.filter(t => t.createdAt.startsWith(today));
      case 'week': return state.transactions.filter(t => new Date(t.createdAt).getTime() >= nowMs - 7 * 24 * 60 * 60 * 1000);
      case 'month': return state.transactions.filter(t => new Date(t.createdAt).getTime() >= nowMs - 30 * 24 * 60 * 60 * 1000);
      default: return state.transactions;
    }
  }, [state.transactions, timeFilter, today]);

  const stats = useMemo(() => {
    const revenue = filteredTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.totalPrice, 0);
    const expense = filteredTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + Math.abs(t.totalPrice), 0);
    const profit = revenue - expense * 0.2;
    const transactionCount = filteredTransactions.length;
    return { revenue, expense, profit, transactionCount };
  }, [filteredTransactions]);

  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: 'Minggu' },
    { key: 'month', label: 'Bulan' },
    { key: 'all', label: 'Semua' },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    filteredTransactions.forEach(t => {
      const date = t.createdAt.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
      {/* Filter + Summary row */}
      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-start'}`}>
        {/* Time Filter */}
        <div className={`flex gap-1.5 bg-white rounded-xl p-1.5 card-shadow ${isMobile ? 'w-full' : 'shrink-0'}`}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={`${isMobile ? 'flex-1' : 'px-4'} h-9 rounded-lg text-xs font-bold transition-all
                ${timeFilter === f.key ? 'bg-[#1A56DB] text-white' : 'text-[#9BA3BC] hover:bg-[#F8F9FC]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 flex-1'}`}>
          <div className="bg-white rounded-xl p-3 card-shadow animate-fade-up animate-delay-1">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Omzet</div>
            <div className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>
              {isMobile ? `Rp ${(stats.revenue / 1000).toFixed(0)}k` : `Rp ${stats.revenue.toLocaleString('id-ID')}`}
            </div>
            <TrendingUp size={14} className="text-[#22c55e] mt-1" />
          </div>
          <div className="bg-white rounded-xl p-3 card-shadow animate-fade-up animate-delay-2">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Biaya</div>
            <div className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>
              {isMobile ? `Rp ${(stats.expense / 1000).toFixed(0)}k` : `Rp ${stats.expense.toLocaleString('id-ID')}`}
            </div>
            <TrendingDown size={14} className="text-[#ef4444] mt-1" />
          </div>
          <div className="bg-white rounded-xl p-3 card-shadow animate-fade-up animate-delay-3">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Laba</div>
            <div className={`font-extrabold ${isMobile ? 'text-sm' : 'text-base'} ${stats.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {isMobile ? `Rp ${(stats.profit / 1000).toFixed(0)}k` : `Rp ${stats.profit.toLocaleString('id-ID')}`}
            </div>
            <Receipt size={14} className="text-[#1A56DB] mt-1" />
          </div>
        </div>
      </div>

      {/* Transaction Count */}
      <div className="flex justify-between items-center">
        <h3 className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>Riwayat Transaksi</h3>
        <span className="text-[10px] font-bold text-[#9BA3BC]">{stats.transactionCount} transaksi</span>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-3">
        {grouped.map(([date, transactions]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar size={14} className="text-[#9BA3BC]" />
              <span className="text-xs font-bold text-[#9BA3BC] uppercase tracking-wide">{formatDate(date)}</span>
            </div>
            <div className={isMobile ? 'flex flex-col gap-2.5' : 'grid grid-cols-2 lg:grid-cols-3 gap-2.5'}>
              {transactions.map((t, i) => (
                <div key={t.id}
                  className="bg-white rounded-xl p-3.5 flex gap-3 items-start card-shadow hover:card-shadow-hover active:scale-[0.98] transition-all animate-fade-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className={`rounded-xl flex items-center justify-center shrink-0 ${isMobile ? 'w-11 h-11' : 'w-12 h-12'}
                    ${t.type === 'OUT' ? 'bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]' : 'bg-gradient-to-br from-[#fee2e2] to-[#fecaca]'}`}>
                    {t.type === 'OUT'
                      ? <TrendingUp size={18} className="text-[#22c55e]" strokeWidth={2.5} />
                      : <TrendingDown size={18} className="text-[#ef4444]" strokeWidth={2.5} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold text-[#1A1F3A] truncate">{t.productName}</div>
                      <div className="text-[10px] font-bold text-[#9BA3BC] shrink-0 ml-2">{formatTime(t.createdAt)}</div>
                    </div>
                    <div className="text-[11px] text-[#9BA3BC] font-medium line-clamp-1 mb-1.5">{t.note}</div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-extrabold ${t.type === 'OUT' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {t.type === 'OUT' ? '+' : '-'}Rp {Math.abs(t.totalPrice).toLocaleString('id-ID')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md
                        ${t.type === 'OUT' ? 'bg-[#dcfce7] text-[#22c55e]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                        {t.type === 'OUT' ? 'JUAL' : 'BELI'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt size={48} className="text-[#DDE1EF] mb-3" />
            <p className="text-sm font-bold text-[#9BA3BC]">Belum ada transaksi</p>
            <p className="text-xs text-[#DDE1EF] mt-1">Transaksi akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}
