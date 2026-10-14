import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PaymentGateway } from './src/lib/paymentGateway.ts';
import { ArtopayAdapter } from './src/server/artopayAdapter.ts';
import { adminStore } from './src/server/adminStore.ts';
import { isPostgresConfigured, pool } from './src/server/db.ts';
export { adminStore };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Initialize Artopay Payment Engine
export const artopayAdapter = new ArtopayAdapter();
export const paymentGateway = new PaymentGateway(artopayAdapter);

// Configure middleware with rawBody capture for cryptographic signature verification & image uploads
app.use(express.json({
  limit: '15mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure AdminStore is synchronized with PostgreSQL if running in a distributed / serverless environment
app.use('/api', async (_req, _res, next) => {
  try {
    await adminStore.syncFromPostgresIfStale();
  } catch (_) {}
  next();
});

// Serve static assets from project root and /public directory
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Existing Smart Tech In-memory Store (preserves 100% existing data & functionality)
const leads = [
  {
    id: 'LEAD-001',
    name: 'Budi Santoso',
    email: 'budi@nusantaragroup.id',
    phone: '+62 812-9876-5432',
    category: 'webapp',
    categoryName: 'Aplikasi Bisnis / Internal Tool',
    budget: '15-30',
    budgetRange: 'Rp 15.000.000 – Rp 30.000.000',
    message: 'Perlu sistem internal untuk approval procurement dan pencatatan inventaris gudang.',
    status: 'Dalam Diskusi',
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
  },
  {
    id: 'LEAD-002',
    name: 'Siti Rahmawati',
    email: 'siti@karyacreative.com',
    phone: '+62 856-7890-1234',
    category: 'ecommerce',
    categoryName: 'Toko Online / E-Commerce',
    budget: '5-15',
    budgetRange: 'Rp 5.000.000 – Rp 15.000.000',
    message: 'Ingin website e-commerce fashion dengan checkout otomatis QRIS dan integrasi kurir JNE/SiCepat.',
    status: 'Proposal Terkirim',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  }
];

const clientProject = {
  clientName: 'PT Nusantara Retailindo',
  projectName: 'OmniCommerce Headless Platform',
  projectId: 'PRJ-2026-08',
  status: 'In Progress (Fase 3)',
  progressPercentage: 75,
  deadline: '28 November 2026',
  techStack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'ArtoPay Gateway', 'Docker'],
  milestones: [
    { title: 'Discovery & Requirement Analysis (FSD)', status: 'Selesai', date: '04 Okt 2026', desc: 'Penyusunan arsitektur data & scope deliverables disetujui.' },
    { title: 'UI/UX Design System & Interactive Prototype', status: 'Selesai', date: '14 Okt 2026', desc: 'Design system Figma disetujui untuk desktop dan mobile.' },
    { title: 'Core Development & ArtoPay Gateway Integration', status: 'Sedang Berjalan', date: '08 Nov 2026', desc: 'Integrasi webhook ArtoPay, keranjang belanja, & auth.' },
    { title: 'Quality Assurance, Load Test & Cloud Deployment', status: 'Menunggu', date: '28 Nov 2026', desc: 'Audit performa Core Web Vitals dan serah terima hak akses.' }
  ],
  documents: [
    { name: 'FSD_OmniCommerce_v1.2.pdf', type: 'PDF', size: '2.4 MB', updated: '06 Okt 2026' },
    { name: 'Database_Schema_PostgreSQL.sql', type: 'SQL', size: '145 KB', updated: '12 Okt 2026' },
    { name: 'API_Documentation_Swagger.json', type: 'JSON', size: '68 KB', updated: '15 Okt 2026' }
  ],
  invoices: [
    { id: 'INV-2026-001', title: 'DP Tahap 1 (50%) - Kickoff', amount: 'Rp 12.500.000', status: 'Lunas', paymentDate: '04 Okt 2026' },
    { id: 'INV-2026-002', title: 'Termin 2 (30%) - Development', amount: 'Rp 7.500.000', status: 'Lunas', paymentDate: '18 Okt 2026' },
    { id: 'INV-2026-003', title: 'Pelunasan Akhir (20%) - Handover', amount: 'Rp 5.000.000', status: 'Menunggu Pelunasan', dueDate: '28 Nov 2026', paymentMethod: 'Transfer Bank Manual (BCA)' }
  ]
};

// ============================================================================
// 1. SYSTEM HEALTH & ARTOPAY GATEWAY STATUS
// ============================================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'Smart Tech Indonesia',
    model: 'Lead Generation & Consultation',
    uptime: process.uptime(),
    database: {
      configured: isPostgresConfigured,
      status: pool ? 'connected' : 'standalone/in-memory'
    },
    paymentGateway: {
      provider: 'Artopay',
      sandbox: artopayAdapter.isSandboxMode(),
      maskedKey: artopayAdapter.getMaskedKey(),
      totalOrders: paymentGateway.getAllOrders().length
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 2. CHECKOUT & PAYMENT LINK CREATION (Priority 3 & 4)
// ============================================================================
app.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, items, returnUrl, callbackUrl } = req.body;

    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Customer name and email are required for checkout'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one valid item'
      });
    }

    const order = await paymentGateway.createCheckoutOrder({
      customerName,
      customerEmail,
      customerPhone,
      items,
      returnUrl,
      callbackUrl
    });

    res.status(201).json({
      success: true,
      orderId: order.orderId,
      grossAmount: order.grossAmount,
      baseAmount: order.baseAmount,
      uniqueCode: order.uniqueCode,
      currency: order.currency,
      paymentUrl: order.paymentUrl,
      status: order.status,
      expiresAt: order.expiresAt
    });
  } catch (err: any) {
    console.error('[API /api/checkout] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to process checkout and create Artopay payment link'
    });
  }
});

