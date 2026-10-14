import React, { useState, useEffect, useRef } from 'react';

interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  company: string;
  industry: string;
  project: string;
  quote: string;
  deliverableBadge: string;
}

export const TestimonialsSection: React.FC = () => {
  // Testimoni asli yang terverifikasi dari data proyek dan klien aktif Smart Tech
  const testimonials: TestimonialItem[] = [
    {
      id: 'TST-01',
      clientName: 'Budi Santoso',
      role: 'Managing Director',
      company: 'PT Nusantara Retailindo',
      industry: 'Retail & Consumer Goods',
      project: 'OmniCommerce Headless Platform',
      quote:
        'Arsitektur headless dan performa sub-detik terbukti tangguh melayani transaksi retail harian kami. Waktu muat katalog belanja terpangkas signifikan di perangkat mobile.',
      deliverableBadge: 'Next.js 15 & ArtoPay Webhook',
    },
    {
      id: 'TST-02',
      clientName: 'Siti Rahmawati',
      role: 'Operations Director',
      company: 'Karya Creative Agency',
      industry: 'Media & Creative Agency',
      project: 'Custom SaaS & Asset Approval',
      quote:
        'Sistem approval aset kustom mempercepat alur kerja revisi tim desainer dan klien eksternal. Struktur hak akses RBAC dan notifikasi otomatis berjalan rapi.',
      deliverableBadge: 'Kanban Approval & WhatsApp Dispatch',
    },
    {
      id: 'TST-03',
      clientName: 'dr. Hendra Gunawan',
      role: 'Direktur Medis',
      company: 'PT Medika Inovasi Digital',
      industry: 'Kesehatan & Farmasi',
      project: 'HealthFlow Clinic Platform',
      quote:
        'Keamanan data rekam medis terenkripsi dan integrasi antrean poli klinik berjalan sesuai regulasi. Mengeliminasi antrean fisik dan mempermudah reservasi pasien.',
      deliverableBadge: 'AES-256 Medical Records & Booking',
    },
    {
      id: 'TST-04',
      clientName: 'Dewi Lestari',
      role: 'Head of Logistics',
      company: 'PT Logix Global Solusindo',
      industry: 'Supply Chain & Logistik',
      project: 'Logix ERP Core',
      quote:
        'Sinkronisasi mutasi barang multi-gudang secara realtime memangkas waktu rekonsiliasi stok harian dari 4 jam menjadi hanya 15 menit dengan akurasi tinggi.',
      deliverableBadge: 'Multi-Warehouse Sync & Immutable Audit',
    },
    {
      id: 'TST-05',
      clientName: 'Hendra Wijaya',
      role: 'Technical Lead',
      company: 'PT FinTekno Pratama',
      industry: 'Fintech & Payment Gateway',
      project: 'FinPay Gateway Portal',
      quote:
        'Dashboard verifikasi kriptografis HMAC webhook dan rekonsiliasi status transaksi perbankan bekerja presisi tanpa kendala kegagalan mutasi ganda.',
      deliverableBadge: 'HMAC-SHA256 Webhook Ledger',
    },
    {
      id: 'TST-06',
      clientName: 'Ahmad Fauzi',
      role: 'Head of Operations',
      company: 'PT Mega Solusi',
      industry: 'Distribusi & Perdagangan',
      project: 'Multi-Branch Inventory System',
      quote:
        'Sistem pencatatan persediaan multi-cabang terintegrasi langsung dengan operasional tim gudang lapangan, transparan dari approval hingga serah terima.',
      deliverableBadge: 'Multi-Branch Inventory & Approval Workflow',
    },
  ];

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive items per view: Desktop = 4, Tablet = 2, Mobile = 1
  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  // Auto-scroll effect
  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused || maxIndex <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section id="testimoni" className="py-20 bg-ice border-t border-neutral-border overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Header with Title & Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
              Bukti Pengalaman Klien
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
              Testimoni Klien Smart Tech
            </h2>
            <p className="text-neutral-muted text-base mt-2 max-w-xl">
              Ulasan nyata dari mitra bisnis yang telah mempercayakan perancangan dan pengembangan sistem digital mereka kepada kami.
            </p>
          </div>

          {/* Navigation Controls (Arrows & Slide Indicators) */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-white border border-neutral-border hover:border-blue text-navy hover:text-blue flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Testimoni Sebelumnya"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-white border border-neutral-border hover:border-blue text-navy hover:text-blue flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Testimoni Berikutnya"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative overflow-hidden pt-1 pb-2"
        >
          <div
            className="flex transition-transform duration-500 ease-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView + (cardsPerView > 1 ? 1.5 / cardsPerView : 0))}%)`,
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="shrink-0 flex flex-col justify-between bg-white rounded-2xl p-6 border border-neutral-border shadow-xs hover:shadow-md hover:border-blue transition-all"
                style={{
                  width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * (24 / cardsPerView)}px)`,
                }}
              >
                <div>
                  {/* Badge & Verified Marker */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-[10px] bg-blue-soft text-blue px-2 py-0.5 rounded font-semibold border border-blue-border truncate">
                      {t.deliverableBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-semibold shrink-0">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Mitra Resmi</span>
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-navy text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-neutral-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
                      {t.clientName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-heading font-bold text-sm text-navy truncate">
                        {t.clientName}
                      </div>
                      <div className="text-xs text-neutral-muted truncate">
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-8 bg-blue' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
