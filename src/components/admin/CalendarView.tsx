import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../../types';

interface CalendarViewProps {
  onToast: (title: string, msg: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onToast }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('Konsultasi');
  const [date, setDate] = useState('2026-11-05');
  const [time, setTime] = useState('10:00 WIB');
  const [location, setLocation] = useState('Google Meet / Online');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/calendar');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          date,
          time,
          location,
          description,
          clientName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast('Agenda Ditambahkan', 'Jadwal baru tersimpan di kalender.');
        setTitle('');
        setDescription('');
        setClientName('');
        fetchEvents();
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Hapus agenda ini?')) return;
    try {
      const res = await fetch(`/api/admin/calendar/${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Agenda kalender telah dihapus.');
        fetchEvents();
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
          Jadwal Pertemuan &amp; Milestones
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Agenda sesi discovery teknis, sprint review mingguan, dan target serah terima.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Add Event Form */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">
            Tambah Agenda Baru
          </h3>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Judul Agenda *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sesi Konsultasi Teknis &amp; FSD Review"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Tipe Agenda</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white cursor-pointer"
                >
                  <option value="Konsultasi">Konsultasi</option>
                  <option value="Meeting Teknis">Meeting Teknis</option>
                  <option value="Sprint Review">Sprint Review</option>
                  <option value="Deadline Milestone">Deadline Milestone</option>
                  <option value="Handover">Handover</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Klien Terkait</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. PT Nusantara"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Waktu</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="14:00 WIB"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Lokasi / Tautan</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Google Meet / Zoom / Kantor Klien"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Keterangan Tambahan</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan persiapan agenda..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue hover:bg-blue-hover text-white text-xs font-semibold py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan ke Kalender
            </button>
          </form>
        </div>

        {/* Right: Events List */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-navy">
            Daftar Agenda Terjadwal ({events.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada agenda dijadwalkan.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-soft text-blue border border-blue-border">
                        {ev.type}
                      </span>
                      <span className="font-heading font-bold text-sm text-navy">{ev.title}</span>
                    </div>
                    {ev.clientName && (
                      <span className="text-xs text-slate-500 block">Klien: {ev.clientName}</span>
                    )}
                    <span className="font-mono text-xs text-slate-500 block">
                      📅 {ev.date} • ⏰ {ev.time} • 📍 {ev.location}
                    </span>
                    {ev.description && (
                      <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
