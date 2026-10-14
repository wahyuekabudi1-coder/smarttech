import React, { useState, useEffect } from 'react';
import type { Language } from './i18n';
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { EngineeringBanner } from './components/public/EngineeringBanner';
import { ServicesSection } from './components/public/ServicesSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { PricingSection } from './components/public/PricingSection';
import { AboutSection } from './components/public/AboutSection';
import { InquirySection } from './components/public/InquirySection';
import { Footer } from './components/public/Footer';
import { ServiceDetailModal } from './components/public/ServiceDetailModal';
import { PortfolioDetailModal } from './components/public/PortfolioDetailModal';
import { DemoShowcaseSection } from './components/public/DemoShowcaseSection';
import { DemoWebsiteView } from './components/demo/DemoWebsiteView';
import { ProcessStepsSection } from './components/public/ProcessStepsSection';
import { TestimonialsSection } from './components/public/TestimonialsSection';

import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardView } from './components/admin/DashboardView';
import { LeadsView } from './components/admin/LeadsView';
import { ConsultationsView } from './components/admin/ConsultationsView';
import { ClientsView } from './components/admin/ClientsView';
import { ProposalsView } from './components/admin/ProposalsView';
import { ProjectsView } from './components/admin/ProjectsView';
import { InvoicesView } from './components/admin/InvoicesView';
import { CalendarView } from './components/admin/CalendarView';
import { DocumentsView } from './components/admin/DocumentsView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';

import { PortalLogin } from './components/portal/PortalLogin';
import { PortalDashboard } from './components/portal/PortalDashboard';

