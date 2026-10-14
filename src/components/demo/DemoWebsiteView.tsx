import React, { useState, useEffect } from 'react';
import { DEMO_WEBSITES, type DemoProduct, type DemoWebsiteConfig } from '../../data/demoWebsites';

interface DemoWebsiteViewProps {
  slug: string;
  subView?: string;
  onNavigate: (path: string) => void;
  onConsultFullStack: (demoSlug: string, businessName: string, categoryTitle: string) => void;
  logoVersion: number;
}

interface CartItem {
  id: string;
  product: DemoProduct;
  selectedOptions: Record<string, string>;
  quantity: number;
  itemTotal: number;
}

export const DemoWebsiteView: React.FC<DemoWebsiteViewProps> = ({
  slug,
  subView,
  onNavigate,
  onConsultFullStack,
  logoVersion,
}) => {
  const config: DemoWebsiteConfig = DEMO_WEBSITES[slug] || DEMO_WEBSITES['toko-baju'];

  // Current page state within this demo (Zero Modal: purely full-page views!)
  // 'catalog' | 'checkout' | 'upselling'
  const [viewStep, setViewStep] = useState<'catalog' | 'checkout' | 'upselling'>(
    subView === 'checkout' || subView === 'booking' ? 'checkout' : 'catalog'
  );

  // Cart / Booking items
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected options map for catalog items: productId -> { optionName: selectedChoice }
  const [itemSelections, setItemSelections] = useState<Record<string, Record<string, string>>>({});

  // Quantity map for catalog items: productId -> number
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Active category filter within the demo
  const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('all');

  // Customer form inputs (purely simulated demo state)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contact: '',
    notes: '',
    secondaryInfo: '', // Address / Table # / License plate / Preferred date
    paymentMethod: 'qris',
    serviceSlot: '10:00 WIB',
    surveyType: 'Survei Langsung di Lokasi',
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Reset or initialize state when slug changes
  useEffect(() => {
    setViewStep(subView === 'checkout' || subView === 'booking' ? 'checkout' : 'catalog');
    setActiveCatalogCategory('all');
    setCart([]);
    setNotificationMsg(null);
    window.scrollTo(0, 0);

    // Initialize default options for items
    const initialOpts: Record<string, Record<string, string>> = {};
    const initialQty: Record<string, number> = {};
    config.items.forEach((item) => {
      initialQty[item.id] = 1;
      if (item.options) {
        initialOpts[item.id] = {};
        item.options.forEach((opt) => {
          initialOpts[item.id][opt.name] = opt.choices[0];
        });
      }
    });
    setItemSelections(initialOpts);
    setItemQuantities(initialQty);
  }, [slug, subView]);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  const handleOptionChange = (itemId: string, optionName: string, choice: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [optionName]: choice,
      },
    }));
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (product: DemoProduct) => {
    const selectedOptions = itemSelections[product.id] || {};
    const quantity = itemQuantities[product.id] || 1;

    // Check if duplicate option combination exists in cart
    const existingIndex = cart.findIndex((c) => {
      if (c.product.id !== product.id) return false;
      const optKeys = Object.keys(c.selectedOptions);
      return optKeys.every((k) => c.selectedOptions[k] === selectedOptions[k]);
    });

    if (existingIndex >= 0) {
      setCart((prev) => {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        next[existingIndex].itemTotal = next[existingIndex].quantity * product.price;
        return next;
      });
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          product,
          selectedOptions: { ...selectedOptions },
          quantity,
          itemTotal: quantity * product.price,
        },
      ]);
    }

    const actionText =
      config.actionType === 'booking'
        ? 'Layanan berhasil dimasukkan ke jadwal reservasi demo.'
        : config.actionType === 'survey'
        ? 'Properti ditambahkan ke daftar survei demo.'
        : 'Item berhasil ditambahkan ke keranjang demo.';

    showNotification(actionText);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartId));
  };

  const handleUpdateCartQty = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.product.price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Format IDR Currency
  const formatIDR = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // Distinct category filters for this demo's items
  const itemCategories = ['all', ...Array.from(new Set(config.items.map((i) => i.category)))];

  const filteredItems =
    activeCatalogCategory === 'all'
      ? config.items
      : config.items.filter((i) => i.category === activeCatalogCategory);

  const allSlugs = Object.keys(DEMO_WEBSITES);

  const getIndustryEmoji = (s: string) => {
    switch (s) {
      case 'toko-baju':
        return '👗 Baju';
      case 'toko-sepatu':
        return '👟 Sepatu';
      case 'restoran':
        return '🍽️ Restoran';
      case 'skincare':
        return '✨ Skincare';
      case 'furniture':
        return '🛋️ Furniture';
      case 'bengkel':
        return '🔧 Bengkel';
      case 'properti':
        return '🏡 Properti';
      case 'kafe':
        return '☕ Kafe';
      default:
        return '🏢 Demo';
    }
  };

  // --------------------------------------------------------------------------
  // TOP SMART TECH DEMO BAR
  // --------------------------------------------------------------------------
  const renderTopDemoBar = () => (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-40 shadow-md">
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Smart Tech</span>
          </button>

          <span className="h-4 w-px bg-slate-700 hidden sm:inline-block"></span>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-emerald-400 font-semibold tracking-wide uppercase text-[11px]">
              Demo Interaktif: {config.categoryTitle}
            </span>
          </div>
        </div>

        {/* Center: Quick switcher chips for all 8 demos */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {allSlugs.map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(`/demo/${s}`)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                s === slug
                  ? 'bg-blue text-white shadow-xs font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {getIndustryEmoji(s)}
            </button>
          ))}
        </div>

        {/* Right: Upsell CTA button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onConsultFullStack(config.slug, config.businessName, config.categoryTitle)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue hover:bg-blue-hover text-white font-semibold transition-colors shadow-xs cursor-pointer text-xs"
          >
            <span>Konsultasikan Full-Stack</span>
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------------------------
  // INLINE NOTIFICATION BANNER
  // --------------------------------------------------------------------------
  const renderNotification = () => {
    if (!notificationMsg) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
        <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
        <span className="text-xs font-medium">{notificationMsg}</span>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // STEP 3: UPSELLING & TRANSACTION LIMIT SCREEN (ZERO MODAL - FULL PAGE)
  // --------------------------------------------------------------------------
  if (viewStep === 'upselling') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        {renderTopDemoBar()}
        {renderNotification()}

        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:py-16 w-full flex flex-col justify-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold self-start mb-6">
            <span className="material-symbols-outlined text-sm">info</span>
            <span>BATAS FITUR PROTOTIPE FRONTEND</span>
          </div>

          {/* Upselling Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>

            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
                  Demo Bisnis • {config.businessName} ({config.categoryTitle})
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight leading-tight">
                  Simulasi Selesai: Fitur Transaksi Pembayaran Nyata Belum Diaktifkan
                </h1>
              </div>

              {/* Exact Required Upselling Quote */}
              <div className="p-5 sm:p-6 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-blue-100 leading-relaxed text-sm sm:text-base font-medium shadow-inner">
                <p className="italic font-serif text-lg text-white mb-2">
                  “Ini adalah demo website interaktif. Ingin menerima pesanan, pembayaran, booking, dan pengelolaan data pelanggan secara otomatis? Konsultasikan pengembangan website full-stack dengan Smart Tech.”
                </p>
                <span className="block text-xs font-mono text-blue-300 not-italic mt-2">
                  — Tim Rekayasa Solusi Smart Tech
                </span>
              </div>

              {/* Summary of Simulated Order / Booking */}
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>Rangkuman Simulasi Pengujian Anda</span>
                  <span className="text-emerald-400 font-normal">
                    {config.actionType === 'booking'
                      ? 'Simulasi Booking'
                      : config.actionType === 'survey'
                      ? 'Simulasi Jadwal Survei'
                      : 'Simulasi Keranjang'}
                  </span>
                </h4>

                <div className="space-y-2 text-xs">
                  {cart.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200">
                          {c.quantity}x {c.product.name}
                        </span>
                        {Object.entries(c.selectedOptions).length > 0 && (
                          <span className="block text-[11px] text-slate-400">
                            {Object.entries(c.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-300 font-medium">
                        {formatIDR(c.itemTotal)}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-3 font-semibold text-sm text-white">
                    <span>Estimasi Total Simulasi:</span>
                    <span className="font-mono text-blue-400 text-base">
                      {formatIDR(cartSubtotal)}
                    </span>
                  </div>
                </div>

                {customerForm.name && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Pemesan: <strong className="text-slate-200">{customerForm.name}</strong> ({customerForm.contact || 'No Kontak'})
                  </div>
                )}
              </div>

              {/* Full-Stack Capabilities Delivered by Smart Tech */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Apa yang Smart Tech Siapkan untuk Website Full-Stack Anda:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-blue-400 text-base shrink-0">
                      payments
                    </span>
                    <div>
                      <strong className="block text-slate-200">Gateway Pembayaran Otomatis</strong>
                      <span className="text-slate-400 text-[11px]">
                        Integrasi QRIS, Virtual Account bank, dan e-wallet via ArtoPay.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">
                      dashboard
                    </span>
                    <div>
                      <strong className="block text-slate-200">Dashboard Admin &amp; CRM</strong>
                      <span className="text-slate-400 text-[11px]">
                        Kelola pesanan, reservasi, stok katalog, dan data pelanggan terpadu.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-400 text-base shrink-0">
                      chat
                    </span>
                    <div>
                      <strong className="block text-slate-200">Notifikasi Otomatis WhatsApp</strong>
                      <span className="text-slate-400 text-[11px]">
                        Kirim tiket booking / invoice langsung ke nomor WhatsApp pelanggan.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-purple-400 text-base shrink-0">
                      security
                    </span>
                    <div>
                      <strong className="block text-slate-200">100% Hak Milik Source Code</strong>
                      <span className="text-slate-400 text-[11px]">
                        Kode bersih, dokumentasi API lengkap, dan deployment cloud terkelola.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() =>
                    onConsultFullStack(config.slug, config.businessName, config.categoryTitle)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue hover:bg-blue-hover text-white font-semibold text-sm shadow-lg shadow-blue/20 transition-all cursor-pointer"
                >
                  <span>Konsultasikan Website Full-Stack</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>

                <button
                  onClick={() => setViewStep('catalog')}
                  className="px-5 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Ubah Pesanan Demo Ini
                </button>

                <button
                  onClick={() => onNavigate('/')}
                  className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  Ke Beranda Smart Tech
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 2: CHECKOUT / BOOKING REVIEW SCREEN (ZERO MODAL - FULL PAGE)
  // --------------------------------------------------------------------------
  if (viewStep === 'checkout') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        {renderTopDemoBar()}
        {renderNotification()}

        {/* Demo Business Navigation Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 sticky top-10 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewStep('catalog')}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-navy font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Kembali ke Katalog</span>
              </button>
              <span className="text-slate-300">|</span>
              <span className="font-heading font-extrabold text-lg text-slate-900">
                {config.businessName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
                Mode Uji Coba Transaksi
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                DEMO SANDBOX
              </span>
            </div>
          </div>
        </header>

        {/* Checkout Main Body */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              {config.actionType === 'booking'
                ? 'Konfirmasi Booking Servis Kendaraan'
                : config.actionType === 'survey'
                ? 'Jadwal Survei Lokasi Properti'
                : 'Review & Checkout Pesanan'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Periksa rincian item, masukkan data contoh, dan uji coba alur checkout frontend.
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                shopping_cart
              </span>
              <h3 className="font-bold text-lg text-slate-700">Daftar Pilihan Masih Kosong</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan kembali ke halaman utama demo dan pilih minimal satu produk atau layanan untuk melanjutkan simulasi.
              </p>
              <button
                onClick={() => setViewStep('catalog')}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-hover text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <span>Buka Katalog {config.businessName}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form data pelanggan simulasi */}
              <div className="lg:col-span-7 space-y-6">
                {/* Customer Information Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue text-lg">person</span>
                    <span>Informasi Kontak Pemesan (Simulasi)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={customerForm.name}
                        onChange={(e) =>
                          setCustomerForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Contoh: Dimas Prasetya"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp / Telepon
                      </label>
                      <input
                        type="tel"
                        value={customerForm.contact}
                        onChange={(e) =>
                          setCustomerForm((prev) => ({ ...prev, contact: e.target.value }))
                        }
                        placeholder="Contoh: 081234567890"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                      />
                    </div>
                  </div>

                  {/* Industry-specific input */}
                  {config.actionType === 'order' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor Meja (Dine-In) atau Alamat Antar (Delivery)
                      </label>
                      <input
                        type="text"
                        value={customerForm.secondaryInfo}
                        onChange={(e) =>
                          setCustomerForm((prev) => ({ ...prev, secondaryInfo: e.target.value }))
                        }
                        placeholder="Contoh: Meja 08 / Apartemen Senopati Tower B No. 12"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                      />
                    </div>
                  ) : config.actionType === 'booking' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nomor Polisi &amp; Tipe Mobil
                        </label>
                        <input
                          type="text"
                          value={customerForm.secondaryInfo}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, secondaryInfo: e.target.value }))
                          }
                          placeholder="Contoh: B 1234 XYZ (Innova Zenix)"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Pilihan Jam Servis
                        </label>
                        <select
                          value={customerForm.serviceSlot}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, serviceSlot: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue bg-white"
                        >
                          <option>09:00 WIB (Pagi)</option>
                          <option>10:30 WIB (Pagi)</option>
                          <option>13:30 WIB (Siang)</option>
                          <option>15:00 WIB (Sore)</option>
                        </select>
                      </div>
                    </div>
                  ) : config.actionType === 'survey' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Metode Survei
                        </label>
                        <select
                          value={customerForm.surveyType}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, surveyType: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue bg-white"
                        >
                          <option>Survei Langsung di Lokasi</option>
                          <option>Private Video Call Tour 360°</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Pilihan Hari
                        </label>
                        <select
                          value={customerForm.serviceSlot}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, serviceSlot: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue bg-white"
                        >
                          <option>Sabtu Depan (10:00 WIB)</option>
                          <option>Minggu Depan (14:00 WIB)</option>
                          <option>Hari Kerja (Sesuai Konfirmasi WhatsApp)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Pengiriman Barang
                      </label>
                      <input
                        type="text"
                        value={customerForm.secondaryInfo}
                        onChange={(e) =>
                          setCustomerForm((prev) => ({ ...prev, secondaryInfo: e.target.value }))
                        }
                        placeholder="Contoh: Jl. Menteng Raya No. 45, Jakarta Pusat"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Tambahan untuk Merchant (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={customerForm.notes}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Contoh: Mohon packing kayu rapi / sambal dipisah / minta teknisi senior"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue"
                    ></textarea>
                  </div>
                </div>

                {/* Simulated Payment Selector */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue text-lg">credit_card</span>
                    <span>Metode Pembayaran Demo (Simulasi Prototipe)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'qris', label: 'QRIS Realtime', icon: 'qr_code_scanner', desc: 'Scan via BCA, Mandiri, GoPay' },
                      { id: 'va', label: 'Virtual Account', icon: 'account_balance', desc: 'BCA, BRI, BNI, Mandiri' },
                      { id: 'cc', label: 'Kartu Kredit / Debit', icon: 'credit_card', desc: 'Visa, Mastercard 3DS' },
                    ].map((pm) => (
                      <label
                        key={pm.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          customerForm.paymentMethod === pm.id
                            ? 'border-blue bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="material-symbols-outlined text-slate-700 text-xl">{pm.icon}</span>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={customerForm.paymentMethod === pm.id}
                            onChange={() =>
                              setCustomerForm((prev) => ({ ...prev, paymentMethod: pm.id }))
                            }
                            className="text-blue focus:ring-blue"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{pm.label}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{pm.desc}</span>
                      </label>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    ℹ️ Sebagai prototipe interaktif, opsi ini adalah ilustrasi frontend alur pembayaran. Transaksi riil akan diarahkan ke payment gateway terintegrasi di sistem full-stack.
                  </p>
                </div>
              </div>

              {/* Right Column: Order Summary & Trigger */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Rincian Pesanan ({totalItemCount} Item)</span>
                  <button
                    onClick={() => setViewStep('catalog')}
                    className="text-xs text-blue hover:underline font-semibold cursor-pointer"
                  >
                    + Tambah Item
                  </button>
                </h3>

                {/* Items List */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>

                        {/* Options */}
                        {Object.entries(item.selectedOptions).length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            {Object.entries(item.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-slate-200 rounded-md text-xs">
                            <button
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {formatIDR(item.itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Totals */}
                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Produk / Servis:</span>
                    <span className="font-mono font-medium">{formatIDR(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pajak &amp; Biaya Layanan:</span>
                    <span className="font-mono font-medium text-emerald-600">Termasuk (Demo)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Simulasi:</span>
                    <span className="font-mono text-blue text-base">{formatIDR(cartSubtotal)}</span>
                  </div>
                </div>

                {/* Safe Demo Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-sm shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <span>
                    Klik tombol di bawah untuk melihat respons sistem checkout demo dan mempelajari integrasi full-stack yang dapat disediakan Smart Tech.
                  </span>
                </div>

                {/* Final Checkout Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setViewStep('upselling');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-slate-900 hover:bg-blue text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {config.actionType === 'booking'
                      ? 'Konfirmasi Booking Servis Demo'
                      : config.actionType === 'survey'
                      ? 'Kirim Permintaan Jadwal Survei Demo'
                      : 'Selesaikan Pesanan Demo'}
                  </span>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 1: INTERACTIVE CATALOG & SERVICE BROWSING (DEFAULT FULL PAGE)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {renderTopDemoBar()}
      {renderNotification()}

      {/* Brand Header */}
      <header className="bg-white border-b border-slate-200 sticky top-10 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand Name & Tagline */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-heading font-black text-lg shadow-sm"
              style={{ backgroundColor: config.accentColor }}
            >
              {config.businessName.charAt(0)}
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
                {config.businessName}
              </h1>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                {config.tagline}
              </span>
            </div>
          </div>

          {/* Navigation & Cart Badge */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {config.themeBadge}
            </span>

            {/* Cart / Booking Drawer Replacement (Zero Modal: Directly navigates to full page checkout) */}
            <button
              onClick={() => {
                if (cart.length === 0) {
                  showNotification('Pilih salah satu item katalog di bawah terlebih dahulu.');
                } else {
                  window.scrollTo(0, 0);
                  setViewStep('checkout');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {config.actionType === 'booking'
                  ? 'calendar_month'
                  : config.actionType === 'survey'
                  ? 'home'
                  : 'shopping_bag'}
              </span>
              <span>
                {config.actionType === 'booking'
                  ? 'Jadwal Servis'
                  : config.actionType === 'survey'
                  ? 'Daftar Survei'
                  : 'Keranjang'}
              </span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue text-white text-[11px] font-mono font-bold">
                {totalItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner with Business Image */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src={config.heroImage}
            alt={config.businessName}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{config.categoryTitle}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight leading-tight text-white">
              {config.heroHeadline}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {config.heroSubtitle}
            </p>

            {/* Business Highlight Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
              {config.stats.map((st, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase">
                    {st.label}
                  </span>
                  <span className="block font-heading font-bold text-sm sm:text-base text-white">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Catalog Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-heading font-bold text-slate-900">
              {config.actionType === 'booking'
                ? 'Paket Servis & Perawatan'
                : config.actionType === 'survey'
                ? 'Pilihan Properti & Hunian'
                : config.actionType === 'order'
                ? 'Daftar Menu Makanan & Minuman'
                : 'Katalog Produk Pilihan'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik dan sesuaikan varian ukuran, warna, atau spesifikasi untuk mencoba kalkulasi keranjang.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {itemCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCatalogCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  activeCatalogCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((item) => {
            const currentOpts = itemSelections[item.id] || {};
            const currentQty = itemQuantities[item.id] || 1;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Item Image with Category Badge */}
                  <div className="h-64 sm:h-72 overflow-hidden relative bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-[10px] bg-white/90 backdrop-blur-md text-slate-800 font-bold px-2.5 py-1 rounded shadow-xs border border-slate-200">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-heading font-bold text-lg text-slate-900 leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <span className="font-mono font-extrabold text-base sm:text-lg text-blue shrink-0">
                        {formatIDR(item.price)}
                      </span>
                    </div>

                    {/* Interactive Options Selectors (Radio Chips) */}
                    {item.options && item.options.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {item.options.map((opt) => (
                          <div key={opt.name} className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                              {opt.name}:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {opt.choices.map((choice) => {
                                const isSelected = currentOpts[opt.name] === choice;
                                return (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() => handleOptionChange(item.id, opt.name, choice)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                  >
                                    {choice}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Quantity & Add Button */}
                <div className="p-6 pt-0 bg-white">
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    {/* Quantity counter */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-2 font-mono font-bold text-slate-900">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                      <span>
                        {config.actionType === 'booking'
                          ? 'Pilih Paket Servis'
                          : config.actionType === 'survey'
                          ? 'Pilih & Jadwalkan Survei'
                          : config.actionType === 'order'
                          ? 'Pesan Menu Ini'
                          : 'Tambah ke Keranjang'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating / Sticky Cart Banner at bottom of catalog when items are present (Zero Modal!) */}
        {cart.length > 0 && (
          <div className="mt-12 bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-blue/20 border border-blue/40 flex items-center justify-center text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-2xl">shopping_cart_checkout</span>
              </div>
              <div>
                <span className="text-xs font-mono text-slate-400 block">
                  {totalItemCount} Item Terpilih di Keranjang Demo
                </span>
                <span className="font-heading font-extrabold text-xl text-white">
                  {formatIDR(cartSubtotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                window.scrollTo(0, 0);
                setViewStep('checkout');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{config.ctaActionLabel}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        )}
      </main>

      {/* Demo Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-medium text-slate-700">
            {config.businessName} — Prototipe Website Bisnis Interaktif Smart Tech
          </p>
          <p className="text-[11px] text-slate-400">
            Seluruh konten produk, harga, dan alur transaksi adalah demonstrasi frontend tanpa pemrosesan finansial.
          </p>
        </div>
      </footer>
    </div>
  );
};