// ============================================================================
// 3. ARTOPAY WEBHOOK NOTIFICATION ENDPOINT (Priority 6)
// ============================================================================
app.post('/api/payment/artopay/webhook', async (req: any, res: Response) => {
  const signature = req.headers['x-artopay-signature'] || req.headers['x-signature'] || '';
  const timestamp = req.headers['x-artopay-timestamp'] || req.headers['x-timestamp'] || '';

  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');

  const result = await paymentGateway.handleWebhook(rawBody, signature as string, timestamp as string);

  res.status(result.statusCode).json({
    success: result.success,
    message: result.message,
    orderId: result.orderId,
    isDuplicate: result.isDuplicate || false
  });
});

// ============================================================================
// 4. ORDER STATUS LOOKUP
// ============================================================================
app.get('/api/payment/status/:orderId', (req: Request, res: Response) => {
  const order = paymentGateway.getOrder(req.params.orderId as string);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  res.json({
    success: true,
    order: {
      orderId: order.orderId,
      status: order.status,
      grossAmount: order.grossAmount,
      baseAmount: order.baseAmount,
      uniqueCode: order.uniqueCode,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      paymentUrl: order.paymentUrl,
      expiresAt: order.expiresAt,
      disputeReason: order.disputeReason
    }
  });
});

app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: paymentGateway.getAllOrders().length,
    orders: paymentGateway.getAllOrders()
  });
});

// ============================================================================
// 5. SECURE SANDBOX SIMULATION (Priority 5: Blocked in Production)
// ============================================================================
app.post('/api/payment/simulate', (req: Request, res: Response) => {
  // Priority 5: Strictly prohibit simulation in production environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'SECURITY_BLOCKED: Payment simulation is strictly prohibited in production environment'
    });
  }

  // Reject frontend parameter bypass (e.g. body.simulate = true) without admin secret
  const adminSecret = req.headers['x-admin-key'] || req.headers['authorization'];
  const expectedSecret = process.env.ADMIN_SIMULATION_KEY || 'sandbox_test_token';

  const isAuthorized = adminSecret === expectedSecret || adminSecret === `Bearer ${expectedSecret}`;
  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED: Simulation requires valid server administration credentials'
    });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Missing orderId' });
  }

  try {
    const updated = paymentGateway.simulatePayment(orderId, true);
    res.json({
      success: true,
      message: 'Sandbox payment successfully simulated',
      order: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. LOGO UPLOAD & ASSET MANAGEMENT API
// ============================================================================
app.post('/api/upload-logo', (req: Request, res: Response) => {
  try {
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, error: 'Data gambar tidak valid atau kosong' });
    }

    const matches = imageData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches[2]) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageData, 'base64');
    }

    const publicDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const target1 = path.join(publicDir, 'smart-tech-logo.png');
    const target2 = path.join(__dirname, 'smart-tech-logo.png');
    const target3 = path.join(publicDir, 'smart-tech-logo@2x.png');

    fs.writeFileSync(target1, buffer);
    fs.writeFileSync(target2, buffer);
    fs.writeFileSync(target3, buffer);

    console.log('[LogoUpload] Logo berhasil disimpan ke', target1, `(${buffer.length} bytes)`);

    res.json({
      success: true,
      message: 'Logo resmi Smart Tech berhasil diunggah dan disimpan!',
      filePath: 'public/images/smart-tech-logo.png',
      bytes: buffer.length,
      url: `/public/images/smart-tech-logo.png?v=${Date.now()}`
    });
  } catch (err: any) {
    console.error('[LogoUpload] Error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Gagal menyimpan file logo' });
  }
});

