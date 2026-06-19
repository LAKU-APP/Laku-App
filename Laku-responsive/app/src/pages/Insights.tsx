import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, Package, BarChart3, AlertTriangle, Bot, Lightbulb, ChevronDown, Receipt, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { calcGrossProfit, formatRupiah } from '@/lib/finance';
import type { Transaction, Product } from '@/types';

const URGENCY_RANK = { high: 3, medium: 2, low: 1 } as const;
type Urgency = keyof typeof URGENCY_RANK;

export default function Insights() {
  const { state } = useApp();
  const isMobile = useIsMobile();
  const [predictionOpen, setPredictionOpen] = useState(false);

  const stats = useMemo(() => {
    const threshold = state.storeSettings.lowStockThreshold;
    const totalProducts = state.products.length;
    const totalTransactions = state.transactions.length;
    const lowStockItems = state.products.filter(p => p.stock > 0 && p.stock <= threshold);
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

    // ── Prediksi restock — dihitung dari kecepatan penjualan 7 hari terakhir ──
    // Berapa unit terjual per produk dalam 7 hari → rata-rata harian → perkiraan
    // berapa hari stok bertahan, dan rekomendasi jumlah restock untuk 7 hari ke depan.
    const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const soldLast7 = new Map<string, number>();
    state.transactions
      .filter(t => t.type === 'OUT' && new Date(t.createdAt).getTime() >= sevenDaysAgoMs)
      .forEach(t => soldLast7.set(t.productId, (soldLast7.get(t.productId) || 0) + t.qty));

    const restockPredictions = state.products
      .map(p => {
        const sold = soldLast7.get(p.id) || 0;
        const avgDaily = sold / 7;
        const daysLeft = avgDaily > 0 ? p.stock / avgDaily : Infinity;
        const recommended = Math.max(0, Math.ceil(avgDaily * 7) - p.stock);
        let urgency: Urgency = 'low';
        if (p.stock === 0 || daysLeft < 3) urgency = 'high';
        else if (daysLeft < 7) urgency = 'medium';
        return { id: p.id, product: p.name, stock: p.stock, recommended, urgency, avgDaily };
      })
      .sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency] || b.avgDaily - a.avgDaily)
      .slice(0, 5);

    // ── Prakiraan omzet minggu depan ──
    // Dasar: rata-rata omzet harian 7 hari terakhir, diekstrapolasi 7 hari ke
    // depan, lalu disesuaikan dengan momentum (tren awal vs akhir minggu) yang
    // dibatasi ±30% agar tidak liar. Confidence mengikuti banyaknya hari berdata.
    const totalWeekRevenue = weekData.reduce((s, d) => s + d.revenue, 0);
    const daysWithData = weekData.filter(d => d.revenue > 0).length;
    const avgDailyRevenue = totalWeekRevenue / 7;
    const withData = weekData.filter(d => d.revenue > 0);
    let momentum = 0;
    if (withData.length >= 2 && withData[0].revenue > 0) {
      momentum = Math.round(((withData[withData.length - 1].revenue - withData[0].revenue) / withData[0].revenue) * 100);
    }
    const cappedMomentum = Math.max(-30, Math.min(30, momentum));
    const forecast = {
      amount: Math.round((avgDailyRevenue * 7) * (1 + cappedMomentum / 100) / 1000) * 1000,
      changePct: cappedMomentum,
      confidence: Math.min(95, Math.round((daysWithData / 7) * 100)),
      hasData: totalWeekRevenue > 0,
    };

    return { totalProducts, totalTransactions, lowStockItems, outOfStock, bestSeller, bestSellerQty, weekData, maxRevenue, restockPredictions, forecast };
  }, [state.products, state.transactions, state.storeSettings.lowStockThreshold]);

  const overviewCards = (
    <div className={`grid gap-2.5 auto-rows-fr ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
      <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F1FF] flex items-center justify-center shrink-0">
            <Package size={15} className="text-[#1A56DB]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Total SKU</span>
        </div>
        <div className="text-xl font-extrabold text-[#1A1F3A]">{stats.totalProducts}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">produk aktif</div>
      </div>
      <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F1FF] flex items-center justify-center shrink-0">
            <TrendingUp size={15} className="text-[#1D4ED8]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Terlaris</span>
        </div>
        <div className="text-base font-extrabold text-[#1A1F3A] leading-tight truncate">{stats.bestSeller}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">{stats.bestSellerQty} terjual</div>
      </div>
      <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F1FF] flex items-center justify-center shrink-0">
            <Receipt size={15} className="text-[#0B3A8D]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Transaksi</span>
        </div>
        <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-extrabold text-[#1A1F3A]`}>{stats.totalTransactions}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">semua waktu</div>
      </div>
      <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <AlertTriangle size={15} className="text-[#dc2626]" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-[#9BA3BC] uppercase tracking-wide leading-tight">Stok Rendah</span>
        </div>
        <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-extrabold text-[#dc2626]`}>{stats.lowStockItems.length + stats.outOfStock.length}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">perlu perhatian</div>
      </div>
    </div>
  );

  const weeklyChart = (
    <SalesChart transactions={state.transactions} products={state.products} isMobile={isMobile} />
  );

  const stockAlerts = (stats.lowStockItems.length > 0 || stats.outOfStock.length > 0) && (
    <div className="bg-[#FEF2F2] rounded-xl p-4 animate-fade-up animate-delay-4 border border-[#FECACA]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-[#dc2626]" />
        <h3 className="text-sm font-extrabold text-[#dc2626]">Peringatan Stok</h3>
      </div>
      <div className={`${!isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
        {stats.outOfStock.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#991B1B]">{p.name}</span>
            <span className="text-[10px] font-extrabold text-[#dc2626] bg-white px-2 py-0.5 rounded">HABIS</span>
          </div>
        ))}
        {stats.lowStockItems.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#92400E]">{p.name}</span>
            <span className="text-[10px] font-bold text-[#B45309]">Sisa {p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const aiPredictions = (
    <div className="bg-white rounded-xl card-shadow animate-fade-up animate-delay-5 overflow-hidden">
      <div className="flex items-center gap-2.5 p-4 pb-3 border-b border-[#EEF0F6]">
        <div className="w-9 h-9 rounded-xl bg-[#E8F1FF] flex items-center justify-center shrink-0">
          <Lightbulb size={17} className="text-[#1A56DB]" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-[#1A1F3A]">Prediksi Belanja Minggu Depan</h3>
      </div>
      <div className="divide-y divide-[#EEF0F6]">
        {stats.restockPredictions.length === 0 && (
          <div className="px-3 py-6 text-center text-xs font-semibold text-[#9BA3BC]">
            Belum ada produk untuk dianalisis
          </div>
        )}
        {stats.restockPredictions.map(pred => {
          const qtyLabel = pred.recommended > 0
            ? `+${pred.recommended} unit`
            : pred.stock === 0 ? 'Perlu restok' : 'Stok cukup';
          return (
            <div key={pred.id} className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  pred.urgency === 'high' ? 'bg-[#FEF2F2]' :
                  pred.urgency === 'medium' ? 'bg-[#FFF7ED]' : 'bg-[#E8F1FF]'
                }`}>
                  <Package
                    size={15}
                    className={
                      pred.urgency === 'high' ? 'text-[#dc2626]' :
                      pred.urgency === 'medium' ? 'text-[#B45309]' : 'text-[#1A56DB]'
                    }
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1A1F3A] truncate">{pred.product}</div>
                  <div className={`text-[10px] font-bold mt-0.5 ${
                    pred.urgency === 'high' ? 'text-[#dc2626]' :
                    pred.urgency === 'medium' ? 'text-[#B45309]' : 'text-[#1A56DB]'}`}>
                    {pred.urgency === 'high' ? 'Segera restock' :
                     pred.urgency === 'medium' ? 'Restock minggu ini' : 'Stok aman'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#1A1F3A] shrink-0 ml-2">{qtyLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const predictionFooter = (
  <div className="bg-gradient-to-r from-[#0B3A8D] via-[#1340b8] to-[#1A56DB] rounded-xl animate-fade-up animate-delay-2 relative overflow-hidden border border-white/10">
    <div className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-24 bg-white/[0.04] pointer-events-none" />

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
              Buka detail prediksi
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
          {stats.forecast.hasData ? formatRupiah(stats.forecast.amount) : 'Belum cukup data'}
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
          <span className="text-xs font-extrabold text-white">
            {stats.forecast.changePct >= 0 ? '+' : ''}{stats.forecast.changePct}%
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-white/70">Dasar Data</span>
          <span className="text-xs font-extrabold text-white">7 hari terakhir</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-white/70">Confidence</span>
          <span className="text-xs font-extrabold text-white">{stats.forecast.confidence}%</span>
        </div>

        <p className="text-[11px] text-white/70 font-medium leading-relaxed pt-2">
          Dihitung dari rata-rata omzet harian 7 hari terakhir, disesuaikan dengan tren penjualan terbaru.
          Semakin banyak hari yang ada transaksinya, semakin tinggi tingkat keyakinannya.
        </p>
      </div>
    )}
  </div>
);

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-3.5 ${isMobile ? 'px-4 pt-3 pb-24 w-full overscroll-contain' : 'px-6 py-6 w-full'}`}>
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

      {isMobile ? (
        <>
          {predictionFooter}
          {overviewCards}
          {weeklyChart}
          {aiPredictions}
          {stockAlerts}
        </>
      ) : (
        <>
          {overviewCards}
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
        </>
      )}
    </div>
  );
}

// Grafik omzet interaktif: pilih periode 7/30 hari, ketuk batang untuk melihat
// rincian pemasukan, pengeluaran, laba, dan daftar transaksi pada hari itu.
function SalesChart({ transactions, products, isMobile }: {
  transactions: Transaction[];
  products: Product[];
  isMobile: boolean;
}) {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const now = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result: { dateStr: string; dayLabel: string; dayNum: number; revenue: number; expense: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayTx = transactions.filter(t => t.createdAt.split('T')[0] === dateStr);
      result.push({
        dateStr,
        dayLabel: dayNames[d.getDay()],
        dayNum: d.getDate(),
        revenue: dayTx.filter(t => t.type === 'OUT').reduce((s, t) => s + t.totalPrice, 0),
        expense: dayTx.filter(t => t.type === 'IN').reduce((s, t) => s + Math.abs(t.totalPrice), 0),
      });
    }
    return result;
  }, [transactions, period]);

  const maxValue = Math.max(...days.map(d => d.revenue), 1);
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const allZero = days.every(d => d.revenue === 0);

  const selected = selectedDate ? days.find(d => d.dateStr === selectedDate) ?? null : null;
  const dayTransactions = selected ? transactions.filter(t => t.createdAt.split('T')[0] === selected.dateStr) : [];
  const dayProfit = selected ? calcGrossProfit(dayTransactions, products) : 0;
  const formatDayLong = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-3">
      {/* Header + pemilih periode */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center shrink-0">
            <BarChart3 size={17} className="text-[#1A56DB]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[#1A1F3A] leading-tight">Omzet {period === 7 ? 'Mingguan' : 'Bulanan'}</h3>
            <span className="text-[10px] font-bold text-[#9BA3BC]">Total: {formatRupiah(totalRevenue)}</span>
          </div>
        </div>
        <div className="flex gap-1 bg-[#F4F6FD] rounded-lg p-1 shrink-0">
          {([7, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setSelectedDate(null); }}
              className={`px-2.5 h-7 rounded-md text-[11px] font-bold transition-colors ${period === p ? 'bg-white text-[#1A56DB] shadow-sm' : 'text-[#9BA3BC]'}`}
            >
              {p === 7 ? '7 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Area chart — 30 hari bisa di-scroll horizontal agar batang tetap bisa diketuk */}
      <div className={period === 30 ? 'overflow-x-auto scrollbar-hide' : ''}>
        <div className={`relative flex items-end gap-1 ${isMobile ? 'h-[140px]' : 'h-[160px]'} ${period === 30 ? 'min-w-[560px]' : ''}`}>
          {days.map(d => {
            const isSelected = selectedDate === d.dateStr;
            const heightPercent = allZero ? 6 : Math.max((d.revenue / maxValue) * 100, d.revenue > 0 ? 8 : 3);
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(isSelected ? null : d.dateStr)}
                className="flex flex-col items-center flex-1 h-full justify-end gap-1 min-w-0"
              >
                <div className="text-[8px] font-bold text-[#9BA3BC] min-h-[10px] leading-none">
                  {period === 7 && d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}k` : ''}
                </div>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${heightPercent}%`,
                    background: d.revenue > 0
                      ? (isSelected ? 'linear-gradient(to top, #0B3A8D, #1A56DB)' : 'linear-gradient(to top, #1A56DB, #60a5fa)')
                      : '#EEF0F6',
                    boxShadow: isSelected ? '0 -2px 10px rgba(26,79,214,0.35)' : 'none',
                  }}
                />
                <div className={`text-[8px] font-bold leading-none ${isSelected ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}>
                  {period === 7 ? d.dayLabel : (d.dayNum % 5 === 0 || isSelected ? d.dayNum : '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Petunjuk / rincian hari terpilih */}
      {!selected ? (
        <p className="text-[10px] text-[#9BA3BC] font-medium text-center mt-3 pt-3 border-t border-[#EEF0F6]">
          Ketuk batang untuk lihat rincian pemasukan & pengeluaran hari itu
        </p>
      ) : (
        <div className="mt-3 pt-3 border-t border-[#EEF0F6]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-[#1A1F3A]">{formatDayLong(selected.dateStr)}</span>
            <button onClick={() => setSelectedDate(null)} aria-label="Tutup rincian" className="text-[#9BA3BC] hover:text-[#1A1F3A]">
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#f0fdf4] rounded-lg p-2 text-center">
              <div className="text-[9px] font-bold text-[#16a34a]">Pemasukan</div>
              <div className="text-[11px] font-extrabold text-[#16a34a] mt-0.5">{formatRupiah(selected.revenue)}</div>
            </div>
            <div className="bg-[#fef2f2] rounded-lg p-2 text-center">
              <div className="text-[9px] font-bold text-[#ef4444]">Pengeluaran</div>
              <div className="text-[11px] font-extrabold text-[#ef4444] mt-0.5">{formatRupiah(selected.expense)}</div>
            </div>
            <div className="bg-[#e8f1ff] rounded-lg p-2 text-center">
              <div className="text-[9px] font-bold text-[#1A56DB]">Laba</div>
              <div className="text-[11px] font-extrabold text-[#1A56DB] mt-0.5">{formatRupiah(dayProfit)}</div>
            </div>
          </div>
          {dayTransactions.length === 0 ? (
            <p className="text-[11px] text-[#9BA3BC] font-medium text-center py-2">Tidak ada transaksi pada hari ini</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {dayTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between gap-2 bg-[#F8F9FC] rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'OUT' ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'}`}>
                      {t.type === 'OUT'
                        ? <ArrowUpRight size={12} className="text-[#16a34a]" strokeWidth={2.5} />
                        : <ArrowDownLeft size={12} className="text-[#ef4444]" strokeWidth={2.5} />}
                    </div>
                    <span className="text-[11px] font-bold text-[#1A1F3A] truncate">{t.productName} ×{t.qty}</span>
                  </div>
                  <span className={`text-[11px] font-extrabold shrink-0 ${t.type === 'OUT' ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                    {t.type === 'OUT' ? '+' : '-'}{formatRupiah(Math.abs(t.totalPrice))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
