import React from 'react';
import { type Language, translations } from '../../i18n';

interface AboutSectionProps {
  currentLang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const steps = [
    {
      step: '01',
      title: 'Discovery & Requirement Analysis',
      desc: 'Bedah ide, pemetaan arsitektur database, dan penyusunan Functional Specification Document (FSD) jelas tanpa spekulasi.',
    },
    {
      step: '02',
      title: 'Interactive Prototype & UI/UX',
      desc: 'Visualisasi desain Figma interaktif beresolusi tinggi sebelum penulisan baris kode pertama dimulai.',
    },
    {
      step: '03',
      title: 'Agile Sprint & Weekly Demo',
      desc: 'Pengerjaan kode modular bertahap dengan demo fungsional mingguan dan akses staging server langsung.',
    },
    {
      step: '04',
      title: 'Handover, Kode Sumber & Garansi',
      desc: 'Serah terima repositori Git penuh, dokumentasi API, deploy cloud domain produksi, dan masa garansi bug aktif.',
    },
  ];

  const techBadges = [
    'React 19 / Next.js 15',
    'TypeScript',
    'Node.js & Express',
    'PostgreSQL / Supabase',
    'Tailwind CSS',
    'Redis Cache',
    'Docker & Cloud VPS',
    'ArtoPay / Midtrans QRIS',
  ];

  return (
    <section id="about" className="py-20 bg-white border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-20">
        {/* 4 Steps Process */}
        <div>
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
              {t.process_tag}
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
              {t.process_title}
            </h2>
            <p className="text-neutral-muted text-base mt-2">
              {t.process_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-ice border border-neutral-border flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-2xl font-extrabold text-blue">{st.step}</span>
                  <h3 className="font-heading font-bold text-lg text-navy mt-3">{st.title}</h3>
                  <p className="text-neutral-muted text-xs mt-2 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Foundation Pillars */}
        <div className="bg-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-soft font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>Engineering Standards</span>
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Dibangun dengan Prinsip Rekayasa Perangkat Lunak Modern
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Kami tidak menggunakan template siap pakai yang lambat dan rapuh. Setiap solusi dibangun
              dengan kode bersih, terstruktur rapi, teruji otomatis, dan terdokumentasi lengkap
              sehingga tim internal Anda dapat melanjutkannya tanpa ketergantungan seumur hidup pada kami.
            </p>

            {/* Tech Badges */}
            <div className="pt-4">
              <span className="text-xs font-mono text-blue-soft uppercase tracking-wider block mb-3 font-semibold">
                Teknologi yang Kami Kuasai:
              </span>
              <div className="flex flex-wrap gap-2">
                {techBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-mono text-slate-200"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