import { Toast, type ToastData } from './components/common/Toast';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [currentLang, setCurrentLang] = useState<Language>('id');
  const [logoVersion, setLogoVersion] = useState<number>(Date.now());

  // Public Modals
  const [activeServiceKey, setActiveServiceKey] = useState<string | null>(null);
  const [activeProjectKey, setActiveProjectKey] = useState<string | null>(null);

  // Inquiry Form pre-fills
  const [prefillCategory, setPrefillCategory] = useState<string>('website');
  const [prefillMessage, setPrefillMessage] = useState<string>('');

  // Portal State
  const [portalClient, setPortalClient] = useState<any>(null);
  const [portalProject, setPortalProject] = useState<any>(null);
  const [portalAccessCode, setPortalAccessCode] = useState<string>('');

  // Toast Queue
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectPackage = (packageName: string, category: string) => {
    setPrefillCategory(category);
    setPrefillMessage(`Saya tertarik dengan paket ${packageName}. Mohon informasi estimasi jadwal pengerjaan dan detail scope.`);
    navigate('/konsultasi');
  };

  // Route Parsing
  const cleanPath = currentPath.replace(/\/$/, '') || '/';

  // 1. Client Portal
  if (cleanPath === '/portal' || cleanPath === '/portal/login') {
    if (portalClient) {
      return (
        <>
          <PortalDashboard
            client={portalClient}
            initialProject={portalProject}
            accessCode={portalAccessCode}
            onLogout={() => {
              setPortalClient(null);
              setPortalProject(null);
              setPortalAccessCode('');
              navigate('/portal');
            }}
            onNavigate={navigate}
            onToast={addToast}
            logoVersion={logoVersion}
          />
          <Toast toasts={toasts} onDismiss={dismissToast} />
        </>
      );
    }
    return (
      <>
        <PortalLogin
          onLoginSuccess={(client, activeProj, code) => {
            setPortalClient(client);
            setPortalProject(activeProj);
            setPortalAccessCode(code);
            addToast('Login Berhasil', `Selamat datang, ${client.name || client.company}!`);
          }}
          onNavigate={navigate}
          logoVersion={logoVersion}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 1.5 Interactive Business Demo Websites (Zero Modal Full Page)
  if (cleanPath.startsWith('/demo')) {
    const parts = cleanPath.split('/').filter(Boolean); // e.g. ['demo', 'toko-baju', 'checkout']
    const slug = parts[1] || 'toko-baju';
    const subView = parts[2] || '';

    return (
      <>
        <DemoWebsiteView
          slug={slug}
          subView={subView}
          onNavigate={navigate}
          onConsultFullStack={(demoSlug, businessName, categoryTitle) => {
            setPrefillCategory('website');
            setPrefillMessage(`Tertarik mengembangkan website full-stack seperti Demo: ${categoryTitle} (${businessName}) dengan integrasi transaksi & database otomatis.`);
            navigate('/konsultasi');
          }}
          logoVersion={logoVersion}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 2. Admin Workspace
  if (cleanPath.startsWith('/admin')) {
    let adminView = 'dashboard';
    let breadcrumbs = [{ label: 'Admin', path: '/admin/dashboard' }];
    let subContent = null;

    if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') {
      adminView = 'dashboard';
      breadcrumbs.push({ label: 'Dashboard', path: '/admin/dashboard' });
      subContent = (
        <DashboardView
          onNavigate={navigate}
          onLogoUpdated={(v) => {
            setLogoVersion(v);
            addToast('Logo Diperbarui', 'Logo resmi Smart Tech baru berhasil diterapkan.');
          }}
          logoVersion={logoVersion}
        />
      );
    } else if (cleanPath === '/admin/leads') {
      adminView = 'leads';
      breadcrumbs.push({ label: 'Leads', path: '/admin/leads' });
      subContent = <LeadsView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/leads/new') {
      adminView = 'leads';
      breadcrumbs.push({ label: 'Leads', path: '/admin/leads' }, { label: 'Baru', path: cleanPath });
      subContent = <LeadsView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/leads\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/leads\/([^/]+)\/edit$/)!;
      adminView = 'leads';
      breadcrumbs.push({ label: 'Leads', path: '/admin/leads' }, { label: 'Edit', path: cleanPath });
      subContent = <LeadsView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/leads\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/leads\/([^/]+)$/)!;
      adminView = 'leads';
      breadcrumbs.push({ label: 'Leads', path: '/admin/leads' }, { label: match[1], path: cleanPath });
      subContent = <LeadsView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/consultations') {
      adminView = 'consultations';
      breadcrumbs.push({ label: 'Permintaan Konsultasi', path: '/admin/consultations' });
      subContent = <ConsultationsView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/consultations/new') {
      adminView = 'consultations';
      breadcrumbs.push({ label: 'Permintaan Konsultasi', path: '/admin/consultations' }, { label: 'Baru', path: cleanPath });
      subContent = <ConsultationsView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/consultations\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/consultations\/([^/]+)\/edit$/)!;
      adminView = 'consultations';
      breadcrumbs.push({ label: 'Permintaan Konsultasi', path: '/admin/consultations' }, { label: 'Edit', path: cleanPath });
      subContent = <ConsultationsView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/consultations\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/consultations\/([^/]+)$/)!;
      adminView = 'consultations';
      breadcrumbs.push({ label: 'Permintaan Konsultasi', path: '/admin/consultations' }, { label: match[1], path: cleanPath });
      subContent = <ConsultationsView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/clients') {
      adminView = 'clients';
      breadcrumbs.push({ label: 'Calon Klien & Klien', path: '/admin/clients' });
      subContent = <ClientsView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/clients/new') {
      adminView = 'clients';
      breadcrumbs.push({ label: 'Calon Klien & Klien', path: '/admin/clients' }, { label: 'Baru', path: cleanPath });
      subContent = <ClientsView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/clients\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/clients\/([^/]+)\/edit$/)!;
      adminView = 'clients';
      breadcrumbs.push({ label: 'Calon Klien & Klien', path: '/admin/clients' }, { label: 'Edit', path: cleanPath });
      subContent = <ClientsView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/clients\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/clients\/([^/]+)$/)!;
      adminView = 'clients';
      breadcrumbs.push({ label: 'Calon Klien & Klien', path: '/admin/clients' }, { label: match[1], path: cleanPath });
      subContent = <ClientsView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/proposals') {
      adminView = 'proposals';
      breadcrumbs.push({ label: 'Proposal & Penawaran', path: '/admin/proposals' });
      subContent = <ProposalsView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/proposals/new') {
      adminView = 'proposals';
      breadcrumbs.push({ label: 'Proposal & Penawaran', path: '/admin/proposals' }, { label: 'Baru', path: cleanPath });
      subContent = <ProposalsView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/proposals\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/proposals\/([^/]+)\/edit$/)!;
      adminView = 'proposals';
      breadcrumbs.push({ label: 'Proposal & Penawaran', path: '/admin/proposals' }, { label: 'Edit', path: cleanPath });
      subContent = <ProposalsView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/proposals\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/proposals\/([^/]+)$/)!;
      adminView = 'proposals';
      breadcrumbs.push({ label: 'Proposal & Penawaran', path: '/admin/proposals' }, { label: match[1], path: cleanPath });
      subContent = <ProposalsView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/projects') {
      adminView = 'projects';
      breadcrumbs.push({ label: 'Proyek', path: '/admin/projects' });
      subContent = <ProjectsView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/projects/new') {
      adminView = 'projects';
      breadcrumbs.push({ label: 'Proyek', path: '/admin/projects' }, { label: 'Baru', path: cleanPath });
      subContent = <ProjectsView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/projects\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/projects\/([^/]+)\/edit$/)!;
      adminView = 'projects';
      breadcrumbs.push({ label: 'Proyek', path: '/admin/projects' }, { label: 'Edit', path: cleanPath });
      subContent = <ProjectsView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/projects\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/projects\/([^/]+)$/)!;
      adminView = 'projects';
      breadcrumbs.push({ label: 'Proyek', path: '/admin/projects' }, { label: match[1], path: cleanPath });
      subContent = <ProjectsView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/invoices') {
      adminView = 'invoices';
      breadcrumbs.push({ label: 'Tagihan & Pembayaran', path: '/admin/invoices' });
      subContent = <InvoicesView mode="list" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/invoices/new') {
      adminView = 'invoices';
      breadcrumbs.push({ label: 'Tagihan & Pembayaran', path: '/admin/invoices' }, { label: 'Baru', path: cleanPath });
      subContent = <InvoicesView mode="new" onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/invoices\/([^/]+)\/edit$/)) {
      const match = cleanPath.match(/^\/admin\/invoices\/([^/]+)\/edit$/)!;
      adminView = 'invoices';
      breadcrumbs.push({ label: 'Tagihan & Pembayaran', path: '/admin/invoices' }, { label: 'Edit', path: cleanPath });
      subContent = <InvoicesView mode="edit" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath.match(/^\/admin\/invoices\/([^/]+)$/)) {
      const match = cleanPath.match(/^\/admin\/invoices\/([^/]+)$/)!;
      adminView = 'invoices';
      breadcrumbs.push({ label: 'Tagihan & Pembayaran', path: '/admin/invoices' }, { label: match[1], path: cleanPath });
      subContent = <InvoicesView mode="detail" id={match[1]} onNavigate={navigate} onToast={addToast} />;
    } else if (cleanPath === '/admin/calendar') {
      adminView = 'calendar';
      breadcrumbs.push({ label: 'Jadwal', path: '/admin/calendar' });
      subContent = <CalendarView onToast={addToast} />;
    } else if (cleanPath === '/admin/documents') {
      adminView = 'documents';
      breadcrumbs.push({ label: 'Dokumen', path: '/admin/documents' });
      subContent = <DocumentsView onToast={addToast} />;
    } else if (cleanPath === '/admin/reports') {
      adminView = 'reports';
      breadcrumbs.push({ label: 'Laporan', path: '/admin/reports' });
      subContent = <ReportsView />;
    } else if (cleanPath === '/admin/settings') {
      adminView = 'settings';
      breadcrumbs.push({ label: 'Pengaturan', path: '/admin/settings' });
      subContent = <SettingsView onToast={addToast} />;
    }

    return (
      <>
        <AdminLayout
          currentView={adminView}
          breadcrumbs={breadcrumbs}
          onNavigate={navigate}
          logoVersion={logoVersion}
        >
          {subContent}
        </AdminLayout>
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 3. Dedicated Public Route: Portfolio
  if (cleanPath === '/portfolio') {
    return (
      <div className="bg-ice text-navy font-body antialiased min-h-screen selection:bg-blue-soft selection:text-blue">
        <Header
          currentLang={currentLang}
          onSetLang={setCurrentLang}
          onNavigate={navigate}
          logoVersion={logoVersion}
        />
        <main className="pt-24 pb-16">
          <PortfolioSection
            currentLang={currentLang}
            onOpenProject={(key) => setActiveProjectKey(key)}
          />
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12">
            <div className="bg-navy rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-blue-soft font-semibold block mb-1">
                  Arsitektur Siap Kustom
                </span>
                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
                  Tertarik Membangun Sistem Serupa?
                </h3>
                <p className="text-slate-300 text-sm mt-1 max-w-xl">
                  Diskusikan kebutuhan sistem digital bisnis Anda bersama Technical Lead Smart Tech. Kami siapkan estimasi arsitektur, timeline, dan transparansi ruang lingkup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPrefillCategory('webapp');
                  setPrefillMessage('Tertarik mendiskusikan implementasi sistem serupa dengan arsitektur portfolio Smart Tech.');
                  navigate('/konsultasi');
                }}
                className="inline-flex items-center gap-2 bg-blue hover:bg-blue-hover text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>Konsultasikan Kebutuhan Anda</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
        <Footer onNavigate={navigate} logoVersion={logoVersion} />

        <PortfolioDetailModal
          projectKey={activeProjectKey}
          onClose={() => setActiveProjectKey(null)}
          onDiscussArchitecture={() => {
            setActiveProjectKey(null);
            setPrefillCategory('webapp');
            setPrefillMessage('Tertarik mendiskusikan implementasi sistem serupa dengan arsitektur portfolio Smart Tech.');
            navigate('/konsultasi');
          }}
        />

        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // 4. Dedicated Public Route: About / Tentang Kami
  if (cleanPath === '/about') {
    return (
      <div className="bg-ice text-navy font-body antialiased min-h-screen selection:bg-blue-soft selection:text-blue">
        <Header
          currentLang={currentLang}
          onSetLang={setCurrentLang}
          onNavigate={navigate}
          logoVersion={logoVersion}
        />
        <main className="pt-24 pb-16">
          <AboutSection
            currentLang={currentLang}
            onConsult={() => {
              setPrefillCategory('website');
              navigate('/konsultasi');
            }}
          />
        </main>
        <Footer onNavigate={navigate} logoVersion={logoVersion} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // 5. Dedicated Public Route: Konsultasi / Form Leads
  if (cleanPath === '/konsultasi' || cleanPath === '/kontak') {
    return (
      <div className="bg-ice text-navy font-body antialiased min-h-screen selection:bg-blue-soft selection:text-blue">
        <Header
          currentLang={currentLang}
          onSetLang={setCurrentLang}
          onNavigate={navigate}
          logoVersion={logoVersion}
        />
        <main className="pt-24 pb-16">
          <InquirySection
            currentLang={currentLang}
            prefillCategory={prefillCategory}
            prefillMessage={prefillMessage}
            onSuccessToast={addToast}
          />
        </main>
        <Footer onNavigate={navigate} logoVersion={logoVersion} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // 6. Default: Public Homepage
  // Urutan Wajib:
  // 1. Header / menu navigasi
  // 2. Hero utama yang sudah ada
  // 3. Bagian kepercayaan: "100% Hak Milik", "NDA Resmi", "Sah Terjamin"
  // 4. Inspirasi Website Bisnis Siap Coba
  // 5. Enam Solusi Digital Bisnis Anda
  // 6. Bagian empat langkah mudah dari ide hingga rilis
  // 7. Pilihan Paket (tepat setelah empat langkah)
  // 8. Testimoni pelanggan (carousel otomatis)
  // 9. Footer
  return (
    <div className="bg-ice text-navy font-body antialiased min-h-screen selection:bg-blue-soft selection:text-blue">
      {/* 1. Header */}
      <Header
        currentLang={currentLang}
        onSetLang={setCurrentLang}
        onNavigate={navigate}
        logoVersion={logoVersion}
      />

      {/* 2. Hero */}
      <Hero
        currentLang={currentLang}
        onNavigate={navigate}
      />

      {/* 3. Kepercayaan (100% Hak Milik, NDA Resmi, Sah Terjamin) */}
      <EngineeringBanner />

      {/* 4. Inspirasi Website Bisnis Siap Coba */}
      <DemoShowcaseSection
        currentLang={currentLang}
        onNavigate={navigate}
      />

      {/* 5. Enam Solusi Digital Bisnis Anda */}
      <ServicesSection
        currentLang={currentLang}
        onOpenDetail={(key) => setActiveServiceKey(key)}
      />

      {/* 6. Empat langkah mudah dari ide hingga rilis */}
      <ProcessStepsSection currentLang={currentLang} />

      {/* 7. Pilihan Paket (tepat setelah section empat langkah) */}
      <PricingSection
        currentLang={currentLang}
        onSelectPackage={handleSelectPackage}
      />

      {/* 8. Testimoni pelanggan — carousel otomatis */}
      <TestimonialsSection />

      {/* 9. Footer */}
      <Footer onNavigate={navigate} logoVersion={logoVersion} />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        serviceKey={activeServiceKey}
        onClose={() => setActiveServiceKey(null)}
        onSelectService={(title, cat) => handleSelectPackage(title, cat)}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