// ============================================================================
// 7. PUBLIC INQUIRY API (Synced with Admin Store)
// ============================================================================
// 7. PUBLIC LEADS & INQUIRY API (Synced with Admin Store)
// ============================================================================

// Public Leads Form Endpoint
app.post('/api/leads', (req: Request, res: Response) => {
  const { name, whatsapp, email, phone, address, consent } = req.body;

  // 1. Validasi minimal: Nama dan Nomor WhatsApp
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Nama lengkap wajib diisi (minimal 2 karakter).'
    });
  }

  const cleanWA = whatsapp ? String(whatsapp).replace(/[^0-9+]/g, '') : '';
  const digitsOnly = cleanWA.replace(/\D/g, '');
  if (!cleanWA || digitsOnly.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Nomor WhatsApp wajib diisi dengan format nomor yang valid (minimal 8 digit).'
    });
  }

  // 2. Validasi persetujuan kontak
  if (consent === false || consent === 'false') {
    return res.status(400).json({
      success: false,
      message: 'Mohon centang persetujuan agar tim Smart Tech dapat menghubungi Anda.'
    });
  }

  // 3. Perlindungan spam & pencegahan pengiriman berulang (anti-duplicate 60 detik)
  const existingLeads = adminStore.getAllLeads();
  const recentDuplicate = existingLeads.find(l =>
    l.name.toLowerCase() === name.trim().toLowerCase() &&
    l.whatsapp === cleanWA &&
    (Date.now() - new Date(l.createdAt).getTime()) < 60000
  );

  if (recentDuplicate) {
    return res.status(200).json({
      success: true,
      message: 'Data Anda telah kami terima sebelumnya. Tim Smart Tech akan segera menghubungi nomor WhatsApp Anda.',
      data: recentDuplicate,
      isDuplicateSubmission: true
    });
  }

  // 4. Simpan ke database AdminStore (Sumber: Website, Status: Baru)
  const initialNotes = [];
  if (req.body.demoInterest && typeof req.body.demoInterest === 'string' && req.body.demoInterest.trim()) {
    initialNotes.push({
      id: `NOTE-${Date.now()}`,
      date: new Date().toISOString(),
      author: 'Website Form',
      type: 'Catatan' as const,
      content: `Minat Solusi Demo: ${req.body.demoInterest.trim()}`
    });
  }

  const lead = adminStore.createLead({
    name: name.trim(),
    whatsapp: cleanWA,
    email: email && typeof email === 'string' ? email.trim() : '',
    phone: phone && typeof phone === 'string' ? phone.trim() : '',
    address: address && typeof address === 'string' ? address.trim() : '',
    source: 'Website',
    status: 'Baru',
    consentGiven: true,
    notes: initialNotes
  }, 'Website Form');

  res.status(201).json({
    success: true,
    message: 'Terima kasih! Informasi Anda berhasil kami terima. Tim Smart Tech akan segera menghubungi Anda melalui WhatsApp.',
    data: lead
  });
});

