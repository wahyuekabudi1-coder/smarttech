import React, { useState, useEffect } from 'react';
import type { Invoice, Project, Client } from '../../types';

interface InvoicesViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
  onOpenSimulation?: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast,
}) => {
  const [list, setList] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [formData, setFormData] = useState<Partial<Invoice>>({
    clientId: '',
    clientName: '',
    projectId: '',
    projectTitle: '',
    title: '',
    type: 'Termin Berkala',
    amount: 5000000,
    dueDate: '2026-11-28',
    status: 'Menunggu Pembayaran',
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invoices');
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

  const fetchProjectsAndClients = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/clients'),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      if (pData.success) setProjects(pData.data || []);
      if (cData.success) setClients(cData.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetail = async (invId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invId}`);
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
    fetchProjectsAndClients();
    if (mode === 'list') {
      fetchList();
    } else if (id && (mode === 'detail' || mode === 'edit')) {
      fetchDetail(id);
    } else {
      setLoading(false);
    }
  }, [mode, id]);

  const handleMarkPaid = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/invoices/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Lunas',
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Transfer Bank Manual / Verifikasi Internal',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        onToast('Status Diperbarui', 'Invoice telah ditandai lunas.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'edit' && id ? `/api/admin/invoices/${id}` : '/api/admin/invoices';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Berhasil', mode === 'edit' ? 'Invoice diperbarui' : 'Invoice baru dibuat');
        onNavigate('/admin/invoices');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDelete = async (invId: string) => {
    if (!confirm('Hapus tagihan ini?')) return;
    try {
      const res = await fetch(`/api/admin/invoices/${invId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Invoice telah dihapus');
        if (mode === 'detail') {
          onNavigate('/admin/invoices');
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
            {mode === 'new' ? 'Terbitkan Tagihan Baru' : `Edit Tagihan ${formData.title}`}
          </h2>
          <button
            onClick={() => onNavigate('/admin/invoices')}
            className="text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
          >
            &larr; Batal &amp; Kembali
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Pilih Klien *</label>
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => {
                  const sel = clients.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    clientId: e.target.value,
                    clientName: sel?.company || sel?.name || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="">-- Pilih Klien --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} (PIC: {c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Pilih Proyek Terkait</label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => {
                  const sel = projects.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    projectTitle: sel?.title || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="">-- Pilih Proyek --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Judul Tagihan / Termin *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. DP Tahap 1 (50%) - Kickoff"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Tipe Tagihan</label>
              <select
                value={formData.type || 'Termin Berkala'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="DP (Down Payment)">DP (Down Payment)</option>
                <option value="Termin Berkala">Termin Berkala</option>
                <option value="Pelunasan Akhir">Pelunasan Akhir</option>
                <option value="Maintenance Bulanan">Maintenance Bulanan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Jumlah Nominal (Rp) *</label>
              <input
                type="number"
                required
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Jatuh Tempo</label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Status Pembayaran</label>
              <select
                value={formData.status || 'Menunggu Pembayaran'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                <option value="Lunas">Lunas</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/invoices')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-navy cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Tagihan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // DETAIL VIEW
  if (mode === 'detail' && selected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-0.5 rounded font-semibold border border-blue-border">
                {selected.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  selected.status === 'Lunas'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selected.status}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-navy">
              {selected.title}
            </h2>
            <span className="text-xs text-slate-500">
              Klien: {selected.clientName} {selected.projectTitle && `• Proyek: ${selected.projectTitle}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selected.status !== 'Lunas' && (
              <button
                onClick={handleMarkPaid}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Tandai Lunas
              </button>
            )}
            <button
              onClick={() => onNavigate(`/admin/invoices/${selected.id}/edit`)}
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
              onClick={() => onNavigate('/admin/invoices')}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Nominal Tagihan</span>
              <span className="text-navy font-extrabold text-lg block mt-0.5">
                Rp {(selected.amount || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Tipe Termin</span>
              <span className="text-navy font-bold block mt-0.5">{selected.type}</span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Jatuh Tempo</span>
              <span className="text-navy font-bold block mt-0.5">{selected.dueDate || '-'}</span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Metode Pembayaran</span>
              <span className="text-navy font-bold block mt-0.5">
                {selected.paymentMethod || 'Transfer Bank Manual'}
              </span>
            </div>
          </div>

          {/* Pencatatan Tagihan Manual */}
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-navy uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-blue">account_balance</span>
                  <span>Metode Tagihan Administratif (Transfer Bank Manual)</span>
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Tagihan diterbitkan sebagai berkas invoice resmi. Pembayaran dilakukan klien melalui transfer ke rekening perusahaan dan diverifikasi manual oleh tim Finance/Admin.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selected.status !== 'Lunas' && (
                  <button
                    onClick={handleMarkPaid}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Tandai Lunas Manual</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 font-mono">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-400">Rekening Tujuan:</span>
                <span className="text-navy font-bold">BCA 8820-192-888 a.n. PT SMART TECH REKAYASA DIGITAL</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-400">Status Administrasi:</span>
                <span className="text-blue font-semibold">
                  {selected.status === 'Lunas' ? 'Lunas (Verifikasi Manual Diterima)' : 'Menunggu Konfirmasi Transfer Klien'}
                </span>
              </div>
              {(selected.paidAt || selected.paymentDate) && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-400">Tanggal Pelunasan:</span>
                  <span className="text-slate-700">{new Date(selected.paidAt || selected.paymentDate || '').toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
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
            Tagihan &amp; Pembayaran Termin
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan invoice DP, termin milestone, pelunasan, dan pencatatan tagihan administratif manual.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/invoices/new')}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Terbitkan Tagihan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ice border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">ID Tagihan</th>
                <th className="p-3.5">Judul &amp; Klien</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Jatuh Tempo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Metode Tagihan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada tagihan dibuat.
                  </td>
                </tr>
              ) : (
                list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-ice/50 transition-colors">
                    <td className="p-3.5 font-mono text-blue font-bold whitespace-nowrap">
                      {inv.id}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-navy block text-sm">{inv.title}</span>
                      <span className="text-[11px] text-slate-500 block">{inv.clientName}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-navy">
                      Rp {(inv.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{inv.dueDate || '-'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          inv.status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      {inv.paymentMethod || 'Transfer Bank Manual'}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/admin/invoices/${inv.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-ice hover:bg-blue hover:text-white border border-slate-200 text-xs font-semibold text-navy transition-colors cursor-pointer mr-1"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
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
