import React from 'react';
import { type Language, translations } from '../../i18n';

interface ProcessStepsSectionProps {
  currentLang: Language;
}

export const ProcessStepsSection: React.FC<ProcessStepsSectionProps> = ({ currentLang }) => {
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

  return (
    <section id="proses" className="py-20 bg-white border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
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
              className="p-6 rounded-2xl bg-ice border border-neutral-border flex flex-col justify-between hover:border-blue transition-all shadow-xs hover:shadow-md"
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
    </section>
  );
};
