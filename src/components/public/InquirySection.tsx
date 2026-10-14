import React, { useState, useEffect } from 'react';
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
    phone: '',
    company: '',
    category: 'website',
    budget: '15-30',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (prefillCategory) {
      setFormData((prev) => ({ ...prev, category: prefillCategory }));
    }
    if (prefillMessage) {
      setFormData((prev) => ({ ...prev, message: prefillMessage }));
    }
  }, [prefillCategory, prefillMessage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        onSuccessToast(
          'Permintaan Konsultasi Diterima',
          data.message || 'Tim Technical Lead Smart Tech akan menghubungi Anda dalam 1x24 jam kerja.'
        );
      } else {
        setErrorMessage(data.message || 'Gagal mengirim formulir. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      setIsSubmitted(true);
      onSuccessToast('Permintaan Terkirim', 'Pesan Anda telah kami catat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      category: 'website',
      budget: '15-30',
      message: '',
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
                  Permintaan Berhasil Dikirim!
                </h3>
                <p className="text-neutral-muted text-sm max-w-md leading-relaxed">
                  Terima kasih atas ketertarikan Anda. Tim Technical Lead Smart Tech akan
                  mempelajari spesifikasi ide Anda dan menghubungi nomor WhatsApp Anda dalam 1x24 jam kerja.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Kirim Permintaan Konsultasi Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Budi Santoso"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Nama Perusahaan / Bisnis
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. PT Nusantara Group"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Email Bisnis *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="budi@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Kategori Kebutuhan
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    >
                      <option value="website">Website (Landing Page / Company Profile)</option>
                      <option value="ecommerce">Toko Online / E-Commerce</option>
                      <option value="webapp">Aplikasi Bisnis / Custom ERP / CRM</option>
                      <option value="marketplace">Booking Platform &amp; Marketplace</option>
                      <option value="ai-integration">AI &amp; Integrasi WhatsApp</option>
                      <option value="maintenance">Cloud DevOps &amp; Pemeliharaan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Estimasi Budget
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                    >
                      <option value="1.5-5">Rp 1.500.000 – Rp 5.000.000</option>
                      <option value="5-15">Rp 5.000.000 – Rp 15.000.000</option>
                      <option value="15-30">Rp 15.000.000 – Rp 30.000.000</option>
                      <option value="30-50">Rp 30.000.000 – Rp 50.000.000</option>
                      <option value="50+">&gt; Rp 50.000.000 (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1.5">
                    Ringkasan Ide / Kebutuhan Fitur
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ceritakan gambaran sistem yang ingin Anda bangun, masalah yang ingin diselesaikan, atau fitur utama yang diperlukan..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border bg-white text-sm text-navy focus:outline-none focus:border-blue"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-sm py-3.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                      <span>Mengirim Permintaan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Permintaan Konsultasi</span>
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
