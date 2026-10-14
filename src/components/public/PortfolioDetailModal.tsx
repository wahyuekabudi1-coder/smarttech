import React from 'react';

interface PortfolioDetailModalProps {
  projectKey: string | null;
  onClose: () => void;
  onDiscussArchitecture: () => void;
}

export const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({
  projectKey,
  onClose,
  onDiscussArchitecture,
}) => {
  if (!projectKey) return null;

  const projects: Record<
    string,
    {
      title: string;
      category: string;
      summary: string;
      metrics: Array<{ label: string; val: string }>;
      stack: string;
      outcome: string;
    }
  > = {
    omnicommerce: {
      title: 'OmniCommerce Engine',
      category: 'E-Commerce Platform',
      summary:
        'Platform retail performa tinggi dengan arsitektur headless yang melayani pencarian produk instan dalam waktu < 85ms.',
      metrics: [
        { label: 'Latency', val: '< 85ms' },
        { label: 'Payment Hooks', val: 'Zero-Loss' },
        { label: 'Core Vitals', val: '99/100' },
      ],
      stack: 'Next.js 15, PostgreSQL, Redis Edge Cache, ArtoPay / Midtrans Webhook',
      outcome:
        'Meningkatkan konversi checkout sebesar 38% dan memangkas waktu load katalog belanja secara signifikan di mobile.',
    },
    healthflow: {
      title: 'HealthFlow Clinic Platform',
      category: 'Booking & Telemedisin',
      summary:
        'Aplikasi manajemen reservasi medis dan rekam medik terpadu yang mematuhi standar privasi data kesehatan.',
      metrics: [
        { label: 'Enkripsi Data', val: 'AES-256' },
        { label: 'Reservasi Sukses', val: '99.4%' },
        { label: 'Uptime', val: '99.99%' },
      ],
      stack: 'React, Node.js Express, PostgreSQL, Twilio & WhatsApp Cloud API',
      outcome:
        'Mengeliminasi antrean fisik hingga 65% serta mengotomatisasi pengiriman notifikasi jadwal kontrol dokter.',
    },
    logix: {
      title: 'Logix ERP Core',
      category: 'Aplikasi Bisnis / ERP',
      summary:
        'Sistem enterprise resource planning untuk multi-gudang logistik dengan pencatatan mutasi barang realtime.',
      metrics: [
        { label: 'Sinkronisasi', val: '< 1 Detik' },
        { label: 'Audit Trail', val: '100% Immutable' },
        { label: 'Pengguna Aktif', val: '250+ Tim' },
      ],
      stack: 'TypeScript, React 19, Node.js, Prisma ORM, PostgreSQL, Docker',
      outcome:
        'Mempercepat rekonsiliasi stok harian dari 4 jam menjadi hanya 15 menit dengan akurasi 99.8%.',
    },
    finpay: {
      title: 'FinPay Gateway Portal',
      category: 'Fintech Infrastructure',
      summary:
        'Dashboard rekonsiliasi dan verifikasi signature kriptografis HMAC webhook untuk volume transaksi tinggi.',
      metrics: [
        { label: 'Verifikasi Webhook', val: 'HMAC-SHA256' },
        { label: 'Kecepatan Proses', val: '12ms / trx' },
        { label: 'Dispute Handling', val: 'Otomatis' },
      ],
      stack: 'Node.js, TypeScript, PostgreSQL, ArtoPay SDK, Tailwind CSS',
      outcome:
        'Mencegah kegagalan verifikasi status pembayaran ganda dan menjamin konsistensi mutasi keuangan bank.',
    },
  };

  const p = projects[projectKey];
  if (!p) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-1 rounded border border-blue-border font-semibold">
              {p.category}
            </span>
            <button
              onClick={onClose}
              className="text-neutral-muted hover:text-navy cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div>
            <h3 className="font-heading font-bold text-2xl text-navy">{p.title}</h3>
            <p className="text-neutral-muted text-sm mt-1.5 leading-relaxed">{p.summary}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-neutral-border">
            {p.metrics.map((m, i) => (
              <div key={i} className="bg-ice p-3 rounded-xl border border-neutral-border text-center">
                <span className="block font-mono text-[10px] text-neutral-muted uppercase">
                  {m.label}
                </span>
                <span className="font-heading font-bold text-lg text-blue">{m.val}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-neutral-muted">
            <div>
              <strong className="text-navy">Arsitektur &amp; Stack:</strong>{' '}
              <span className="font-mono text-blue">{p.stack}</span>
            </div>
            <div>
              <strong className="text-navy">Dampak Bisnis:</strong> {p.outcome}
            </div>
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
                onDiscussArchitecture();
              }}
              className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>Diskusikan Arsitektur Serupa</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
