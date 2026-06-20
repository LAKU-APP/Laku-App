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
