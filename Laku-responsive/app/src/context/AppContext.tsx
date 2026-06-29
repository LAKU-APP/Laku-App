import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { Product, Transaction, CartItem, TabType, ToastState, Notification, ReceiptSnapshot, StoreSettings } from '@/types';
import { clearToken, apiCompleteOnboarding } from '@/services/auth/authService';
import { readStorage, writeStorage, removeStorage } from '@/services/storage/storage';
import { ApiError } from '@/services/api/interceptor';
import * as productsApi from '@/services/api/products';
import * as categoriesApi from '@/services/api/categories';
import * as transactionsApi from '@/services/api/transactions';
import * as receiptsApi from '@/services/api/receipts';
import * as settingsApi from '@/services/api/settings';
import { calcGrossProfit } from '@/utils/currency';
import { generateId } from '@/utils/helpers';
import { notifySound } from '@/utils/feedback';
import { STORAGE_KEYS } from '@/constants/storageKeys';

// Kategori default fallback sebelum data dari backend dimuat. Saat user
// mendaftar, backend membuat kategori default yang sama (lihat AuthController).
const defaultCategories = ['Makanan', 'Minuman', 'Sembako', 'Bumbu', 'Lainnya'];

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
  user?: { id: string; name: string; email: string; phone?: string; image?: string } | null;
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
  | { type: 'SET_USER'; payload: { id: string; name: string; email: string; phone?: string; image?: string } }
  | { type: 'UPDATE_USER'; payload: { name?: string; email?: string; phone?: string; image?: string } }
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
  products: [],
  transactions: [],
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
      // Bersihkan semua data milik user agar tidak bocor ke sesi berikutnya bila
      // perangkat dipakai bergantian. Data asli tetap aman tersimpan di backend.
      return {
        ...state,
        user: null,
        products: [],
        transactions: [],
        receipts: [],
        cart: [],
        notifications: [],
        categories: defaultCategories,
        storeSettings: defaultStoreSettings,
        dailyTarget: 300000,
        hasSeenOnboarding: false,
      };
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
      // Tidak ada lagi data contoh; reset selalu mengosongkan tampilan lokal.
      // (Catatan: ini hanya membersihkan state lokal, bukan menghapus di backend.)
      return {
        ...state,
        products: [],
        transactions: [],
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
  login: (user: { id: string; name: string; email: string; phone?: string; image?: string }) => void;
  logout: () => void;
  updateUser: (updates: { name?: string; email?: string; phone?: string; image?: string }) => void;
  setDailyTarget: (target: number) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  addProduct: (input: productsApi.ProductInput) => Promise<boolean>;
  editProduct: (id: string, input: Partial<productsApi.ProductInput>) => Promise<boolean>;
  removeProduct: (id: string) => Promise<boolean>;
  adjustProductStock: (id: string, qty: number, type: 'IN' | 'OUT', note?: string) => Promise<boolean>;
  addCategory: (name: string) => Promise<boolean>;
  removeCategory: (name: string) => Promise<boolean>;
  checkout: (payload: transactionsApi.CheckoutPayload) => Promise<ReceiptSnapshot | null>;
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
    categories: readStorage<string[]>(STORAGE_KEYS.categories, defaultCategories),
    products: readStorage<Product[]>(STORAGE_KEYS.products, []),
    transactions: readStorage<Transaction[]>(STORAGE_KEYS.transactions, []),
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

  // Bunyikan suara saat ADA notifikasi baru masuk (stok rendah / target tercapai).
  // Catatan: browser baru mengeluarkan suara setelah ada interaksi pengguna
  // (kebijakan autoplay), jadi notifikasi paling awal saat boot bisa senyap.
  const notifCountRef = useRef(state.notifications.length);
  useEffect(() => {
    if (state.notifications.length > notifCountRef.current) notifySound();
    notifCountRef.current = state.notifications.length;
  }, [state.notifications.length]);

  const showToast = useCallback((message: string) => {
    dispatch({ type: 'SHOW_TOAST', payload: message });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
  }, []);

  const login = useCallback((user: { id: string; name: string; email: string; phone?: string; image?: string }) => {
    writeStorage(STORAGE_KEYS.user, user);
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    // Hapus seluruh cache data lokal agar tidak terbaca user berikutnya di
    // perangkat yang sama (data sebenarnya tetap tersimpan di backend).
    [
      STORAGE_KEYS.user, STORAGE_KEYS.products, STORAGE_KEYS.transactions,
      STORAGE_KEYS.receipts, STORAGE_KEYS.cart, STORAGE_KEYS.categories,
      STORAGE_KEYS.storeSettings, STORAGE_KEYS.dailyTarget, STORAGE_KEYS.onboarding,
    ].forEach(removeStorage);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Tangani error API secara konsisten: token habis/invalid → logout otomatis,
  // selain itu tampilkan pesan dari backend (atau fallback) lewat toast.
  const handleApiError = useCallback((e: unknown, fallback: string) => {
    if (e instanceof ApiError && e.status === 401) {
      logout();
      showToast('Sesi berakhir, silakan login kembali');
      return;
    }
    showToast(e instanceof Error ? e.message : fallback);
  }, [logout, showToast]);

  const updateUser = useCallback((updates: { name?: string; email?: string; phone?: string; image?: string }) => {
    if (!state.user) return;
    writeStorage(STORAGE_KEYS.user, { ...state.user, ...updates });
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [state.user]);

  // Disimpan lokal langsung (UX instan), lalu disinkron ke backend di belakang.
  const setDailyTarget = useCallback((target: number) => {
    writeStorage(STORAGE_KEYS.dailyTarget, target);
    dispatch({ type: 'SET_DAILY_TARGET', payload: target });
    void settingsApi.updateTarget(target).catch(e => handleApiError(e, 'Gagal menyimpan target'));
  }, [handleApiError]);

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
    void apiCompleteOnboarding();
    dispatch({ type: 'SET_ONBOARDING_COMPLETE' });
  }, []);

  // Tampilkan ulang langkah-langkah pengenalan (dipakai saat masuk mode demo).
  const restartOnboarding = useCallback(() => {
    removeStorage(STORAGE_KEYS.onboarding);
    dispatch({ type: 'RESET_ONBOARDING' });
  }, []);

  // Disimpan lokal langsung (dipakai juga oleh toggle notifikasi yang perlu
  // terasa instan), lalu disinkron ke backend di belakang.
  const updateStoreSettings = useCallback((settings: Partial<StoreSettings>) => {
    writeStorage(STORAGE_KEYS.storeSettings, { ...state.storeSettings, ...settings });
    dispatch({ type: 'UPDATE_STORE_SETTINGS', payload: settings });
    void settingsApi.updateSettings(settings).catch(e => handleApiError(e, 'Gagal menyimpan pengaturan'));
  }, [state.storeSettings, handleApiError]);

  // Produk/kategori/transaksi: tunggu konfirmasi backend dulu baru perbarui
  // state lokal — datanya menyangkut stok & uang, jangan optimistic.
  const addProduct = useCallback(async (input: productsApi.ProductInput) => {
    try {
      const product = await productsApi.createProduct(input);
      dispatch({ type: 'ADD_PRODUCT', payload: product });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal menambah produk');
      return false;
    }
  }, [handleApiError]);

  const editProduct = useCallback(async (id: string, input: Partial<productsApi.ProductInput>) => {
    try {
      const product = await productsApi.updateProduct(id, input);
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal memperbarui produk');
      return false;
    }
  }, [handleApiError]);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await productsApi.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal menghapus produk');
      return false;
    }
  }, [handleApiError]);

  const adjustProductStock = useCallback(async (id: string, qty: number, type: 'IN' | 'OUT', note?: string) => {
    try {
      const { product, transaction } = await productsApi.adjustStock(id, qty, type, note);
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal mengubah stok');
      return false;
    }
  }, [handleApiError]);

  const addCategory = useCallback(async (name: string) => {
    try {
      await categoriesApi.createCategory(name);
      dispatch({ type: 'ADD_CATEGORY', payload: name });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal menambah kategori');
      return false;
    }
  }, [handleApiError]);

  const removeCategory = useCallback(async (name: string) => {
    try {
      await categoriesApi.deleteCategory(name);
      dispatch({ type: 'REMOVE_CATEGORY', payload: name });
      return true;
    } catch (e) {
      handleApiError(e, 'Gagal menghapus kategori');
      return false;
    }
  }, [handleApiError]);

  // Checkout POS: backend membuat transaksi + struk + mengurangi stok sekaligus
  // (atomik, terkunci per-baris). Stok lokal dikurangi sesuai qty yang dibeli
  // supaya UI langsung konsisten tanpa fetch ulang.
  const checkout = useCallback(async (payload: transactionsApi.CheckoutPayload) => {
    try {
      const { transactions, receipt } = await transactionsApi.checkout(payload);
      transactions.forEach(t => dispatch({ type: 'ADD_TRANSACTION', payload: t }));
      payload.items.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) dispatch({ type: 'UPDATE_PRODUCT', payload: { ...product, stock: product.stock - item.qty } });
      });
      dispatch({ type: 'ADD_RECEIPT', payload: receipt });
      dispatch({ type: 'CLEAR_CART' });
      return receipt;
    } catch (e) {
      handleApiError(e, 'Gagal memproses transaksi');
      return null;
    }
  }, [handleApiError, state.products]);

  // Saat user login (atau saat app dibuka dengan sesi tersimpan), tarik data
  // nyata dari backend supaya cache lokal tidak basi (lihat docs/API.md).
  useEffect(() => {
    if (!state.user) return;
    let cancelled = false;

    (async () => {
      try {
        const [products, categories, transactions, receipts, settings] = await Promise.all([
          productsApi.fetchProducts(),
          categoriesApi.fetchCategories(),
          transactionsApi.fetchTransactions(),
          receiptsApi.fetchReceipts(),
          settingsApi.fetchSettings(),
        ]);
        if (cancelled) return;
        const { dailyTarget, ...storeSettings } = settings;
        dispatch({ type: 'IMPORT_DATA', payload: { products, categories, transactions, receipts } });
        dispatch({ type: 'UPDATE_STORE_SETTINGS', payload: storeSettings });
        dispatch({ type: 'SET_DAILY_TARGET', payload: dailyTarget });
      } catch (e) {
        if (!cancelled) handleApiError(e, 'Gagal memuat data dari server');
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.id]);

  return (
    <AppContext.Provider value={{
      state, dispatch, showToast, login, logout, updateUser, setDailyTarget, addNotification,
      completeOnboarding, restartOnboarding, updateStoreSettings,
      addProduct, editProduct, removeProduct, adjustProductStock, addCategory, removeCategory, checkout,
    }}>
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
