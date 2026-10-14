import React from 'react';
import { type Language, translations } from '../../i18n';

interface PortfolioSectionProps {
  currentLang: Language;
  onOpenProject: (key: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ currentLang, onOpenProject }) => {
  const t = translations[currentLang];

  const projects = [
    {
      key: 'omnicommerce',
      tag: 'E-Commerce Platform',
      title: 'OmniCommerce Engine',
      desc: 'Platform retail multi-channel dengan pencarian sub-detik dan sinkronisasi pembayaran otomatis.',
      stat: 'Latency < 85ms',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA3wyt7kB-1v5b3v1mfAKHLdomzey2Fn1xoIL9SzxrffvCStZaaA2yH41k8JsyV43jvpAwDfgqUgi1hJmhqM5InAdGnlEYz7Kj1Yu0uT-WhYhBrnxFBCjkiym0a-bR7VQjhYxIf0ObBi2P5L2ifF0DWBzXIzfV0QlAqeswW21uaP7eF67yvnwfkcmuoUWZY5VNgmmeY4BATSuegv4CmkRggV9BCc4yLU0Ft0HOmvYWMVZZmSwJ6no1q_A',
    },
    {
      key: 'healthflow',
      tag: 'Booking & Telemedisin',
      title: 'HealthFlow Clinic',
      desc: 'Sistem reservasi dokter realtime, rekam medis terenkripsi, dan reminder otomatis WhatsApp.',
      stat: 'Keamanan Data AES-256',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCR1s_50ZOIaQ4ikDh3-DeJSyHsF1MmLo9rsQW_6bywacWszsuk-5DKlhGyBkCr0Vf-vELOXWZdt0QLrwc43wkuZBqp937-twzbx46wETQ0xSRe1Nml6b4jkacrSUha8-h4x5_jUT54_y8uiuaEhDcQRaDVuP-KFDfFX-x_ISxilTggp2YV9l--jg0PXrCzH6nKB5b377gY8_1jdpACkEJiGc143ptvquCgj_L7MBg-xHpUBLh1ar-VnA',
    },
    {
      key: 'logix',
      tag: 'Aplikasi Bisnis / ERP',
      title: 'Logix ERP Core',
      desc: 'Sistem manajemen supply chain dan inventaris multi-gudang dengan kontrol akses ketat (RBAC).',
      stat: 'Multi-Warehouse Sync',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDg5FFLn9LJ2gFk9MvTa2ssf8qViQBczvAs4QSfbsuWrPYR1eFrp-m6CeKuepcpAJDqkrGXWOlRzoy1SJtVupkYYX9fZ2k6-K3KRzDH_N7WDbIzDA3hhvw-chY7fmFDypnMBISgB8bSHRKsVnmEvJTryuaYBKg_oaVapKhZfMj7KEteiGT7ie6IKHDhqbu0oTjDtWyErrfDHTBvP2kK5daQH4xhXJZinCVtYjQuOYiCZTn7Jc8UdSz6PA',
    },
    {
      key: 'finpay',
      tag: 'Fintech Infrastructure',
      title: 'FinPay Gateway Portal',
      desc: 'Portal rekonsiliasi transaksi pembayaran otomatis dengan integrasi perbankan & webhook aman.',
      stat: 'Zero-Loss Ledger',
      image: '/screen.png',
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-white border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
              {t.portfolio_tag}
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
              {t.portfolio_title}
            </h2>
            <p className="text-neutral-muted text-base mt-2">
              {t.portfolio_subtitle}
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-muted">
            Semua proyek disertai source code &amp; dokumentasi
          </span>
        </div>

        {/* 4 Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p) => (
            <div
              key={p.key}
              className="bg-ice rounded-2xl border border-neutral-border overflow-hidden group hover:border-blue transition-all shadow-xs hover:shadow-md flex flex-col"
            >
              <div className="h-64 sm:h-72 overflow-hidden relative bg-neutral-subtle">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3wyt7kB-1v5b3v1mfAKHLdomzey2Fn1xoIL9SzxrffvCStZaaA2yH41k8JsyV43jvpAwDfgqUgi1hJmhqM5InAdGnlEYz7Kj1Yu0uT-WhYhBrnxFBCjkiym0a-bR7VQjhYxIf0ObBi2P5L2ifF0DWBzXIzfV0QlAqeswW21uaP7eF67yvnwfkcmuoUWZY5VNgmmeY4BATSuegv4CmkRggV9BCc4yLU0Ft0HOmvYWMVZZmSwJ6no1q_A';
                  }}
                />
                <div className="absolute top-4 left-4 font-mono text-[11px] bg-white text-navy font-semibold px-3 py-1 rounded-md border border-neutral-border shadow-xs">
                  {p.tag}
                </div>
              </div>
              <div className="p-6 flex flex-col justify-between flex-1 gap-4 bg-white">
                <div>
                  <h3 className="font-heading font-bold text-xl text-navy">{p.title}</h3>
                  <p className="text-neutral-muted text-sm mt-1">{p.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-border">
                  <span className="font-mono text-xs text-blue font-semibold">{p.stat}</span>
                  <button
                    onClick={() => onOpenProject(p.key)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-navy hover:text-blue font-semibold cursor-pointer"
                  >
                    <span>{t.btn_view_project}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
