// Satu sumber kebenaran untuk semua perhitungan uang di aplikasi.
//
// Tujuannya menghilangkan "angka ajaib" (mis. laba = omzet × 0,2) yang
// sebelumnya tersebar di Dashboard, Records, dan Insights. Semua halaman
// kini memakai fungsi yang sama sehingga angka selalu konsisten.
//
// Model perhitungan:
//   • Omzet (revenue)   = total transaksi penjualan (OUT).
//   • Pengeluaran       = total transaksi pembelian/restock (IN).
//   • Laba kotor (profit) = harga jual − harga modal (costPrice) untuk barang
//     yang terjual. Pembelian stok TIDAK dipotong dari laba karena itu
//     pembelian aset (stok), bukan biaya operasional hari itu.
//   • Kas di tangan     = saldo awal + total pemasukan − total pengeluaran.
//
// Bila sebuah produk tidak punya harga modal (costPrice), modalnya dianggap 0
// sehingga laba untuk barang tersebut sama dengan harga jualnya. Isi harga
// modal di form produk untuk mendapat angka laba yang akurat.

import type { Product, Transaction } from '@/types';

/** Total penjualan (omzet) dari semua transaksi keluar (OUT). */
export function calcRevenue(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'OUT')
    .reduce((sum, t) => sum + t.totalPrice, 0);
}

/** Total pengeluaran dari semua transaksi masuk (IN: pembelian/restock). */
export function calcExpense(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'IN')
    .reduce((sum, t) => sum + Math.abs(t.totalPrice), 0);
}

/** Laba dari satu transaksi: untuk penjualan = harga jual − modal; selain itu 0. */
export function transactionProfit(transaction: Transaction, products: Product[]): number {
  if (transaction.type !== 'OUT') return 0;
  const product = products.find(p => p.id === transaction.productId);
  const unitCost = product?.costPrice ?? 0;
  return transaction.totalPrice - unitCost * transaction.qty;
}

/** Laba kotor total: jumlah laba dari seluruh transaksi penjualan. */
export function calcGrossProfit(transactions: Transaction[], products: Product[]): number {
  const costByProductId = new Map(products.map(p => [p.id, p.costPrice ?? 0]));
  return transactions
    .filter(t => t.type === 'OUT')
    .reduce((sum, t) => {
      const unitCost = costByProductId.get(t.productId) ?? 0;
      return sum + (t.totalPrice - unitCost * t.qty);
    }, 0);
}

/** Kas di tangan saat ini: saldo awal + total pemasukan − total pengeluaran. */
export function calcCashOnHand(initialCash: number, transactions: Transaction[]): number {
  return initialCash + calcRevenue(transactions) - calcExpense(transactions);
}

/** Format angka menjadi mata uang Rupiah, mis. 15000 → "Rp 15.000". */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}