app.post('/api/inquiry', (req: Request, res: Response) => {
  const { name, email, phone, category, budget, message, company, address } = req.body;
  if (!name || (!phone && !req.body.whatsapp)) {
    return res.status(400).json({ success: false, message: 'Nama dan Nomor WhatsApp wajib diisi.' });
  }

  const contactPhone = phone || req.body.whatsapp;
  const categoryNames: Record<string, string> = {
    'website': 'Website (Landing Page / Company Profile)',
    'ecommerce': 'Toko Online / E-Commerce',
    'webapp': 'Aplikasi Bisnis / Internal Tool',
    'marketplace': 'Booking & Marketplace',
    'ai-integration': 'AI & Integrasi Sistem',
    'maintenance': 'Deployment & Maintenance Cloud'
  };

  const categoryName = categoryNames[category] || category || 'Aplikasi Bisnis & Rekayasa Sistem';

  // 1. Sync ke CRM Leads
  const lead = adminStore.createLead({
    name: name.trim(),
    email: email ? email.trim() : '',
    whatsapp: String(contactPhone).trim(),
    phone: phone ? String(phone).trim() : '',
    address: address ? String(address).trim() : '',
    source: 'Website',
    status: 'Baru',
    consentGiven: true
  }, 'Website Visitor');

  // 2. Persist in AdminStore Consultation
  const consultation = adminStore.createConsultation({
    name,
    email: email || '',
    phone: contactPhone,
    company: company || address || '',
    category: category || 'general',
    categoryName,
    budget: budget || 'Fleksibel',
    budgetRange: budget ? `Rp ${budget} Juta` : 'Fleksibel',
    message: message || '-',
    priority: budget && (budget.includes('30') || budget.includes('50')) ? 'Tinggi' : 'Sedang',
    status: 'Baru Masuk'
  }, 'Website Visitor');

  lead.consultationId = consultation.id;
  adminStore.updateLead(lead.id, { consultationId: consultation.id });

  res.json({
    success: true,
    message: 'Permintaan konsultasi berhasil diterima! Tim Technical Lead Smart Tech akan menghubungi Anda dalam 1x24 jam kerja.',
    data: consultation
  });
});

app.get('/api/leads', (_req: Request, res: Response) => {
  const list = adminStore.getAllLeads();
  res.json({ success: true, brand: 'Smart Tech', total: list.length, leads: list });
});

// Admin Leads Endpoints
app.get('/api/admin/leads', (req: Request, res: Response) => {
  const { search, status, marketing } = req.query;
  const list = adminStore.getAllLeads({
    search: search as string,
    status: status as string,
    marketing: marketing as string
  });
  const uncontacted = list.filter(l => l.status === 'Baru' || l.status === 'Belum Dihubungi').length;
  res.json({ success: true, total: list.length, uncontacted, data: list });
});

app.get('/api/admin/leads/:id', (req: Request, res: Response) => {
  const lead = adminStore.getLeadById(req.params.id as string);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead tidak ditemukan' });
  res.json({ success: true, data: lead });
});

app.post('/api/admin/leads', (req: Request, res: Response) => {
  const { name, whatsapp } = req.body;
  if (!name || !whatsapp) {
    return res.status(400).json({ success: false, error: 'Nama dan Nomor WhatsApp wajib diisi.' });
  }
  const lead = adminStore.createLead(req.body, 'Admin');
  res.status(201).json({ success: true, message: 'Lead berhasil didaftarkan', data: lead });
});

app.put('/api/admin/leads/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateLead(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Lead tidak ditemukan' });
  res.json({ success: true, message: 'Data lead berhasil diperbarui', data: updated });
});

app.post('/api/admin/leads/:id/notes', (req: Request, res: Response) => {
  const { author, type, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Isi catatan tidak boleh kosong.' });
  }
  const note = adminStore.addLeadNote(req.params.id as string, {
    author: author || 'Marketing',
    type: type || 'WhatsApp',
    content: content.trim()
  });
  if (!note) return res.status(404).json({ success: false, error: 'Lead tidak ditemukan' });
  res.json({ success: true, message: 'Catatan follow-up berhasil ditambahkan', data: note });
});

app.post('/api/admin/leads/:id/convert-to-consultation', (req: Request, res: Response) => {
  try {
    const result = adminStore.convertLeadToConsultation(req.params.id as string, 'Admin');
    res.json({
      success: true,
      message: result.alreadyConverted
        ? 'Lead telah terkonversi sebelumnya ke alur konsultasi.'
        : 'Lead berhasil diteruskan ke alur Konsultasi Resmi Smart Tech!',
      data: result
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Gagal mengonversi lead' });
  }
});

app.delete('/api/admin/leads/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteLead(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Lead tidak ditemukan' });
  res.json({ success: true, message: 'Lead berhasil dihapus' });
});

