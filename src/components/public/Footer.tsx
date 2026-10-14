import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
  logoVersion: number;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, logoVersion }) => {
  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
                  alt="Smart Tech Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
                  }}
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-white">Smart Tech</span>
                <span className="block font-mono text-[10px] text-blue-soft/80 uppercase">
                  Technology Studio
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
              Software engineering &amp; digital product design studio terpercaya. Dari ide bisnis sampai
              online dengan kode berstandar internasional.
            </p>
            <div className="pt-2 text-xs font-mono text-slate-400">
              © {new Date().getFullYear()} Smart Tech. All rights reserved.
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold block">
              Navigasi
            </span>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#layanan" className="hover:text-blue transition-colors">
                  Layanan Rekayasa
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-blue transition-colors">
                  Portfolio Terpilih
                </a>
              </li>
              <li>
                <a href="#harga" className="hover:text-blue transition-colors">
                  Paket &amp; Harga
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue transition-colors">
                  Standar Rekayasa
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-blue transition-colors">
                  Konsultasi Gratis
                </a>
              </li>
            </ul>
          </div>

          {/* Portal & Workspace access */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold block">
              Akses Portal &amp; Klien
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Klien terdaftar dapat memantau progres milestone, unduh dokumen FSD, dan verifikasi
              pembayaran lewat Client Portal.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onNavigate('/portal')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                <span>Client Portal</span>
              </button>
              <button
                onClick={() => onNavigate('/admin/dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue hover:bg-blue-hover text-xs font-mono text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Admin Workspace</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <span>Jakarta Selatan, DKI Jakarta, Indonesia</span>
          <span>100% Hak Milik Kode • Garansi Bug Resmi</span>
        </div>
      </div>
    </footer>
  );
};
