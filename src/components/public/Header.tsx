import React, { useState } from 'react';
import { type Language, translations } from '../../i18n';

interface HeaderProps {
  currentLang: Language;
  onSetLang: (lang: Language) => void;
  onNavigate: (path: string) => void;
  logoVersion: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSetLang,
  onNavigate,
  logoVersion
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-navy/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-navy/25 transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Brand Name */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="flex items-center gap-3 group shrink-0"
          aria-label="Smart Tech Home"
        >
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 shrink-0 shadow-xs">
            <img
              src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
              alt="Smart Tech Logo"
              className="w-full h-full object-contain"
              width="48"
              height="48"
              onError={(e) => {
                // Fallback to root logo if public/images is missing
                (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-none group-hover:text-blue transition-colors">
              Smart Tech
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] text-blue-soft/80 tracking-wider uppercase font-medium mt-1">
              Technology Studio
            </span>
          </div>
        </a>

        {/* 4 Public Menus (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a
            href="#layanan"
            onClick={(e) => handleNavClick(e, '#layanan')}
            className="text-slate-200 hover:text-blue transition-colors py-1 font-medium"
          >
            {t.nav_services}
          </a>
          <a
            href="#portfolio"
            onClick={(e) => handleNavClick(e, '#portfolio')}
            className="text-slate-200 hover:text-blue transition-colors py-1 font-medium"
          >
            {t.nav_portfolio}
          </a>
          <a
            href="#harga"
            onClick={(e) => handleNavClick(e, '#harga')}
            className="text-slate-200 hover:text-blue transition-colors py-1 font-medium"
          >
            {t.nav_pricing}
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, '#about')}
            className="text-slate-200 hover:text-blue transition-colors py-1 font-medium"
          >
            {t.nav_about}
          </a>
        </nav>

        {/* Right Controls: Language, Portal, CTA */}
        <div className="flex items-center gap-3">
          {/* Language Switcher ID/EN */}
          <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/15 text-xs font-mono">
            <button
              onClick={() => onSetLang('id')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                currentLang === 'id'
                  ? 'bg-white text-navy font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => onSetLang('en')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                currentLang === 'en'
                  ? 'bg-white text-navy font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Discreet Portal & Admin Trigger */}
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            title="Login Client Portal & Admin Workspace"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-slate-200 hover:text-white hover:bg-white/10 border border-white/15 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-blue">admin_panel_settings</span>
            <span>{t.btn_portal}</span>
          </button>

          {/* Main CTA Button */}
          <a
            href="#kontak"
            onClick={(e) => handleNavClick(e, '#kontak')}
            className="inline-flex items-center justify-center gap-1.5 bg-blue hover:bg-blue-hover text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>{t.btn_consult}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-200 hover:text-white border border-white/15 transition-colors"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy/98 border-b border-white/15 px-6 py-5 flex flex-col gap-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
              <img
                src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
                alt="Smart Tech Logo"
                className="w-full h-full object-contain"
                width="40"
                height="40"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg text-white leading-tight">
                Smart Tech
              </span>
              <span className="font-mono text-[10px] text-blue-soft/80 uppercase font-medium">
                Technology Studio
              </span>
            </div>
          </div>
          <nav className="flex flex-col gap-3 font-medium text-base">
            <a
              href="#layanan"
              onClick={(e) => handleNavClick(e, '#layanan')}
              className="text-slate-200 hover:text-blue py-1 transition-colors"
            >
              {t.nav_services}
            </a>
            <a
              href="#portfolio"
              onClick={(e) => handleNavClick(e, '#portfolio')}
              className="text-slate-200 hover:text-blue py-1 transition-colors"
            >
              {t.nav_portfolio}
            </a>
            <a
              href="#harga"
              onClick={(e) => handleNavClick(e, '#harga')}
              className="text-slate-200 hover:text-blue py-1 transition-colors"
            >
              {t.nav_pricing}
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className="text-slate-200 hover:text-blue py-1 transition-colors"
            >
              {t.nav_about}
            </a>
          </nav>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/admin/dashboard');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-blue font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Akses Portal Klien / Admin</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/portal');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-soft font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
              <span>Client Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