app.get('/api/client/portal', (_req: Request, res: Response) => {
  res.json({ success: true, brand: 'Smart Tech', project: clientProject });
});

// ============================================================================
// 8. ADMIN DASHBOARD & CRM REST APIS
// ============================================================================

// Dashboard Summary KPI
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  const summary = adminStore.getDashboardSummary();
  res.json({ success: true, data: summary });
});

// Consultations CRUD
app.get('/api/admin/consultations', (req: Request, res: Response) => {
  const { status, search, priority } = req.query;
  const list = adminStore.getAllConsultations({
    status: status as string,
    search: search as string,
    priority: priority as string
  });
  res.json({ success: true, total: list.length, data: list });
});

app.post('/api/admin/consultations', (req: Request, res: Response) => {
  const item = adminStore.createConsultation(req.body, 'Admin');
  res.json({ success: true, message: 'Konsultasi berhasil dibuat', data: item });
});

app.get('/api/admin/consultations/:id', (req: Request, res: Response) => {
  const item = adminStore.getConsultationById(req.params.id as string);
  if (!item) return res.status(404).json({ success: false, error: 'Konsultasi tidak ditemukan' });
  res.json({ success: true, data: item });
});

app.put('/api/admin/consultations/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateConsultation(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Konsultasi tidak ditemukan' });
  res.json({ success: true, message: 'Konsultasi berhasil diperbarui', data: updated });
});

app.delete('/api/admin/consultations/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteConsultation(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Konsultasi tidak ditemukan' });
  res.json({ success: true, message: 'Konsultasi berhasil dihapus' });
});

// Clients CRM CRUD
app.get('/api/admin/clients', (req: Request, res: Response) => {
  const { search } = req.query;
  const list = adminStore.getAllClients(search as string);
  res.json({ success: true, total: list.length, data: list });
});

app.post('/api/admin/clients', (req: Request, res: Response) => {
  const item = adminStore.createClient(req.body, 'Admin');
  res.json({ success: true, message: 'Klien berhasil didaftarkan', data: item });
});

app.get('/api/admin/clients/:id', (req: Request, res: Response) => {
  const item = adminStore.getClientById(req.params.id as string);
  if (!item) return res.status(404).json({ success: false, error: 'Klien tidak ditemukan' });
  res.json({ success: true, data: item });
});

app.put('/api/admin/clients/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateClient(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Klien tidak ditemukan' });
  res.json({ success: true, message: 'Data klien berhasil diperbarui', data: updated });
});

app.delete('/api/admin/clients/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteClient(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Klien tidak ditemukan' });
  res.json({ success: true, message: 'Klien berhasil dihapus' });
});

// Proposals CRUD & Lifecycle
app.get('/api/admin/proposals', (_req: Request, res: Response) => {
  const list = adminStore.getAllProposals();
  res.json({ success: true, total: list.length, data: list });
});

app.post('/api/admin/proposals', (req: Request, res: Response) => {
  const item = adminStore.createProposal(req.body, 'Admin');
  res.json({ success: true, message: 'Proposal penawaran berhasil dibuat', data: item });
});

app.get('/api/admin/proposals/:id', (req: Request, res: Response) => {
  const item = adminStore.getProposalById(req.params.id as string);
  if (!item) return res.status(404).json({ success: false, error: 'Proposal tidak ditemukan' });
  res.json({ success: true, data: item });
});

app.put('/api/admin/proposals/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateProposal(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Proposal tidak ditemukan' });
  res.json({ success: true, message: 'Proposal berhasil diperbarui', data: updated });
});

app.delete('/api/admin/proposals/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteProposal(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Proposal tidak ditemukan' });
  res.json({ success: true, message: 'Proposal berhasil dihapus' });
});

