import React, { useState } from 'react';
import { type Language, translations } from '../../i18n';

interface InquirySectionProps {
  currentLang: Language;
  prefillCategory?: string;
  prefillMessage?: string;
  onSuccessToast: (title: string, msg: string) => void;
}

export const InquirySection: React.FC<InquirySectionProps> = ({
  currentLang,
  prefillCategory,
  prefillMessage,
  onSuccessToast,
}) => {
  const t = translations[currentLang];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    phone: '',
    address: '',
    consent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    // Validasi minimal
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Nama lengkap wajib diisi (minimal 2 karakter).');
      return;
    }

    const cleanWA = formData.whatsapp.replace(/\D/g, '');
    if (!cleanWA || cleanWA.length < 8) {
      setErrorMessage('Nomor WhatsApp wajib diisi dengan nomor valid (minimal 8 digit).');
      return;
    }

    if (!formData.consent) {
      setErrorMessage('Mohon centang persetujuan agar tim Smart Tech dapat menghubungi Anda.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          consent: formData.consent,
          demoInterest: prefillMessage || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
        onSuccessToast(
          'Data Berhasil Diterima',
          data.message || 'Tim Smart Tech akan segera menghubungi nomor WhatsApp Anda.'
        );
      } else {
        setErrorMessage(data.message || 'Gagal mengirim formulir. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Terjadi kendala jaringan saat mengirim data. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      phone: '',
      address: '',
      consent: true,
    });
    setIsSubmitted(false);
    setErrorMessage('');
  };

  return (
    <section id="kontak" className="py-20 bg-ice border-t border-neutral-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading & Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs text-blue font-semibold uppercase tracking-wider block">
              {t.contact_tag}
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-navy tracking-tight leading-tight">
              {t.contact_title}
            </h2>
            <p className="text-neutral-muted text-base leading-relaxed">
              {t.contact_subtitle}
            </p>

            <div className="space-y-4 pt-4 border-t border-neutral-border">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-border flex items-center justify-center text-blue shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-neutral-muted uppercase">
                    WhatsApp Engineering
                  </span>
                  <a
                    href="https://wa.me/6281298765432"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-navy hover:text-blue transition-colors"
                  >
                    +62 812-9876-5432
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-border flex items-center justify-center text-blue shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-xl">mark_email_read</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-neutral-muted uppercase">
                    Email Resmi
                  </span>
                  <a
                    href="mailto:halo@smarttech.id"
                    className="font-medium text-navy hover:text-blue transition-colors"
                  >
                    halo@smarttech.id
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-border flex items-center justify-center text-blue shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-xl">pin_drop</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-neutral-muted uppercase">
                    Lokasi Studio
                  </span>
                  <span className="font-medium text-navy">
                    Kuningan Cyber 2 Tower, Jakarta Selatan &amp; Global Remote
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form or Success Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-border p-6 sm:p-8 shadow-sm">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-soft border border-blue-border flex items-center justify-center text-blue">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-navy">
                  Data Berhasil Diterima!
                </h3>
                <p className="text-neutral-muted text-sm max-w-md leading-relaxed">
                  Terima kasih atas kepercayaan Anda. Tim Smart Tech akan segera menghubungi nomor WhatsApp Anda dalam 1x24 jam kerja untuk mendiskusikan kebutuhan solusi Anda.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Kirim Data Calon Pelanggan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {prefillMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-blue text-base shrink-0 mt-0.5">
                      auto_awesome
                    </span>
                    <div>
                      <span className="font-bold block text-blue-950">Referensi Minat Solusi:</span>
                      <span className="text-slate-700 leading-relaxed">{prefillMessage}</span>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Nama (wajib) */}
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                  />
                </div>

                {/* 2. Nomor WhatsApp (wajib) & 3. Nomor Telepon (opsional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Nomor Telepon <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 021-5556789"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                </div>

                {/* 4. Email (opsional) */}
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1.5">
                    Email <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Contoh: budi@perusahaan.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                  />
                </div>

                {/* 5. Alamat (opsional) */}
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1.5">
                    Alamat / Domisili <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Contoh: Jl. Sudirman No. 12, Jakarta Selatan"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                  ></textarea>
                </div>

                {/* Persetujuan Singkat */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-border text-blue focus:ring-blue"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Saya menyetujui bahwa data kontak di atas boleh digunakan oleh tim Smart Tech untuk menghubungi saya terkait kebutuhan solusi dan layanan teknologi.
                    </span>
                  </label>
                </div>

                {/* Submit button with duplicate prevention */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-sm py-3.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                      <span>Menyimpan &amp; Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Data Calon Pelanggan</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
