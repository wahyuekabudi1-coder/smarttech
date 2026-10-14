import React, { useState } from 'react';
import { type Language } from '../../i18n';
import { DEMO_WEBSITES, type DemoWebsiteConfig } from '../../data/demoWebsites';

interface DemoShowcaseSectionProps {
  currentLang: Language;
  onNavigate: (path: string) => void;
}

export const DemoShowcaseSection: React.FC<DemoShowcaseSectionProps> = ({
  currentLang,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const demoList = Object.values(DEMO_WEBSITES);

  const categories = [
    { id: 'all', label: currentLang === 'id' ? 'Semua Bidang (8)' : 'All Industries (8)' },
    { id: 'retail', label: currentLang === 'id' ? 'Fashion & Retail' : 'Fashion & Retail' },
    { id: 'culinary', label: currentLang === 'id' ? 'Kuliner & F&B' : 'Food & Beverage' },
    { id: 'lifestyle', label: currentLang === 'id' ? 'Beauty & Lifestyle' : 'Beauty & Lifestyle' },
    { id: 'service', label: currentLang === 'id' ? 'Otomotif & Properti' : 'Auto & Real Estate' },
  ];

  const getIndustryGroup = (slug: string) => {
    if (slug === 'toko-baju' || slug === 'toko-sepatu') return 'retail';
    if (slug === 'restoran' || slug === 'kafe') return 'culinary';
    if (slug === 'skincare' || slug === 'furniture') return 'lifestyle';
    if (slug === 'bengkel' || slug === 'properti') return 'service';
    return 'all';
  };

  const filteredDemos = activeCategory === 'all'
    ? demoList
    : demoList.filter(d => getIndustryGroup(d.slug) === activeCategory);

  const getActionPill = (actionType: DemoWebsiteConfig['actionType']) => {
    switch (actionType) {
      case 'checkout':
        return { label: 'Simulasi Checkout', icon: 'shopping_bag', color: 'bg-blue-soft text-blue border-blue-border' };
      case 'order':
        return { label: 'Simulasi Pesan Menu', icon: 'restaurant_menu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'booking':
        return { label: 'Simulasi Booking Servis', icon: 'car_repair', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'survey':
        return { label: 'Simulasi Jadwal Survei', icon: 'real_estate_agent', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  return (
    <section id="inspirasi" className="py-20 bg-slate-50/70 border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
              02.5 • Prototipe Interaktif
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
              Inspirasi Website Bisnis Siap Coba
            </h2>
            <p className="text-neutral-muted text-base mt-2 max-w-2xl leading-relaxed">
              Jelajahi 8 prototipe website interaktif untuk berbagai sektor usaha. Coba langsung pengalaman memilih produk, kustomisasi varian, keranjang, hingga alur pemesanan sebelum membangun website full-stack bersama Smart Tech.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              8 Industri Lengkap
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-navy text-white shadow-xs font-semibold'
                  : 'bg-white border border-neutral-border text-navy hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 8 Demos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDemos.map((demo) => {
            const actionPill = getActionPill(demo.actionType);
            return (
              <div
                key={demo.slug}
                className="bg-white rounded-2xl border border-neutral-border overflow-hidden hover:border-blue hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Hero Thumbnail */}
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img
                    src={demo.heroImage}
                    alt={demo.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[10px] bg-navy/85 backdrop-blur-md text-white font-semibold px-2.5 py-1 rounded-md border border-white/20">
                      {demo.categoryTitle}
                    </span>
                  </div>

                  {/* Action Preview Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border shadow-xs ${actionPill.color}`}>
                      <span className="material-symbols-outlined text-xs">{actionPill.icon}</span>
                      <span>{actionPill.label}</span>
                    </span>
                    <span className="text-white/80 font-mono text-[10px]">
                      {demo.items.length} Katalog
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-navy group-hover:text-blue transition-colors">
                      {demo.businessName}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                      {demo.tagline}
                    </p>

                    {/* Stats pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {demo.stats.slice(0, 2).map((st, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {st.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate(`/demo/${demo.slug}`)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue text-white text-xs font-semibold transition-all group/btn cursor-pointer shadow-xs"
                    >
                      <span>Coba Demo Interaktif</span>
                      <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-white rounded-2xl border border-neutral-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-heading font-bold text-lg text-navy">
              Ingin Website Full-Stack untuk Industri Anda?
            </h4>
            <p className="text-neutral-muted text-xs sm:text-sm max-w-xl">
              Prototipe di atas dapat diintegrasikan dengan pembayaran otomatis (ArtoPay/QRIS/VA), manajemen database terenkripsi, admin dashboard, dan WhatsApp gateway.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.querySelector('#kontak');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 inline-flex items-center gap-2 bg-blue hover:bg-blue-hover text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Konsultasikan Kebutuhan Sistem</span>
            <span className="material-symbols-outlined text-base">forum</span>
          </button>
        </div>
      </div>
    </section>
  );
};
