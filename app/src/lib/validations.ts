import { z } from 'zod';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Email harus valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email harus valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  password_confirmation: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
});

// Product Schemas
export const ProductSchema = z.object({
  name: z.string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(100, 'Nama produk maksimal 100 karakter'),
  price: z.number()
    .min(1, 'Harga harus lebih dari 0')
    .int('Harga harus bilangan bulat'),
  stock: z.number()
    .min(0, 'Stok tidak boleh negatif')
    .int('Stok harus bilangan bulat'),
  emoji: z.string().min(1, 'Emoji harus dipilih'),
  image: z.string().optional(),
});

export const UpdateProductSchema = ProductSchema.partial();

// Transaction Schemas
export const TransactionItemSchema = z.object({
  productId: z.string().or(z.number()),
  qty: z.number().min(1, 'Quantity minimal 1'),
  price: z.number().min(0, 'Price tidak boleh negatif'),
});

export const TransactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  items: z.array(TransactionItemSchema).min(1, 'Minimal 1 item transaksi'),
  note: z.string().optional(),
});

// Type exports
export type LoginType = z.infer<typeof LoginSchema>;
export type RegisterType = z.infer<typeof RegisterSchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type TransactionType = z.infer<typeof TransactionSchema>;
