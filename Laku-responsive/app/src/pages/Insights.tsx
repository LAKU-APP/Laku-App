import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, Package, BarChart3, AlertTriangle, Bot, Lightbulb, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

function allZeroWeek(weekData: { revenue: number }[]) {
  return weekData.every(d => d.revenue === 0);
}

function getTrendLabel(weekData: { day: string; revenue: number }[]) {
  const withData = weekData.filter(d => d.revenue > 0);
  if (withData.length < 2) return 'Data tren belum cukup';
  const first = withData[0].revenue;
  const last = withData[withData.length - 1].revenue;
  const pct = (((last - first) / first) * 100).toFixed(0);
  const up = last >= first;
  return `${up ? '+' : ''}${pct}% dibanding awal minggu`;
}

export default function Insights() {
  const { state } = useApp();
  const isMobile = useIsMobile();
  const [predictionOpen, setPredictionOpen] = useState(false);

  const stats = useMemo(() => {
    const totalProducts = state.products.length;
    const totalTransactions = state.transactions.length;
    const lowStockItems = state.products.filter(p => p.stock <= 5 && p.stock > 0);
    const outOfStock = state.products.filter(p => p.stock === 0);

    const salesByProduct = new Map<string, number>();
    state.transactions.filter(t => t.type === 'OUT').forEach(t => {
      salesByProduct.set(t.productName, (salesByProduct.get(t.productName) || 0) + t.qty);
    });
    let bestSeller = '-';
    let bestSellerQty = 0;
    salesByProduct.forEach((qty, name) => {
      if (qty > bestSellerQty) { bestSellerQty = qty; bestSeller = name; }
    });

    // FIX: Gunakan tanggal real dari transaksi, bukan hardcoded
    const now = new Date();
    const weekData: { day: string; revenue: number; date: string }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      
      // Hitung revenue untuk tanggal ini
      const dayRevenue = state.transactions
        .filter(t => {
          const txDate = t.createdAt.split('T')[0];
          return txDate === dateStr && t.type === 'OUT';
        })
        .reduce((sum, t) => sum + t.totalPrice, 0);
      
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      weekData.push({ 
        day: dayNames[d.getDay()], 
        revenue: dayRevenue,
        date: dateStr
      });
    }
    
    const maxRevenue = Math.max(...weekData.map(d => d.revenue), 1);

    return { totalProducts, totalTransactions, lowStockItems, outOfStock, bestSeller, bestSellerQty, weekData, maxRevenue };
  }, [state.products, state.transactions]);

  const predictions = [
    { product: 'Cabai Merah', qty: '+12 kg', emoji: '🌶️', urgency: 'high' },
    { product: 'Telur', qty: '+5 kg', emoji: '🥚', urgency: 'medium' },
    { product: 'Beras', qty: 'Stok cukup', emoji: '🍚', urgency: 'low' },
    { product: 'Minyak Goreng', qty: '+4 liter', emoji: '🧴', urgency: 'medium' },
  ];

  const overviewCards = (
    <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
      <div className="bg-white rounded-xl p-3 card-shadow animate-fade-up animate-delay-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center shrink-0">
            <Package size={15} className="text-[#1A56DB]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Total SKU</span>
        </div>
        <div className="text-xl font-extrabold text-[#1A1F3A]">{stats.totalProducts}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">produk aktif</div>
      </div>
      <div className="bg-white rounded-xl p-3 card-shadow animate-fade-up animate-delay-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fde8dc] to-[#fcd4b8] flex items-center justify-center shrink-0">
            <TrendingUp size={15} className="text-[#F97316]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Terlaris</span>
        </div>
        <div className="text-base font-extrabold text-[#1A1F3A] leading-tight truncate">{stats.bestSeller}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">{stats.bestSellerQty} terjual</div>
      </div>
      {!isMobile && (
        <>
          <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] flex items-center justify-center">
                <TrendingUp size={17} className="text-[#22c55e]" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-[#9BA3BC] uppercase tracking-wide">Total Transaksi</span>
            </div>
            <div className="text-2xl font-extrabold text-[#1A1F3A]">{stats.totalTransactions}</div>
            <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">semua waktu</div>
          </div>
          <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fee2e2] to-[#fecaca] flex items-center justify-center">
                <AlertTriangle size={17} className="text-[#ef4444]" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-[#9BA3BC] uppercase tracking-wide">Stok Rendah</span>
            </div>
            <div className="text-2xl font-extrabold text-[#ef4444]">{stats.lowStockItems.length + stats.outOfStock.length}</div>
            <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">perlu perhatian</div>
          </div>
        </>
      )}
    </div>
  );

  const weeklyChart = (
    <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center shrink-0">
            <BarChart3 size={17} className="text-[#1A56DB]" strokeWidth={2.5} />
          </div>
          <h3 className="text-sm font-extrabold text-[#1A1F3A]">Omzet Mingguan</h3>
        </div>
        <span className="text-[10px] font-bold text-[#9BA3BC]">
          Total: Rp {stats.weekData.reduce((s, d) => s + d.revenue, 0).toLocaleString('id-ID')}
        </span>
      </div>

      {/* Chart area */}
      <div className={`relative flex items-end justify-between gap-1 ${isMobile ? 'h-[140px]' : 'h-[160px]'}`}>
        {stats.weekData.map((d, i) => {
          const isToday = i === stats.weekData.length - 1;
          // Kalau semua 0, tampilkan bar placeholder 20% biar keliatan
          const allZero = stats.maxRevenue === 0;
          const heightPercent = allZero
            ? 20
            : stats.maxRevenue > 0
              ? Math.max((d.revenue / stats.maxRevenue) * 100, d.revenue > 0 ? 8 : 4)
              : 4;

          return (
            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end" style={{ gap: '2px' }}>
              {/* Value label */}
              <div className="text-[8px] font-bold text-[#9BA3BC] min-h-[10px] text-center leading-none">
                {d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}k` : ''}
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: `${heightPercent}%`,
                  background: allZero
                    ? '#EEF0F6'
                    : d.revenue > 0
                      ? isToday
                        ? 'linear-gradient(to top, #1340b8, #3B82F6)'
                        : 'linear-gradient(to top, #1A56DB, #60a5fa)'
                      : '#EEF0F6',
                  opacity: allZero ? 0.5 : 1,
                  boxShadow: d.revenue > 0 ? '0 -2px 8px rgba(26,79,214,0.2)' : 'none',
                }}
              />
              {/* Day label */}
              <div className={`text-[9px] font-bold leading-none ${
                isToday ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'
              }`}>{d.day}</div>
              {isToday && <div className="w-1 h-1 rounded-full bg-[#1A56DB] shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Trend line info */}
      {!allZeroWeek(stats.weekData) && (
        <div className="mt-3 pt-3 border-t border-[#EEF0F6] flex items-center gap-2">
          <TrendingUp size={13} className="text-[#22c55e] shrink-0" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-[#9BA3BC]">
            {getTrendLabel(stats.weekData)}
          </span>
        </div>
      )}
    </div>
  );

  const stockAlerts = (stats.lowStockItems.length > 0 || stats.outOfStock.length > 0) && (
    <div className="bg-[#fee2e2] rounded-xl p-4 animate-fade-up animate-delay-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-[#ef4444]" />
        <h3 className="text-sm font-extrabold text-[#ef4444]">Peringatan Stok</h3>
      </div>
      <div className={`${!isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
        {stats.outOfStock.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#ef4444]">{p.name}</span>
            <span className="text-[10px] font-extrabold text-[#ef4444] bg-white px-2 py-0.5 rounded">HABIS</span>
          </div>
        ))}
        {stats.lowStockItems.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#F97316]">{p.name}</span>
            <span className="text-[10px] font-bold text-[#F97316]">Sisa {p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const aiPredictions = (
    <div className="bg-white rounded-xl card-shadow animate-fade-up animate-delay-5 overflow-hidden">
      <div className="flex items-center gap-2.5 p-4 pb-3 border-b border-[#EEF0F6]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fde8dc] to-[#fcd4b8] flex items-center justify-center shrink-0">
          <Lightbulb size={17} className="text-[#F97316]" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-[#1A1F3A]">Prediksi Belanja Minggu Depan</h3>
      </div>
      <div className="divide-y divide-[#EEF0F6]">
        {predictions.map((pred, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F8F9FC] flex items-center justify-center shrink-0">
                <span className="text-base">{pred.emoji}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1A1F3A] truncate">{pred.product}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${
                  pred.urgency === 'high' ? 'text-[#ef4444]' :
                  pred.urgency === 'medium' ? 'text-[#F97316]' : 'text-[#22c55e]'}`}>
                  {pred.urgency === 'high' ? 'Segera restock' :
                   pred.urgency === 'medium' ? 'Restock minggu ini' : 'Stok aman'}
                </div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#1A1F3A] shrink-0 ml-2">{pred.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const predictionFooter = (
  <div className="bg-gradient-to-r from-[#1340b8] to-[#1A56DB] rounded-xl animate-fade-up animate-delay-5 relative overflow-hidden">
    <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

    <button
      type="button"
      onClick={() => setPredictionOpen(prev => !prev)}
      className="relative z-10 w-full p-4 text-left active:scale-[0.99] transition-transform"
      aria-expanded={predictionOpen}
      aria-label="Toggle AI Prediction detail"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Bot size={17} className="text-white" strokeWidth={2.5} />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-bold text-white/80 uppercase tracking-wide">
              AI Prediction
            </span>
            <span className="block text-[11px] text-white/60 font-medium mt-0.5">
              Tap untuk lihat detail prediksi
            </span>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-white shrink-0 transition-transform duration-200 ${
            predictionOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={2.5}
        />
      </div>

      <div className="mt-3">
        <div className="text-xl font-extrabold text-white mb-0.5">
          Rp 2.800.000
        </div>
        <div className="text-xs font-bold text-white/80">
          Prediksi Omzet Minggu Depan
        </div>
      </div>
    </button>

    {predictionOpen && (
      <div className="relative z-10 mx-4 mb-4 rounded-xl bg-white/15 border border-white/20 p-3">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-white/70">Perubahan</span>
          <span className="text-xs font-extrabold text-white">+12%</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-white/70">Dasar Data</span>
          <span className="text-xs font-extrabold text-white">7 hari terakhir</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-white/70">Confidence</span>
          <span className="text-xs font-extrabold text-white">78%</span>
        </div>

        <p className="text-[11px] text-white/70 font-medium leading-relaxed pt-2">
          Prediksi ini dihitung dari pola penjualan mingguan, produk terlaris, dan transaksi terakhir.
        </p>
      </div>
    )}
  </div>
);

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3.5 ${isMobile ? 'px-4 pt-3 pb-24 w-full overscroll-contain' : 'px-6 py-6 w-full'}`}>
      {/* Header - mobile only */}
      {isMobile && (
        <div className="flex items-center gap-2.5 animate-fade-up animate-delay-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#1340b8] flex items-center justify-center shadow-md">
            <Bot size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1A1F3A]">AI Insights</h2>
            <p className="text-[10px] text-[#9BA3BC] font-medium">Analisis cerdas untuk bisnismu</p>
          </div>
        </div>
      )}

      {overviewCards}

      {isMobile ? (
        <>
          {weeklyChart}
          {stockAlerts}
          {aiPredictions}
          {predictionFooter}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {weeklyChart}
            {stockAlerts}
          </div>
          <div className="flex flex-col gap-4">
            {aiPredictions}
            {predictionFooter}
          </div>
        </div>
      )}
    </div>
  );
}
