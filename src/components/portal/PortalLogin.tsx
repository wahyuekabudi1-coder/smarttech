import React, { useState } from 'react';

interface PortalLoginProps {
  onLoginSuccess: (client: any, activeProject: any, accessCode: string) => void;
  onNavigate: (path: string) => void;
  logoVersion: number;
}

export const PortalLogin: React.FC<PortalLoginProps> = ({
  onLoginSuccess,
  onNavigate,
  logoVersion,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    const code = (codeToUse || accessCode).trim();
    if (!code) {
      setError('Masukkan kode akses portal klien Anda.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.client, data.activeProject, code);
      } else {
        setError(data.error || 'Kode akses portal tidak valid.');
      }
    } catch (err: any) {
      setError('Koneksi server gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setAccessCode('PTN-8821');
    handleSubmit(null as any, 'PTN-8821');
  };

  return (
    <div className="min-h-screen bg-ice flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-border p-8 shadow-md">
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center p-2.5 mx-auto shadow-sm">
            <img
              src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
              alt="Smart Tech Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
              }}
            />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-navy">
            Smart Tech Client Portal
          </h2>
          <p className="text-neutral-muted text-xs leading-relaxed">
            Akses privat untuk memantau progres proyek, unduh berkas spesifikasi, dan pelunasan termin resmi.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-navy uppercase mb-1.5">
              Kode Akses Klien
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Contoh: PTN-8821"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-border font-mono text-base uppercase text-navy focus:outline-none focus:border-blue tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue hover:bg-blue-hover text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Portal</span>
                <span className="material-symbols-outlined text-base">lock_open</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-border space-y-3">
          <button
            onClick={handleQuickDemo}
            className="w-full py-2.5 rounded-lg bg-blue-soft border border-blue-border text-blue text-xs font-mono font-semibold hover:bg-blue hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>Gunakan Kode Demo (PTN-8821)</span>
          </button>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-muted pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-navy hover:underline cursor-pointer"
            >
              &larr; Kembali ke Website
            </button>
            <button
              onClick={() => onNavigate('/admin/dashboard')}
              className="text-blue hover:underline cursor-pointer"
            >
              Login Administrator &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
