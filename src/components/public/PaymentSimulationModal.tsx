import React, { useState } from 'react';

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentSimulationModal: React.FC<PaymentSimulationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // Call simulation endpoint or acknowledge sandbox status
      await new Promise((r) => setTimeout(r, 600));
      onSuccess();
      onClose();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-1 rounded border border-blue-border font-semibold">
              Simulasi Payment Gateway
            </span>
            <button onClick={onClose} className="text-neutral-muted hover:text-navy cursor-pointer">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <h3 className="font-heading font-bold text-2xl text-navy">Checkout Pembayaran</h3>
          <p className="text-neutral-muted text-sm leading-relaxed">
            Invoice <strong>INV-2026-003</strong> — Pelunasan Akhir (20%) Handover OmniCommerce Platform.
          </p>

          <div className="bg-ice p-4 rounded-xl border border-neutral-border space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-muted">Total Tagihan:</span>
              <span className="text-blue font-bold text-base">Rp 5.000.000</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-muted">Metode Pembayaran:</span>
              <span className="text-navy font-semibold">QRIS / Virtual Account / Transfer Bank</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-muted">Status Keamanan:</span>
              <span className="text-navy font-semibold">ArtoPay Gateway (TLS 1.3 Webhook)</span>
            </div>
          </div>

          <div className="p-3 bg-blue-soft rounded-lg border border-blue-border text-xs text-blue flex items-center gap-2">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Simulasi sandbox aktif: webhook akan otomatis memverifikasi status pelunasan.</span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="bg-blue hover:bg-blue-hover text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer disabled:opacity-75"
            >
              {isSimulating ? 'Memproses Simulasi...' : 'Simulasikan Pelunasan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
