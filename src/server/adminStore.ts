import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'admin_store.json');

// ============================================================================
// DATA INTERFACES
// ============================================================================

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  module: 'Consultation' | 'Client' | 'Proposal' | 'Project' | 'Invoice' | 'Settings' | 'Portal';
  action: string;
  details: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  category: string;
  categoryName: string;
  budget: string;
  budgetRange: string;
  message: string;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  status:
    | 'Baru Masuk'
    | 'Ditinjau'
    | 'Dihubungi'
    | 'Jadwal Konsultasi'
    | 'Proposal Dibuat'
    | 'Menunggu Persetujuan'
    | 'Kesepakatan'
    | 'Proyek Dimulai'
    | 'Ditunda'
    | 'Ditolak'
    | 'Ditutup';
  consultationDate?: string;
  consultationNotes?: string;
  assignedTo: string;
  clientId?: string;
  proposalId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{ date: string; user: string; status: string; note: string }>;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  type: 'Calon Klien' | 'Klien Aktif' | 'Klien Selesai';
  address: string;
  portalAccessCode: string;
  totalValue: number;
  projectsCount: number;
  notes: string;
  meetings: Array<{ id: string; date: string; title: string; notes: string; pic: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  consultationId?: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  title: string;
  summary: string;
  scopeOfWork: string[];
  deliverables: string[];
  techStack: string[];
  totalPrice: number;
  paymentTerms: {
    dpPercentage: number;
    dpAmount: number;
    terminPercentage: number;
    terminAmount: number;
    settlementPercentage: number;
    settlementAmount: number;
    description: string;
  };
  timeline: string;
  estimatedStartDate: string;
  status: 'Draft' | 'Terkirim' | 'Revisi Klien' | 'Disetujui' | 'Ditolak' | 'Dikonversi ke Proyek';
  revisionsCount: number;
  revisionsHistory: Array<{ version: number; date: string; changeNote: string; price: number; user: string }>;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  phase: number;
  status: 'Menunggu' | 'Sedang Berjalan' | 'Review Klien' | 'Selesai';
  dueDate: string;
  desc: string;
  deliverables: string[];
  approvedByClient?: boolean;
}

export interface ProjectTask {
  id: string;
  milestoneId: string;
  title: string;
  assignee: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  dueDate: string;
}

export interface ProjectRevision {
  id: string;
  submittedDate: string;
  requestedBy: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  resolutionNote?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  category: 'Contract' | 'FSD / Spec' | 'Design' | 'Source / Deployment';
  size: string;
  url: string;
  uploadedAt: string;
  allowedForClient: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  proposalId?: string;
  pic: string;
  teamMembers: Array<{ name: string; role: string }>;
  startDate: string;
  deadline: string;
  progressPercentage: number;
  status:
    | 'Kickoff'
    | 'Pengerjaan'
    | 'Review Klien'
    | 'Revisi'
    | 'Pelunasan'
    | 'Serah Terima'
    | 'Selesai';
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  revisions: ProjectRevision[];
  files: ProjectFile[];
  activityLog: Array<{ date: string; user: string; action: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId?: string;
  projectName?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  title: string;
  type: 'DP (Uang Muka)' | 'Termin Berkala' | 'Pelunasan Akhir' | 'Tagihan Custom';
  amount: number;
  dueDate: string;
  status: 'Menunggu Pembayaran' | 'Lunas' | 'Jatuh Tempo' | 'Dibatalkan';
  paymentUrl?: string;
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Konsultasi' | 'Milestone' | 'Review Klien' | 'Deadline' | 'Kickoff Proyek';
  date: string;
  time: string;
  clientName: string;
  relatedId?: string;
  relatedType?: 'consultation' | 'project';
  status: 'Terkonfirmasi' | 'Menunggu' | 'Selesai';
  location: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'Kontrak Resmi' | 'FSD Spesifikasi' | 'SRS Teknis' | 'Berita Acara (BAST)' | 'Invoice';
  relatedProject?: string;
  relatedClient: string;
  fileSize: string;
  accessLevel: 'Internal Admin' | 'Dibagikan ke Klien';
  url: string;
  updatedAt: string;
}

export interface SystemSettings {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  studioAddress: string;
  websiteUrl: string;
  bankInfo: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
  artopaySandbox: boolean;
  defaultDpPercentage: number;
  teamMembers: Array<{ name: string; role: string; email: string }>;
}

export interface AdminStoreData {
  consultations: Consultation[];
  clients: Client[];
  proposals: Proposal[];
  projects: Project[];
  invoices: Invoice[];
  calendarEvents: CalendarEvent[];
  documents: DocumentItem[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
}

// ============================================================================
// ADMIN STORE IMPLEMENTATION
// ============================================================================

export class AdminStore {
  private data: AdminStoreData;

  constructor() {
    this.data = this.loadOrInit();
  }

  private loadOrInit(): AdminStoreData {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('[AdminStore] Error reading store, re-initializing seed data:', err);
      }
    }

    const initial = this.getSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: AdminStoreData) {
    try {
      const target = dataToSave || this.data;
      fs.writeFileSync(STORE_FILE, JSON.stringify(target, null, 2), 'utf8');
    } catch (err) {
      console.error('[AdminStore] Error saving store to disk:', err);
    }
  }

