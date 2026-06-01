import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Minus, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function POS() {
  const { state, dispatch, showToast } = useApp();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const filteredProducts = useMemo(() => {
    let prods = state.products.filter(p => p.stock > 0);
    if (!searchQuery.trim()) return prods;
    return prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [state.products, searchQuery]);

  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);

  const handleProductClick = (product: { id: string; name: string; price: number; stock: number }) => {
    const cartItem = state.cart.find(c => c.productId === product.id);
    const currentQtyInCart = cartItem?.qty ?? 0;
    if (currentQtyInCart >= product.stock) {
      showToast(`Stok ${product.name} tidak mencukupi!`);
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, productName: product.name, price: product.price } });
    setSelectedProduct(product.id);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) return;

    // Validate stock before processing
    for (const item of state.cart) {
      const product = state.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.qty) {
        showToast(`Stok ${item.productName} tidak mencukupi!`);
        return;
      }
    }

    setProcessing(true);
    setTimeout(() => {
      const note = `Penjualan: ${state.cart.map(i => `${i.qty}x ${i.productName}`).join(', ')}`;
      state.cart.forEach(item => {
        // ADD_TRANSACTION for the sale record
        dispatch({
          type: 'ADD_TRANSACTION', payload: {
            id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
            productId: item.productId, productName: item.productName, type: 'OUT' as const,
            qty: item.qty, totalPrice: item.price * item.qty,
            note,
            createdAt: new Date().toISOString(),
          }
        });
        // Only update stock (without creating another transaction)
        dispatch({ type: 'UPDATE_PRODUCT', payload: {
          ...state.products.find(p => p.id === item.productId)!,
          stock: state.products.find(p => p.id === item.productId)!.stock - item.qty,
        }});
      });
      dispatch({ type: 'CLEAR_CART' });
      setProcessing(false);
      showToast(`Transaksi berhasil! Total: Rp ${cartTotal.toLocaleString('id-ID')}`);
    }, 800);
  };

  const isInCart = (productId: string) => state.cart.some(c => c.productId === productId);

  // Product grid (shared)
  const productGrid = (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(80px, 25vw, 110px), 1fr))' }}>
      {filteredProducts.map((product, i) => {
        const inCart = isInCart(product.id);
        const isSelected = selectedProduct === product.id;
        return (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className={`bg-white rounded-xl flex flex-col items-center card-shadow
                       active:scale-[0.95] transition-all duration-150 relative overflow-hidden
                       ${isSelected ? 'ring-2 ring-[#1A56DB] scale-95' : ''}
                       ${inCart ? 'border border-[#1A56DB]/30' : ''}`}
            style={{ padding: 'clamp(8px, 2.5vw, 12px)', gap: 'clamp(4px, 1.5vw, 6px)', animationDelay: `${i * 0.03}s` }}
          >
            {inCart && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-[#1A56DB] rounded-full flex items-center justify-center z-10">
                <span className="text-[9px] font-bold text-white">
                  {state.cart.find(c => c.productId === product.id)?.qty}
                </span>
              </div>
            )}
            {product.image ? (
              <img src={product.image} alt={product.name}
                className="rounded-lg object-cover"
                style={{ width: 'clamp(36px, 10vw, 48px)', height: 'clamp(36px, 10vw, 48px)' }}
              />
            ) : (
              <div
                className="rounded-lg bg-[#F4F6FD] flex items-center justify-center"
                style={{ width: 'clamp(36px, 10vw, 48px)', height: 'clamp(36px, 10vw, 48px)' }}
              >
                <Package size={18} className="text-[#9BA3BC]" strokeWidth={1.5} />
              </div>
            )}
            <div className="text-center leading-tight line-clamp-2 w-full font-bold text-[#1A1F3A]" style={{ fontSize: 'clamp(9px, 2.5vw, 11px)' }}>{product.name}</div>
            <div className="font-semibold text-[#9BA3BC]" style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Rp {product.price.toLocaleString('id-ID')}</div>
          </button>
        );
      })}
    </div>
  );

  // Cart panel (shared)
  const cartPanel = (
    <div
      className={`bg-white flex flex-col ${isMobile ? 'border-t border-[#EEF0F6]' : 'rounded-2xl card-shadow'}`}
      style={{
        padding: isMobile ? 'clamp(10px, 3vw, 16px) clamp(12px, 4vw, 16px)' : '20px',
        boxShadow: isMobile ? '0 -4px 20px rgba(0,0,0,0.05)' : undefined,
      }}
    >
      {/* Cart Header */}
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <ShoppingCart size={15} className="text-[#1A56DB]" />
          <span className="font-bold text-[#1A1F3A]" style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>Keranjang</span>
          {cartCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#1A56DB] px-1.5 py-0.5 rounded-full">{cartCount}</span>
          )}
        </div>
        {state.cart.length > 0 && (
          <button onClick={() => dispatch({ type: 'CLEAR_CART' })}
            className="text-[10px] font-bold text-[#ef4444] flex items-center gap-1 active:scale-95">
            <Trash2 size={11} /> Kosongkan
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div
        className="overflow-y-auto scrollbar-hide flex flex-col gap-1.5 mb-2.5"
        style={{ maxHeight: isMobile ? 'clamp(80px, 22vw, 120px)' : undefined, flex: isMobile ? undefined : 1 }}
      >
        {state.cart.length === 0 && (
          <div className="text-center py-4 text-[#DDE1EF] text-xs font-medium">Belum ada item dipilih</div>
        )}
        {state.cart.map(item => (
          <div key={item.productId} className="flex items-center justify-between bg-[#F8F9FC] rounded-lg px-2.5 py-1.5">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1A1F3A] truncate" style={{ fontSize: 'clamp(10px, 2.8vw, 12px)' }}>{item.productName}</div>
              <div className="text-[#9BA3BC]" style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Rp {item.price.toLocaleString('id-ID')}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => dispatch({ type: 'UPDATE_CART_QTY', payload: { productId: item.productId, delta: -1 } })}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
                <Minus size={13} className="text-[#ef4444]" />
              </button>
              <span className="text-sm font-extrabold text-[#1A1F3A] w-5 text-center">{item.qty}</span>
              <button
                onClick={() => {
                  const prod = state.products.find(p => p.id === item.productId);
                  if (prod && item.qty >= prod.stock) { showToast(`Stok ${item.productName} tidak mencukupi!`); return; }
                  dispatch({ type: 'UPDATE_CART_QTY', payload: { productId: item.productId, delta: 1 } });
                }}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
                <Plus size={13} className="text-[#22c55e]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal (desktop) */}
      {!isMobile && state.cart.length > 0 && (
        <div className="mb-3 border-t border-[#EEF0F6] pt-3">
          {state.cart.map(item => (
            <div key={item.productId} className="flex justify-between text-xs text-[#9BA3BC] mb-1">
              <span>{item.productName} x{item.qty}</span>
              <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total & Checkout */}
      <div className={`flex items-center justify-between gap-3 ${!isMobile ? 'border-t border-[#EEF0F6] pt-3 mt-auto' : ''}`}>
        <div>
          <div className="text-[10px] text-[#9BA3BC] font-medium">Total</div>
          <div className="font-extrabold text-[#1A1F3A]" style={{ fontSize: 'clamp(15px, 4.5vw, 20px)' }}>
            Rp {cartTotal.toLocaleString('id-ID')}
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={state.cart.length === 0 || processing}
          className={`rounded-xl font-bold transition-all ${
            state.cart.length === 0 || processing
              ? 'bg-[#EEF0F6] text-[#9BA3BC] cursor-not-allowed'
              : 'bg-[#1A56DB] text-white active:scale-[0.97]'
          }`}
          style={{
            height: 'clamp(40px, 11vw, 48px)',
            paddingLeft: 'clamp(16px, 5vw, 24px)',
            paddingRight: 'clamp(16px, 5vw, 24px)',
            fontSize: 'clamp(12px, 3.5vw, 14px)',
            boxShadow: state.cart.length > 0 && !processing ? '0 4px 20px rgba(26,79,214,0.35)' : 'none',
          }}
        >
          {processing ? '⏳ Memproses...' : 'Bayar'}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4 pb-2">
          <div className="relative mb-3.5">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BA3BC]" />
            <input type="text" placeholder="Cari produk..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white rounded-xl text-sm font-semibold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30 card-shadow transition-all" />
          </div>
          {productGrid}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart size={40} className="text-[#DDE1EF] mb-3" />
              <p className="text-sm font-bold text-[#9BA3BC]">Tidak ada produk tersedia</p>
              <p className="text-xs text-[#DDE1EF] mt-1">Coba kata kunci lain</p>
            </div>
          )}
        </div>
        <div className="shrink-0">{cartPanel}</div>
      </div>
    );
  }

  // Desktop: side-by-side layout
  return (
    <div className="flex-1 flex gap-6 px-6 py-6 overflow-hidden">
      {/* Product selection */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA3BC]" />
          <input type="text" placeholder="Cari produk..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 bg-white rounded-xl text-sm font-medium text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30 card-shadow transition-shadow" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {productGrid}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart size={40} className="text-[#DDE1EF] mb-3" />
              <p className="text-sm font-semibold text-[#9BA3BC]">Tidak ada produk tersedia</p>
            </div>
          )}
        </div>
      </div>
      {/* Cart sidebar */}
      <div className="w-[320px] shrink-0 flex flex-col">{cartPanel}</div>
    </div>
  );
}
