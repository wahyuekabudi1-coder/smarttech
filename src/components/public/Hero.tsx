import React from 'react';
import { type Language, translations } from '../../i18n';

interface HeroProps {
  currentLang: Language;
}

export const Hero: React.FC<HeroProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-ice">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bold Headline & Clear CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white border border-blue-border shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue animate-pulse"></span>
              <span className="font-mono text-xs text-blue font-semibold tracking-wide">
                {t.hero_badge}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.15]">
              <span>{t.hero_title}</span> <br />
              <span className="text-blue">{t.hero_title_accent}</span>
            </h1>

            <p className="text-neutral-muted text-lg sm:text-xl font-normal max-w-xl leading-relaxed">
              {t.hero_subtitle}
            </p>

            {/* Dual Clear CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleScrollTo('#kontak')}
                className="inline-flex items-center justify-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-base px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{t.hero_cta_primary}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => handleScrollTo('#portfolio')}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-subtle text-navy font-semibold text-base px-6 py-3.5 rounded-lg border border-neutral-border shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-blue text-lg">grid_view</span>
                <span>{t.hero_cta_secondary}</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-neutral-muted">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue text-base">verified</span>
                <span>{t.trust_1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue text-base">schedule</span>
                <span>{t.trust_2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue text-base">security</span>
                <span>{t.trust_3}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry & Stack Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl border border-neutral-border shadow-md p-5 md:p-6 flex flex-col gap-4">
              {/* Window Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="ml-2 font-mono text-xs text-neutral-muted">production.smarttech.id</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue bg-blue-soft px-2 py-0.5 rounded-md border border-blue-border font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue"></span>
                  99.98% UPTIME
                </span>
              </div>

              {/* Key Metrics Strip */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-ice p-3 rounded-xl border border-neutral-border text-center">
                  <span className="block font-mono text-[10px] text-neutral-muted uppercase">Latency</span>
                  <span className="font-heading font-bold text-xl text-blue">24ms</span>
                </div>
                <div className="bg-ice p-3 rounded-xl border border-neutral-border text-center">
                  <span className="block font-mono text-[10px] text-neutral-muted uppercase">Lighthouse</span>
                  <span className="font-heading font-bold text-xl text-navy">98/100</span>
                </div>
                <div className="bg-ice p-3 rounded-xl border border-neutral-border text-center">
                  <span className="block font-mono text-[10px] text-neutral-muted uppercase">Security</span>
                  <span className="font-heading font-bold text-xl text-navy">OWASP-A+</span>
                </div>
              </div>

              {/* Tech Blueprint Code Box */}
              <div className="bg-ice rounded-xl border border-neutral-border p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-neutral-border">
                  <span className="text-navy font-bold">Standard Stack Architecture</span>
                  <span className="text-blue font-semibold">Verified</span>
                </div>
                <div className="font-mono text-xs text-neutral-muted leading-relaxed space-y-1">
                  <div>
                    <span className="text-blue font-semibold">const</span>{' '}
                    <span className="text-navy font-semibold">systemStack</span> = &#123;
                  </div>
                  <div className="pl-4">
                    frontend: <span className="text-navy font-medium">'React 19 &amp; TypeScript'</span>,
                  </div>
                  <div className="pl-4">
                    backend: <span className="text-navy font-medium">'Node.js &amp; Express'</span>,
                  </div>
                  <div className="pl-4">
                    paymentGateway: <span className="text-navy font-medium">'ArtoPay / Midtrans QRIS'</span>,
                  </div>
                  <div className="pl-4">
                    ownership: <span className="text-blue font-semibold">'100% Client Full Code'</span>
                  </div>
                  <div>&#125;;</div>
                </div>
              </div>

              {/* Card Footnote */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-muted pt-1">
                <div className="flex items-center gap-1.5 text-blue font-medium">
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                  <span>Bebas Vendor Lock-in</span>
                </div>
                <span>Jakarta &amp; Global Remote</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
