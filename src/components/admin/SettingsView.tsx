import React, { useState, useEffect } from 'react';
import type { ActivityLog } from '../../types';

interface SettingsViewProps {
  onToast: (title: string, msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onToast }) => {
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettingsAndLogs = async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/activity-logs'),
      ]);
      const sData = await sRes.json();
      const lData = await lRes.json();
      if (sData.success) setSettings(sData.data);
      if (lData.success) setLogs(lData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        onToast('Pengaturan Disimpan', 'Konfigurasi sistem berhasil diperbarui.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-navy">
          Pengaturan Sistem &amp; Log Audit
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi profil studio, integrasi payment gateway, dan audit aktivitas.
        </p>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-heading font-bold text-base text-navy pb-3 border-b border-slate-100">
          Profil Perusahaan &amp; Rekening Bank
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Nama Studio</label>
            <input
              type="text"
              value={settings?.companyName || 'Smart Tech Technology Studio'}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Email Resmi</label>
            <input
              type="email"
              value={settings?.email || 'halo@smarttech.id'}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Bank Penerima</label>
            <input
              type="text"
              value={settings?.bankName || 'BCA (Bank Central Asia)'}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Nomor Rekening</label>
            <input
              type="text"
              value={settings?.bankAccount || '8820-192-888'}
              onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Atas Nama</label>
            <input
              type="text"
              value={settings?.bankHolder || 'PT SMART TECH REKAYASA DIGITAL'}
              onChange={(e) => setSettings({ ...settings, bankHolder: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
            />
          </div>
        </div>

        {/* Payment Gateway Box */}
        <div className="p-4 bg-ice rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue text-sm">lock</span>
              <span>Integrasi Gateway ArtoPay</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sandbox Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Payment link terintegrasi dengan webhook HMAC-SHA256 untuk verifikasi otomatis status pelunasan invoice termin klien.
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {/* Activity Logs */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-navy">
          Audit Aktivitas Sistem ({logs.length})
        </h3>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-navy">{log.action}</span>
                <p className="text-slate-500 mt-0.5">{log.details}</p>
              </div>
              <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                <span className="block text-navy font-semibold">{log.user}</span>
                <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
