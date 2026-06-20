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