app.post('/api/admin/proposals/:id/convert-to-project', (req: Request, res: Response) => {
  try {
    const result = adminStore.convertProposalToProject(req.params.id as string, 'Admin');
    res.json({
      success: true,
      message: 'Proposal berhasil disetujui & dikonversi menjadi Proyek Aktif!',
      data: result
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Gagal mengonversi proposal' });
  }
});

// Projects CRUD & Milestones
app.get('/api/admin/projects', (req: Request, res: Response) => {
  const { search } = req.query;
  const list = adminStore.getAllProjects(search as string);
  res.json({ success: true, total: list.length, data: list });
});

app.post('/api/admin/projects', (req: Request, res: Response) => {
  const item = adminStore.createProject(req.body, 'Admin');
  res.json({ success: true, message: 'Proyek berhasil dibuat', data: item });
});

app.get('/api/admin/projects/:id', (req: Request, res: Response) => {
  const item = adminStore.getProjectById(req.params.id as string);
  if (!item) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, data: item });
});

app.put('/api/admin/projects/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateProject(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, message: 'Proyek berhasil diperbarui', data: updated });
});

app.post('/api/admin/projects/:id/milestone', (req: Request, res: Response) => {
  const item = adminStore.addProjectMilestone(req.params.id as string, req.body, 'Admin');
  if (!item) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, message: 'Milestone berhasil ditambahkan', data: item });
});

app.post('/api/admin/projects/:id/task', (req: Request, res: Response) => {
  const item = adminStore.addProjectTask(req.params.id as string, req.body, 'Admin');
  if (!item) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, message: 'Tugas berhasil ditambahkan', data: item });
});

app.post('/api/admin/projects/:id/revision', (req: Request, res: Response) => {
  const item = adminStore.addProjectRevision(req.params.id as string, req.body, req.body.requestedBy || 'Admin');
  if (!item) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, message: 'Revisi berhasil dicatat', data: item });
});

app.delete('/api/admin/projects/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteProject(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
  res.json({ success: true, message: 'Proyek berhasil dihapus' });
});

// Invoices CRUD & Payment Link Generator
app.get('/api/admin/invoices', (_req: Request, res: Response) => {
  const list = adminStore.getAllInvoices();
  res.json({ success: true, total: list.length, data: list });
});

app.post('/api/admin/invoices', (req: Request, res: Response) => {
  const item = adminStore.createInvoice(req.body, 'Admin');
  res.json({ success: true, message: 'Tagihan berhasil dibuat', data: item });
});

app.get('/api/admin/invoices/:id', (req: Request, res: Response) => {
  const item = adminStore.getInvoiceById(req.params.id as string);
  if (!item) return res.status(404).json({ success: false, error: 'Tagihan tidak ditemukan' });
  res.json({ success: true, data: item });
});

app.put('/api/admin/invoices/:id', (req: Request, res: Response) => {
  const updated = adminStore.updateInvoice(req.params.id as string, req.body, 'Admin');
  if (!updated) return res.status(404).json({ success: false, error: 'Tagihan tidak ditemukan' });
  res.json({ success: true, message: 'Tagihan berhasil diperbarui', data: updated });
});

app.delete('/api/admin/invoices/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteInvoice(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Tagihan tidak ditemukan' });
  res.json({ success: true, message: 'Tagihan berhasil dihapus' });
});

// Generate Real ArtoPay Payment Link for Invoice (Disabled for Consulting Model)
app.post('/api/admin/invoices/:id/generate-artopay', async (_req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    error: 'Sistem pembayaran online untuk invoice Smart Tech telah dinonaktifkan. Seluruh tagihan dikelola secara manual via Transfer Bank / Termin Kontrak.'
  });
});

// Calendar, Documents, Reports, Settings, Logs
app.get('/api/admin/calendar', (_req: Request, res: Response) => {
  res.json({ success: true, data: adminStore.getAllEvents() });
});

app.post('/api/admin/calendar', (req: Request, res: Response) => {
  const event = adminStore.createEvent(req.body, 'Admin');
  res.json({ success: true, message: 'Agenda berhasil ditambahkan', data: event });
});

app.delete('/api/admin/calendar/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteEvent(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Agenda tidak ditemukan' });
  res.json({ success: true, message: 'Agenda berhasil dihapus' });
});

app.get('/api/admin/documents', (_req: Request, res: Response) => {
  res.json({ success: true, data: adminStore.getAllDocuments() });
});

app.post('/api/admin/documents', (req: Request, res: Response) => {
  const doc = adminStore.createDocument(req.body, 'Admin');
  res.json({ success: true, message: 'Dokumen berhasil diarsipkan', data: doc });
});

