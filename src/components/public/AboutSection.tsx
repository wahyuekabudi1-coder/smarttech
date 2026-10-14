import React from 'react';
import { type Language } from '../../i18n';

interface AboutSectionProps {
  currentLang?: Language;
  onConsult?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onConsult }) => {
  const workflowStages = [
    {
      step: '01',
      title: 'Konsultasi Kebutuhan',
      desc: 'Mendengarkan ide, menganalisis alur bisnis Anda, dan memetakan kebutuhan sistem tanpa spekulasi.',
      icon: 'forum',
    },
    {
      step: '02',
      title: 'Proposal & Ruang Lingkup',
      desc: 'Menyusun dokumen ruang lingkup pekerjaan, rincian deliverables, estimasi jadwal, dan transparansi biaya.',
      icon: 'description',
    },
    {
      step: '03',
      title: 'Pengembangan Berstandar',
      desc: 'Penulisan kode bersih berstandar modern secara modular dengan demo progres berkala selama proses pengerjaan.',
      icon: 'code',
    },
    {
      step: '04',
      title: 'Pengujian Menyeluruh',
      desc: 'Pengecekan kualitas fungsi, performa kecepatan akses, dan responsivitas tampilan pada berbagai perangkat.',
      icon: 'verified_user',
    },
    {
      step: '05',
      title: 'Serah Terima & Garansi',
      desc: 'Penyerahan repositori kode sumber 100% hak milik klien, konfigurasi deployment, serta dukungan garansi bug resmi.',
      icon: 'task_alt',
    },
  ];

  const handleCtaClick = () => {
    if (onConsult) {
      onConsult();
    } else {
      const el = document.querySelector('#kontak');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/konsultasi';
      }
    }
  };

  return (
    <section id="about" className="py-20 bg-white border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
        {/* 1. Header & Tentang Smart Tech Indonesia */}
        <div className="max-w-3xl">
          <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-2">
            Profil Studio
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy tracking-tight leading-tight">
            Tentang Smart Tech Indonesia
          </h1>
          {/* 2. Deskripsi Perusahaan dan Layanan */}
          <div className="mt-6 text-neutral-muted text-base sm:text-lg leading-relaxed space-y-4">
            <p>
              Smart Tech Indonesia adalah penyedia solusi digital yang membantu bisnis membangun kehadiran online dan mengembangkan sistem digital sesuai kebutuhan. Layanan kami mencakup pembuatan website, website bisnis interaktif, serta pengembangan sistem web yang disesuaikan dengan proses operasional klien. Kami memulai setiap proyek melalui konsultasi untuk memahami kebutuhan, menentukan solusi yang tepat, dan menyusun ruang lingkup pekerjaan sebelum pengembangan dimulai.
            </p>
          </div>
        </div>

        {/* 3. Pendekatan Kerja */}
        <div>
          <div className="mb-8">
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block mb-1">
              Metodologi Rekayasa
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy tracking-tight">
              Pendekatan Kerja Terstruktur
            </h2>
            <p className="text-neutral-muted text-sm mt-1">
              Alur kolaborasi profesional dari konsultasi hingga serah terima penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {workflowStages.map((wf) => (
              <div
                key={wf.step}
                className="p-5 rounded-2xl bg-ice border border-neutral-border hover:border-blue transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xl font-extrabold text-blue">{wf.step}</span>
                    <span className="material-symbols-outlined text-blue text-lg">{wf.icon}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-navy">{wf.title}</h3>
                  <p className="text-neutral-muted text-xs mt-2 leading-relaxed">{wf.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Lokasi Perusahaan & 5. CTA Konsultasikan Kebutuhan Anda */}
        <div className="bg-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-soft font-mono text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>Lokasi Resmi Studio</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Malang, Jawa Timur, Indonesia
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Kami siap berkolaborasi baik secara online untuk seluruh wilayah Indonesia maupun pertemuan langsung untuk proyek-proyek strategis. Sampaikan ide atau tantangan operasional Anda kepada tim rekayasa kami.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center md:items-end">
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto text-center"
              >
                <span>Konsultasikan Kebutuhan Anda</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
