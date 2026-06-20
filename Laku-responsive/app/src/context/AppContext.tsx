import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Product, Transaction, CartItem, TabType, ToastState, Notification, ReceiptSnapshot, StoreSettings } from '@/types';
import { clearToken, apiCompleteOnboarding } from '@/services/auth/authService';
import { readStorage, writeStorage, removeStorage } from '@/services/storage/storage';
import { calcGrossProfit } from '@/utils/currency';
import { generateId } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/constants/storageKeys';

// Helper: generate ISO date string relative to today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + n, 0, 0, 0);
  return d.toISOString();
}

const defaultCategories = ['Makanan', 'Minuman', 'Sembako', 'Bumbu', 'Lainnya'];

const initialProducts: Product[] = [
  { id: '1', name: 'Nasi Goreng', price: 15000, costPrice: 8000, stock: 50, emoji: '📦', category: 'Makanan', createdAt: daysAgo(7) },
  { id: '2', name: 'Es Teh', price: 5000, costPrice: 2000, stock: 30, emoji: '📦', category: 'Minuman', createdAt: daysAgo(7) },
  { id: '3', name: 'Beras 1kg', price: 12000, costPrice: 10000, stock: 100, emoji: '📦', category: 'Sembako', createdAt: daysAgo(7) },
  { id: '4', name: 'Cabai Merah', price: 8000, costPrice: 5000, stock: 20, emoji: '📦', category: 'Bumbu', createdAt: daysAgo(7) },
  { id: '5', name: 'Telur 1kg', price: 25000, costPrice: 20000, stock: 40, emoji: '📦', category: 'Sembako', createdAt: daysAgo(7) },
  { id: '6', name: 'Minyak Goreng', price: 15000, costPrice: 12000, stock: 25, emoji: '📦', category: 'Sembako', createdAt: daysAgo(7) },
  { id: '7', name: 'Mie Goreng', price: 10000, costPrice: 5500, stock: 0, emoji: '📦', category: 'Makanan', createdAt: daysAgo(7) },
  { id: '8', name: 'Kopi', price: 6000, costPrice: 3000, stock: 60, emoji: '📦', category: 'Minuman', createdAt: daysAgo(7) },
];

const initialTransactions: Transaction[] = [
  { id: '1', productId: '1', productName: 'Nasi Goreng', type: 'OUT', qty: 3, totalPrice: 45000, note: 'Penjualan: 3x Nasi Goreng', paymentMethod: 'cash', createdAt: daysAgo(0) },
  { id: '2', productId: '2', productName: 'Es Teh', type: 'OUT', qty: 2, totalPrice: 10000, note: 'Penjualan: 2x Es Teh', paymentMethod: 'cash', createdAt: daysAgo(0) },
  { id: '3', productId: '3', productName: 'Beras 1kg', type: 'IN', qty: 10, totalPrice: 120000, note: 'Pembelian: 10kg Beras', createdAt: daysAgo(0) },
  { id: '4', productId: '1', productName: 'Nasi Goreng', type: 'OUT', qty: 2, totalPrice: 30000, note: 'Penjualan: 2x Nasi Goreng', paymentMethod: 'qris', createdAt: daysAgo(0) },
  { id: '5', productId: '4', productName: 'Cabai Merah', type: 'OUT', qty: 5, totalPrice: 40000, note: 'Penjualan: 5x Cabai Merah', paymentMethod: 'cash', createdAt: daysAgo(1) },
  { id: '6', productId: '5', productName: 'Telur 1kg', type: 'IN', qty: 5, totalPrice: 125000, note: 'Pembelian: 5kg Telur', createdAt: daysAgo(1) },
  { id: '7', productId: '6', productName: 'Minyak Goreng', type: 'IN', qty: 4, totalPrice: 60000, note: 'Pembelian: 4L Minyak Goreng', createdAt: daysAgo(2) },
  { id: '8', productId: '3', productName: 'Beras 1kg', type: 'OUT', qty: 8, totalPrice: 96000, note: 'Penjualan: 8kg Beras', paymentMethod: 'transfer', createdAt: daysAgo(2) },
  { id: '9', productId: '8', productName: 'Kopi', type: 'OUT', qty: 10, totalPrice: 60000, note: 'Penjualan: 10x Kopi', paymentMethod: 'cash', createdAt: daysAgo(3) },
  { id: '10', productId: '2', productName: 'Es Teh', type: 'OUT', qty: 5, totalPrice: 25000, note: 'Penjualan: 5x Es Teh', paymentMethod: 'cash', createdAt: daysAgo(4) },
  { id: '11', productId: '1', productName: 'Nasi Goreng', type: 'OUT', qty: 4, totalPrice: 60000, note: 'Penjualan: 4x Nasi Goreng', paymentMethod: 'qris', createdAt: daysAgo(5) },
  { id: '12', productId: '8', productName: 'Kopi', type: 'OUT', qty: 6, totalPrice: 36000, note: 'Penjualan: 6x Kopi', paymentMethod: 'cash', createdAt: daysAgo(6) },
];

