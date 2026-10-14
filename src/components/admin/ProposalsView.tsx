import React, { useState, useEffect } from 'react';
import type { Proposal, Client } from '../../types';

interface ProposalsViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast,
}) => {
  const [list, setList] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<Proposal>>({
    clientId: '',
    clientName: '',
    clientCompany: '',
    title: '',
    summary: '',
    scopeOfWork: ['Discovery & Analisis Kebutuhan', 'Desain UI/UX & Prototyping', 'Development Core System', 'QA & Handover'],
    deliverables: ['FSD v1.0', 'Figma Prototype', 'Source Code Git', 'Dokumentasi API'],
    techStack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Docker'],
    totalPrice: 25000000,
    paymentTerms: {
      dpPercentage: 50,
      dpAmount: 12500000,
      terminPercentage: 30,
      terminAmount: 7500000,
      settlementPercentage: 20,
      settlementAmount: 5000000,
      description: 'DP 50% saat kickoff, Termin 30% saat core release, 20% saat serah terima BAST',
    },
    timeline: '30 Hari Kerja',
    estimatedStartDate: '2026-11-01',
    status: 'Terkirim',
    validUntil: '2026-12-01',
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/proposals');
      const data = await res.json();
      if (data.success) {
        setList(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetail = async (proposalId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}`);
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        if (mode === 'edit') {
          setFormData(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    if (mode === 'list') {
      fetchList();
    } else if (id && (mode === 'detail' || mode === 'edit')) {
      fetchDetail(id);
    } else {
      setLoading(false);
    }
  }, [mode, id]);

  const handleConvertToProject = async () => {
    if (!selected) return;
    if (!confirm('Konversi proposal ini menjadi Proyek Aktif dan buat tagihan DP otomatis?')) return;

    try {
      const res = await fetch(`/api/admin/proposals/${selected.id}/convert-to-project`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Berhasil Dikonversi!', 'Proposal disetujui, proyek baru dan invoice DP telah dibuat.');
        onNavigate(`/admin/projects/${data.data.project.id}`);
      } else {
        onToast('Gagal', data.error || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'edit' && id ? `/api/admin/proposals/${id}` : '/api/admin/proposals';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Berhasil', mode === 'edit' ? 'Proposal diperbarui' : 'Proposal penawaran dibuat');
        onNavigate('/admin/proposals');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm('Hapus proposal penawaran ini?')) return;
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Proposal telah dihapus');
        if (mode === 'detail') {
          onNavigate('/admin/proposals');
        } else {
          fetchList();
        }
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  // FORM VIEW
  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-2xl text-navy">
            {mode === 'new' ? 'Buat Proposal Penawaran Harga Baru' : `Edit Proposal ${formData.title}`}
          </h2>
          <button
            onClick={() => onNavigate('/admin/proposals')}
            className="text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
          >
            &larr; Batal &amp; Kembali
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Pilih Klien Sasaran *</label>
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => {
                  const selClient = clients.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    clientId: e.target.value,
                    clientName: selClient?.name || '',
                    clientCompany: selClient?.company || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="">-- Pilih Klien Terdaftar --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} (PIC: {c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Judul Penawaran / Proyek *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. OmniCommerce Platform Revamp"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Ringkasan Eksekutif</label>
            <textarea
              rows={3}
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Jelaskan value proposition dan arsitektur inti solusi..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Total Nilai Kontrak (Rp)</label>
              <input
                type="number"
                required
                value={formData.totalPrice || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    totalPrice: val,
                    paymentTerms: {
                      dpPercentage: 50,
                      dpAmount: val * 0.5,
                      terminPercentage: 30,
                      terminAmount: val * 0.3,
                      settlementPercentage: 20,
                      settlementAmount: val * 0.2,
                      description: 'DP 50%, Termin 30%, Pelunasan 20%',
                    },
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Estimasi Timeline</label>
              <input
                type="text"
                value={formData.timeline || ''}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="Contoh: 30 Hari Kerja"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Status Penawaran</label>
              <select
                value={formData.status || 'Terkirim'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Revisi Klien">Revisi Klien</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Dikonversi ke Proyek">Dikonversi ke Proyek</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-ice rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-semibold text-navy block">
              Skema Termin Pembayaran Otomatis (50% / 30% / 20%)
            </span>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">DP Tahap 1 (50%)</span>
                <span className="font-bold text-navy">
                  Rp {(formData.totalPrice ? formData.totalPrice * 0.5 : 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Termin 2 (30%)</span>
                <span className="font-bold text-navy">
                  Rp {(formData.totalPrice ? formData.totalPrice * 0.3 : 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Pelunasan Akhir (20%)</span>
                <span className="font-bold text-navy">
                  Rp {(formData.totalPrice ? formData.totalPrice * 0.2 : 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/proposals')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-navy cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Proposal Penawaran
            </button>
          </div>
        </form>
      </div>
    );
  }

  // DETAIL VIEW
  if (mode === 'detail' && selected) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-0.5 rounded font-semibold border border-blue-border">
                {selected.id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {selected.status}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-navy">
              {selected.title}
            </h2>
            <span className="text-xs text-slate-500">
              Klien: {selected.clientCompany} ({selected.clientName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selected.status !== 'Dikonversi ke Proyek' && (
              <button
                onClick={handleConvertToProject}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Setujui &amp; Konversi ke Proyek Aktif</span>
              </button>
            )}
            <button
              onClick={() => onNavigate(`/admin/proposals/${selected.id}/edit`)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 cursor-pointer"
            >
              Hapus
            </button>
            <button
              onClick={() => onNavigate('/admin/proposals')}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">Struktur Pembiayaan &amp; Termin</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue block uppercase text-[10px] font-bold">Total Penawaran</span>
              <span className="text-navy font-extrabold text-base block mt-0.5">
                Rp {(selected.totalPrice || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">DP Kickoff (50%)</span>
              <span className="text-navy font-bold block mt-0.5">
                Rp {(selected.paymentTerms?.dpAmount || selected.totalPrice * 0.5).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Termin 2 (30%)</span>
              <span className="text-navy font-bold block mt-0.5">
                Rp {(selected.paymentTerms?.terminAmount || selected.totalPrice * 0.3).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Pelunasan BAST (20%)</span>
              <span className="text-navy font-bold block mt-0.5">
                Rp {(selected.paymentTerms?.settlementAmount || selected.totalPrice * 0.2).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Scope of Work & Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-base text-navy">Scope of Work (Lingkup Kerja)</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {(selected.scopeOfWork || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue text-base">check</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-base text-navy">Deliverables Utama</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {(selected.deliverables || []).map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-navy">
            Proposal &amp; Penawaran Harga
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen penawaran teknis, struktur biaya, dan kesepakatan termin.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/proposals/new')}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Buat Proposal</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ice border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Judul &amp; Klien</th>
                <th className="p-3.5">Nilai Penawaran</th>
                <th className="p-3.5">Timeline</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada proposal penawaran dibuat.
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id} className="hover:bg-ice/50 transition-colors">
                    <td className="p-3.5 font-mono text-blue font-bold whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-navy block text-sm">{p.title}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {p.clientCompany || p.clientName}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-navy">
                      Rp {(p.totalPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 text-slate-700">{p.timeline}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          p.status === 'Disetujui' || p.status === 'Dikonversi ke Proyek'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-soft text-blue border border-blue-border'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/admin/proposals/${p.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-ice hover:bg-blue hover:text-white border border-slate-200 text-xs font-semibold text-navy transition-colors cursor-pointer mr-1"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
