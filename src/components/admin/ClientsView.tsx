import React, { useState, useEffect } from 'react';
import type { Client } from '../../types';

interface ClientsViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast,
}) => {
  const [list, setList] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Meeting log form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // Client form
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: 'Teknologi & Retail',
    type: 'Klien Aktif',
    address: 'Jakarta, Indonesia',
    portalAccessCode: '',
    notes: '',
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/clients${q}`);
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

  const fetchDetail = async (clientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`);
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
    if (mode === 'list') {
      fetchList();
    } else if (id && (mode === 'detail' || mode === 'edit')) {
      fetchDetail(id);
    } else {
      setLoading(false);
    }
  }, [mode, id]);

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'edit' && id ? `/api/admin/clients/${id}` : '/api/admin/clients';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Berhasil', mode === 'edit' ? 'Data klien diperbarui' : 'Klien baru didaftarkan');
        onNavigate('/admin/clients');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !meetingTitle.trim()) return;

    const meetings = [
      ...(selected.meetings || []),
      {
        id: `MTG-${Date.now()}`,
        date: new Date().toISOString(),
        title: meetingTitle,
        notes: meetingNotes,
        pic: 'Lead Engineer',
      },
    ];

    try {
      const res = await fetch(`/api/admin/clients/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetings }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setMeetingTitle('');
        setMeetingNotes('');
        onToast('Meeting Dicatat', 'Notulensi rapat teknis tersimpan.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data klien ini?')) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Klien telah dihapus');
        if (mode === 'detail') {
          onNavigate('/admin/clients');
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
            {mode === 'new' ? 'Daftarkan Klien Baru' : `Edit Klien ${formData.name}`}
          </h2>
          <button
            onClick={() => onNavigate('/admin/clients')}
            className="text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
          >
            &larr; Kembali ke Daftar
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Nama Kontak PIC *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Nama Perusahaan / Bisnis *</label>
              <input
                type="text"
                required
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">WhatsApp *</label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Industri</label>
              <input
                type="text"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Tipe Klien</label>
              <select
                value={formData.type || 'Klien Aktif'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="Calon Klien">Calon Klien</option>
                <option value="Klien Aktif">Klien Aktif</option>
                <option value="Klien Selesai">Klien Selesai</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Kode Akses Portal</label>
              <input
                type="text"
                value={formData.portalAccessCode || ''}
                onChange={(e) => setFormData({ ...formData, portalAccessCode: e.target.value.toUpperCase() })}
                placeholder="Otomatis jika kosong"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Alamat Kantor / Domisili</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Catatan Tambahan</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/clients')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-navy cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Data Klien
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
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selected.type}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-navy">
              {selected.company}
            </h2>
            <span className="text-xs text-slate-500">PIC: {selected.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/admin/clients/${selected.id}/edit`)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 cursor-pointer"
            >
              Edit Data
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 cursor-pointer"
            >
              Hapus
            </button>
            <button
              onClick={() => onNavigate('/admin/clients')}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Portal Access Token Card */}
        <div className="bg-gradient-to-r from-navy to-blue-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-blue-soft uppercase tracking-wider block">
              Kredensial Akses Client Portal
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono font-extrabold text-2xl text-white tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                {selected.portalAccessCode}
              </span>
              <span className="text-xs text-blue-soft">
                Berikan kode ini kepada klien untuk melihat progres &amp; unduh berkas di{' '}
                <code className="text-white">/portal</code>.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(selected.portalAccessCode);
              onToast('Kode Disalin', `Kode ${selected.portalAccessCode} disalin ke clipboard.`);
            }}
            className="px-4 py-2 rounded-lg bg-white text-navy font-semibold text-xs shadow-xs hover:bg-slate-100 cursor-pointer shrink-0"
          >
            Salin Kode Akses
          </button>
        </div>

        {/* Client Detail Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">Informasi Kontak &amp; Bisnis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Email Bisnis</span>
              <a href={`mailto:${selected.email}`} className="text-blue font-bold truncate block">
                {selected.email}
              </a>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">WhatsApp</span>
              <span className="text-navy font-bold block">{selected.phone}</span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Industri</span>
              <span className="text-navy font-bold block">{selected.industry}</span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Alamat</span>
              <span className="text-navy font-bold block truncate">{selected.address}</span>
            </div>
          </div>
        </div>

        {/* Meeting Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-heading font-bold text-base text-navy">
            Notulensi &amp; Riwayat Pertemuan ({selected.meetings?.length || 0})
          </h3>

          <form onSubmit={handleAddMeeting} className="p-4 bg-ice rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-semibold text-navy block">Catat Notulensi Rapat Baru</span>
            <input
              type="text"
              required
              placeholder="Topik meeting, contoh: Kickoff Meeting &amp; Review Arsitektur Database"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue"
            />
            <textarea
              rows={2}
              placeholder="Poin-poin kesepakatan, deliverables berikutnya, deadline sprint..."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-xs"
              >
                Simpan Notulensi
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(selected.meetings || []).map((m, i) => (
              <div key={m.id || i} className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-navy">{m.title}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(m.date).toLocaleDateString('id-ID')} • PIC: {m.pic}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{m.notes}</p>
              </div>
            ))}
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
            Daftar Calon Klien &amp; Klien Aktif
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database profil entitas bisnis mitra kerja Smart Tech.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/clients/new')}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Daftarkan Klien</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Cari nama PIC, perusahaan, atau industri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchList()}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-navy outline-none focus:border-blue"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">
            search
          </span>
        </div>
        <button
          onClick={fetchList}
          className="px-4 py-2 rounded-xl bg-ice hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-navy cursor-pointer"
        >
          Cari
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ice border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Perusahaan &amp; PIC</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5">Industri</th>
                <th className="p-3.5">Tipe Klien</th>
                <th className="p-3.5">Akses Portal</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada data klien terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id} className="hover:bg-ice/50 transition-colors">
                    <td className="p-3.5 font-mono text-blue font-bold whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-navy block text-sm">{c.company}</span>
                      <span className="text-[11px] text-slate-500 block">PIC: {c.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="text-slate-600 block">{c.email}</span>
                      <span className="text-emerald-600 block">{c.phone}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">{c.industry}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-navy">
                      {c.portalAccessCode}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/admin/clients/${c.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-ice hover:bg-blue hover:text-white border border-slate-200 text-xs font-semibold text-navy transition-colors cursor-pointer mr-1"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
