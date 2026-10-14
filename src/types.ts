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
  validUntil: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Menunggu' | 'Sedang Berjalan' | 'Selesai';
  paymentTrigger?: string;
}

export interface ProjectTask {
  id: string;
  milestoneId?: string;
  title: string;
  assignee: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface ProjectRevision {
  id: string;
  date: string;
  requestedBy: string;
  title: string;
  description: string;
  status: 'Menunggu Review' | 'Diproses' | 'Selesai';
}

export interface ProjectFile {
  id: string;
  name: string;
  category: 'FSD' | 'Design' | 'SourceCode' | 'BAST' | 'Lainnya';
  fileUrl: string;
  size: string;
  uploadedAt: string;
  allowedForClient: boolean;
}

export interface Project {
  id: string;
  proposalId?: string;
  clientId: string;
  clientName: string;
  title: string;
  category: string;
  techStack: string[];
  totalBudget: number;
  startDate: string;
  deadline: string;
  progressPercentage: number;
  status: 'Kickoff' | 'Development' | 'Testing & QA' | 'UAT' | 'Handover Selesai' | 'Maintenance';
  milestones: Milestone[];
  tasks: ProjectTask[];
  revisions: ProjectRevision[];
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  type: 'DP (Down Payment)' | 'Termin Berkala' | 'Pelunasan Akhir' | 'Maintenance Bulanan';
  amount: number;
  dueDate: string;
  status: 'Menunggu Pembayaran' | 'Lunas' | 'Terlambat' | 'Dibatalkan';
  paymentDate?: string;
  paymentMethod?: string;
  paymentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Konsultasi' | 'Meeting Teknis' | 'Sprint Review' | 'Deadline Milestone' | 'Handover';
  date: string;
  time: string;
  clientName?: string;
  projectId?: string;
  location: string;
  description: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'Kontrak / PKS' | 'NDA' | 'FSD & SRS' | 'Arsitektur Teknis' | 'BAST Serah Terima';
  projectId?: string;
  projectTitle?: string;
  clientName: string;
  fileUrl: string;
  size: string;
  version: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  module: 'Consultation' | 'Client' | 'Proposal' | 'Project' | 'Invoice' | 'Settings' | 'Portal';
  action: string;
  details: string;
}

export interface DashboardSummary {
  kpi: {
    totalConsultations: number;
    newConsultations: number;
    activeClients: number;
    pendingProposals: number;
    activeProjects: number;
    unpaidInvoices: number;
    estimatedRevenue: number;
    collectedRevenue: number;
  };
  recentConsultations: Consultation[];
  activeProjects: Project[];
  recentInvoices: Invoice[];
  upcomingEvents: CalendarEvent[];
}
