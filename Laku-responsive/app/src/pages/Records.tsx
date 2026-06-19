import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Truck, Receipt, Calendar, Download, FileText, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { calcRevenue, calcExpense, calcGrossProfit } from '@/lib/finance';

type TimeFilter = 'today' | 'yesterday' | '7days' | '30days';
type TypeFilter = 'all' | 'OUT' | 'IN';

function csvCell(value: string | number | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Records() {
  const { state } = useApp();
  const isMobile = useIsMobile();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nowMs = now.getTime();
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const matchesTime = (createdAt: string) => {
      switch (timeFilter) {
        case 'today': return createdAt.startsWith(today);
        case 'yesterday': return createdAt.startsWith(yesterdayStr);
        case '7days': return new Date(createdAt).getTime() >= nowMs - 7 * 24 * 60 * 60 * 1000;
        case '30days': return new Date(createdAt).getTime() >= nowMs - 30 * 24 * 60 * 60 * 1000;
        default: return true;
      }
    };

    const query = searchQuery.trim().toLowerCase();
    return state.transactions.filter(t =>
      matchesTime(t.createdAt) &&
      (typeFilter === 'all' || t.type === typeFilter) &&
      (query === '' ||
        t.productName.toLowerCase().includes(query) ||
        (t.note?.toLowerCase().includes(query) ?? false))
    );
  }, [state.transactions, timeFilter, typeFilter, searchQuery]);

  const stats = useMemo(() => ({
    revenue: calcRevenue(filteredTransactions),
    expense: calcExpense(filteredTransactions),
    profit: calcGrossProfit(filteredTransactions, state.products),
    transactionCount: filteredTransactions.length,
  }), [filteredTransactions, state.products]);

  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'yesterday', label: 'Kemarin' },
    { key: '7days', label: '7 Hari' },
    { key: '30days', label: '30 Hari' },
  ];

  const typeFilters: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'OUT', label: 'Jual' },
    { key: 'IN', label: 'Beli' },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const activeFilterLabel = filters.find(f => f.key === timeFilter)?.label || 'Laporan';
  const reportDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const reportFilename = `laku-transaksi-${timeFilter}-${new Date().toISOString().split('T')[0]}`;

  const handleExportCSV = () => {
    const header = ['Tanggal', 'Waktu', 'Produk', 'Tipe', 'Qty', 'Total', 'Catatan'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.createdAt),
      formatTime(t.createdAt),
      t.productName,
      t.type === 'OUT' ? 'JUAL' : 'BELI',
      t.qty,
      Math.abs(t.totalPrice),
      t.note || '',
    ]);
    const summaryRows = [
      ['Laporan Transaksi LAKU'],
      [`Periode: ${activeFilterLabel}`],
      [`Tanggal Export: ${reportDate}`],
      [`Omzet: Rp ${stats.revenue.toLocaleString('id-ID')}`],
      [`Biaya: Rp ${stats.expense.toLocaleString('id-ID')}`],
      [`Laba: Rp ${stats.profit.toLocaleString('id-ID')}`],
      [`Jumlah Transaksi: ${stats.transactionCount}`],
      [],
    ];
    const csv = [
      ...summaryRows.map(row => row.map(csvCell).join(',')),
      header.map(csvCell).join(','),
      ...rows.map(row => row.map(csvCell).join(',')),
    ].join('\n');
    downloadFile(`${reportFilename}.csv`, `\ufeff${csv}`, 'text/csv;charset=utf-8');
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    let y = 40;

    const drawHeader = () => {
      doc.setFillColor(11, 58, 141);
      doc.rect(0, 0, pageWidth, 74, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Laporan Transaksi LAKU', margin, 32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Periode: ${activeFilterLabel} | Export: ${reportDate}`, margin, 52);
      doc.setTextColor(26, 31, 58);
      y = 100;
    };

    const drawTableHeader = () => {
      doc.setFillColor(232, 241, 255);
      doc.rect(margin, y - 14, pageWidth - margin * 2, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(26, 31, 58);
      const headers = ['Tanggal', 'Waktu', 'Produk', 'Tipe', 'Qty', 'Total', 'Catatan'];
      const x = [margin + 8, 118, 170, 312, 356, 398, 490];
      headers.forEach((h, idx) => doc.text(h, x[idx], y));
      y += 22;
    };

    const truncate = (text: string, max: number) => text.length > max ? `${text.slice(0, max - 3)}...` : text;

    drawHeader();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Omzet Rp ${stats.revenue.toLocaleString('id-ID')}`, margin, y);
    doc.text(`Biaya Rp ${stats.expense.toLocaleString('id-ID')}`, margin + 190, y);
    doc.text(`Laba Rp ${stats.profit.toLocaleString('id-ID')}`, margin + 380, y);
    doc.text(`${stats.transactionCount} transaksi`, margin + 570, y);
    y += 34;

    drawTableHeader();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    filteredTransactions.forEach((t, index) => {
      if (y > pageHeight - 36) {
        doc.addPage();
        drawHeader();
        drawTableHeader();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 252);
        doc.rect(margin, y - 13, pageWidth - margin * 2, 20, 'F');
      }

      doc.setTextColor(26, 31, 58);
      doc.text(formatDate(t.createdAt), margin + 8, y);
      doc.text(formatTime(t.createdAt), 118, y);
      doc.text(truncate(t.productName, 25), 170, y);
      doc.text(t.type === 'OUT' ? 'JUAL' : 'BELI', 312, y);
      doc.text(String(t.qty), 356, y);
      doc.text(`Rp ${Math.abs(t.totalPrice).toLocaleString('id-ID')}`, 398, y);
      doc.text(truncate(t.note || '-', 48), 490, y);
      y += 20;
    });

    if (filteredTransactions.length === 0) {
      doc.text('Tidak ada transaksi pada periode ini.', margin + 8, y);
    }

    doc.save(`${reportFilename}.pdf`);
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
    <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
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
        <div className={`grid gap-2.5 auto-rows-fr ${isMobile ? 'grid-cols-3' : 'grid-cols-3 flex-1'}`}>
          <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-1">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Omzet</div>
            <div className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>
              {isMobile ? `Rp ${(stats.revenue / 1000).toFixed(0)}k` : `Rp ${stats.revenue.toLocaleString('id-ID')}`}
            </div>
            <ShoppingBag size={14} className="text-[#1A56DB] mt-1" />
          </div>
          <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-2">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Biaya</div>
            <div className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>
              {isMobile ? `Rp ${(stats.expense / 1000).toFixed(0)}k` : `Rp ${stats.expense.toLocaleString('id-ID')}`}
            </div>
            <Truck size={14} className="text-[#F97316] mt-1" />
          </div>
          <div className="bg-white rounded-xl p-3 h-full card-shadow animate-fade-up animate-delay-3">
            <div className="text-[10px] font-bold text-[#9BA3BC] mb-1">Laba</div>
            <div className={`font-extrabold ${isMobile ? 'text-sm' : 'text-base'} ${stats.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {isMobile ? `Rp ${(stats.profit / 1000).toFixed(0)}k` : `Rp ${stats.profit.toLocaleString('id-ID')}`}
            </div>
            <Receipt size={14} className="text-[#1A56DB] mt-1" />
          </div>
        </div>
      </div>

      {/* Search + Type filter */}
      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center'}`}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA3BC]" />
          <input
            type="text"
            placeholder="Cari nama produk atau catatan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 bg-white rounded-xl text-sm font-medium text-[#1A1F3A]
                       placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30 card-shadow transition-shadow"
          />
        </div>
        <div className={`flex gap-1.5 bg-white rounded-xl p-1.5 card-shadow ${isMobile ? 'w-full' : 'shrink-0'}`}>
          {typeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`${isMobile ? 'flex-1' : 'px-4'} h-9 rounded-lg text-xs font-bold transition-all
                ${typeFilter === f.key ? 'bg-[#1A56DB] text-white' : 'text-[#9BA3BC] hover:bg-[#F8F9FC]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Count + Export */}
      <div className="bg-white rounded-xl card-shadow p-4 animate-fade-up animate-delay-3">
        <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center shrink-0">
              <Receipt size={18} className="text-[#1A56DB]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={`font-extrabold text-[#1A1F3A] ${isMobile ? 'text-sm' : 'text-base'}`}>Riwayat Transaksi</h3>
              <span className="text-[11px] font-semibold text-[#9BA3BC]">{stats.transactionCount} transaksi ditemukan</span>
            </div>
          </div>

          {/* Export Buttons — redesigned for clarity */}
          <div className={`flex gap-2.5 ${isMobile ? 'w-full' : 'shrink-0'}`}>
            <button
              onClick={handleExportCSV}
              className={`${isMobile ? 'flex-1' : ''} h-11 px-4 rounded-xl bg-[#f0fdf4] border-2 border-[#bbf7d0] text-[#16a34a]
                         text-xs font-bold flex items-center justify-center gap-2
                         hover:bg-[#dcfce7] active:scale-[0.97] transition-all`}
              style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.12)' }}
            >
              <Download size={16} strokeWidth={2.5} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className={`${isMobile ? 'flex-1' : ''} h-11 px-4 rounded-xl text-white
                         text-xs font-bold flex items-center justify-center gap-2
                         hover:opacity-90 active:scale-[0.97] transition-all`}
              style={{
                background: 'linear-gradient(135deg, #1A56DB, #0B3A8D)',
                boxShadow: '0 4px 16px rgba(26,86,219,0.3)',
              }}
            >
              <FileText size={16} strokeWidth={2.5} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
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
                    ${t.type === 'OUT' ? 'bg-gradient-to-br from-[#e8effe] to-[#d4e4fb]' : 'bg-gradient-to-br from-[#fde8dc] to-[#fcd4b8]'}`}>
                    {t.type === 'OUT'
                      ? <ShoppingBag size={18} className="text-[#1A56DB]" strokeWidth={2.5} />
                      : <Truck size={18} className="text-[#F97316]" strokeWidth={2.5} />
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
            <p className="text-sm font-bold text-[#9BA3BC]">
              {searchQuery.trim() || typeFilter !== 'all' ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
            </p>
            <p className="text-xs text-[#DDE1EF] mt-1">
              {searchQuery.trim() || typeFilter !== 'all' ? 'Coba ubah kata kunci atau filter' : 'Transaksi akan muncul di sini'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
