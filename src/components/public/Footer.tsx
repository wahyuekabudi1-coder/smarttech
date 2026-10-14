import React, { useState } from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
  logoVersion: number;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, logoVersion }) => {
  const [copyrightClicks, setCopyrightClicks] = useState<number>(0);

  const handleCopyrightClick = () => {
    setCopyrightClicks((prev) => {
      const next = prev + 1;
      if (next >= 14) {
        return 0; // reset hitungan ke 0
      }
      return next;
    });
  };

  const isPortalVisible = copyrightClicks >= 10 && copyrightClicks <= 13;

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
              <button
                type="button"
                id="copyright-trigger"
                onClick={handleCopyrightClick}
                className="hover:text-slate-300 transition-colors text-left select-none cursor-default focus:outline-hidden"
                aria-label="Copyright Smart Tech"
              >
                © {new Date().getFullYear()} Smart Tech. All rights reserved.
              </button>
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold block">
              Navigasi
            </span>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a
                  href="#layanan"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      const el = document.querySelector('#layanan');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('/#layanan');
                    }
                  }}
                  className="hover:text-blue transition-colors"
                >
                  Layanan Rekayasa
                </a>
              </li>
              <li>
                <a
                  href="/portfolio"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/portfolio');
                  }}
                  className="hover:text-blue transition-colors"
                >
                  Portfolio Terpilih
                </a>
              </li>
              <li>
                <a
                  href="#harga"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      const el = document.querySelector('#harga');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('/#harga');
                    }
                  }}
                  className="hover:text-blue transition-colors"
                >
                  Paket &amp; Harga
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/about');
                  }}
                  className="hover:text-blue transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="/konsultasi"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/konsultasi');
                  }}
                  className="hover:text-blue transition-colors"
                >
                  Konsultasi Gratis
                </a>
              </li>
            </ul>
          </div>

          {/* Third Column: Conditional Portal Access or Studio Commitment */}
          <div className="md:col-span-4 space-y-3">
            {isPortalVisible ? (
              <div
                id="hidden-portal-access"
                className="p-4 rounded-xl bg-white/5 border border-blue/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold">
                      Akses Portal Tersembunyi
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue/20 text-blue-soft border border-blue/30 font-semibold">
                    Klik {copyrightClicks}/13
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Akses login ke Client Portal dan Admin Workspace telah diaktifkan. Klik copyright ke-14 untuk mengunci kembali.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    id="btn-portal-client"
                    onClick={() => onNavigate('/portal')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    <span>Portal Klien</span>
                  </button>
                  <button
                    id="btn-portal-admin"
                    onClick={() => onNavigate('/admin/dashboard')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue hover:bg-blue-hover text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    <span>Portal Admin</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold block">
                  Standar Mutu Rekayasa
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Arsitektur cloud teruji, standar clean architecture, 100% kepemilikan kode sumber, dan garansi bug resmi untuk setiap sistem digital.
                </p>
                <div className="pt-1 space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue text-sm">verified</span>
                    <span>ISO/IEC Standar Kualitas Software</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue text-sm">security</span>
                    <span>Enkripsi TLS 1.3 &amp; Signature HMAC-SHA256</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <span>Malang, Jawa Timur, Indonesia</span>
          <span>100% Hak Milik Kode • Garansi Bug Resmi</span>
        </div>
      </div>
    </footer>
  );
};
