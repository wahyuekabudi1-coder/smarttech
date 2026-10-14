import React, { useState, useEffect } from 'react';
import type { DashboardSummary } from '../../types';

interface DashboardViewProps {
  onNavigate: (path: string) => void;
  onLogoUpdated: (newVersion: number) => void;
  logoVersion: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onLogoUpdated,
  logoVersion,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Logo upload state
  const [selectedLogoBase64, setSelectedLogoBase64] = useState<string | null>(null);
  const [logoFileDetails, setLogoFileDetails] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedLogoBase64(base64);
      setLogoFileDetails(`${file.name} (${Math.round(file.size / 1024)} KB)`);
      setUploadFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!selectedLogoBase64) return;
    setIsUploadingLogo(true);
    setUploadFeedback(null);

    try {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: selectedLogoBase64 }),
      });

      const resData = await res.json();
      if (resData.success) {
        setUploadFeedback({
          type: 'success',
          msg: `✅ Berhasil! Logo baru tersimpan di ${resData.filePath}. Seluruh logo website telah diperbarui.`,
        });
        onLogoUpdated(Date.now());
      } else {
        setUploadFeedback({
          type: 'error',
          msg: `Gagal: ${resData.error || 'Terjadi kesalahan sistem'}`,
        });
      }
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        msg: `Koneksi gagal: ${err.message}`,
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalConsultations: 0,
    newConsultations: 0,
    activeClients: 0,
    pendingProposals: 0,
    activeProjects: 0,
    unpaidInvoices: 0,
    estimatedRevenue: 0,
    collectedRevenue: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy to-blue-900 p-6 md:p-8 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider text-blue-soft uppercase">
            Smart Tech Management Hub
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold mt-1">
            Ringkasan Operasional &amp; Klien
          </h2>
          <p className="text-blue-soft text-sm mt-1 max-w-2xl">
            Kelola seluruh alur bisnis mulai dari permintaan konsultasi, calon klien, penawaran harga, eksekusi proyek, hingga pelunasan tagihan.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/admin/consultations/new')}
            className="inline-flex items-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Input Permintaan</span>
          </button>
        </div>
      </div>

      {/* Business Workflow Visual Pipeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-navy flex items-center gap-2">
            <span className="material-symbols-outlined text-blue">alt_route</span>
            <span>Alur Bisnis Smart Tech (Standard Operating Procedure)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">10 Tahap Terintegrasi</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-medium">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex flex-col">
            <span className="font-bold text-blue font-mono text-[10px]">TAHAP 1</span>
            <span className="font-semibold mt-0.5">Lead Masuk</span>
            <span className="text-[11px] text-slate-500 mt-1">Form website / WhatsApp</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 2</span>
            <span className="font-semibold mt-0.5">Marketing Follow-up</span>
            <span className="text-[11px] text-slate-500 mt-1">Kualifikasi kebutuhan</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 3</span>
            <span className="font-semibold mt-0.5">Konsultasi</span>
            <span className="text-[11px] text-slate-500 mt-1">Temu teknis &amp; arsitektur</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 4</span>
            <span className="font-semibold mt-0.5">Proposal Penawaran</span>
            <span className="text-[11px] text-slate-500 mt-1">Scope &amp; estimasi biaya</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 5</span>
            <span className="font-semibold mt-0.5">Persetujuan Pelanggan</span>
            <span className="text-[11px] text-slate-500 mt-1">Kontrak &amp; tagihan manual</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 6</span>
            <span className="font-semibold mt-0.5">Pembuatan Proyek</span>
            <span className="text-[11px] text-slate-500 mt-1">Kickoff &amp; Portal Klien</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col">
            <span className="font-bold text-slate-500 font-mono text-[10px]">TAHAP 7</span>
            <span className="font-semibold mt-0.5">Pengerjaan</span>
            <span className="text-[11px] text-slate-500 mt-1">Milestones &amp; sprint</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex flex-col">
            <span className="font-bold text-emerald-600 font-mono text-[10px]">TAHAP 8</span>
            <span className="font-semibold mt-0.5">Serah Terima</span>
            <span className="text-[11px] text-slate-500 mt-1">100% kode, BAST &amp; SLA</span>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Permintaan Baru
            </span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue flex items-center justify-center material-symbols-outlined text-lg">
              contact_support
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy">{kpi.newConsultations}</span>
            <span className="text-xs text-slate-500">dari {kpi.totalConsultations} total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <button
              onClick={() => onNavigate('/admin/consultations')}
              className="text-blue font-semibold hover:underline cursor-pointer"
            >
              Kelola Permintaan &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Proyek Berjalan
            </span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center material-symbols-outlined text-lg">
              rocket_launch
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy">{kpi.activeProjects}</span>
            <span className="text-xs text-slate-500">Proyek aktif</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="text-blue font-semibold hover:underline cursor-pointer"
            >
              Lihat Proyek &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tagihan Menunggu
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-lg">
              receipt_long
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy">{kpi.unpaidInvoices}</span>
            <span className="text-xs text-slate-500">Perlu diproses</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <button
              onClick={() => onNavigate('/admin/invoices')}
              className="text-blue font-semibold hover:underline cursor-pointer"
            >
              Kelola Invoicing &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi Revenue
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center material-symbols-outlined text-lg">
              payments
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-navy truncate">
              Rp {(kpi.estimatedRevenue || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <button
              onClick={() => onNavigate('/admin/reports')}
              className="text-blue font-semibold hover:underline cursor-pointer"
            >
              Lihat Laporan &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Consultations & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Consultations */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-navy">
              Permintaan Konsultasi Terbaru
            </h3>
            <button
              onClick={() => onNavigate('/admin/consultations')}
              className="text-xs font-mono text-blue hover:underline cursor-pointer"
            >
              Semua Permintaan &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentConsultations || []).slice(0, 5).map((c) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue font-bold">{c.id}</span>
                    <span className="font-semibold text-sm text-navy">{c.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    {c.categoryName || c.category} • {c.budgetRange || c.budget}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-soft text-blue font-semibold border border-blue-border">
                    {c.status}
                  </span>
                  <button
                    onClick={() => onNavigate(`/admin/consultations/${c.id}`)}
                    className="p-1 rounded-lg text-slate-400 hover:text-navy cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Projects Overview */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-navy">
              Proyek Aktif
            </h3>
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="text-xs font-mono text-blue hover:underline cursor-pointer"
            >
              Semua Proyek &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {(data?.activeProjects || []).slice(0, 3).map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-ice space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-navy">{p.title}</h4>
                    <span className="text-xs text-slate-500">{p.clientName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue">
                    {p.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue h-full rounded-full"
                    style={{ width: `${p.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Logo Upload & Live Replacement Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-lg text-navy flex items-center gap-2">
              <span className="material-symbols-outlined text-blue">image</span>
              <span>Pengaturan &amp; Upload Logo Resmi Smart Tech</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbarui file visual logo Smart Tech di header, footer, mobile drawer, dan portal klien secara otomatis.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
            Live Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center p-4 bg-ice rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-slate-500 mb-2">Pratinjau Logo Aktif:</span>
            <div className="w-24 h-24 rounded-2xl bg-navy p-3 flex items-center justify-center shadow-xs">
              <img
                src={selectedLogoBase64 || `/public/images/smart-tech-logo.png?v=${logoVersion}`}
                alt="Logo Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
                }}
              />
            </div>
            {logoFileDetails && (
              <span className="text-[11px] font-mono text-blue mt-2 text-center">
                {logoFileDetails}
              </span>
            )}
          </div>

          <div className="md:col-span-8 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Pilih File Logo Baru (PNG / SVG / JPG):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue file:text-white hover:file:bg-blue-hover file:cursor-pointer cursor-pointer border border-slate-200 rounded-lg p-1 bg-white"
              />
            </div>

            {uploadFeedback && (
              <div
                className={`text-xs p-3 rounded-lg border ${
                  uploadFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {uploadFeedback.msg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveLogo}
                disabled={!selectedLogoBase64 || isUploadingLogo}
                className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUploadingLogo ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Terapkan Logo Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