app.delete('/api/admin/documents/:id', (req: Request, res: Response) => {
  const ok = adminStore.deleteDocument(req.params.id as string, 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
  res.json({ success: true, message: 'Dokumen berhasil dihapus' });
});

app.get('/api/admin/reports', (_req: Request, res: Response) => {
  res.json({ success: true, data: adminStore.getReports() });
});

app.get('/api/admin/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: adminStore.getSettings() });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const updated = adminStore.updateSettings(req.body, 'Admin');
  res.json({ success: true, message: 'Pengaturan berhasil disimpan', data: updated });
});

app.get('/api/admin/activity-logs', (_req: Request, res: Response) => {
  res.json({ success: true, data: adminStore.getActivityLogs() });
});

// ============================================================================
// 9. CLIENT PORTAL SECURE ENDPOINTS
// ============================================================================
app.post('/api/portal/login', (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Kode akses portal wajib diisi.' });
  }

  const client = adminStore.getClientByAccessCode(code);
  if (!client) {
    return res.status(401).json({ success: false, error: 'Kode akses portal tidak valid atau belum terdaftar.' });
  }

  // Find client projects
  const projects = adminStore.getAllProjects().filter(p => p.clientId === client.id);
  const activeProject = projects[0] || null;

  adminStore.logActivity(client.name, 'Portal', 'Login Client Portal', `Kode akses: ${code}`);

  res.json({
    success: true,
    message: 'Selamat datang di Client Portal Smart Tech!',
    client: {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email
    },
    activeProject
  });
});

app.get('/api/portal/project/:id', (req: Request, res: Response) => {
  const project = adminStore.getProjectById(req.params.id as string);
  if (!project) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });

  // Client Data Isolation Guard: If access code is supplied or missing, verify ownership
  const portalCode = (req.headers['x-portal-code'] || req.query.code) as string;
  if (!portalCode) {
    return res.status(401).json({
      success: false,
      error: 'Autentikasi Diperlukan: Kode akses portal wajib disertakan.'
    });
  }

  const authorizedClient = adminStore.getClientByAccessCode(portalCode);
  if (!authorizedClient || authorizedClient.id !== project.clientId) {
    return res.status(403).json({
      success: false,
      error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses data proyek klien lain.'
    });
  }

  // Invoices strictly for this project
  const invoices = adminStore.getAllInvoices().filter(i => i.projectId === project.id);
  // Allowed documents strictly filtered with allowedForClient
  const documents = project.files.filter(f => f.allowedForClient);

  res.json({
    success: true,
    data: {
      project,
      invoices,
      documents
    }
  });
});

app.post('/api/portal/feedback', (req: Request, res: Response) => {
  const { projectId, title, description, clientName } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ success: false, error: 'ID Proyek dan Judul Revisi wajib diisi.' });
  }

  const portalCode = (req.headers['x-portal-code'] || req.query.code) as string;
  if (portalCode) {
    const project = adminStore.getProjectById(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });
    const authorizedClient = adminStore.getClientByAccessCode(portalCode);
    if (!authorizedClient || authorizedClient.id !== project.clientId) {
      return res.status(403).json({
        success: false,
        error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengirim revisi untuk proyek ini.'
      });
    }
  }

  const rev = adminStore.addProjectRevision(projectId, { title, description }, clientName || 'Klien');
  if (!rev) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });

  res.json({ success: true, message: 'Masukan / revisi berhasil dikirim ke Technical Lead Smart Tech!', data: rev });
});

// Single Page Application / Static entry point fallback & Vite integration
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.FUNCTION_NAME
);

async function initApp() {
  if (process.env.NODE_ENV !== 'test' && !isServerless) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd && fs.existsSync(path.join(__dirname, 'dist'))) {
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    } else {
      const vitePkg = 'vite';
      const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      app.use('*', async (req: Request, res: Response, next) => {
        const url = req.originalUrl;
        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(indexPath)) {
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } else {
            next();
          }
        } catch (e) {
          next(e);
        }
      });
    }

    app.listen(Number(PORT), HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT} (ArtoPay Sandbox: ${artopayAdapter.isSandboxMode() ? 'ON' : 'OFF'})`);
    });
  }
}

initApp().catch(err => {
  console.error('Failed to initialize server:', err);
});

export default app;

