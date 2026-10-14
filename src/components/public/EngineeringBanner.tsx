import React from 'react';

export const EngineeringBanner: React.FC = () => {
  return (
    <section className="bg-navy text-white py-12 border-y border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-blue text-xs uppercase tracking-wider font-semibold">
              Source Code
            </span>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-white">
              100% Hak Milik
            </span>
            <span className="text-xs text-neutral-muted">Repo Git &amp; dokumen diserahkan</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-blue text-xs uppercase tracking-wider font-semibold">
              Performa Web
            </span>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-white">
              &lt; 1.5 Detik
            </span>
            <span className="text-xs text-neutral-muted">Skor Google Core Web Vitals 95+</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-blue text-xs uppercase tracking-wider font-semibold">
              Kerahasiaan
            </span>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-white">
              NDA Resmi
            </span>
            <span className="text-xs text-neutral-muted">Perlindungan ide &amp; privasi data</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-blue text-xs uppercase tracking-wider font-semibold">
              Dukungan
            </span>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-white">
              SLA Terjamin
            </span>
            <span className="text-xs text-neutral-muted">Garansi perbaikan bug berkala</span>
          </div>
        </div>
      </div>
    </section>
  );
};
