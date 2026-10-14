import React, { useState, useEffect } from 'react';
import type { Consultation } from '../../types';

interface ConsultationsViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
}

export const ConsultationsView: React.FC<ConsultationsViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast,
}) => {
  const [list, setList] = useState<Consultation[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<Consultation>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    category: 'website',
    categoryName: 'Website (Landing Page / Company Profile)',
    budget: '15-30',
    budgetRange: 'Rp 15.000.000 – Rp 30.000.000',
    priority: 'Sedang',
    message: '',
    assignedTo: 'Lead Engineer',
    status: 'Baru Masuk',
  });

  // Note for status update
  const [statusNote, setStatusNote] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (statusFilter) q.append('status', statusFilter);
      if (priorityFilter) q.append('priority', priorityFilter);

      const res = await fetch(`/api/admin/consultations?${q.toString()}`);
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

  const fetchDetail = async (consultationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}`);
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setConsultationNotes(data.data.consultationNotes || '');
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
  }, [mode, id, statusFilter, priorityFilter]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/consultations/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status diubah ke ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setStatusNote('');
        onToast('Status Diperbarui', `Permintaan kini berstatus ${newStatus}`);
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/consultations/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationNotes,
          note: 'Memperbarui catatan konsultasi teknis',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        onToast('Catatan Disimpan', 'Catatan konsultasi teknis berhasil diperbarui.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'edit' && id ? `/api/admin/consultations/${id}` : '/api/admin/consultations';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Berhasil', mode === 'edit' ? 'Permintaan diperbarui' : 'Permintaan baru ditambahkan');
        onNavigate('/admin/consultations');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDelete = async (consultationId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus permintaan ini?')) return;
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Permintaan konsultasi telah dihapus');
        if (mode === 'detail') {
          onNavigate('/admin/consultations');
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

  // FORM VIEW (New / Edit)
  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-2xl text-navy">
            {mode === 'new' ? 'Tambah Permintaan Konsultasi Baru' : `Edit Permintaan ${id}`}
          </h2>
          <button
            onClick={() => onNavigate('/admin/consultations')}
            className="text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
          >
            &larr; Kembali ke Daftar
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Nama Klien *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Perusahaan</label>
              <input
                type="text"
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
              <label className="block text-xs font-semibold text-navy mb-1">Kategori</label>
              <select
                value={formData.category || 'website'}
                onChange={(e) => {
                  const cat = e.target.value;
                  const names: Record<string, string> = {
                    website: 'Website (Landing Page / Company Profile)',
                    ecommerce: 'Toko Online / E-Commerce',
                    webapp: 'Aplikasi Bisnis / Internal Tool',
                    marketplace: 'Booking & Marketplace',
                    'ai-integration': 'AI & Integrasi Sistem',
                    maintenance: 'Deployment & Maintenance Cloud',
                  };
                  setFormData({
                    ...formData,
                    category: cat,
                    categoryName: names[cat] || cat,
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="website">Website</option>
                <option value="ecommerce">Toko Online</option>
                <option value="webapp">Aplikasi Bisnis</option>
                <option value="marketplace">Booking &amp; Marketplace</option>
                <option value="ai-integration">AI &amp; Integrasi</option>
                <option value="maintenance">Maintenance Cloud</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Budget</label>
              <select
                value={formData.budget || '15-30'}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value, budgetRange: `Rp ${e.target.value} Juta` })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="1.5-5">Rp 1.5 - 5 Juta</option>
                <option value="5-15">Rp 5 - 15 Juta</option>
                <option value="15-30">Rp 15 - 30 Juta</option>
                <option value="30-50">Rp 30 - 50 Juta</option>
                <option value="50+">&gt; Rp 50 Juta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Prioritas</label>
              <select
                value={formData.priority || 'Sedang'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Deskripsi Pesan</label>
            <textarea
              rows={4}
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/consultations')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-navy cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Permintaan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // DETAIL VIEW
  if (mode === 'detail' && selected) {
    const statuses = [
      'Baru Masuk',
      'Ditinjau',
      'Dihubungi',
      'Jadwal Konsultasi',
      'Proposal Dibuat',
      'Menunggu Persetujuan',
      'Kesepakatan',
      'Proyek Dimulai',
      'Ditunda',
      'Ditolak',
      'Ditutup',
    ];

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-0.5 rounded font-semibold border border-blue-border">
                {selected.id}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Masuk: {new Date(selected.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-navy">
              {selected.name} {selected.company && `— ${selected.company}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/admin/consultations/${selected.id}/edit`)}
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
              onClick={() => onNavigate('/admin/consultations')}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Status Lifecycle Updater */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Status Siklus Saat Ini:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-soft text-blue border border-blue-border">
                  {selected.status}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Prioritas: <strong className="text-navy">{selected.priority}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selected.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-navy bg-white focus:border-blue outline-none cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    Ubah Status: {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Email Bisnis</span>
              <a href={`mailto:${selected.email}`} className="text-blue font-bold truncate block">
                {selected.email}
              </a>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">WhatsApp</span>
              <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold block">
                {selected.phone}
              </a>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Kategori</span>
              <span className="text-navy font-bold block">{selected.categoryName || selected.category}</span>
            </div>
            <div className="p-3 bg-ice rounded-xl border border-slate-100">
              <span className="text-slate-400 block uppercase text-[10px]">Budget</span>
              <span className="text-navy font-bold block">{selected.budgetRange || selected.budget}</span>
            </div>
          </div>

          {/* Inquiry Message */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-slate-400 block uppercase mb-1">
              Catatan Permintaan Awal dari Form:
            </span>
            <p className="text-sm text-navy whitespace-pre-line leading-relaxed">
              {selected.message || '-'}
            </p>
          </div>
        </div>

        {/* Technical Lead Notes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-navy">
              Catatan Hasil Diskusi Teknis &amp; FSD
            </h3>
            <textarea
              rows={5}
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Tulis ringkasan hasil call/meeting dengan calon klien, arsitektur yang direkomendasikan, atau jadwal follow up..."
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:border-blue outline-none"
            ></textarea>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">
                PIC: {selected.assignedTo || 'Lead Engineer'}
              </span>
              <button
                onClick={handleSaveNotes}
                className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>

          {/* History Timeline */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-navy">
              Riwayat Aktivitas ({selected.history?.length || 0})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(selected.history || []).map((h, i) => (
                <div key={i} className="text-xs border-l-2 border-blue pl-3 py-1 space-y-0.5">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>{h.date ? new Date(h.date).toLocaleDateString('id-ID') : '-'}</span>
                    <span className="text-navy font-semibold">{h.user}</span>
                  </div>
                  <span className="font-semibold text-blue block">{h.status}</span>
                  <p className="text-slate-600">{h.note}</p>
                </div>
              ))}
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
            Permintaan Konsultasi Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola prospek dan kualifikasi kebutuhan calon klien Smart Tech.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/consultations/new')}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Input Permintaan</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Cari nama, perusahaan, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchList()}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-navy outline-none focus:border-blue"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">
            search
          </span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl text-xs text-navy bg-white outline-none cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="Baru Masuk">Baru Masuk</option>
          <option value="Ditinjau">Ditinjau</option>
          <option value="Dihubungi">Dihubungi</option>
          <option value="Jadwal Konsultasi">Jadwal Konsultasi</option>
          <option value="Proposal Dibuat">Proposal Dibuat</option>
          <option value="Kesepakatan">Kesepakatan</option>
          <option value="Proyek Dimulai">Proyek Dimulai</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl text-xs text-navy bg-white outline-none cursor-pointer"
        >
          <option value="">Semua Prioritas</option>
          <option value="Tinggi">Tinggi</option>
          <option value="Sedang">Sedang</option>
          <option value="Rendah">Rendah</option>
        </select>

        <button
          onClick={fetchList}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-ice hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-navy cursor-pointer"
        >
          Terapkan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ice border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Klien &amp; Kontak</th>
                <th className="p-3.5">Kebutuhan</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Prioritas</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada permintaan konsultasi yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id} className="hover:bg-ice/50 transition-colors">
                    <td className="p-3.5 font-mono text-blue font-bold whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-navy block text-sm">{c.name}</span>
                      {c.company && (
                        <span className="text-[11px] text-slate-500 block">{c.company}</span>
                      )}
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        {c.phone} • {c.email}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {c.categoryName || c.category}
                    </td>
                    <td className="p-3.5 font-mono text-navy font-semibold">
                      {c.budgetRange || c.budget}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          c.priority === 'Tinggi'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.priority === 'Sedang'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-blue-soft text-blue font-semibold border border-blue-border">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/admin/consultations/${c.id}`)}
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
