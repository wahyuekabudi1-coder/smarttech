import React from 'react';
import { type Language, translations } from '../../i18n';

interface PricingSectionProps {
  currentLang: Language;
  onSelectPackage: (packageName: string, category: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ currentLang, onSelectPackage }) => {
  const t = translations[currentLang];

  const packages = [
    {
      number: '01',
      duration: '3 - 5 Hari',
      name: 'Landing Page',
      category: 'website',
      desc: '1 Halaman konversi tinggi untuk promosi produk atau validasi ide baru.',
      price: 'Rp 1.500.000',
      isPopular: false,
      features: [
        'Desain Responsif Mobile & Desktop',
        'Integrasi WhatsApp Langsung & Form',
        'Optimasi Kecepatan & SEO On-Page',
        'Garansi Bug 30 Hari',
      ],
    },
    {
      number: '02',
      duration: '7 - 10 Hari',
      name: 'Company Profile',
      category: 'website',
      desc: 'Website multi-halaman profesional untuk membangun kredibilitas perusahaan.',
      price: 'Rp 4.000.000',
      isPopular: false,
      features: [
        'Hingga 5 Halaman Konten Kustom',
        'CMS Ramah Pengguna untuk Update Berita/Blog',
        'Setup Domain & Cloud Hosting 1 Tahun',
        'Garansi Bug 60 Hari',
      ],
    },
    {
      number: '03',
      duration: '10 - 14 Hari',
      name: 'Toko Online / E-Commerce',
      category: 'ecommerce',
      desc: 'Platform jualan mandiri lengkap dengan checkout otomatis tanpa potongan pihak ketiga.',
      price: 'Rp 4.500.000',
      isPopular: true,
      features: [
        'Checkout QRIS, VA Bank & E-Wallet Otomatis',
        'Kalkulator Ongkir JNE, J&T, SiCepat Terpadu',
        'Manajemen Stok & Laporan Penjualan',
        'Garansi Bug 90 Hari & Training Penggunaan',
      ],
    },
    {
      number: '04',
      duration: '14 - 30 Hari',
      name: 'Aplikasi Bisnis Kustom',
      category: 'webapp',
      desc: 'Sistem operasional internal (ERP, CRM, Procurement) disesuaikan dengan SOP bisnis Anda.',
      price: 'Rp 8.000.000',
      isPopular: false,
      features: [
        'Hak Akses Bertingkat (Role-Based Permissions)',
        'Otomasi Approval Workflow & Notifikasi',
        'Ekspor Laporan PDF & Excel Realtime',
        'Garansi Bug & SLA Support 3 Bulan',
      ],
    },
    {
      number: '05',
      duration: '21 - 45 Hari',
      name: 'Booking & Marketplace',
      category: 'marketplace',
      desc: 'Platform reservasi jadwal, sewa, atau direktori transaksi multi-mitra dengan bagi hasil.',
      price: 'Rp 12.000.000',
      isPopular: false,
      features: [
        'Sistem Jadwal Kalender Anti Bentrok',
        'Portal Akun Vendor / Mitra Terpisah',
        'Distribusi Bagi Hasil Transaksi Otomatis',
        'Garansi Bug & Pemeliharaan 6 Bulan',
      ],
    },
    {
      number: '06',
      duration: '5 - 14 Hari',
      name: 'AI & Otomasi Bisnis',
      category: 'ai-integration',
      desc: 'Otomasi percakapan WhatsApp CS atau integrasi mesin AI pintar untuk efisiensi tim.',
      price: 'Rp 3.500.000',
      isPopular: false,
      features: [
        'Bot WhatsApp 24/7 Terkoneksi Database',
        'Asisten AI Pintar Berbasis FAQ Bisnis Anda',
        'Integrasi Webhook ke Spreadsheet / CRM',
        'Garansi Integrasi & Setup Cloud Terkelola',
      ],
    },
  ];

  return (
    <section id="harga" className="py-20 bg-ice border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
            {t.pricing_tag}
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
            {t.pricing_title}
          </h2>
          <p className="text-neutral-muted text-base mt-2">
            {t.pricing_subtitle}
          </p>
        </div>

        {/* 6 Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.number}
              className={`bg-white rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative ${
                pkg.isPopular
                  ? 'border-2 border-blue ring-4 ring-blue-soft'
                  : 'border border-neutral-border'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 right-6 bg-blue text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Paling Populer
                </div>
              )}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-neutral-muted mb-2">
                  <span>Paket {pkg.number}</span>
                  <span>{pkg.duration}</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-navy">{pkg.name}</h3>
                <p className="text-neutral-muted text-xs mt-1 leading-relaxed">{pkg.desc}</p>
                <div className="my-5">
                  <span className="block font-mono text-[11px] text-neutral-muted">
                    {t.start_from}
                  </span>
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
                    {pkg.price}
                  </div>
                </div>
                <ul className="text-xs text-neutral-muted space-y-2.5 pt-2 border-t border-neutral-border">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue text-base">check</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onSelectPackage(pkg.name, pkg.category)}
                className={`w-full mt-6 text-xs font-semibold py-3 rounded-lg transition-colors cursor-pointer ${
                  pkg.isPopular
                    ? 'bg-blue hover:bg-blue-hover text-white shadow-xs'
                    : 'bg-ice hover:bg-neutral-subtle text-navy border border-neutral-border'
                }`}
              >
                Pilih Paket Ini
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