const defaultStoreSettings: StoreSettings = {
  storeName: '',
  storeAddress: '',
  storePhone: '',
  receiptNote: 'Terima kasih telah berbelanja',
  initialCash: 1000000,
  lowStockThreshold: 5,
  notifLowStock: true,
  notifTarget: true,
  currency: 'IDR',
  darkMode: false,
};

interface AppState {
  products: Product[];
  transactions: Transaction[];
  cart: CartItem[];
  activeTab: TabType;
  toast: ToastState;
  user?: { id: string; name: string; email: string; image?: string } | null;
  dailyTarget: number;
  notifications: Notification[];
  hasSeenOnboarding: boolean;
  receipts: ReceiptSnapshot[];
  storeSettings: StoreSettings;
  categories: string[];
}

type AppAction =
  | { type: 'SET_TAB'; payload: TabType }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADJUST_STOCK'; payload: { productId: string; qty: number; type: 'IN' | 'OUT'; note?: string } }
  | { type: 'ADD_TO_CART'; payload: { productId: string; productName: string; price: number } }
  | { type: 'UPDATE_CART_QTY'; payload: { productId: string; delta: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SHOW_TOAST'; payload: string }
  | { type: 'HIDE_TOAST' }
  | { type: 'SET_USER'; payload: { id: string; name: string; email: string; image?: string } }
  | { type: 'UPDATE_USER'; payload: { name?: string; email?: string; image?: string } }
  | { type: 'SET_DAILY_TARGET'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_ONBOARDING_COMPLETE' }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_RECEIPT'; payload: ReceiptSnapshot }
  | { type: 'UPDATE_STORE_SETTINGS'; payload: Partial<StoreSettings> }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'RESET_DATA'; payload: 'demo' | 'empty' }
  | { type: 'IMPORT_DATA'; payload: { products?: Product[]; transactions?: Transaction[]; receipts?: ReceiptSnapshot[]; categories?: string[] } };

const initialState: AppState = {
  products: initialProducts,
  transactions: initialTransactions,
  cart: [],
  activeTab: 'dashboard',
  toast: { visible: false, message: '' },
  user: null,
  dailyTarget: 300000,
  notifications: [],
  hasSeenOnboarding: false,
  receipts: [],
  storeSettings: defaultStoreSettings,
  categories: defaultCategories,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'ADJUST_STOCK': {
      const { productId, qty, type, note } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (!product) return state;
      const newStock = type === 'IN' ? product.stock + qty : Math.max(0, product.stock - qty);
      const transaction: Transaction = {
        id: generateId(), productId, productName: product.name, type, qty,
        totalPrice: type === 'IN' ? product.price * qty * -1 : product.price * qty,
        note: note || `${type === 'IN' ? 'Penambahan' : 'Pengurangan'} stok: ${qty} ${product.name}`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p),
        transactions: [transaction, ...state.transactions],
      };
    }
    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.productId === action.payload.productId);
      if (existing) {
        return { ...state, cart: state.cart.map(item => item.productId === action.payload.productId ? { ...item, qty: item.qty + 1 } : item) };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, qty: 1 }] };
    }
    case 'UPDATE_CART_QTY': {
      const { productId, delta } = action.payload;
      const item = state.cart.find(c => c.productId === productId);
      if (!item) return state;
      const newQty = item.qty + delta;
      if (newQty <= 0) return { ...state, cart: state.cart.filter(c => c.productId !== productId) };
      return { ...state, cart: state.cart.map(c => c.productId === productId ? { ...c, qty: newQty } : c) };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SHOW_TOAST':
      return { ...state, toast: { visible: true, message: action.payload } };
    case 'HIDE_TOAST':
      return { ...state, toast: { visible: false, message: '' } };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_DAILY_TARGET':
      return { ...state, dailyTarget: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, hasSeenOnboarding: true };
    case 'RESET_ONBOARDING':
      return { ...state, hasSeenOnboarding: false };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_RECEIPT':
      return { ...state, receipts: [action.payload, ...state.receipts] };
    case 'UPDATE_STORE_SETTINGS':
      return { ...state, storeSettings: { ...state.storeSettings, ...action.payload } };
    case 'ADD_CATEGORY': {
      if (state.categories.includes(action.payload)) return state;
      return { ...state, categories: [...state.categories, action.payload] };
    }
    case 'REMOVE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c !== action.payload) };
    case 'RESET_DATA':
      return {
        ...state,
        products: action.payload === 'demo' ? initialProducts : [],
        transactions: action.payload === 'demo' ? initialTransactions : [],
        receipts: [],
        cart: [],
      };
    case 'IMPORT_DATA': {
      const p = action.payload;
      return {
        ...state,
        products: Array.isArray(p.products) ? p.products : state.products,
        transactions: Array.isArray(p.transactions) ? p.transactions : state.transactions,
        receipts: Array.isArray(p.receipts) ? p.receipts : state.receipts,
        categories: Array.isArray(p.categories) ? p.categories : state.categories,
        cart: [],
      };
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  showToast: (message: string) => void;
  login: (user: { id: string; name: string; email: string; image?: string }) => void;
  logout: () => void;
  updateUser: (updates: { name?: string; email?: string; image?: string }) => void;
  setDailyTarget: (target: number) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  addReceipt: (receipt: ReceiptSnapshot) => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init): AppState => ({
    ...init,
    // Data inti dipulihkan dari localStorage; data contoh hanya tampil saat
    // pertama kali aplikasi dibuka (belum ada apa pun tersimpan).
    user: readStorage<AppState['user']>(STORAGE_KEYS.user, null),
    dailyTarget: readStorage(STORAGE_KEYS.dailyTarget, init.dailyTarget),
    hasSeenOnboarding: readStorage(STORAGE_KEYS.onboarding, false),
    storeSettings: { ...defaultStoreSettings, ...readStorage(STORAGE_KEYS.storeSettings, {}) },
    categories: readStorage(STORAGE_KEYS.categories, defaultCategories),
    products: readStorage(STORAGE_KEYS.products, initialProducts),
    transactions: readStorage(STORAGE_KEYS.transactions, initialTransactions),
    receipts: readStorage(STORAGE_KEYS.receipts, []),
    cart: readStorage(STORAGE_KEYS.cart, []),
  }));

  // Simpan otomatis setiap slice data yang berubah. Dipisah per-key agar hanya
  // data yang benar-benar berubah yang ditulis ulang ke localStorage.
  useEffect(() => { writeStorage(STORAGE_KEYS.products, state.products); }, [state.products]);
  useEffect(() => { writeStorage(STORAGE_KEYS.transactions, state.transactions); }, [state.transactions]);
  useEffect(() => { writeStorage(STORAGE_KEYS.receipts, state.receipts); }, [state.receipts]);
  useEffect(() => { writeStorage(STORAGE_KEYS.cart, state.cart); }, [state.cart]);
  useEffect(() => { writeStorage(STORAGE_KEYS.categories, state.categories); }, [state.categories]);

  // Auto-generate notifications for low stock items
  useEffect(() => {
    const threshold = state.storeSettings.lowStockThreshold;
    const lowStockItems = state.products.filter(p => p.stock > 0 && p.stock <= threshold);
    const outOfStockItems = state.products.filter(p => p.stock === 0);

    // Only generate if user is logged in and we haven't notified recently
    if (!state.user) return;

    if (state.storeSettings.notifLowStock) {
      outOfStockItems.forEach(p => {
        const exists = state.notifications.some(n => n.title === `Stok Habis: ${p.name}` && !n.read);
        if (!exists) {
          const notification: Notification = {
            id: generateId(),
            title: `Stok Habis: ${p.name}`,
            message: `${p.name} sudah habis! Segera restok.`,
            type: 'error',
            read: false,
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        }
      });

      lowStockItems.forEach(p => {
        const exists = state.notifications.some(n => n.title === `Stok Rendah: ${p.name}` && !n.read);
        if (!exists) {
          const notification: Notification = {
            id: generateId(),
            title: `Stok Rendah: ${p.name}`,
            message: `${p.name} tinggal ${p.stock} unit. Pertimbangkan untuk restok.`,
            type: 'warning',
            read: false,
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        }
      });
    }

    // Cek apakah target laba harian sudah tercapai (laba kotor hari ini).
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = state.transactions.filter(t => t.createdAt.startsWith(today));
    const todayProfit = calcGrossProfit(todayTransactions, state.products);

    if (state.storeSettings.notifTarget && todayProfit >= state.dailyTarget && state.dailyTarget > 0) {
      const exists = state.notifications.some(n => n.title === 'Target Tercapai! 🎉' && n.createdAt.startsWith(today));
      if (!exists) {
        const notification: Notification = {
          id: generateId(),
          title: 'Target Tercapai! 🎉',
          message: `Selamat! Target harian Rp ${state.dailyTarget.toLocaleString('id-ID')} telah tercapai.`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.products, state.transactions, state.user, state.dailyTarget, state.storeSettings.lowStockThreshold, state.storeSettings.notifLowStock, state.storeSettings.notifTarget]);

  // Apply dark mode
  useEffect(() => {
    if (state.storeSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.storeSettings.darkMode]);

  const showToast = useCallback((message: string) => {
    dispatch({ type: 'SHOW_TOAST', payload: message });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
  }, []);

  const login = useCallback((user: { id: string; name: string; email: string; image?: string }) => {
    writeStorage(STORAGE_KEYS.user, user);
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const logout = useCallback(() => {
    removeStorage(STORAGE_KEYS.user);
    clearToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates: { name?: string; email?: string; image?: string }) => {
    if (!state.user) return;
    writeStorage(STORAGE_KEYS.user, { ...state.user, ...updates });
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [state.user]);

  const setDailyTarget = useCallback((target: number) => {
    writeStorage(STORAGE_KEYS.dailyTarget, target);
    dispatch({ type: 'SET_DAILY_TARGET', payload: target });
  }, []);

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const notification: Notification = {
      id: generateId(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const completeOnboarding = useCallback(() => {
    writeStorage(STORAGE_KEYS.onboarding, true);
    // Catat agar saat user ini login lagi nanti tidak diminta onboarding ulang.
    if (state.user?.email) void apiCompleteOnboarding(state.user.email);
    dispatch({ type: 'SET_ONBOARDING_COMPLETE' });
  }, [state.user]);

  // Tampilkan ulang langkah-langkah pengenalan (dipakai saat masuk mode demo).
  const restartOnboarding = useCallback(() => {
    removeStorage(STORAGE_KEYS.onboarding);
    dispatch({ type: 'RESET_ONBOARDING' });
  }, []);

  const addReceipt = useCallback((receipt: ReceiptSnapshot) => {
    dispatch({ type: 'ADD_RECEIPT', payload: receipt });
  }, []);

  const updateStoreSettings = useCallback((settings: Partial<StoreSettings>) => {
    writeStorage(STORAGE_KEYS.storeSettings, { ...state.storeSettings, ...settings });
    dispatch({ type: 'UPDATE_STORE_SETTINGS', payload: settings });
  }, [state.storeSettings]);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast, login, logout, updateUser, setDailyTarget, addNotification, completeOnboarding, restartOnboarding, addReceipt, updateStoreSettings }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