  public logActivity(user: string, module: ActivityLog['module'], action: string, details: string) {
    const entry: ActivityLog = {
      id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user,
      module,
      action,
      details
    };
    this.data.activityLogs.unshift(entry);
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 200);
    }
    this.saveData();
    return entry;
  }

  // ==========================================================================
  // DASHBOARD KPI & FOLLOW-UPS
  // ==========================================================================
  public getDashboardSummary() {
    const totalConsultations = this.data.consultations.length;
    const newConsultations = this.data.consultations.filter(c => c.status === 'Baru Masuk' || c.status === 'Ditinjau').length;
    const activeProjects = this.data.projects.filter(p => p.status !== 'Selesai').length;
    const pendingProposals = this.data.proposals.filter(p => p.status === 'Terkirim' || p.status === 'Revisi Klien').length;
    
    // Revenue calculations
    let totalRevenue = 0;
    let pendingInvoicesAmount = 0;
    for (const inv of this.data.invoices) {
      if (inv.status === 'Lunas') {
        totalRevenue += inv.amount;
      } else if (inv.status === 'Menunggu Pembayaran' || inv.status === 'Jatuh Tempo') {
        pendingInvoicesAmount += inv.amount;
      }
    }

    // Follow-ups needed (urgent tasks, pending proposals, upcoming calendar)
    const followUps: Array<{ id: string; type: string; title: string; client: string; priority: string; url: string; time: string }> = [];

    // Follow up 1: Baru Masuk Consultations
    for (const c of this.data.consultations.filter(x => x.status === 'Baru Masuk' || x.priority === 'Tinggi').slice(0, 3)) {
      followUps.push({
        id: c.id,
        type: 'Permintaan Konsultasi',
        title: `Tinjau & Hubungi: ${c.categoryName}`,
        client: `${c.name} (${c.company || 'Personal'})`,
        priority: c.priority,
        url: `/admin/consultations/${c.id}`,
        time: c.createdAt
      });
    }

    // Follow up 2: Pending Invoices
    for (const inv of this.data.invoices.filter(i => i.status === 'Menunggu Pembayaran').slice(0, 2)) {
      followUps.push({
        id: inv.id,
        type: 'Tagihan Pembayaran',
        title: `Menunggu Pembayaran: ${inv.title}`,
        client: inv.clientName,
        priority: 'Tinggi',
        url: `/admin/invoices/${inv.id}`,
        time: inv.dueDate
      });
    }

    // Follow up 3: Proposals awaiting decision
    for (const prop of this.data.proposals.filter(p => p.status === 'Terkirim').slice(0, 2)) {
      followUps.push({
        id: prop.id,
        type: 'Proposal Penawaran',
        title: `Menunggu Persetujuan Klien: ${prop.title}`,
        client: prop.clientCompany || prop.clientName,
        priority: 'Sedang',
        url: `/admin/proposals/${prop.id}`,
        time: prop.updatedAt
      });
    }

    return {
      kpi: {
        totalConsultations,
        newConsultations,
        activeProjects,
        pendingProposals,
        totalRevenue,
        pendingInvoicesAmount,
        totalClients: this.data.clients.length
      },
      followUps,
      recentActivity: this.data.activityLogs.slice(0, 8),
      recentConsultations: this.data.consultations.slice(0, 5),
      activeProjectsList: this.data.projects.filter(p => p.status !== 'Selesai').slice(0, 4)
    };
  }

  // ==========================================================================
  // CONSULTATIONS CRUD & WORKFLOW
  // ==========================================================================
  public getAllConsultations(query?: { status?: string; search?: string; priority?: string }) {
    let list = [...this.data.consultations];
    if (query?.status && query.status !== 'all') {
      list = list.filter(c => c.status === query.status);
    }
    if (query?.priority && query.priority !== 'all') {
      list = list.filter(c => c.priority === query.priority);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getConsultationById(id: string) {
    return this.data.consultations.find(c => c.id === id);
  }

  public createConsultation(payload: Partial<Consultation>, actor = 'Admin') {
    const id = `CNS-2026-${String(this.data.consultations.length + 1).padStart(3, '0')}`;
    const item: Consultation = {
      id,
      name: payload.name || 'Calon Klien',
      email: payload.email || '',
      phone: payload.phone || '',
      company: payload.company || '',
      category: payload.category || 'website',
      categoryName: payload.categoryName || 'Website & Landing Page',
      budget: payload.budget || '15-30',
      budgetRange: payload.budgetRange || 'Rp 15.000.000 – Rp 30.000.000',
      message: payload.message || '-',
      priority: payload.priority || 'Sedang',
      status: payload.status || 'Baru Masuk',
      consultationDate: payload.consultationDate,
      consultationNotes: payload.consultationNotes || '',
      assignedTo: payload.assignedTo || 'Aditya Pratama (Technical Lead)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          date: new Date().toISOString(),
          user: actor,
          status: payload.status || 'Baru Masuk',
          note: 'Permintaan konsultasi berhasil didaftarkan ke sistem.'
        }
      ]
    };

    this.data.consultations.unshift(item);
    this.logActivity(actor, 'Consultation', 'Buat Konsultasi Baru', `${item.id}: ${item.name} (${item.categoryName})`);
    this.saveData();
    return item;
  }

  public updateConsultation(id: string, payload: Partial<Consultation>, actor = 'Admin') {
    const idx = this.data.consultations.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const existing = this.data.consultations[idx];
    const prevStatus = existing.status;
    const newStatus = payload.status || existing.status;

    const history = [...existing.history];
    if (newStatus !== prevStatus) {
      history.unshift({
        date: new Date().toISOString(),
        user: actor,
        status: newStatus,
        note: payload.consultationNotes || `Status diubah dari "${prevStatus}" menjadi "${newStatus}"`
      });
    }

    const updated: Consultation = {
      ...existing,
      ...payload,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      history
    };

    this.data.consultations[idx] = updated;
    this.logActivity(actor, 'Consultation', 'Update Konsultasi', `${id}: Status ${newStatus}`);
    this.saveData();
    return updated;
  }

  public deleteConsultation(id: string, actor = 'Admin') {
    const idx = this.data.consultations.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.consultations.splice(idx, 1);
    this.logActivity(actor, 'Consultation', 'Hapus Konsultasi', `Menghapus konsultasi ${id}`);
    this.saveData();
    return true;
  }

  // ==========================================================================
  // CLIENTS CRM
  // ==========================================================================
  public getAllClients(search?: string) {
    if (!search) return this.data.clients;
    const q = search.toLowerCase();
    return this.data.clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  public getClientById(id: string) {
    return this.data.clients.find(c => c.id === id);
  }

  public getClientByAccessCode(code: string) {
    return this.data.clients.find(c => c.portalAccessCode.toLowerCase() === code.trim().toLowerCase());
  }

  public createClient(payload: Partial<Client>, actor = 'Admin') {
    const id = `CLI-${String(this.data.clients.length + 1).padStart(3, '0')}`;
    const code = `${payload.company ? payload.company.substring(0, 3).toUpperCase() : 'CLI'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const item: Client = {
      id,
      name: payload.name || 'Nama Klien',
      company: payload.company || 'Perusahaan Klien',
      email: payload.email || '',
      phone: payload.phone || '',
      industry: payload.industry || 'Teknologi & Bisnis',
      type: payload.type || 'Calon Klien',
      address: payload.address || 'Jakarta, Indonesia',
      portalAccessCode: payload.portalAccessCode || code,
      totalValue: payload.totalValue || 0,
      projectsCount: payload.projectsCount || 0,
      notes: payload.notes || '',
      meetings: payload.meetings || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.clients.unshift(item);
    this.logActivity(actor, 'Client', 'Tambah Klien Baru', `${item.id}: ${item.name} (${item.company})`);
    this.saveData();
    return item;
  }

  public updateClient(id: string, payload: Partial<Client>, actor = 'Admin') {
    const idx = this.data.clients.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated: Client = {
      ...this.data.clients[idx],
      ...payload,
      updatedAt: new Date().toISOString()
    };
    this.data.clients[idx] = updated;
    this.logActivity(actor, 'Client', 'Update Data Klien', `${id}: ${updated.name}`);
    this.saveData();
    return updated;
  }

  public deleteClient(id: string, actor = 'Admin') {
    const idx = this.data.clients.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.clients.splice(idx, 1);
    this.logActivity(actor, 'Client', 'Hapus Klien', `Menghapus klien ${id}`);
    this.saveData();
    return true;
  }

  // ==========================================================================
  // PROPOSALS
  // ==========================================================================
  public getAllProposals() {
    return this.data.proposals;
  }

  public getProposalById(id: string) {
    return this.data.proposals.find(p => p.id === id);
  }

  public createProposal(payload: Partial<Proposal>, actor = 'Admin') {
    const id = `PROP-2026-${String(this.data.proposals.length + 1).padStart(3, '0')}`;
    const price = Number(payload.totalPrice) || 25000000;
    const dpPct = payload.paymentTerms?.dpPercentage || 50;
    const settlementPct = payload.paymentTerms?.settlementPercentage || 50;

    const item: Proposal = {
      id,
      consultationId: payload.consultationId,
      clientId: payload.clientId || 'CLI-001',
      clientName: payload.clientName || 'Klien',
      clientCompany: payload.clientCompany || 'Perusahaan',
      title: payload.title || 'Proposal Solusi Digital Smart Tech',
      summary: payload.summary || 'Dokumen penawaran resmi rancangan software dan infrastruktur sistem.',
      scopeOfWork: payload.scopeOfWork && payload.scopeOfWork.length ? payload.scopeOfWork : [
        'Discovery & Arsitektur Sistem Kustom',
        'UI/UX Design System Figma & Prototype',
        'Pengembangan Frontend & Backend Berstandar Enterprise',
        'Integrasi Payment Gateway & Webhook Automations',
        'Quality Assurance, Load Test, & Serah Terima 100% Hak Milik'
      ],
      deliverables: payload.deliverables && payload.deliverables.length ? payload.deliverables : [
        'Aplikasi Web Responsif (Desktop & Mobile)',
        'Dashboard Admin & Role-based Access Control',
        'Dokumentasi API Swagger & Manual Book',
        'Repository Git & Konfigurasi Server Cloud'
      ],
      techStack: payload.techStack && payload.techStack.length ? payload.techStack : ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
      totalPrice: price,
      paymentTerms: {
        dpPercentage: dpPct,
        dpAmount: (price * dpPct) / 100,
        terminPercentage: payload.paymentTerms?.terminPercentage || 0,
        terminAmount: payload.paymentTerms?.terminAmount || 0,
        settlementPercentage: settlementPct,
        settlementAmount: (price * settlementPct) / 100,
        description: payload.paymentTerms?.description || `DP ${dpPct}% saat kickoff, Pelunasan ${settlementPct}% saat serah terima proyek.`
      },
      timeline: payload.timeline || '4 – 6 Minggu Kerja',
      estimatedStartDate: payload.estimatedStartDate || new Date().toISOString().slice(0, 10),
      status: payload.status || 'Draft',
      revisionsCount: 0,
      revisionsHistory: [
        {
          version: 1,
          date: new Date().toISOString(),
          changeNote: 'Inisialisasi dokumen penawaran resmi v1.0',
          price,
          user: actor
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.proposals.unshift(item);

    // If associated with a consultation, link it
    if (payload.consultationId) {
      const c = this.getConsultationById(payload.consultationId);
      if (c) {
        c.proposalId = item.id;
        c.status = 'Proposal Dibuat';
        c.updatedAt = new Date().toISOString();
      }
    }

    this.logActivity(actor, 'Proposal', 'Buat Proposal Baru', `${item.id}: ${item.title} (Rp ${item.totalPrice.toLocaleString('id-ID')})`);
    this.saveData();
    return item;
  }

  public updateProposal(id: string, payload: Partial<Proposal>, actor = 'Admin') {
    const idx = this.data.proposals.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.proposals[idx];
    const newPrice = payload.totalPrice !== undefined ? Number(payload.totalPrice) : existing.totalPrice;
    
    const revisionsHistory = [...existing.revisionsHistory];
    let revisionsCount = existing.revisionsCount;
    if (payload.status === 'Revisi Klien' || (payload.totalPrice && payload.totalPrice !== existing.totalPrice)) {
      revisionsCount += 1;
      revisionsHistory.unshift({
        version: revisionsCount + 1,
        date: new Date().toISOString(),
        changeNote: payload.summary || `Revisi versi ${revisionsCount + 1}`,
        price: newPrice,
        user: actor
      });
    }

    const updated: Proposal = {
      ...existing,
      ...payload,
      totalPrice: newPrice,
      revisionsCount,
      revisionsHistory,
      updatedAt: new Date().toISOString()
    };

    this.data.proposals[idx] = updated;
    this.logActivity(actor, 'Proposal', 'Update Proposal', `${id}: Status ${updated.status}`);
    this.saveData();
    return updated;
  }

  public deleteProposal(id: string, actor = 'Admin') {
    const idx = this.data.proposals.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.proposals.splice(idx, 1);
    this.logActivity(actor, 'Proposal', 'Hapus Proposal', `Menghapus proposal ${id}`);
    this.saveData();
    return true;
  }

  /**
   * Approves a proposal and automatically provisions:
   * 1. Active Project
   * 2. DP Invoice with payment gateway readiness
   * 3. Initial Milestones & Client Portal access
   */
  public convertProposalToProject(proposalId: string, actor = 'Admin') {
    const proposal = this.getProposalById(proposalId);
    if (!proposal) throw new Error('Proposal tidak ditemukan');

    if (proposal.status === 'Dikonversi ke Proyek') {
      throw new Error('Proposal ini sudah pernah disetujui dan dikonversi menjadi proyek aktif sebelumnya.');
    }
    const existingProj = this.data.projects.find(p => p.proposalId === proposalId);
    if (existingProj) {
      throw new Error(`Proyek aktif untuk proposal ini sudah ada (${existingProj.id}).`);
    }

    proposal.status = 'Dikonversi ke Proyek';
    proposal.approvedAt = new Date().toISOString();
    proposal.updatedAt = new Date().toISOString();

    // 1. Create Project
    const projectId = `PRJ-2026-${String(this.data.projects.length + 1).padStart(2, '0')}`;
    const project: Project = {
      id: projectId,
      name: proposal.title,
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      clientEmail: this.getClientById(proposal.clientId)?.email || '',
      proposalId: proposal.id,
      pic: 'Aditya Pratama (Technical Lead)',
      teamMembers: [
        { name: 'Aditya Pratama', role: 'Lead Architect' },
        { name: 'Sarah Lestari', role: 'Lead UI/UX' },
        { name: 'Dimas Wicaksono', role: 'Fullstack Engineer' }
      ],
      startDate: new Date().toISOString().slice(0, 10),
      deadline: '28 November 2026',
      progressPercentage: 15,
      status: 'Kickoff',
      milestones: [
        {
          id: `${projectId}-M1`,
          title: 'Discovery & Requirement Analysis (FSD)',
          phase: 1,
          status: 'Sedang Berjalan',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
          desc: 'Penyusunan arsitektur data & scope deliverables disetujui bersama klien.',
          deliverables: ['Dokumen FSD v1.0', 'Diagram ERD Database', 'Wireframe Flow']
        },
        {
          id: `${projectId}-M2`,
          title: 'UI/UX Design System & Prototype Interaktif',
          phase: 2,
          status: 'Menunggu',
          dueDate: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
          desc: 'Penyusunan desain UI/UX interaktif Figma untuk desktop dan mobile.',
          deliverables: ['Design System', 'Figma Prototype Siap Uji']
        },
        {
          id: `${projectId}-M3`,
          title: 'Core Development & Integrasi Gateway Payment',
          phase: 3,
          status: 'Menunggu',
          dueDate: new Date(Date.now() + 86400000 * 35).toISOString().slice(0, 10),
          desc: 'Pengerjaan kode modul inti, autentikasi, database, dan webhook payment gateway.',
          deliverables: ['Backend API Endpoint', 'Frontend Interactive', 'Integrasi Gateway']
        },
        {
          id: `${projectId}-M4`,
          title: 'Quality Assurance, Load Test & Serah Terima Final',
          phase: 4,
          status: 'Menunggu',
          dueDate: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
          desc: 'Audit performa Core Web Vitals, pengujian keamanan, dan serah terima 100% hak milik kode.',
          deliverables: ['Laporan Uji QA', 'Akses Repo Git Penuh', 'Deployment Cloud Berjalan']
        }
      ],
      tasks: [
        { id: `TSK-1`, milestoneId: `${projectId}-M1`, title: 'Kickoff Meeting Teknis', assignee: 'Aditya Pratama', status: 'Done', priority: 'Tinggi', dueDate: new Date().toISOString().slice(0, 10) },
        { id: `TSK-2`, milestoneId: `${projectId}-M1`, title: 'Finalisasi FSD & Scope Deliverables', assignee: 'Aditya Pratama', status: 'In Progress', priority: 'Tinggi', dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10) },
        { id: `TSK-3`, milestoneId: `${projectId}-M2`, title: 'Penyusunan Desain UI/UX Figma', assignee: 'Sarah Lestari', status: 'To Do', priority: 'Sedang', dueDate: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10) }
      ],
      revisions: [],
      files: [
        {
          id: 'FIL-01',
          name: `FSD_${proposal.title.replace(/\s+/g, '_')}_v1.0.pdf`,
          category: 'FSD / Spec',
          size: '1.8 MB',
          url: '/public/images/smart-tech-logo.png',
          uploadedAt: new Date().toISOString().slice(0, 10),
          allowedForClient: true
        }
      ],
      activityLog: [
        {
          date: new Date().toISOString(),
          user: actor,
          action: 'Proyek Resmi Dimulai',
          note: `Dikonversi dari proposal ${proposal.id} yang telah disetujui.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.projects.unshift(project);

    // 2. Create DP Invoice
    const invoiceId = `INV-2026-${String(this.data.invoices.length + 1).padStart(3, '0')}`;
    const dpInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: invoiceId,
      projectId: project.id,
      projectName: project.name,
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      clientEmail: project.clientEmail,
      title: `DP ${proposal.paymentTerms.dpPercentage}% - Kickoff Proyek ${project.name}`,
      type: 'DP (Uang Muka)',
      amount: proposal.paymentTerms.dpAmount,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      status: 'Menunggu Pembayaran',
      paymentUrl: `https://checkout-sandbox.artopay.id/pay/${invoiceId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Invoice pembayaran tahap 1 uang muka (DP) sesuai kontrak proposal ${proposal.id}.`
    };

    this.data.invoices.unshift(dpInvoice);

    // 3. Update Client status & stats
    const client = this.getClientById(proposal.clientId);
    if (client) {
      client.type = 'Klien Aktif';
      client.totalValue += proposal.totalPrice;
      client.projectsCount += 1;
      client.updatedAt = new Date().toISOString();
    }

    // 4. Update Consultation if linked
    if (proposal.consultationId) {
      const c = this.getConsultationById(proposal.consultationId);
      if (c) {
        c.status = 'Proyek Dimulai';
        c.projectId = project.id;
        c.updatedAt = new Date().toISOString();
      }
    }

    this.logActivity(actor, 'Project', 'Proyek Dibuat dari Proposal', `Proposal ${proposal.id} -> Proyek ${project.id} & Invoice ${dpInvoice.id}`);
    this.saveData();

    return { project, invoice: dpInvoice, proposal };
  }

  // ==========================================================================
  // PROJECTS CRUD & MANAGEMENT
  // ==========================================================================
  public getAllProjects(search?: string) {
    if (!search) return this.data.projects;
    const q = search.toLowerCase();
    return this.data.projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }

  public getProjectById(id: string) {
    return this.data.projects.find(p => p.id === id);
  }

  public createProject(payload: Partial<Project>, actor = 'Admin') {
    const id = `PRJ-2026-${String(this.data.projects.length + 1).padStart(2, '0')}`;
    const item: Project = {
      id,
      name: payload.name || 'Proyek Baru',
      clientId: payload.clientId || 'CLI-001',
      clientName: payload.clientName || 'PT Nusantara Retailindo',
      clientEmail: payload.clientEmail || '',
      proposalId: payload.proposalId,
      pic: payload.pic || 'Aditya Pratama (Technical Lead)',
      teamMembers: payload.teamMembers || [
        { name: 'Aditya Pratama', role: 'Lead Architect' },
        { name: 'Dimas Wicaksono', role: 'Senior Engineer' }
      ],
      startDate: payload.startDate || new Date().toISOString().slice(0, 10),
      deadline: payload.deadline || '30 Desember 2026',
      progressPercentage: payload.progressPercentage || 0,
      status: payload.status || 'Kickoff',
      milestones: payload.milestones || [],
      tasks: payload.tasks || [],
      revisions: payload.revisions || [],
      files: payload.files || [],
      activityLog: [
        {
          date: new Date().toISOString(),
          user: actor,
          action: 'Proyek Baru Dibuat',
          note: 'Proyek didaftarkan langsung oleh Admin.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.projects.unshift(item);
    this.logActivity(actor, 'Project', 'Buat Proyek Baru', `${item.id}: ${item.name}`);
    this.saveData();
    return item;
  }

  public updateProject(id: string, payload: Partial<Project>, actor = 'Admin') {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.projects[idx];
    const prevStatus = existing.status;
    const newStatus = payload.status || existing.status;

    const activityLog = [...existing.activityLog];
    if (newStatus !== prevStatus) {
      activityLog.unshift({
        date: new Date().toISOString(),
        user: actor,
        action: 'Perubahan Status Proyek',
        note: `Status proyek diubah dari "${prevStatus}" menjadi "${newStatus}".`
      });
    }

    const updated: Project = {
      ...existing,
      ...payload,
      status: newStatus,
      activityLog,
      updatedAt: new Date().toISOString()
    };

    this.data.projects[idx] = updated;
    this.logActivity(actor, 'Project', 'Update Proyek', `${id}: ${updated.name} (${newStatus})`);
    this.saveData();
    return updated;
  }

  public deleteProject(id: string, actor = 'Admin') {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const removed = this.data.projects.splice(idx, 1)[0];
    this.logActivity(actor, 'Project', 'Hapus Proyek', `${id}: ${removed.name}`);
    this.saveData();
    return true;
  }

  public addProjectMilestone(projectId: string, milestone: Partial<ProjectMilestone>, actor = 'Admin') {
    const proj = this.getProjectById(projectId);
    if (!proj) return null;

    const newMilestone: ProjectMilestone = {
      id: `${projectId}-M${proj.milestones.length + 1}`,
      title: milestone.title || 'Milestone Baru',
      phase: milestone.phase || proj.milestones.length + 1,
      status: milestone.status || 'Menunggu',
      dueDate: milestone.dueDate || new Date().toISOString().slice(0, 10),
      desc: milestone.desc || '',
      deliverables: milestone.deliverables || []
    };

    proj.milestones.push(newMilestone);
    proj.activityLog.unshift({
      date: new Date().toISOString(),
      user: actor,
      action: 'Tambah Milestone',
      note: `Menambahkan milestone: ${newMilestone.title}`
    });
    proj.updatedAt = new Date().toISOString();

    this.logActivity(actor, 'Project', 'Tambah Milestone', `${projectId}: ${newMilestone.title}`);
    this.saveData();
    return newMilestone;
  }

  public addProjectTask(projectId: string, task: Partial<ProjectTask>, actor = 'Admin') {
    const proj = this.getProjectById(projectId);
    if (!proj) return null;

    const newTask: ProjectTask = {
      id: `TSK-${Date.now().toString(36)}`,
      milestoneId: task.milestoneId || (proj.milestones[0]?.id || 'M1'),
      title: task.title || 'Tugas Baru',
      assignee: task.assignee || proj.pic,
      status: task.status || 'To Do',
      priority: task.priority || 'Sedang',
      dueDate: task.dueDate || proj.deadline
    };

    proj.tasks.push(newTask);
    proj.updatedAt = new Date().toISOString();
    this.saveData();
    return newTask;
  }

  public addProjectRevision(projectId: string, revision: Partial<ProjectRevision>, actor = 'Client') {
    const proj = this.getProjectById(projectId);
    if (!proj) return null;

    const newRev: ProjectRevision = {
      id: `REV-${proj.revisions.length + 1}`,
      submittedDate: new Date().toISOString().slice(0, 10),
      requestedBy: actor,
      title: revision.title || 'Catatan Revisi Klien',
      description: revision.description || '-',
      status: 'Open'
    };

    proj.revisions.unshift(newRev);
    proj.status = 'Revisi';
    proj.activityLog.unshift({
      date: new Date().toISOString(),
      user: actor,
      action: 'Pengajuan Revisi',
      note: `Revisi baru diajukan: "${newRev.title}"`
    });
    proj.updatedAt = new Date().toISOString();

    this.logActivity(actor, 'Project', 'Pengajuan Revisi', `${projectId}: ${newRev.title}`);
    this.saveData();
    return newRev;
  }

  // ==========================================================================
  // INVOICES & PAYMENTS
  // ==========================================================================
  public getAllInvoices() {
    return this.data.invoices;
  }

  public getInvoiceById(id: string) {
    return this.data.invoices.find(i => i.id === id);
  }

  public createInvoice(payload: Partial<Invoice>, actor = 'Admin') {
    if (payload.invoiceNumber && this.data.invoices.some(i => i.invoiceNumber === payload.invoiceNumber)) {
      throw new Error(`Nomor invoice ${payload.invoiceNumber} sudah terdaftar di sistem.`);
    }
    if (payload.projectId && payload.type === 'DP (Uang Muka)' && this.data.invoices.some(i => i.projectId === payload.projectId && i.type === 'DP (Uang Muka)')) {
      throw new Error(`Tagihan DP untuk proyek ini sudah diterbitkan sebelumnya.`);
    }
    const id = payload.invoiceNumber || `INV-2026-${String(this.data.invoices.length + 1).padStart(3, '0')}`;
    const amount = Number(payload.amount) || 5000000;

    const item: Invoice = {
      id,
      invoiceNumber: id,
      projectId: payload.projectId,
      projectName: payload.projectName || 'Proyek Smart Tech',
      clientId: payload.clientId || 'CLI-001',
      clientName: payload.clientName || 'Klien',
      clientEmail: payload.clientEmail || '',
      title: payload.title || 'Tagihan Layanan Smart Tech',
      type: payload.type || 'DP (Uang Muka)',
      amount,
      dueDate: payload.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      status: payload.status || 'Menunggu Pembayaran',
      paymentUrl: payload.paymentUrl || `https://checkout-sandbox.artopay.id/pay/${id}`,
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.invoices.unshift(item);
    this.logActivity(actor, 'Invoice', 'Buat Tagihan Baru', `${item.id}: ${item.title} (Rp ${item.amount.toLocaleString('id-ID')})`);
    this.saveData();
    return item;
  }

  public updateInvoice(id: string, payload: Partial<Invoice>, actor = 'Admin') {
    const idx = this.data.invoices.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const existing = this.data.invoices[idx];
    const prevStatus = existing.status;
    const newStatus = payload.status || existing.status;

    const updated: Invoice = {
      ...existing,
      ...payload,
      status: newStatus,
      paidAt: newStatus === 'Lunas' && !existing.paidAt ? new Date().toISOString() : existing.paidAt,
      updatedAt: new Date().toISOString()
    };

    this.data.invoices[idx] = updated;
    this.logActivity(actor, 'Invoice', 'Update Tagihan', `${id}: Status ${newStatus}`);
    this.saveData();
    return updated;
  }

  public deleteInvoice(id: string, actor = 'Admin') {
    const idx = this.data.invoices.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.data.invoices.splice(idx, 1);
    this.logActivity(actor, 'Invoice', 'Hapus Tagihan', `Menghapus invoice ${id}`);
    this.saveData();
    return true;
  }

  // ==========================================================================
  // CALENDAR & EVENTS
  // ==========================================================================
  public getAllEvents() {
    return this.data.calendarEvents;
  }

  public createEvent(payload: Partial<CalendarEvent>, actor = 'Admin') {
    const id = `EVT-${Date.now().toString(36)}`;
    const event: CalendarEvent = {
      id,
      title: payload.title || 'Agenda Baru',
      type: payload.type || 'Konsultasi',
      date: payload.date || new Date().toISOString().slice(0, 10),
      time: payload.time || '10:00 WIB',
      clientName: payload.clientName || 'Klien',
      relatedId: payload.relatedId,
      relatedType: payload.relatedType,
      status: payload.status || 'Terkonfirmasi',
      location: payload.location || 'Google Meet / Online'
    };
    this.data.calendarEvents.push(event);
    this.logActivity(actor, 'Settings', 'Tambah Agenda Jadwal', `${event.title} (${event.date})`);
    this.saveData();
    return event;
  }

  public deleteEvent(id: string, actor = 'Admin') {
    const idx = this.data.calendarEvents.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.data.calendarEvents.splice(idx, 1);
    this.logActivity(actor, 'Settings', 'Hapus Agenda Jadwal', `Hapus agenda ${id}`);
    this.saveData();
    return true;
  }

  // ==========================================================================
  // DOCUMENTS
  // ==========================================================================
  public getAllDocuments() {
    return this.data.documents;
  }

  public createDocument(payload: Partial<DocumentItem>, actor = 'Admin') {
    const id = `DOC-${String(this.data.documents.length + 1).padStart(3, '0')}`;
    const doc: DocumentItem = {
      id,
      title: payload.title || 'Dokumen Baru.pdf',
      type: payload.type || 'FSD Spesifikasi',
      relatedProject: payload.relatedProject || 'Umum',
      relatedClient: payload.relatedClient || 'Smart Tech',
      fileSize: payload.fileSize || '1.2 MB',
      accessLevel: payload.accessLevel || 'Dibagikan ke Klien',
      url: payload.url || '/public/images/smart-tech-logo.png',
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    this.data.documents.unshift(doc);
    this.logActivity(actor, 'Settings', 'Unggah Dokumen', `${doc.id}: ${doc.title}`);
    this.saveData();
    return doc;
  }

  public deleteDocument(id: string, actor = 'Admin') {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.documents.splice(idx, 1);
    this.logActivity(actor, 'Settings', 'Hapus Dokumen', `Hapus dokumen ${id}`);
    this.saveData();
    return true;
  }

  // ==========================================================================
  // REPORTS
  // ==========================================================================
  public getReports() {
    const totalConsultations = this.data.consultations.length;
    const closedProjects = this.data.consultations.filter(c => c.status === 'Proyek Dimulai' || c.status === 'Kesepakatan').length;
    const conversionRate = totalConsultations > 0 ? Math.round((closedProjects / totalConsultations) * 100) : 0;

    const totalRevenue = this.data.invoices
      .filter(i => i.status === 'Lunas')
      .reduce((acc, i) => acc + i.amount, 0);

    const projectedRevenue = this.data.proposals
      .filter(p => p.status === 'Disetujui' || p.status === 'Dikonversi ke Proyek')
      .reduce((acc, p) => acc + p.totalPrice, 0);

    // Distribution by Category
    const categoryStats: Record<string, number> = {};
    for (const c of this.data.consultations) {
      categoryStats[c.categoryName] = (categoryStats[c.categoryName] || 0) + 1;
    }

    return {
      conversionRate,
      totalConsultations,
      closedProjects,
      totalRevenue,
      projectedRevenue,
      categoryStats,
      projectsStatus: {
        kickoff: this.data.projects.filter(p => p.status === 'Kickoff').length,
        inProgress: this.data.projects.filter(p => p.status === 'Pengerjaan').length,
        review: this.data.projects.filter(p => p.status === 'Review Klien' || p.status === 'Revisi').length,
        completed: this.data.projects.filter(p => p.status === 'Selesai' || p.status === 'Serah Terima').length
      }
    };
  }

  // ==========================================================================
  // SETTINGS & LOGS
  // ==========================================================================
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(payload: Partial<SystemSettings>, actor = 'Admin') {
    this.data.settings = {
      ...this.data.settings,
      ...payload
    };
    this.logActivity(actor, 'Settings', 'Update Pengaturan Sistem', 'Memperbarui profil studio & konfigurasi');
    this.saveData();
    return this.data.settings;
  }

  public getActivityLogs(limit = 100) {
    return this.data.activityLogs.slice(0, limit);
  }

  // ==========================================================================
  // SEED DATA GENERATOR
  // ==========================================================================
  private getSeedData(): AdminStoreData {
    return {
      consultations: [
        {
          id: 'CNS-2026-001',
          name: 'Budi Santoso',
          email: 'budi@nusantaragroup.id',
          phone: '+62 812-9876-5432',
          company: 'PT Nusantara Retailindo',
          category: 'ecommerce',
          categoryName: 'Toko Online & E-Commerce',
          budget: '15-30',
          budgetRange: 'Rp 25.000.000 – Rp 35.000.000',
          message: 'Membutuhkan platform OmniCommerce headless dengan integrasi payment gateway dan WhatsApp order notification.',
          priority: 'Tinggi',
          status: 'Proyek Dimulai',
          consultationDate: '2026-10-04T10:00:00Z',
          consultationNotes: 'Diskusi requirement FSD berjalan lancar. Klien menyetujui proposal arsitektur headless.',
          assignedTo: 'Aditya Pratama (Technical Lead)',
          clientId: 'CLI-001',
          proposalId: 'PROP-2026-001',
          projectId: 'PRJ-2026-01',
          createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          history: [
            { date: new Date(Date.now() - 86400000 * 12).toISOString(), user: 'Sistem', status: 'Baru Masuk', note: 'Permintaan konsultasi diterima dari website publik.' },
            { date: new Date(Date.now() - 86400000 * 11).toISOString(), user: 'Aditya Pratama', status: 'Ditinjau', note: 'Kebutuhan teknis masuk dalam spesifikasi arsitektur enterprise.' },
            { date: new Date(Date.now() - 86400000 * 9).toISOString(), user: 'Aditya Pratama', status: 'Jadwal Konsultasi', note: 'Discovery call meeting teknis dijadwalkan via Google Meet.' },
            { date: new Date(Date.now() - 86400000 * 6).toISOString(), user: 'Aditya Pratama', status: 'Proposal Dibuat', note: 'Proposal PROP-2026-001 berhasil dikirim ke klien.' },
            { date: new Date(Date.now() - 86400000 * 3).toISOString(), user: 'Budi Santoso (Klien)', status: 'Kesepakatan', note: 'Proposal disetujui, invoice DP diterbitkan.' },
            { date: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'Aditya Pratama', status: 'Proyek Dimulai', note: 'DP telah diverifikasi, sprint kickoff fase 1 dimulai.' }
          ]
        },
        {
          id: 'CNS-2026-002',
          name: 'Siti Rahmawati',
          email: 'siti@karyacreative.com',
          phone: '+62 856-7890-1234',
          company: 'Karya Creative Agency',
          category: 'webapp',
          categoryName: 'Aplikasi Bisnis / Internal Tool',
          budget: '15-30',
          budgetRange: 'Rp 15.000.000 – Rp 25.000.000',
          message: 'Perlu dashboard sistem approval manajemen aset kreatif, tracking deadline revisi, dan portal kolaborasi vendor.',
          priority: 'Tinggi',
          status: 'Menunggu Persetujuan',
          consultationDate: '2026-10-11T14:00:00Z',
          consultationNotes: 'Proposal penawaran v1.0 sudah dikirimkan via email & WhatsApp. Klien sedang mengkaji klausul SLA.',
          assignedTo: 'Aditya Pratama (Technical Lead)',
          clientId: 'CLI-002',
          proposalId: 'PROP-2026-002',
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          history: [
            { date: new Date(Date.now() - 86400000 * 4).toISOString(), user: 'Sistem', status: 'Baru Masuk', note: 'Permintaan masuk dari formulir konsultasi.' },
            { date: new Date(Date.now() - 86400000 * 3).toISOString(), user: 'Aditya Pratama', status: 'Dihubungi', note: 'Follow up via WhatsApp resmi.' },
            { date: new Date(Date.now() - 86400000 * 1).toISOString(), user: 'Aditya Pratama', status: 'Menunggu Persetujuan', note: 'Proposal PROP-2026-002 dikirimkan ke PIC.' }
          ]
        },
        {
          id: 'CNS-2026-003',
          name: 'Hendrawan Pratama',
          email: 'hendra@megaprolog.co.id',
          phone: '+62 813-1122-3344',
          company: 'PT Megaprolog Logistik',
          category: 'marketplace',
          categoryName: 'Booking & Marketplace',
          budget: '30-50',
          budgetRange: 'Rp 35.000.000 – Rp 50.000.000+',
          message: 'Membutuhkan platform marketplace armada truk logistik dengan dispatch realtime, pelacakan GPS, dan otomasi invoice.',
          priority: 'Tinggi',
          status: 'Ditinjau',
          consultationDate: '2026-10-15T13:30:00Z',
          consultationNotes: 'Skala enterprise, membutuhkan arsitektur event-driven dan cloud auto-scaling.',
          assignedTo: 'Rangga Prawira (Cloud Architect)',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          history: [
            { date: new Date(Date.now() - 3600000 * 6).toISOString(), user: 'Sistem', status: 'Baru Masuk', note: 'Inquiry diterima via form landing page.' },
            { date: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Aditya Pratama', status: 'Ditinjau', note: 'Ditugaskan ke Cloud Architect untuk analisis arsitektur armada.' }
          ]
        },
        {
          id: 'CNS-2026-004',
          name: 'dr. Melinda Kusuma',
          email: 'melinda@kliniksehatprima.id',
          phone: '+62 818-4455-6677',
          company: 'Klinik Sehat Prima',
          category: 'website',
          categoryName: 'Website (Landing Page / Company Profile)',
          budget: '5-15',
          budgetRange: 'Rp 6.000.000 – Rp 12.000.000',
          message: 'Website profil klinik spesialis dengan sistem booking janji temu dokter dokter dan integrasi WhatsApp.',
          priority: 'Sedang',
          status: 'Baru Masuk',
          assignedTo: 'Sarah Lestari (Product Lead)',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          history: [
            { date: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Sistem', status: 'Baru Masuk', note: 'Inquiry baru menunggu peninjauan awal Technical Lead.' }
          ]
        }
      ],
      clients: [
        {
          id: 'CLI-001',
          name: 'Budi Santoso',
          company: 'PT Nusantara Retailindo',
          email: 'budi@nusantaragroup.id',
          phone: '+62 812-9876-5432',
          industry: 'Retail & Consumer Goods',
          type: 'Klien Aktif',
          address: 'Gedung Menara Batavia Lt. 15, Jl. KH Mas Mansyur, Jakarta Pusat',
          portalAccessCode: 'NTR-2026',
          totalValue: 25000000,
          projectsCount: 1,
          notes: 'Klien prioritas skala retail enterprise. Komunikasi utama melalui WhatsApp dan Zoom koordinasi mingguan.',
          meetings: [
            { id: 'M-1', date: '2026-10-04', title: 'Discovery & Requirement Analysis FSD', notes: 'Menyepakati spesifikasi arsitektur headless eCommerce.', pic: 'Aditya Pratama' },
            { id: 'M-2', date: '2026-10-11', title: 'Review UI/UX Design System Figma', notes: 'Design disetujui tanpa revisi mayor, langsung lanjut sprint coding.', pic: 'Sarah Lestari' }
          ],
          createdAt: '2026-10-01T08:00:00Z',
          updatedAt: '2026-10-12T10:00:00Z'
        },
        {
          id: 'CLI-002',
          name: 'Siti Rahmawati',
          company: 'Karya Creative Agency',
          email: 'siti@karyacreative.com',
          phone: '+62 856-7890-1234',
          industry: 'Media & Digital Agency',
          type: 'Calon Klien',
          address: 'Ruko Golden Plaza Blok C-12, Fatmawati, Jakarta Selatan',
          portalAccessCode: 'KRY-7788',
          totalValue: 18000000,
          projectsCount: 0,
          notes: 'Menunggu persetujuan dewan direksi untuk proposal sistem approval aset kreatif.',
          meetings: [
            { id: 'M-3', date: '2026-10-10', title: 'Presentasi Solusi Dashboard Internal', notes: 'Demo arsitektur RBAC dan workflow persetujuan.', pic: 'Aditya Pratama' }
          ],
          createdAt: '2026-10-08T09:00:00Z',
          updatedAt: '2026-10-11T16:00:00Z'
        }
      ],
      proposals: [
        {
          id: 'PROP-2026-001',
          consultationId: 'CNS-2026-001',
          clientId: 'CLI-001',
          clientName: 'Budi Santoso',
          clientCompany: 'PT Nusantara Retailindo',
          title: 'Pengembangan OmniCommerce Headless Platform',
          summary: 'Pembangunan platform e-commerce enterprise dengan arsitektur headless, payment gateway ArtoPay, dan otomasi omnichannel.',
          scopeOfWork: [
            'Arsitektur Headless Next.js 15 & PostgreSQL RLS',
            'UI/UX Design System Figma & Responsive Prototype',
            'Integrasi ArtoPay Gateway Webhook (QRIS, VA, Kartu)',
            'Kalkulator Ongkir Kurir Terpadu (JNE, SiCepat, J&T)',
            'Dashboard Manajemen Pesanan & Notifikasi WhatsApp Realtime',
            'Deployment Cloud Production & Garansi Bug 90 Hari'
          ],
          deliverables: [
            'Web Aplikasi Toko Online Responsif',
            'Admin Dashboard Manajemen Produk & Transaksi',
            'Dokumentasi API Swagger & Manual Book Penggunaan',
            '100% Hak Milik Repository Git Source Code'
          ],
          techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'ArtoPay'],
          totalPrice: 25000000,
          paymentTerms: {
            dpPercentage: 50,
            dpAmount: 12500000,
            terminPercentage: 30,
            terminAmount: 7500000,
            settlementPercentage: 20,
            settlementAmount: 5000000,
            description: 'DP 50% saat kickoff, Termin 30% setelah prototype disetujui, Pelunasan 20% saat serah terima.'
          },
          timeline: '6 – 8 Minggu Kerja',
          estimatedStartDate: '2026-10-04',
          status: 'Disetujui',
          revisionsCount: 1,
          revisionsHistory: [
            { version: 1, date: '2026-10-05T08:00:00Z', changeNote: 'Draft awal penawaran eCommerce', price: 28000000, user: 'Aditya Pratama' },
            { version: 2, date: '2026-10-06T14:00:00Z', changeNote: 'Penyesuaian termin pembayaran dan diskon kemitraan', price: 25000000, user: 'Aditya Pratama' }
          ],
          approvedAt: '2026-10-06T17:00:00Z',
          createdAt: '2026-10-05T08:00:00Z',
          updatedAt: '2026-10-06T17:00:00Z'
        },
        {
          id: 'PROP-2026-002',
          consultationId: 'CNS-2026-002',
          clientId: 'CLI-002',
          clientName: 'Siti Rahmawati',
          clientCompany: 'Karya Creative Agency',
          title: 'Pengembangan Custom SaaS Dashboard & Asset Approval',
          summary: 'Sistem operasional internal untuk manajemen antrean produksi kreatif, approval aset multi-level, dan audit trail.',
          scopeOfWork: [
            'Perancangan Role-Based Access Control (Admin, Desainer, Klien)',
            'Modul Kanban Approval Asset & Komentar Revisi Realtime',
            'Integrasi Notifikasi Bot WhatsApp & Email Dispatch',
            'Fitur Ekspor Laporan KPI Kinerja Tim (PDF & Excel)'
          ],
          deliverables: [
            'Aplikasi Dashboard Web Kustom',
            'Portal Khusus Review Klien Eksternal',
            'Full Source Code & Database Setup'
          ],
          techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
          totalPrice: 18000000,
          paymentTerms: {
            dpPercentage: 50,
            dpAmount: 9000000,
            terminPercentage: 0,
            terminAmount: 0,
            settlementPercentage: 50,
            settlementAmount: 9000000,
            description: 'DP 50% di awal kontrak, Pelunasan 50% saat serah terima.'
          },
          timeline: '4 – 5 Minggu Kerja',
          estimatedStartDate: '2026-10-20',
          status: 'Terkirim',
          revisionsCount: 0,
          revisionsHistory: [
            { version: 1, date: '2026-10-11T10:00:00Z', changeNote: 'Penyusunan penawaran sistem approval', price: 18000000, user: 'Aditya Pratama' }
          ],
          createdAt: '2026-10-11T10:00:00Z',
          updatedAt: '2026-10-11T10:00:00Z'
        }
      ],
      projects: [
        {
          id: 'PRJ-2026-01',
          name: 'OmniCommerce Headless Platform',
          clientId: 'CLI-001',
          clientName: 'PT Nusantara Retailindo',
          clientEmail: 'budi@nusantaragroup.id',
          proposalId: 'PROP-2026-001',
          pic: 'Aditya Pratama (Technical Lead)',
          teamMembers: [
            { name: 'Aditya Pratama', role: 'Lead Architect' },
            { name: 'Sarah Lestari', role: 'Lead UI/UX' },
            { name: 'Dimas Wicaksono', role: 'Senior Engineer' }
          ],
          startDate: '2026-10-04',
          deadline: '2026-11-28',
          progressPercentage: 75,
          status: 'Pengerjaan',
          milestones: [
            {
              id: 'PRJ-01-M1',
              title: 'Discovery & Requirement Analysis (FSD)',
              phase: 1,
              status: 'Selesai',
              dueDate: '2026-10-08',
              desc: 'Penyusunan arsitektur data & scope deliverables disetujui bersama klien.',
              deliverables: ['Dokumen FSD v1.2', 'Database Schema Diagram'],
              approvedByClient: true
            },
            {
              id: 'PRJ-01-M2',
              title: 'UI/UX Design System & Interactive Prototype',
              phase: 2,
              status: 'Selesai',
              dueDate: '2026-10-18',
              desc: 'Design system Figma disetujui untuk tampilan desktop dan mobile.',
              deliverables: ['Figma Prototype', 'Komponen UI Design System'],
              approvedByClient: true
            },
            {
              id: 'PRJ-01-M3',
              title: 'Core Development & ArtoPay Gateway Integration',
              phase: 3,
              status: 'Sedang Berjalan',
              dueDate: '2026-11-08',
              desc: 'Integrasi webhook ArtoPay, keranjang belanja, checkout QRIS/VA, dan database order.',
              deliverables: ['Engine Checkout', 'Webhook Gateway', 'Portal Admin Produk']
            },
            {
              id: 'PRJ-01-M4',
              title: 'Quality Assurance, Load Test & Cloud Deployment',
              phase: 4,
              status: 'Menunggu',
              dueDate: '2026-11-28',
              desc: 'Audit performa Core Web Vitals, pengujian keamanan, dan serah terima 100% hak milik kode.',
              deliverables: ['Laporan QA 99.9% Uptime', 'Akses Repo Git Penuh', 'Handover BAST']
            }
          ],
          tasks: [
            { id: 'T-01', milestoneId: 'PRJ-01-M3', title: 'Implementasi Webhook Signature Validator ArtoPay', assignee: 'Aditya Pratama', status: 'Done', priority: 'Tinggi', dueDate: '2026-10-14' },
            { id: 'T-02', milestoneId: 'PRJ-01-M3', title: 'Pengembangan Filter Kategori & Search Realtime', assignee: 'Dimas Wicaksono', status: 'In Progress', priority: 'Sedang', dueDate: '2026-10-22' },
            { id: 'T-03', milestoneId: 'PRJ-01-M3', title: 'Integrasi WhatsApp Order Confirmation Gateway', assignee: 'Dimas Wicaksono', status: 'In Progress', priority: 'Sedang', dueDate: '2026-10-25' },
            { id: 'T-04', milestoneId: 'PRJ-01-M4', title: 'Load Testing Simulasi 1000 Transaksi Konkuren', assignee: 'Aditya Pratama', status: 'To Do', priority: 'Tinggi', dueDate: '2026-11-15' }
          ],
          revisions: [
            {
              id: 'REV-01',
              submittedDate: '2026-10-12',
              requestedBy: 'Budi Santoso (Klien)',
              title: 'Penambahan Kolom Nomor Resi Otomatis pada Email Pelanggan',
              description: 'Klien meminta format template email konfirmasi pengiriman menyertakan tombol lacak langsung ke kurir.',
              status: 'Resolved',
              resolutionNote: 'Sudah diimplementasikan pada sprint 2 dan telah disetujui klien.'
            }
          ],
          files: [
            { id: 'F-01', name: 'FSD_OmniCommerce_v1.2.pdf', category: 'FSD / Spec', size: '2.4 MB', url: '/public/images/smart-tech-logo.png', uploadedAt: '2026-10-06', allowedForClient: true },
            { id: 'F-02', name: 'Database_Schema_PostgreSQL.sql', category: 'Source / Deployment', size: '145 KB', url: '/public/images/smart-tech-logo.png', uploadedAt: '2026-10-12', allowedForClient: true },
            { id: 'F-03', name: 'API_Documentation_Swagger.json', category: 'FSD / Spec', size: '68 KB', url: '/public/images/smart-tech-logo.png', uploadedAt: '2026-10-15', allowedForClient: true }
          ],
          activityLog: [
            { date: '2026-10-04T09:00:00Z', user: 'Aditya Pratama', action: 'Proyek Resmi Dimulai', note: 'Kickoff meeting dan alokasi tim engineer.' },
            { date: '2026-10-08T16:00:00Z', user: 'Sarah Lestari', action: 'Milestone 1 Selesai', note: 'Dokumen FSD v1.2 disetujui klien.' },
            { date: '2026-10-18T14:00:00Z', user: 'Sarah Lestari', action: 'Milestone 2 Selesai', note: 'Design system dan prototype Figma 100% tervalidasi.' }
          ],
          createdAt: '2026-10-04T08:00:00Z',
          updatedAt: '2026-10-18T14:00:00Z'
        }
      ],
      invoices: [
        {
          id: 'INV-2026-001',
          invoiceNumber: 'INV-2026-001',
          projectId: 'PRJ-2026-01',
          projectName: 'OmniCommerce Headless Platform',
          clientId: 'CLI-001',
          clientName: 'PT Nusantara Retailindo',
          clientEmail: 'budi@nusantaragroup.id',
          title: 'DP Tahap 1 (50%) - Kickoff Pengembangan',
          type: 'DP (Uang Muka)',
          amount: 12500000,
          dueDate: '2026-10-07',
          status: 'Lunas',
          paymentUrl: 'https://checkout-sandbox.artopay.id/pay/INV-2026-001',
          paymentMethod: 'BCA Virtual Account (ArtoPay)',
          paidAt: '2026-10-06T15:30:00Z',
          notes: 'Pembayaran DP uang muka proyek telah terverifikasi otomatis.',
          createdAt: '2026-10-04T09:00:00Z',
          updatedAt: '2026-10-06T15:30:00Z'
        },
        {
          id: 'INV-2026-002',
          invoiceNumber: 'INV-2026-002',
          projectId: 'PRJ-2026-01',
          projectName: 'OmniCommerce Headless Platform',
          clientId: 'CLI-001',
          clientName: 'PT Nusantara Retailindo',
          clientEmail: 'budi@nusantaragroup.id',
          title: 'Termin 2 (30%) - Progress Prototype & Core Engine',
          type: 'Termin Berkala',
          amount: 7500000,
          dueDate: '2026-10-21',
          status: 'Lunas',
          paymentUrl: 'https://checkout-sandbox.artopay.id/pay/INV-2026-002',
          paymentMethod: 'QRIS Dinamis (ArtoPay)',
          paidAt: '2026-10-18T10:15:00Z',
          notes: 'Pembayaran termin kedua progress pembangunan sistem.',
          createdAt: '2026-10-14T11:00:00Z',
          updatedAt: '2026-10-18T10:15:00Z'
        },
        {
          id: 'INV-2026-003',
          invoiceNumber: 'INV-2026-003',
          projectId: 'PRJ-2026-01',
          projectName: 'OmniCommerce Headless Platform',
          clientId: 'CLI-001',
          clientName: 'PT Nusantara Retailindo',
          clientEmail: 'budi@nusantaragroup.id',
          title: 'Pelunasan Akhir (20%) - Handover & Go-Live',
          type: 'Pelunasan Akhir',
          amount: 5000000,
          dueDate: '2026-11-28',
          status: 'Menunggu Pembayaran',
          paymentUrl: 'https://checkout-sandbox.artopay.id/pay/INV-2026-003',
          notes: 'Tagihan pelunasan akhir sebelum penyerahan hak akses server production.',
          createdAt: '2026-10-18T11:00:00Z',
          updatedAt: '2026-10-18T11:00:00Z'
        }
      ],
      calendarEvents: [
        {
          id: 'EVT-01',
          title: 'Discovery Meeting Teknis: PT Nusantara Retailindo',
          type: 'Konsultasi',
          date: '2026-10-14',
          time: '10:00 – 11:30 WIB',
          clientName: 'Budi Santoso',
          relatedId: 'CNS-2026-001',
          relatedType: 'consultation',
          status: 'Selesai',
          location: 'Google Meet (meet.google.com/smt-tech-demo)'
        },
        {
          id: 'EVT-02',
          title: 'Presentasi Proposal: Karya Creative Agency',
          type: 'Review Klien',
          date: '2026-10-16',
          time: '14:00 – 15:00 WIB',
          clientName: 'Siti Rahmawati',
          relatedId: 'PROP-2026-002',
          relatedType: 'consultation',
          status: 'Terkonfirmasi',
          location: 'Office Meeting / Hybrid'
        },
        {
          id: 'EVT-03',
          title: 'Demo Mingguan Milestone 3: OmniCommerce Headless',
          type: 'Milestone',
          date: '2026-10-24',
          time: '15:30 – 16:30 WIB',
          clientName: 'PT Nusantara Retailindo',
          relatedId: 'PRJ-2026-01',
          relatedType: 'project',
          status: 'Terkonfirmasi',
          location: 'Staging Server Demo'
        },
        {
          id: 'EVT-04',
          title: 'Target Go-Live & Serah Terima: OmniCommerce Platform',
          type: 'Deadline',
          date: '2026-11-28',
          time: '09:00 – 17:00 WIB',
          clientName: 'PT Nusantara Retailindo',
          relatedId: 'PRJ-2026-01',
          relatedType: 'project',
          status: 'Menunggu',
          location: 'Cloud Production Deployment'
        }
      ],
      documents: [
        {
          id: 'DOC-001',
          title: 'Kontrak_Kemitraan_Pengembangan_Software_PT_Nusantara.pdf',
          type: 'Kontrak Resmi',
          relatedProject: 'OmniCommerce Headless Platform',
          relatedClient: 'PT Nusantara Retailindo',
          fileSize: '3.1 MB',
          accessLevel: 'Dibagikan ke Klien',
          url: '/public/images/smart-tech-logo.png',
          updatedAt: '2026-10-06'
        },
        {
          id: 'DOC-002',
          title: 'Functional_Specification_Document_FSD_v1.2.pdf',
          type: 'FSD Spesifikasi',
          relatedProject: 'OmniCommerce Headless Platform',
          relatedClient: 'PT Nusantara Retailindo',
          fileSize: '2.4 MB',
          accessLevel: 'Dibagikan ke Klien',
          url: '/public/images/smart-tech-logo.png',
          updatedAt: '2026-10-08'
        },
        {
          id: 'DOC-003',
          title: 'Proposal_Penawaran_Resmi_PROP-2026-002.pdf',
          type: 'Kontrak Resmi',
          relatedProject: 'Custom SaaS Dashboard',
          relatedClient: 'Karya Creative Agency',
          fileSize: '1.9 MB',
          accessLevel: 'Dibagikan ke Klien',
          url: '/public/images/smart-tech-logo.png',
          updatedAt: '2026-10-11'
        },
        {
          id: 'DOC-004',
          title: 'Standard_Operating_Procedure_Security_Audit.pdf',
          type: 'SRS Teknis',
          relatedProject: 'Internal Smart Tech',
          relatedClient: 'Smart Tech Studio',
          fileSize: '840 KB',
          accessLevel: 'Internal Admin',
          url: '/public/images/smart-tech-logo.png',
          updatedAt: '2026-10-13'
        }
      ],
      activityLogs: [
        {
          id: 'LOG-001',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: 'Aditya Pratama (Admin)',
          module: 'Consultation',
          action: 'Tinjau Inquiry',
          details: 'Menugaskan inquiry dr. Melinda Kusuma ke Product Lead.'
        },
        {
          id: 'LOG-002',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          user: 'Sistem Gateway',
          module: 'Invoice',
          action: 'Verifikasi Pembayaran',
          details: 'Invoice INV-2026-002 sebesar Rp 7.500.000 terverifikasi LUNAS via QRIS ArtoPay.'
        },
        {
          id: 'LOG-003',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
          user: 'Sarah Lestari (Designer)',
          module: 'Project',
          action: 'Update Milestone',
          details: 'Milestone 2 (UI/UX Design System) ditandai Selesai.'
        },
        {
          id: 'LOG-004',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          user: 'Budi Santoso (Klien)',
          module: 'Portal',
          action: 'Akses Client Portal',
          details: 'Klien login ke portal dengan kode akses NTR-2026.'
        }
      ],
      settings: {
        studioName: 'Smart Tech',
        studioEmail: 'hello@smarttech.id',
        studioPhone: '+62 812-3456-7890',
        studioAddress: 'Equity Tower Lt. 22, SCBD, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
        websiteUrl: 'https://smarttech.id',
        bankInfo: {
          bankName: 'Bank Central Asia (BCA)',
          accountNo: '8820-192-881',
          accountName: 'PT SMART TECH REKAYASA DIGITAL'
        },
        artopaySandbox: true,
        defaultDpPercentage: 50,
        teamMembers: [
          { name: 'Aditya Pratama', role: 'Head of Engineering / Technical Lead', email: 'aditya@smarttech.id' },
          { name: 'Sarah Lestari', role: 'Lead UI/UX Product Designer', email: 'sarah@smarttech.id' },
          { name: 'Dimas Wicaksono', role: 'Senior Fullstack Engineer', email: 'dimas@smarttech.id' },
          { name: 'Rangga Prawira', role: 'DevOps & Cloud Architect', email: 'rangga@smarttech.id' }
        ]
      }
    };
  }
}

export const adminStore = new AdminStore();
