import React, { useState, useEffect } from 'react';
import type { Lead, LeadStatus, LeadNote } from '../../types';

interface LeadsViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string, type?: 'success' | 'info' | 'error') => void;
}

const MARKETING_TEAM = [
  'Belum Ditugaskan',
  'Rian Pratama',
  'Sarah Wijaya',
  'Budi Haryanto',
  'Aditya Pratama (Technical Lead)',
  'Dimas Wicaksono'
];

const LEAD_STATUSES: LeadStatus[] = [
  'Baru',
  'Belum Dihubungi',
  'Sudah Dihubungi',
  'Tertarik',
  'Follow-up Lagi',
  'Tidak Tertarik',
  'Menjadi Klien'
];

const getStatusBadgeClass = (status: LeadStatus) => {
  switch (status) {
    case 'Baru':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Belum Dihubungi':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Sudah Dihubungi':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Tertarik':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Follow-up Lagi':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Menjadi Klien':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Tidak Tertarik':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const LeadsView: React.FC<LeadsViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [marketingFilter, setMarketingFilter] = useState('Semua');

  // Follow-up note form in detail view
  const [noteType, setNoteType] = useState<LeadNote['type']>('WhatsApp');
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Marketing');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status & Assignment Quick Updates in Detail View
  const [detailStatus, setDetailStatus] = useState<LeadStatus>('Baru');
  const [detailMarketing, setDetailMarketing] = useState('Belum Ditugaskan');
  const [detailNextFollowUp, setDetailNextFollowUp] = useState('');
  const [savingDetailChanges, setSavingDetailChanges] = useState(false);
  const [convertingToConsultation, setConvertingToConsultation] = useState(false);

  // New Lead Form State
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    assignedMarketing: 'Belum Ditugaskan',
    status: 'Baru' as LeadStatus,
    initialNote: ''
  });
  const [submittingNewLead, setSubmittingNewLead] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'Semua') params.append('status', statusFilter);
      if (marketingFilter !== 'Semua') params.append('marketing', marketingFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (err: any) {
      console.error(err);
      onToast('Error', 'Gagal memuat daftar leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetail = async (leadId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const lead: Lead = data.data;
        setSelectedLead(lead);
        setDetailStatus(lead.status);
        setDetailMarketing(lead.assignedMarketing || 'Belum Ditugaskan');
        setDetailNextFollowUp(lead.nextFollowUpDate || '');
      } else {
        onToast('Error', 'Data lead tidak ditemukan', 'error');
        onNavigate('/admin/leads');
      }
    } catch (err: any) {
      console.error(err);
      onToast('Error', 'Gagal memuat detail lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'list') {
      fetchLeads();
    } else if (id && (mode === 'detail' || mode === 'edit')) {
      fetchLeadDetail(id);
    } else {
      setLoading(false);
    }
  }, [mode, id, statusFilter, marketingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  // Add Follow-up Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteContent.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: noteAuthor,
          type: noteType,
          content: noteContent.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast('Berhasil', 'Catatan follow-up berhasil dicatat');
        setNoteContent('');
        fetchLeadDetail(id);
      } else {
        onToast('Peringatan', data.error || 'Gagal menyimpan catatan', 'error');
      }
    } catch (err: any) {
      onToast('Error', err.message, 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Save Lead Status, PIC, & Next Follow-up
  const handleSaveDetailUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || savingDetailChanges) return;

    setSavingDetailChanges(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: detailStatus,
          assignedMarketing: detailMarketing,
          nextFollowUpDate: detailNextFollowUp
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast('Berhasil', 'Status dan penugasan lead berhasil disimpan');
        fetchLeadDetail(id);
      } else {
        onToast('Peringatan', data.error || 'Gagal menyimpan perubahan', 'error');
      }
    } catch (err: any) {
      onToast('Error', err.message, 'error');
    } finally {
      setSavingDetailChanges(false);
    }
  };

  // Convert Lead to Consultation
  const handleConvertToConsultation = async () => {
    if (!id || convertingToConsultation) return;

    setConvertingToConsultation(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/convert-to-consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast('Berhasil Dikonversi', data.message || 'Lead berhasil diteruskan ke Konsultasi');
        fetchLeadDetail(id);
      } else {
        onToast('Peringatan', data.error || 'Gagal meneruskan ke konsultasi', 'error');
      }
    } catch (err: any) {
      onToast('Error', err.message, 'error');
    } finally {
      setConvertingToConsultation(false);
    }
  };

  // Submit New Lead Form
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.name.trim() || !newLeadData.whatsapp.trim() || submittingNewLead) return;

    setSubmittingNewLead(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadData.name.trim(),
          whatsapp: newLeadData.whatsapp.trim(),
          phone: newLeadData.phone.trim(),
          email: newLeadData.email.trim(),
          address: newLeadData.address.trim(),
          assignedMarketing: newLeadData.assignedMarketing,
          status: newLeadData.status,
          source: 'Manual',
          notes: newLeadData.initialNote.trim()
            ? [
                {
                  id: `NOTE-${Date.now()}`,
                  date: new Date().toISOString(),
                  author: 'Admin',
                  type: 'Catatan',
                  content: newLeadData.initialNote.trim()
                }
              ]
            : []
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast('Berhasil', 'Lead baru berhasil ditambahkan');
        onNavigate('/admin/leads');
      } else {
        onToast('Peringatan', data.error || 'Gagal membuat lead baru', 'error');
      }
    } catch (err: any) {
      onToast('Error', err.message, 'error');
    } finally {
      setSubmittingNewLead(false);
    }
  };

  // ==========================================================================
  // VIEW: NEW LEAD (Full Page Route)
  // ==========================================================================
  if (mode === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-border">
          <div>
            <h2 className="font-heading font-bold text-2xl text-navy">
              Tambah Lead Calon Pelanggan Baru
            </h2>
            <p className="text-neutral-muted text-xs">
              Pendaftaran data prospek lead secara manual ke dalam CRM Smart Tech
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin/leads')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Daftar</span>
          </button>
        </div>

        <form onSubmit={handleCreateLead} className="bg-white rounded-xl border border-neutral-border p-6 shadow-xs max-w-3xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newLeadData.name}
                onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                placeholder="Contoh: Hendra Wijaya"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={newLeadData.whatsapp}
                onChange={(e) => setNewLeadData({ ...newLeadData, whatsapp: e.target.value })}
                placeholder="Contoh: 08123456789"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Nomor Telepon Kantor/Rumah (Opsional)
              </label>
              <input
                type="tel"
                value={newLeadData.phone}
                onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                placeholder="Contoh: 021-5551234"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Email (Opsional)
              </label>
              <input
                type="email"
                value={newLeadData.email}
                onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                placeholder="hendra@perusahaan.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Alamat / Domisili / Perusahaan (Opsional)
            </label>
            <textarea
              rows={2}
              value={newLeadData.address}
              onChange={(e) => setNewLeadData({ ...newLeadData, address: e.target.value })}
              placeholder="Contoh: Gedung Artha Graha Lt. 10, Jakarta Selatan"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                PIC Marketing yang Ditugaskan
              </label>
              <select
                value={newLeadData.assignedMarketing}
                onChange={(e) => setNewLeadData({ ...newLeadData, assignedMarketing: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue bg-white"
              >
                {MARKETING_TEAM.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Status Awal
              </label>
              <select
                value={newLeadData.status}
                onChange={(e) => setNewLeadData({ ...newLeadData, status: e.target.value as LeadStatus })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue bg-white"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Catatan Awal Prospek
            </label>
            <textarea
              rows={3}
              value={newLeadData.initialNote}
              onChange={(e) => setNewLeadData({ ...newLeadData, initialNote: e.target.value })}
              placeholder="Kebutuhan sistem, ringkasan kontak pertama, atau informasi relevan..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="pt-3 border-t border-neutral-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/leads')}
              className="px-4 py-2 rounded-lg border border-neutral-border text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingNewLead}
              className="px-5 py-2 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>{submittingNewLead ? 'Menyimpan...' : 'Simpan Data Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: DETAIL LEAD (Full Page Route)
  // ==========================================================================
  if (mode === 'detail' && selectedLead) {
    const cleanWA = selectedLead.whatsapp ? selectedLead.whatsapp.replace(/[^0-9]/g, '') : '';
    const waLink = cleanWA ? `https://wa.me/${cleanWA.startsWith('0') ? '62' + cleanWA.slice(1) : cleanWA}` : '#';

    return (
      <div className="space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/admin/leads')}
              className="p-1.5 rounded-lg border border-neutral-border bg-white text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors"
              title="Kembali ke Daftar Leads"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-2xl text-navy">
                  {selectedLead.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
              </div>
              <span className="font-mono text-xs text-neutral-muted">
                ID: {selectedLead.id} • Sumber: {selectedLead.source} • Masuk: {new Date(selectedLead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Call */}
            {cleanWA && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                <span>Hubungi via WhatsApp</span>
              </a>
            )}

            {/* Business Integration: Convert to Consultation */}
            {selectedLead.consultationId ? (
              <button
                type="button"
                onClick={() => onNavigate(`/admin/consultations/${selectedLead.consultationId}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Lihat Konsultasi ({selectedLead.consultationId})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConvertToConsultation}
                disabled={convertingToConsultation}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>{convertingToConsultation ? 'Mengonversi...' : 'Teruskan ke Konsultasi'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Profile & Status Assignment */}
          <div className="lg:col-span-5 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-blue text-base">person</span>
                <span>Informasi Calon Pelanggan</span>
              </h3>

              <div className="divide-y divide-neutral-border text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Nama Lengkap</span>
                  <span className="font-semibold text-navy">{selectedLead.name}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Nomor WhatsApp</span>
                  <a href={waLink} target="_blank" rel="noreferrer" className="font-mono text-emerald-700 font-semibold hover:underline">
                    {selectedLead.whatsapp}
                  </a>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Nomor Telepon</span>
                  <span className="font-mono text-slate-700">{selectedLead.phone || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Email</span>
                  <span className="text-slate-700">{selectedLead.email || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Alamat / Domisili</span>
                  <span className="text-slate-700 text-right max-w-[200px]">{selectedLead.address || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-neutral-muted">Persetujuan Kontak</span>
                  <span className="text-emerald-700 font-medium">Disetujui ✓</span>
                </div>
              </div>
            </div>

            {/* Management & Status Update Form */}
            <form onSubmit={handleSaveDetailUpdates} className="bg-white rounded-xl border border-neutral-border p-5 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-blue text-base">manage_accounts</span>
                <span>Pengaturan &amp; Status Prospek</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-navy mb-1">
                    Status Lead Saat Ini
                  </label>
                  <select
                    value={detailStatus}
                    onChange={(e) => setDetailStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-white text-navy focus:outline-none focus:border-blue text-xs"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy mb-1">
                    PIC Marketing yang Ditugaskan
                  </label>
                  <select
                    value={detailMarketing}
                    onChange={(e) => setDetailMarketing(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-white text-navy focus:outline-none focus:border-blue text-xs"
                  >
                    {MARKETING_TEAM.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy mb-1">
                    Tanggal Follow-up Berikutnya
                  </label>
                  <input
                    type="date"
                    value={detailNextFollowUp}
                    onChange={(e) => setDetailNextFollowUp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-white text-navy focus:outline-none focus:border-blue text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingDetailChanges}
                  className="w-full mt-2 py-2.5 rounded-lg bg-navy hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{savingDetailChanges ? 'Menyimpan...' : 'Simpan Perubahan Status'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (7 cols): Follow-up Notes & Activity History */}
          <div className="lg:col-span-7 space-y-6">
            {/* Add Follow-up Note Form */}
            <form onSubmit={handleAddNote} className="bg-white rounded-xl border border-neutral-border p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue text-base">rate_review</span>
                  <span>Catat Hasil Telepon atau WhatsApp</span>
                </h3>
                <span className="text-[11px] text-neutral-muted font-mono">
                  Riwayat Tersimpan Permanen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-navy mb-1">Kanal Interaksi</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as LeadNote['type'])}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-white text-navy text-xs"
                  >
                    <option value="WhatsApp">WhatsApp Chat</option>
                    <option value="Telepon">Panggilan Telepon</option>
                    <option value="Catatan">Catatan Internal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-navy mb-1">Marketing / Petugas</label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Nama Marketing"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border text-navy text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy text-xs mb-1">Isi Hasil Percakapan</label>
                <textarea
                  rows={3}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tuliskan poin-poin hasil diskusi: respon calon pelanggan, kebutuhan fitur, kendala, atau kesepakatan waktu follow-up..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-border text-navy text-xs focus:outline-none focus:border-blue"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="px-4 py-2 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>{submittingNote ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                </button>
              </div>
            </form>

            {/* List of Follow-up Notes */}
            <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-navy flex items-center justify-between">
                <span>Catatan Follow-up ({selectedLead.notes?.length || 0})</span>
              </h3>

              {!selectedLead.notes || selectedLead.notes.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-muted">
                  Belum ada catatan follow-up. Silakan tambahkan hasil panggilan atau pesan pertama di atas.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedLead.notes.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded font-mono font-medium ${
                            note.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                            note.type === 'Telepon' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {note.type}
                          </span>
                          <span className="font-semibold text-navy">{note.author}</span>
                        </div>
                        <span className="text-neutral-muted font-mono">
                          {new Date(note.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History Timeline */}
            <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-navy">
                Riwayat Aktivitas &amp; Log
              </h3>
              <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3 text-xs">
                {selectedLead.activities?.map((act, idx) => (
                  <div key={idx} className="relative py-1">
                    <div className="absolute -left-[19px] top-2.5 w-2.5 h-2.5 rounded-full bg-blue border-2 border-white"></div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-muted">
                      <span className="font-medium text-navy">{act.action} — {act.user}</span>
                      <span className="font-mono">{new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {act.note && <p className="text-slate-600 mt-0.5">{act.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: LIST OF LEADS (Default Full Page)
  // ==========================================================================
  const totalLeads = leads.length;
  const uncontactedLeads = leads.filter(l => l.status === 'Baru' || l.status === 'Belum Dihubungi').length;
  const contactedLeads = leads.filter(l => l.status === 'Sudah Dihubungi' || l.status === 'Follow-up Lagi' || l.status === 'Tertarik').length;
  const convertedLeads = leads.filter(l => l.status === 'Menjadi Klien').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <h2 className="font-heading font-bold text-2xl text-navy">
            Leads Management
          </h2>
          <p className="text-neutral-muted text-xs">
            Manajemen prospek calon pelanggan, tindak lanjut telepon/WhatsApp, dan konversi ke alur konsultasi
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/admin/leads/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>Tambah Lead Baru</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-border shadow-xs">
          <span className="text-neutral-muted text-[11px] font-mono block mb-1">TOTAL LEADS</span>
          <span className="font-heading font-bold text-2xl text-navy">{totalLeads}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-amber-800 text-[11px] font-mono block mb-1">BELUM DIHUBUNGI</span>
          <span className="font-heading font-bold text-2xl text-amber-600">{uncontactedLeads}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-border/80 bg-blue-soft/30 shadow-xs">
          <span className="text-blue text-[11px] font-mono block mb-1">DALAM PROSES FOLLOW-UP</span>
          <span className="font-heading font-bold text-2xl text-blue">{contactedLeads}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-emerald-800 text-[11px] font-mono block mb-1">MENJADI KLIEN</span>
          <span className="font-heading font-bold text-2xl text-emerald-600">{convertedLeads}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-border shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama calon pelanggan, nomor WhatsApp, atau telepon..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-border text-xs text-navy bg-white focus:outline-none focus:border-blue"
            >
              <option value="Semua">Semua Status</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={marketingFilter}
              onChange={(e) => setMarketingFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-border text-xs text-navy bg-white focus:outline-none focus:border-blue"
            >
              <option value="Semua">Semua Marketing</option>
              {MARKETING_TEAM.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-navy hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Table / List View */}
      <div className="bg-white rounded-xl border border-neutral-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-muted flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            <span>Memuat data leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <span className="material-symbols-outlined text-2xl">person_search</span>
            </div>
            <h4 className="font-semibold text-navy text-sm">Belum Ada Data Lead</h4>
            <p className="text-neutral-muted text-xs max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'Semua' || marketingFilter !== 'Semua'
                ? 'Tidak ada data lead yang cocok dengan filter pencarian Anda.'
                : 'Belum ada prospek lead yang terdaftar. Data dari formulir website akan muncul di sini secara otomatis.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-neutral-border text-neutral-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Calon Pelanggan</th>
                  <th className="px-4 py-3">Kontak WhatsApp / HP</th>
                  <th className="px-4 py-3">Tanggal Masuk</th>
                  <th className="px-4 py-3">Status Lead</th>
                  <th className="px-4 py-3">PIC Marketing</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {leads.map((lead) => {
                  const cleanWA = lead.whatsapp ? lead.whatsapp.replace(/[^0-9]/g, '') : '';
                  const waUrl = cleanWA ? `https://wa.me/${cleanWA.startsWith('0') ? '62' + cleanWA.slice(1) : cleanWA}` : '#';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy text-sm">{lead.name}</div>
                        {lead.address && (
                          <div className="text-[11px] text-neutral-muted truncate max-w-[200px]">
                            {lead.address}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {lead.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline inline-flex items-center gap-1"
                            title="Buka WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                            <span>{lead.whatsapp}</span>
                          </a>
                        </div>
                        {lead.email && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {lead.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-muted whitespace-nowrap">
                        <div>
                          {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {lead.source}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {lead.assignedMarketing || 'Belum Ditugaskan'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {lead.nextFollowUpDate ? (
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-mono">
                            {lead.nextFollowUpDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/admin/leads/${lead.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Detail &amp; Kelola</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
