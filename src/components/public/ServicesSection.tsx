import React from 'react';
import { type Language, translations } from '../../i18n';

interface ServicesSectionProps {
  currentLang: Language;
  onOpenDetail: (key: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ currentLang, onOpenDetail }) => {
  const t = translations[currentLang];

  const services = [
    {
      key: 'website',
      icon: 'web',
      title: t.srv_1_title,
      desc: t.srv_1_desc,
      price: 'Rp 1.500.000',
    },
    {
      key: 'ecommerce',
      icon: 'shopping_bag',
      title: t.srv_2_title,
      desc: t.srv_2_desc,
      price: 'Rp 4.500.000',
    },
    {
      key: 'webapp',
      icon: 'dashboard_customize',
      title: t.srv_3_title,
      desc: t.srv_3_desc,
      price: 'Rp 8.000.000',
    },
    {
      key: 'marketplace',
      icon: 'calendar_month',
      title: t.srv_4_title,
      desc: t.srv_4_desc,
      price: 'Rp 12.000.000',
    },
    {
      key: 'ai',
      icon: 'smart_toy',
      title: t.srv_5_title,
      desc: t.srv_5_desc,
      price: 'Rp 3.500.000',
    },
    {
      key: 'maintenance',
      icon: 'cloud_sync',
      title: t.srv_6_title,
      desc: t.srv_6_desc,
      price: 'Rp 1.500.000 /bln',
    },
  ];

  return (
    <section id="layanan" className="py-20 bg-ice">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
            {t.services_tag}
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight">
            {t.services_title}
          </h2>
          <p className="text-neutral-muted text-base mt-2">
            {t.services_subtitle}
          </p>
        </div>

        {/* 6 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-xl p-6 border border-neutral-border hover:border-blue shadow-xs hover:shadow-md flex flex-col justify-between transition-all group"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-soft border border-blue-border flex items-center justify-center text-blue group-hover:bg-blue group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-navy">{s.title}</h3>
                  <p className="text-neutral-muted text-sm mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-border flex items-center justify-between">
                <div>
                  <span className="block font-mono text-[11px] text-neutral-muted uppercase">
                    {t.start_from}
                  </span>
                  <span className="font-heading font-bold text-lg text-blue">{s.price}</span>
                </div>
                <button
                  onClick={() => onOpenDetail(s.key)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-navy group-hover:text-blue font-semibold transition-colors cursor-pointer"
                >
                  <span>{t.btn_detail}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
