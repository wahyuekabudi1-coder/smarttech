import React, { useState, useEffect } from 'react';
import type { DocumentItem } from '../../types';

interface DocumentsViewProps {
  onToast: (title: string, msg: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onToast }) => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentItem['type']>('FSD & SRS');
  const [clientName, setClientName] = useState('');
  const [size, setSize] = useState('2.4 MB');
  const [version, setVersion] = useState('v1.0');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/documents');
      const data = await res.json();
      if (data.success) {
        setDocs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          clientName,
          size,
          version,
          fileUrl: '#',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast('Dokumen Diarsipkan', 'Dokumen berhasil tersimpan di repositori.');
        setTitle('');
        setClientName('');
        fetchDocs();
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Hapus dokumen ini dari arsip?')) return;
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Dokumen telah dihapus.');
        fetchDocs();
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-navy">
          Repositori Dokumen Legal &amp; Teknis
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Arsip FSD, NDA resmi, Kontrak Kerja Sama (PKS), diagram arsitektur, dan Berita Acara Serah Terima (BAST).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Add Form */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">
            Arsipkan Dokumen Baru
          </h3>
          <form onSubmit={handleAddDoc} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Judul Dokumen *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FSD_OmniCommerce_Architecture_v1.0.pdf"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Kategori Dokumen</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white cursor-pointer"
              >
                <option value="FSD & SRS">FSD &amp; SRS</option>
                <option value="Kontrak / PKS">Kontrak / PKS</option>
                <option value="NDA">NDA</option>
                <option value="Arsitektur Teknis">Arsitektur Teknis</option>
                <option value="BAST Serah Terima">BAST Serah Terima</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Nama Klien</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. PT Nusantara"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Versi</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Ukuran File</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="2.4 MB"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue hover:bg-blue-hover text-white text-xs font-semibold py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan ke Repositori
            </button>
          </form>
        </div>

        {/* Right: Document List */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">
            Daftar Dokumen Tersimpan ({docs.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {docs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada dokumen tersimpan.</p>
            ) : (
              docs.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue text-2xl">
                      description
                    </span>
                    <div>
                      <span className="font-semibold text-sm text-navy block">{d.title}</span>
                      <span className="font-mono text-xs text-slate-400">
                        {d.type} • {d.clientName} • {d.version} ({d.size})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToast('Info', `Mengunduh berkas ${d.title}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-ice hover:bg-blue hover:text-white border border-slate-200 text-xs font-mono text-navy transition-colors cursor-pointer"
                    >
                      Unduh
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
