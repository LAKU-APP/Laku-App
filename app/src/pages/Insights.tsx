import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, Package, BarChart3, AlertTriangle, Bot, Lightbulb } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Insights() {
  const { state } = useApp();
  const isMobile = useIsMobile();

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
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
      <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center">
            <Package size={17} className="text-[#1A56DB]" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-[#9BA3BC] uppercase tracking-wide">Total SKU</span>
        </div>
        <div className="text-2xl font-extrabold text-[#1A1F3A]">{stats.totalProducts}</div>
        <div className="text-[10px] text-[#9BA3BC] font-medium mt-0.5">produk aktif</div>
      </div>
      <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-2">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fde8dc] to-[#fcd4b8] flex items-center justify-center">
            <TrendingUp size={17} className="text-[#F97316]" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-[#9BA3BC] uppercase tracking-wide">Terlaris</span>
        </div>
        <div className="text-lg font-extrabold text-[#1A1F3A] leading-tight truncate">{stats.bestSeller}</div>
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
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center">
          <BarChart3 size={17} className="text-[#1A56DB]" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-[#1A1F3A]">Omzet Mingguan</h3>
      </div>
      <div className={`flex items-end justify-between gap-2 ${isMobile ? 'h-[140px]' : 'h-[180px]'}`}>
        {stats.weekData.map((d, i) => {
          const heightPercent = stats.maxRevenue > 0 ? (d.revenue / stats.maxRevenue) * 100 : 0;
          const hasData = d.revenue > 0;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="text-[9px] font-bold text-[#9BA3BC] min-h-[12px]">
                {hasData ? `${(d.revenue / 1000).toFixed(0)}k` : ''}
              </div>
              <div
                className={`w-full max-w-[45px] rounded-t-lg transition-all duration-500 ${
                  hasData ? 'shadow-sm' : ''
                }`}
                style={{
                  height: `${Math.max(heightPercent, hasData ? 5 : 3)}%`,
                  background: hasData 
                    ? 'linear-gradient(to top, #1A56DB, #3B82F6)' 
                    : '#EEF0F6',
                }}
                title={`${d.day}: Rp ${d.revenue.toLocaleString('id-ID')}`}
              />
              <div className="text-[10px] font-bold text-[#9BA3BC]">{d.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const stockAlerts = (stats.lowStockItems.length > 0 || stats.outOfStock.length > 0) && (
    <div className="bg-[#fee2e2] rounded-xl p-4 animate-fade-up animate-delay-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-[#ef4444]" />
        <h3 className="text-sm font-extrabold text-[#ef4444]">Peringatan Stok</h3>
      </div>
      <div className={`flex flex-col gap-2 ${!isMobile ? 'grid grid-cols-2 gap-2' : ''}`}>
        {stats.outOfStock.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#ef4444]">{p.emoji} {p.name}</span>
            <span className="text-[10px] font-extrabold text-[#ef4444] bg-white px-2 py-0.5 rounded">HABIS</span>
          </div>
        ))}
        {stats.lowStockItems.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-[#F97316]">{p.emoji} {p.name}</span>
            <span className="text-[10px] font-bold text-[#F97316]">Sisa {p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const aiPredictions = (
    <div className="bg-white rounded-xl p-4 card-shadow animate-fade-up animate-delay-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fde8dc] to-[#fcd4b8] flex items-center justify-center">
          <Lightbulb size={17} className="text-[#F97316]" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-[#1A1F3A]">Prediksi Belanja Minggu Depan</h3>
      </div>
      <div className={`${isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-x-6 gap-y-2.5'}`}>
        {predictions.map((pred, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#EEF0F6] last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F8F9FC] to-[#EEF0F6] flex items-center justify-center">
                <span className="text-xl">{pred.emoji}</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1F3A]">{pred.product}</div>
                <div className={`text-[10px] font-bold mt-0.5
                  ${pred.urgency === 'high' ? 'text-[#ef4444]' :
                    pred.urgency === 'medium' ? 'text-[#F97316]' : 'text-[#22c55e]'}`}>
                  {pred.urgency === 'high' ? 'Segera restock' :
                   pred.urgency === 'medium' ? 'Restock minggu ini' : 'Stok aman'}
                </div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#1A1F3A]">{pred.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const predictionFooter = (
    <div className="bg-gradient-to-r from-[#1340b8] to-[#1A56DB] rounded-xl p-4 animate-fade-up animate-delay-5 relative overflow-hidden">
      <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-bold text-white/80 uppercase tracking-wide">AI Prediction</span>
        </div>
        <div className={`font-extrabold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Prediksi Omzet: Rp 2.800.000
        </div>
        <div className="text-xs text-white/70 font-medium mt-1.5">
          +12% dari minggu lalu berdasarkan pola penjualan
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
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
