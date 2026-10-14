import React, { useState } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface AdminLayoutProps {
  currentView: string;
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  logoVersion: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  breadcrumbs,
  onNavigate,
  logoVersion,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'consultations', label: 'Permintaan Konsultasi', icon: 'contact_support', path: '/admin/consultations' },
    { id: 'clients', label: 'Calon Klien & Klien', icon: 'groups', path: '/admin/clients' },
    { id: 'proposals', label: 'Proposal & Penawaran', icon: 'description', path: '/admin/proposals' },
    { id: 'projects', label: 'Proyek', icon: 'rocket_launch', path: '/admin/projects' },
    { id: 'invoices', label: 'Tagihan & Pembayaran', icon: 'receipt_long', path: '/admin/invoices' },
    { id: 'calendar', label: 'Jadwal', icon: 'calendar_today', path: '/admin/calendar' },
    { id: 'documents', label: 'Dokumen', icon: 'folder_open', path: '/admin/documents' },
    { id: 'reports', label: 'Laporan', icon: 'bar_chart', path: '/admin/reports' },
    { id: 'settings', label: 'Pengaturan', icon: 'settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-ice text-slate-800 flex flex-col md:flex-row antialiased font-body">
      {/* Mobile Header */}
      <div className="md:hidden bg-navy text-white p-4 flex items-center justify-between border-b border-blue-900 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img
            src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
            alt="Smart Tech"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
            }}
          />
          <div>
            <span className="font-bold text-base tracking-tight">Smart Tech</span>
            <span className="text-[10px] text-blue-soft block font-mono">ADMIN SYSTEM</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">
            {sidebarOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-navy text-white shrink-0 border-r border-blue-950 min-h-screen sticky top-0 h-screen z-20`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 shrink-0">
              <img
                src={`/public/images/smart-tech-logo.png?v=${logoVersion}`}
                alt="Smart Tech Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/smart-tech-logo.png?v=${logoVersion}`;
                }}
              />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg tracking-tight text-white leading-tight">
                Smart Tech
              </h1>
              <span className="font-mono text-[10px] text-blue-soft font-semibold uppercase tracking-wider">
                Admin Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items (10 Items) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView.startsWith(item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSidebarOpen(false);
                  onNavigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#0f172a]">
          <button
            onClick={() => onNavigate('/portal')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-soft hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">lock_open</span>
            <span>Buka Client Portal</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>Lihat Website Publik</span>
          </button>
          <div className="pt-2 border-t border-white/10 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white font-bold text-xs shrink-0">
              ST
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-blue-soft truncate">admin@smarttech.id</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-ice">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            {breadcrumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-slate-900 font-bold">{c.label}</span>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate(c.path)}
                      className="hover:text-blue transition-colors cursor-pointer"
                    >
                      {c.label}
                    </button>
                    <span className="text-slate-400">/</span>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/admin/consultations/new')}
              className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Permintaan Baru</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
