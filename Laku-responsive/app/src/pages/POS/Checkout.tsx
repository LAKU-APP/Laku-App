import { Wallet, Landmark, QrCode } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatRupiah } from '@/utils/currency';

export type PaymentMethod = NonNullable<Transaction['paymentMethod']>;

const paymentMethods: { key: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { key: 'cash', label: 'Tunai', icon: Wallet },
  { key: 'transfer', label: 'Transfer', icon: Landmark },
  { key: 'qris', label: 'QRIS', icon: QrCode },
];

interface CheckoutProps {
  isMobile: boolean;
  cartEmpty: boolean;
  processing: boolean;
  grossTotal: number;
  discount: number;
  netTotal: number;
  change: number;
  discountInput: string;
  setDiscountInput: (v: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  cashPaidInput: string;
  setCashPaidInput: (v: string) => void;
  onCheckout: () => void;
}

// Kontrol checkout: diskon, metode bayar, uang dibayar, total, dan tombol Bayar.
export default function Checkout({
  isMobile, cartEmpty, processing, grossTotal, discount, netTotal, change,
  discountInput, setDiscountInput, paymentMethod, setPaymentMethod, cashPaidInput, setCashPaidInput, onCheckout,
}: CheckoutProps) {
  return (
    <>
      {/* Diskon + metode pembayaran + uang dibayar */}
      {!cartEmpty && (
        <div className={`flex flex-col gap-2 mb-2.5 ${!isMobile ? 'border-t border-[#EEF0F6] pt-3' : ''}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#9BA3BC]">Diskon (Rp)</span>
            <input
              type="number" inputMode="numeric" value={discountInput} placeholder="0"
              onChange={e => setDiscountInput(e.target.value)}
              className="w-28 h-9 px-3 bg-[#F8F9FC] rounded-lg text-xs font-bold text-right text-[#1A1F3A] outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
            />
          </div>
          <div className="flex gap-1.5">
            {paymentMethods.map(m => {
              const Icon = m.icon;
              const active = paymentMethod === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex-1 h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors
                    ${active ? 'bg-[#1A56DB] text-white' : 'bg-[#F8F9FC] text-[#9BA3BC]'}`}
                >
                  <Icon size={13} strokeWidth={2.4} /> {m.label}
                </button>
              );
            })}
          </div>
          {paymentMethod === 'cash' && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#9BA3BC]">Uang dibayar</span>
              <input
                type="number" inputMode="numeric" value={cashPaidInput} placeholder={String(netTotal)}
                onChange={e => setCashPaidInput(e.target.value)}
                className="w-28 h-9 px-3 bg-[#F8F9FC] rounded-lg text-xs font-bold text-right text-[#1A1F3A] outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
              />
            </div>
          )}
          {paymentMethod === 'cash' && cashPaidInput.trim() !== '' && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#9BA3BC]">Kembalian</span>
              <span className={`text-xs font-extrabold ${change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {formatRupiah(change)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Total & Checkout */}
      <div className={`flex items-center justify-between gap-3 ${!isMobile ? 'border-t border-[#EEF0F6] pt-3 mt-auto' : ''}`}>
        <div>
          {discount > 0 && (
            <div className="text-[10px] text-[#9BA3BC] font-medium line-through">{formatRupiah(grossTotal)}</div>
          )}
          <div className="text-[10px] text-[#9BA3BC] font-medium">Total{discount > 0 ? ' setelah diskon' : ''}</div>
          <div className="font-extrabold text-[#1A1F3A]" style={{ fontSize: 'clamp(15px, 4.5vw, 20px)' }}>
            {formatRupiah(netTotal)}
          </div>
        </div>
        <button
          onClick={onCheckout}
          disabled={cartEmpty || processing}
          className={`rounded-xl font-bold transition-all ${
            cartEmpty || processing
              ? 'bg-[#EEF0F6] text-[#9BA3BC] cursor-not-allowed'
              : 'bg-[#1A56DB] text-white active:scale-[0.97]'
          }`}
          style={{
            height: 'clamp(40px, 11vw, 48px)',
            paddingLeft: 'clamp(16px, 5vw, 24px)',
            paddingRight: 'clamp(16px, 5vw, 24px)',
            fontSize: 'clamp(12px, 3.5vw, 14px)',
            boxShadow: !cartEmpty && !processing ? '0 4px 20px rgba(26,79,214,0.35)' : 'none',
          }}
        >
          {processing ? 'Memproses...' : 'Bayar'}
        </button>
      </div>
    </>
  );
}
