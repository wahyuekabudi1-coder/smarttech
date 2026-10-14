import React from 'react';

interface ServiceDetailModalProps {
  serviceKey: string | null;
  onClose: () => void;
  onSelectService: (title: string, categoryKey: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  serviceKey,
  onClose,
  onSelectService,
}) => {
  if (!serviceKey) return null;

  const details: Record<
    string,
    {
      title: string;
      categoryKey: string;
      price: string;
      timeline: string;
      deliverables: string[];
      techStack: string;
    }
  > = {
    website: {
      title: 'Website Development & Company Profile',
      categoryKey: 'website',
      price: 'Rp 1.500.000 – Rp 5.000.000',
      timeline: '3 – 7 Hari Kerja',
      deliverables: [
        'Halaman responsif adaptif (Mobile, Tablet, Desktop)',
        'Optimasi Kecepatan (Lighthouse score 95+)',
        'Technical SEO on-page & setup OpenGraph Meta',
        'Integrasi Formulir Lead & Tombol Direct WhatsApp',
        'Akses penuh repository Git & hosting setup',
      ],
      techStack: 'React 19 / Next.js 15, Tailwind CSS, Vercel Edge Network',
    },
    ecommerce: {
      title: 'Toko Online & Platform E-Commerce',
      categoryKey: 'ecommerce',
      price: 'Rp 4.500.000 – Rp 15.000.000',
      timeline: '7 – 14 Hari Kerja',
      deliverables: [
        'Katalog produk terstruktur dengan filter & search instan',
        'Integrasi payment gateway (ArtoPay / Midtrans: QRIS, VA, CC)',
        'Kalkulator ongkir real-time (JNE, SiCepat, J&T)',
        'Dashboard admin untuk update produk & resi pengiriman',
        'Notifikasi konfirmasi pesanan otomatis ke WhatsApp',
      ],
      techStack: 'Next.js App Router, PostgreSQL, ArtoPay Gateway, Redis',
    },
    webapp: {
      title: 'Aplikasi Bisnis & Custom SaaS Dashboard',
      categoryKey: 'webapp',
      price: 'Rp 8.000.000 – Rp 25.000.000',
      timeline: '14 – 30 Hari Kerja',
      deliverables: [
        'Arsitektur data terisolasi & Role-Based Access Control (RBAC)',
        'Modul operasional custom (Approval, Inventaris, CRM)',
        'Ekspor laporan otomatis (PDF, Excel, CSV)',
        'Audit trail & logging aktivitas pengguna',
        'Dokumentasi API Swagger / Postman lengkap',
      ],
      techStack: 'TypeScript, React / Node.js, PostgreSQL / Supabase, Docker',
    },
    marketplace: {
      title: 'Booking Platform & Marketplace',
      categoryKey: 'marketplace',
      price: 'Rp 12.000.000 – Rp 35.000.000+',
      timeline: '21 – 45 Hari Kerja',
      deliverables: [
        'Kalender reservasi waktu nyata anti bentrok jadwal',
        'Portal akun multi-vendor / mitra independen',
        'Sistem bagi hasil transaksi otomatis & penarikan saldo',
        'Notifikasi email & WhatsApp untuk konfirmasi booking',
        'Arsitektur skalabel untuk high-traffic concurrency',
      ],
      techStack: 'Next.js 15, Supabase Realtime, PostgreSQL RLS, Redis',
    },
    ai: {
      title: 'AI Tooling & Otomasi Integrasi Sistem',
      categoryKey: 'ai-integration',
      price: 'Rp 3.500.000 – Rp 15.000.000',
      timeline: '5 – 14 Hari Kerja',
      deliverables: [
        'Bot WhatsApp resmi dengan kecerdasan kontekstual',
        'Integrasi model OpenAI / Gemini untuk knowledge base',
        'Otomasi webhook antar aplikasi (Google Sheets, CRM, ERP)',
        'Dashboard monitoring penggunaan kuota API & riwayat chat',
      ],
      techStack: 'Node.js / Python, WhatsApp Cloud API, Gemini / OpenAI SDK',
    },
    maintenance: {
      title: 'Cloud DevOps & Pemeliharaan Berkala',
      categoryKey: 'maintenance',
      price: 'Mulai Rp 1.500.000 / bulan',
      timeline: 'Dukungan Berkelanjutan Bulanan / Tahunan',
      deliverables: [
        'Monitoring uptime 24/7 dengan notifikasi insiden real-time',
        'Backup database berkala (harian / mingguan)',
        'Perbaikan bug bergaransi sesuai Service Level Agreement (SLA)',
        'Pembaruan keamanan sistem dan dependency patches',
        'Bantuan technical advisory langsung dari Lead Engineer',
      ],
      techStack: 'AWS / Vercel / DigitalOcean, Cloudflare CDN, Docker',
    },
  };

  const s = details[serviceKey];
  if (!s) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-1 rounded border border-blue-border font-semibold">
              Spesifikasi Layanan
            </span>
            <button
              onClick={onClose}
              className="text-neutral-muted hover:text-navy cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div>
            <h3 className="font-heading font-bold text-2xl text-navy">{s.title}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs text-neutral-muted">
              <span>
                Estimasi: <strong className="text-blue font-bold">{s.price}</strong>
              </span>
              <span>•</span>
              <span>
                Waktu Pengerjaan: <strong className="text-navy font-semibold">{s.timeline}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-neutral-border">
            <h4 className="font-mono text-xs text-neutral-muted uppercase font-semibold">
              Deliverables &amp; Fitur Utama:
            </h4>
            <ul className="text-xs text-neutral-muted space-y-2">
              {s.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue text-base">check</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-ice rounded-lg border border-neutral-border font-mono text-xs text-neutral-muted">
            <span className="text-navy font-semibold">Tech Stack:</span> {s.techStack}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectService(s.title, s.categoryKey);
              }}
              className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>Konsultasikan Layanan Ini</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
