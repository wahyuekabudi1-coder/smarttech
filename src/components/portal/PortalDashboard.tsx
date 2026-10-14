import React, { useState, useEffect } from 'react';
import type { Project, Invoice, ProjectFile } from '../../types';

interface PortalDashboardProps {
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
  };
  initialProject: Project | null;
  accessCode: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
  onOpenSimulation: () => void;
  logoVersion: number;
}

export const PortalDashboard: React.FC<PortalDashboardProps> = ({
  client,
  initialProject,
  accessCode,
  onLogout,
  onNavigate,
  onToast,
  onOpenSimulation,
  logoVersion,
}) => {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'documents' | 'invoices' | 'feedback'>(
    'milestones'
  );

  // Feedback form
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  const fetchProjectDetails = async () => {
    if (!initialProject?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/project/${initialProject.id}`, {
        headers: {
          'x-portal-code': accessCode,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProject(data.data.project);
        setInvoices(data.data.invoices || []);
        setDocuments(data.data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [initialProject?.id, accessCode]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id || !feedbackTitle.trim()) return;

    setFeedbackSending(true);
    try {
      const res = await fetch('/api/portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: feedbackTitle,
          description: feedbackDesc,
          clientName: client.name || client.company,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Masukan Diterima', 'Catatan revisi telah dikirim ke Technical Lead Smart Tech.');
        setFeedbackTitle('');
        setFeedbackDesc('');
        fetchProjectDetails();
      } else {
        onToast('Peringatan', data.error || 'Gagal mengirim revisi.');
      }
    } catch (err: any) {
      onToast('Peringatan', err.message);
    } finally {
      setFeedbackSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-ice flex flex-col text-slate-800">
      {/* Portal Top Bar */}
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 shrink-0">
            <img
              src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
              alt="Smart Tech Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
              }}
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-white">Smart Tech</span>
            <span className="block font-mono text-[10px] text-blue-soft uppercase">Client Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-bold text-white">{client.company || client.name}</span>
            <span className="block font-mono text-[10px] text-blue-soft">Akses: {accessCode}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Keluar Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-1 space-y-6">
        {project ? (
          <>
            {/* Project Hero Card */}
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-0.5 rounded font-semibold border border-blue-border">
                      {project.id}
                    </span>
                    <span className="font-mono text-xs text-neutral-muted">{project.status}</span>
                  </div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
                    {project.title}
                  </h1>
                </div>
                <div className="text-right sm:self-center">
                  <span className="block text-xs font-mono text-neutral-muted">Estimasi Rilis</span>
                  <span className="font-heading font-bold text-base text-navy">{project.deadline}</span>
                </div>
              </div>

              {/* Progress Bar Strip */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-neutral-muted">Progres Pengembangan Keseluruhan</span>
                  <span className="text-blue font-bold">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className="bg-blue h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Tech Stack Badges */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-border">
                  <span className="text-xs font-mono text-neutral-muted self-center mr-1">
                    Arsitektur Stack:
                  </span>
                  {project.techStack.map((st, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-ice border border-neutral-border text-xs font-mono text-navy"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-border gap-2 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('milestones')}
                className={`pb-3 px-4 transition-all cursor-pointer ${
                  activeTab === 'milestones'
                    ? 'border-b-2 border-blue text-blue'
                    : 'text-neutral-muted hover:text-navy'
                }`}
              >
                Milestones &amp; Jadwal
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-3 px-4 transition-all cursor-pointer ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-blue text-blue'
                    : 'text-neutral-muted hover:text-navy'
                }`}
              >
                Dokumen &amp; Berkas Spesifikasi ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`pb-3 px-4 transition-all cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'border-b-2 border-blue text-blue'
                    : 'text-neutral-muted hover:text-navy'
                }`}
              >
                Tagihan &amp; Pembayaran ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`pb-3 px-4 transition-all cursor-pointer ${
                  activeTab === 'feedback'
                    ? 'border-b-2 border-blue text-blue'
                    : 'text-neutral-muted hover:text-navy'
                }`}
              >
                Kirim Revisi / Masukan
              </button>
            </div>

            {/* Tab: Milestones */}
            {activeTab === 'milestones' && (
              <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-lg text-navy">
                  Tahapan Pengerjaan (Milestones)
                </h3>
                <div className="space-y-4">
                  {(project.milestones || []).map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-xl border border-neutral-border bg-ice flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              m.status === 'Selesai'
                                ? 'bg-emerald-500 text-white'
                                : m.status === 'Sedang Berjalan'
                                ? 'bg-blue text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-heading font-bold text-base text-navy">
                            {m.title}
                          </span>
                        </div>
                        <p className="text-neutral-muted text-xs leading-relaxed pl-8">
                          {m.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
                            m.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'Sedang Berjalan'
                              ? 'bg-blue-soft text-blue border border-blue-border'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.status}
                        </span>
                        {m.dueDate && (
                          <span className="block font-mono text-[11px] text-neutral-muted mt-1">
                            {m.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Documents */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-lg text-navy">
                  Berkas &amp; Spesifikasi Proyek
                </h3>
                {documents.length === 0 ? (
                  <p className="text-neutral-muted text-xs">Belum ada berkas yang diunggah.</p>
                ) : (
                  <div className="divide-y divide-neutral-border">
                    {documents.map((doc, i) => (
                      <div key={doc.id || i} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-blue text-2xl">
                            description
                          </span>
                          <div>
                            <span className="font-semibold text-sm text-navy block">{doc.name}</span>
                            <span className="font-mono text-xs text-neutral-muted">
                              {doc.category} • {doc.size}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.fileUrl || '#'}
                          download={doc.name}
                          className="px-3 py-1.5 rounded-lg bg-ice hover:bg-neutral-subtle border border-neutral-border text-xs font-mono text-navy transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>Unduh</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Invoices */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-navy">
                    Daftar Tagihan &amp; Termin
                  </h3>
                  <button
                    onClick={onOpenSimulation}
                    className="text-xs font-mono text-blue hover:underline cursor-pointer"
                  >
                    Simulasi Checkout Sandbox
                  </button>
                </div>

                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl border border-neutral-border bg-ice flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue font-bold">{inv.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                              inv.status === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-navy mt-1">
                          {inv.title}
                        </h4>
                        <span className="text-xs font-mono text-neutral-muted">
                          Jatuh Tempo: {inv.dueDate || '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono text-xs text-neutral-muted block">Jumlah</span>
                          <span className="font-heading font-extrabold text-lg text-navy">
                            Rp {(inv.amount || 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {inv.status !== 'Lunas' && (
                          <a
                            href={inv.paymentUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!inv.paymentUrl || inv.paymentUrl === '#') {
                                e.preventDefault();
                                onOpenSimulation();
                              }
                            }}
                            className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                          >
                            Bayar Sekarang
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Feedback */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-lg text-navy">
                  Catat Revisi / Masukan untuk Tim Smart Tech
                </h3>
                <p className="text-neutral-muted text-xs leading-relaxed">
                  Setiap masukan dicatat langsung dalam log tiket Technical Lead kami untuk ditinjau pada sprint review terdekat.
                </p>

                <form onSubmit={handleSendFeedback} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">
                      Judul / Topik Revisi *
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="Contoh: Perubahan warna tombol CTA & copy formulir registrasi"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">
                      Detail Masukan &amp; Lampiran Link
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackDesc}
                      onChange={(e) => setFeedbackDesc(e.target.value)}
                      placeholder="Jelaskan secara spesifik halaman dan komponen yang membutuhkan penyesuaian..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSending}
                    className="bg-blue hover:bg-blue-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-70 flex items-center gap-1.5"
                  >
                    {feedbackSending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          progress_activity
                        </span>
                        <span>Mengirim Masukan...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>Kirim Masukan Revisi</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center text-neutral-muted">
            {loading ? 'Memuat data proyek...' : 'Tidak ada proyek aktif yang ditemukan untuk akun klien ini.'}
          </div>
        )}
      </main>
    </div>
  );
};
