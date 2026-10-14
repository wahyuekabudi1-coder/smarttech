import React, { useState, useEffect } from 'react';
import type { Project, Client, Milestone, ProjectTask, ProjectRevision } from '../../types';

interface ProjectsViewProps {
  mode: 'list' | 'detail' | 'new' | 'edit';
  id?: string;
  onNavigate: (path: string) => void;
  onToast: (title: string, msg: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  mode,
  id,
  onNavigate,
  onToast,
}) => {
  const [list, setList] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'revisions' | 'files'>('milestones');

  // Milestone Form
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Frontend Engineer');

  // Revision Form
  const [revTitle, setRevTitle] = useState('');
  const [revDesc, setRevDesc] = useState('');

  // Project Form
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    clientId: '',
    clientName: '',
    category: 'E-Commerce Platform',
    totalBudget: 25000000,
    deadline: '28 November 2026',
    progressPercentage: 50,
    status: 'Development',
    techStack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Docker'],
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
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

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetail = async (projId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${projId}`);
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
    fetchClients();
    if (mode === 'list') {
      fetchList();
    } else if (id && (mode === 'detail' || mode === 'edit')) {
      fetchDetail(id);
    } else {
      setLoading(false);
    }
  }, [mode, id]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !milestoneTitle.trim()) return;

    try {
      const res = await fetch(`/api/admin/projects/${selected.id}/milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: milestoneTitle,
          description: milestoneDesc,
          dueDate: milestoneDate,
          status: 'Menunggu',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setMilestoneTitle('');
        setMilestoneDesc('');
        setMilestoneDate('');
        onToast('Milestone Ditambahkan', 'Tahapan baru berhasil dicatat.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    if (!selected) return;
    const nextStatus =
      currentStatus === 'Menunggu'
        ? 'Sedang Berjalan'
        : currentStatus === 'Sedang Berjalan'
        ? 'Selesai'
        : 'Menunggu';

    const updatedMilestones = selected.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: nextStatus as any } : m
    );

    // Calculate progress percentage
    const doneCount = updatedMilestones.filter((m) => m.status === 'Selesai').length;
    const progress = Math.round((doneCount / updatedMilestones.length) * 100);

    try {
      const res = await fetch(`/api/admin/projects/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestones: updatedMilestones,
          progressPercentage: progress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        onToast('Status Diperbarui', `Milestone status: ${nextStatus} (Progres: ${progress}%)`);
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !taskTitle.trim()) return;

    try {
      const res = await fetch(`/api/admin/projects/${selected.id}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          assignee: taskAssignee,
          status: 'Todo',
          priority: 'Sedang',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setTaskTitle('');
        onToast('Tugas Ditambahkan', 'Sprint task tersimpan.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!selected) return;
    const nextStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    const updatedTasks = selected.tasks.map((t) =>
      t.id === taskId ? { ...t, status: nextStatus as any } : t
    );

    try {
      const res = await fetch(`/api/admin/projects/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleAddRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !revTitle.trim()) return;

    try {
      const res = await fetch(`/api/admin/projects/${selected.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: revTitle,
          description: revDesc,
          requestedBy: 'Technical Lead',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
        setRevTitle('');
        setRevDesc('');
        onToast('Revisi Dicatat', 'Tiket revisi teknis berhasil dibuat.');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'edit' && id ? `/api/admin/projects/${id}` : '/api/admin/projects';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onToast('Berhasil', mode === 'edit' ? 'Proyek diperbarui' : 'Proyek baru dibuat');
        onNavigate('/admin/projects');
      }
    } catch (err: any) {
      onToast('Error', err.message);
    }
  };

  const handleDelete = async (projId: string) => {
    if (!confirm('Hapus proyek ini beserta seluruh datanya?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${projId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onToast('Terhapus', 'Proyek telah dihapus');
        if (mode === 'detail') {
          onNavigate('/admin/projects');
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
            {mode === 'new' ? 'Buat Proyek Baru' : `Edit Proyek ${formData.title}`}
          </h2>
          <button
            onClick={() => onNavigate('/admin/projects')}
            className="text-xs font-mono text-neutral-muted hover:text-navy cursor-pointer"
          >
            &larr; Batal &amp; Kembali
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Pilih Klien *</label>
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => {
                  const sel = clients.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    clientId: e.target.value,
                    clientName: sel?.company || sel?.name || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="">-- Pilih Klien --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} (PIC: {c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Nama Proyek *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. OmniCommerce Headless Platform"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Kategori</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. E-Commerce Platform"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Target Deadline</label>
              <input
                type="text"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="28 November 2026"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Status Proyek</label>
              <select
                value={formData.status || 'Development'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue outline-none"
              >
                <option value="Kickoff">Kickoff</option>
                <option value="Development">Development</option>
                <option value="Testing & QA">Testing &amp; QA</option>
                <option value="UAT">UAT</option>
                <option value="Handover Selesai">Handover Selesai</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/projects')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-navy cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Proyek
            </button>
          </div>
        </form>
      </div>
    );
  }

  // DETAIL VIEW
  if (mode === 'detail' && selected) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue bg-blue-soft px-2.5 py-0.5 rounded font-semibold border border-blue-border">
                {selected.id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-soft text-blue border border-blue-border">
                {selected.status}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-navy">
              {selected.title}
            </h2>
            <span className="text-xs text-slate-500">Klien: {selected.clientName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/admin/projects/${selected.id}/edit`)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 cursor-pointer"
            >
              Edit Proyek
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 cursor-pointer"
            >
              Hapus
            </button>
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Progress & Deadline Strip */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">
              Progres Milestone Terpenuhi ({selected.milestones?.filter((m) => m.status === 'Selesai').length} /{' '}
              {selected.milestones?.length || 0})
            </span>
            <span className="font-bold text-blue text-base">{selected.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-blue h-full rounded-full transition-all duration-300"
              style={{ width: `${selected.progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-500 pt-1">
            <span>Target Handover: <strong className="text-navy">{selected.deadline}</strong></span>
            <span>Nilai Kontrak: <strong className="text-navy">Rp {(selected.totalBudget || 0).toLocaleString('id-ID')}</strong></span>
          </div>
        </div>

        {/* Project Sub-Modules Tabs */}
        <div className="flex border-b border-slate-200 gap-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`pb-3 px-4 transition-all cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-b-2 border-blue text-blue'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Milestones ({selected.milestones?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-4 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-b-2 border-blue text-blue'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Tugas Sprint ({selected.tasks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`pb-3 px-4 transition-all cursor-pointer ${
              activeTab === 'revisions'
                ? 'border-b-2 border-blue text-blue'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Revisi &amp; Feedback ({selected.revisions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 px-4 transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'border-b-2 border-blue text-blue'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Berkas Proyek ({selected.files?.length || 0})
          </button>
        </div>

        {/* Tab 1: Milestones */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <form onSubmit={handleAddMilestone} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                placeholder="Judul Milestone baru..."
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
              <input
                type="text"
                placeholder="Keterangan singkat..."
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
              <input
                type="text"
                placeholder="Tanggal, e.g. 20 Nov 2026"
                value={milestoneDate}
                onChange={(e) => setMilestoneDate(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
              >
                + Tambah Milestone
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
              {(selected.milestones || []).map((m, idx) => (
                <div key={m.id || idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.status)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                        m.status === 'Selesai'
                          ? 'bg-emerald-500 text-white'
                          : m.status === 'Sedang Berjalan'
                          ? 'bg-blue text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-blue hover:text-white'
                      }`}
                      title="Klik untuk ubah status"
                    >
                      {m.status === 'Selesai' ? '✓' : idx + 1}
                    </button>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-navy">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.status)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold cursor-pointer ${
                        m.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'Sedang Berjalan'
                          ? 'bg-blue-soft text-blue border border-blue-border'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status} (Ubah)
                    </button>
                    {m.dueDate && (
                      <span className="block font-mono text-[11px] text-slate-400 mt-1">
                        {m.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <form onSubmit={handleAddTask} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                placeholder="Nama tugas sprint baru..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white cursor-pointer"
              >
                <option value="Lead Engineer">Lead Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="QA Tester">QA Tester</option>
              </select>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
              >
                + Tambah Tugas
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
              {(selected.tasks || []).map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === 'Done'}
                      onChange={() => handleToggleTask(t.id, t.status)}
                      className="w-4 h-4 rounded text-blue cursor-pointer"
                    />
                    <span className={`text-sm ${t.status === 'Done' ? 'line-through text-slate-400' : 'text-navy font-medium'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{t.assignee}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Revisions */}
        {activeTab === 'revisions' && (
          <div className="space-y-6">
            <form onSubmit={handleAddRevision} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-navy block">Catat Tiket Revisi Baru</span>
              <input
                type="text"
                required
                placeholder="Judul revisi, contoh: Penyesuaian layout responsive tablet"
                value={revTitle}
                onChange={(e) => setRevTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              />
              <textarea
                rows={2}
                placeholder="Deskripsi detail permintaan revisi..."
                value={revDesc}
                onChange={(e) => setRevDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-xs"
                >
                  Catat Revisi
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(selected.revisions || []).map((r, i) => (
                <div key={r.id || i} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-navy">{r.title}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(r.date).toLocaleDateString('id-ID')} • Diajukan: {r.requestedBy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Files */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-navy">
              Berkas &amp; Deliverables Proyek
            </h3>
            <div className="divide-y divide-slate-100">
              {(selected.files || []).map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue text-xl">description</span>
                    <div>
                      <span className="font-semibold text-sm text-navy block">{f.name}</span>
                      <span className="text-xs font-mono text-slate-400">
                        {f.category} • {f.size}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      f.allowedForClient
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {f.allowedForClient ? 'Tampak di Portal Klien' : 'Internal Admin Only'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-navy">
            Daftar Proyek Berjalan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan sprint development, delivery milestones, dan serah terima proyek.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/projects/new')}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Buat Proyek Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ice border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">ID Proyek</th>
                <th className="p-3.5">Judul &amp; Klien</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Progres</th>
                <th className="p-3.5">Target Selesai</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada proyek terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id} className="hover:bg-ice/50 transition-colors">
                    <td className="p-3.5 font-mono text-blue font-bold whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-navy block text-sm">{p.title}</span>
                      <span className="text-[11px] text-slate-500 block">{p.clientName}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">{p.category}</td>
                    <td className="p-3.5 w-36">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                        <span>{p.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue h-full rounded-full"
                          style={{ width: `${p.progressPercentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{p.deadline}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-blue-soft text-blue font-semibold border border-blue-border">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/admin/projects/${p.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-ice hover:bg-blue hover:text-white border border-slate-200 text-xs font-semibold text-navy transition-colors cursor-pointer mr-1"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
