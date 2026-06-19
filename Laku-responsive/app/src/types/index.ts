export interface Product {
  id: string;
  name: string;
  price: number; // harga jual (sell price)
  costPrice?: number; // harga beli (cost price) — for profit calculation
  stock: number;
  emoji: string;
  image?: string; // URL atau base64 image
  category?: string; // kategori produk
  createdAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  qty: number;
  totalPrice: number;
  note?: string;
  paymentMethod?: 'cash' | 'transfer' | 'qris';
  discount?: number; // nominal diskon
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
}

export type TabType = 'dashboard' | 'products' | 'pos' | 'records' | 'insights' | 'settings';

export interface ToastState {
  visible: boolean;
  message: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ModalState {
  open: boolean;
  title: string;
  content: React.ReactNode;
}

export interface DashboardStats {
  todayProfit: number;
  cashOnHand: number;
  todayRevenue: number;
  todayExpense: number;
  targetProfit: number;
}

export interface ReceiptSnapshot {
  id: string;
  storeName: string;
  createdAt: string;
  items: { productId: string; productName: string; price: number; qty: number }[];
  total: number;
  discount?: number;
  paymentMethod?: 'cash' | 'transfer' | 'qris';
  cashPaid?: number;
  change?: number;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string; // no. HP toko — tampil di struk
  receiptNote: string; // catatan/ucapan di kaki struk
  initialCash: number; // saldo awal kas
  lowStockThreshold: number; // batas stok dianggap "rendah"
  notifLowStock: boolean; // tampilkan notifikasi stok rendah/habis
  notifTarget: boolean; // tampilkan notifikasi target tercapai
  currency: string;
  darkMode: boolean;
}
