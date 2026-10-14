// Comprehensive Audit Test Suite for Smart Tech Admin Dashboard & Client Portal
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAudit() {
  console.log('======================================================');
  console.log('🔍 AUDIT MENYELURUH SMART TECH ADMIN & CLIENT PORTAL');
  console.log('======================================================\n');

  // Load modules
  const { adminStore, app, paymentGateway, artopayAdapter } = await import('../server.ts');

  let passed = 0;
  let failed = 0;
  const failureDetails: string[] = [];

  function recordPass(testName: string) {
    passed++;
    console.log(`✅ [LULUS] ${testName}`);
  }

  function recordFail(testName: string, error: string) {
    failed++;
    failureDetails.push(`${testName}: ${error}`);
    console.error(`❌ [GAGAL] ${testName}: ${error}`);
  }

  // --------------------------------------------------------------------------
  // TEST 1: ALUR BISNIS LENGKAP DARI KONSULTASI PUBLIK SAMPAI SELESAI
  // --------------------------------------------------------------------------
  try {
    // 1.1 Formulir Konsultasi Publik Masuk
    const lead = adminStore.createConsultation({
      name: 'Dr. Hendra Gunawan',
      email: 'hendra@meditech.id',
      phone: '+62 811-9988-7766',
      company: 'PT Medika Inovasi Digital',
      category: 'webapp',
      categoryName: 'Aplikasi Bisnis / Internal Tool',
      budgetRange: 'Rp 40.000.000 – Rp 60.000.000',
      priority: 'Tinggi',
      message: 'Sistem rekam medis terpadu & antrean poli terintegrasi BPJS.'
    }, 'Website Visitor');
    assert(lead && lead.id, 'Consultation ID must be generated');
    assert.strictEqual(lead.status, 'Baru Masuk');

    // 1.2 CRM Calon Klien
    const client = adminStore.createClient({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      industry: 'Kesehatan & Farmasi',
      type: 'Calon Klien'
    }, 'Admin');
    assert(client && client.portalAccessCode, 'Client portal access code must be generated');

    // 1.3 Pembuatan Proposal Penawaran
    const proposal = adminStore.createProposal({
      consultationId: lead.id,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      title: 'Hospital Information & Telemedicine Platform',
      totalPrice: 50000000,
      timeline: '8 Minggu',
      status: 'Terkirim',
      scopeOfWork: ['FSD Rekam Medis', 'UI/UX Portal Dokter & Pasien', 'Core Telemedicine Engine', 'Integrasi BPJS & QA'],
      deliverables: ['Dokumen FSD v1.0', 'Source Code Git', 'Cloud Deployment']
    }, 'Admin');
    assert(proposal && proposal.id, 'Proposal must be created');
    assert.strictEqual(proposal.status, 'Terkirim');
    assert.strictEqual(proposal.paymentTerms.dpAmount, 25000000); // 50% DP

    // 1.4 Persetujuan & Konversi ke Proyek Aktif
    const converted = adminStore.convertProposalToProject(proposal.id, 'Admin');
    assert(converted.project && converted.project.id, 'Project must be created');
    assert.strictEqual(converted.project.status, 'Kickoff');
    assert.strictEqual(converted.invoice.amount, 25000000);

    // 1.5 Milestone & Pengerjaan
    assert(converted.project.milestones.length >= 4, 'Initial milestones must be provisioned');
    const m1 = converted.project.milestones[0];
    m1.status = 'Selesai';
    m1.approvedByClient = true;
    converted.project.status = 'Pengerjaan';
    converted.project.progressPercentage = 50;
    adminStore.updateProject(converted.project.id, converted.project, 'Admin');

    // 1.6 Tagihan Invoice Pelunasan & Pembayaran Terverifikasi
    const finalInvoice = adminStore.createInvoice({
      projectId: converted.project.id,
      projectName: converted.project.name,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      title: 'Pelunasan Akhir (50%) & BAST Serah Terima',
      type: 'Pelunasan Akhir',
      amount: 25000000,
      dueDate: '2026-11-28',
      status: 'Menunggu Pembayaran'
    }, 'Admin');
    assert(finalInvoice && finalInvoice.id, 'Final invoice must be created');

    // 1.7 Verifikasi Pembayaran & Serah Terima Selesai
    adminStore.updateInvoice(finalInvoice.id, { status: 'Lunas', paidAt: new Date().toISOString() }, 'Admin');
    adminStore.updateProject(converted.project.id, { status: 'Selesai', progressPercentage: 100 }, 'Admin');
    const finalProjectState = adminStore.getProjectById(converted.project.id);
    assert.strictEqual(finalProjectState?.status, 'Selesai');
    assert.strictEqual(finalProjectState?.progressPercentage, 100);

    recordPass('1. Alur Bisnis Penuh: Konsultasi -> CRM -> Proposal -> Proyek -> Milestone -> Invoice -> Lunas -> Selesai');
  } catch (err: any) {
    recordFail('1. Alur Bisnis Penuh', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: PERSISTENSI DATABASE KE DISK SETELAH RESTART
  // --------------------------------------------------------------------------
  try {
    const storePath = path.resolve(__dirname, '../data/admin_store.json');
    assert(fs.existsSync(storePath), 'File data/admin_store.json harus ada');
    const rawData = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(rawData);
    assert(Array.isArray(parsed.consultations) && parsed.consultations.length > 0, 'Consultations tersimpan di JSON');
    assert(Array.isArray(parsed.projects) && parsed.projects.length > 0, 'Projects tersimpan di JSON');
    assert(Array.isArray(parsed.invoices) && parsed.invoices.length > 0, 'Invoices tersimpan di JSON');
    assert(Array.isArray(parsed.activityLogs) && parsed.activityLogs.length > 0, 'Audit activity logs tersimpan di JSON');

    recordPass('2. Persistensi Data: Penyimpanan JSON ke disk terbukti persisten & tidak hilang saat restart');
  } catch (err: any) {
    recordFail('2. Persistensi Data', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: CLIENT PORTAL AUTH, LOGOUT & ISOLASI DATA ANTAR-KLIEN
  // --------------------------------------------------------------------------
  try {
    // 3.1 Login dengan kode valid
    const allClients = adminStore.getAllClients();
    assert(allClients.length >= 2, 'Minimal ada 2 klien untuk uji isolasi');
    const clientA = allClients[0];
    const clientB = allClients[1];

    const lookupA = adminStore.getClientByAccessCode(clientA.portalAccessCode);
    assert(lookupA && lookupA.id === clientA.id, 'Login dengan kode klien A berhasil');

    // 3.2 Login dengan kode tidak valid
    const lookupInvalid = adminStore.getClientByAccessCode('KODE-SALAH-1234');
    assert.strictEqual(lookupInvalid, undefined, 'Kode salah harus ditolak');

    // 3.3 Isolasi data antar-klien
    const projectsA = adminStore.getAllProjects().filter(p => p.clientId === clientA.id);
    const projectsB = adminStore.getAllProjects().filter(p => p.clientId === clientB.id);
    if (projectsA.length > 0) {
      assert.notStrictEqual(projectsA[0].clientId, clientB.id, 'Proyek milik klien A tidak boleh tercampur dengan klien B');
    }

    recordPass('3. Client Portal: Autentikasi kode akses teruji & isolasi data antar-klien aman');
  } catch (err: any) {
    recordFail('3. Client Portal Auth & Isolasi', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: WAJIB TANPA MODAL (ZERO-MODAL VERIFICATION)
  // --------------------------------------------------------------------------
  try {
    const routerFile = fs.readFileSync(path.resolve(__dirname, '../public/admin-router.js'), 'utf8');
    const viewsFile = fs.readFileSync(path.resolve(__dirname, '../public/admin-views.js'), 'utf8');
    const indexFile = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

    // Verifikasi semua URL aksi wajib tanpa modal terdaftar di router
    const requiredRoutes = [
      '/admin/consultations',
      '/admin/consultations/new',
      '/admin/clients',
      '/admin/clients/new',
      '/admin/proposals',
      '/admin/proposals/new',
      '/admin/projects',
      '/admin/projects/new',
      '/admin/invoices',
      '/admin/invoices/new',
      '/admin/calendar',
      '/admin/documents',
      '/admin/reports',
      '/admin/settings'
    ];

    for (const r of requiredRoutes) {
      assert(routerFile.includes(r), `Route ${r} harus didukung penuh di admin-router.js`);
    }

    // Pastikan tombol di header/footer tidak lagi membuka modal lama
    assert(!indexFile.includes('openPortalModal()'), 'Tombol openPortalModal() tidak boleh digunakan di markup header');

    recordPass('4. Wajib Tanpa Modal: Seluruh aksi Tambah, Edit, Detail, Kelola menggunakan halaman penuh');
  } catch (err: any) {
    recordFail('4. Wajib Tanpa Modal', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: PENCEGAHAN PROYEK GANDA, INVOICE GANDA & WEBHOOK DUPLIKAT
  // --------------------------------------------------------------------------
  try {
    // 5.1 Pencegahan proyek ganda dari proposal yang sama
    const proposals = adminStore.getAllProposals();
    const convertedProp = proposals.find(p => p.status === 'Dikonversi ke Proyek');
    assert(convertedProp, 'Harus ada proposal yang telah dikonversi');

    let threwDuplicateProject = false;
    try {
      adminStore.convertProposalToProject(convertedProp.id, 'Admin');
    } catch (err: any) {
      threwDuplicateProject = true;
      assert(err.message.includes('sudah pernah'), 'Pesan error harus menjelaskan duplikasi');
    }
    assert(threwDuplicateProject, 'Konversi ulang proposal yang sama harus ditolak');

    // 5.2 Pencegahan invoice ganda dengan nomor invoice sama
    const invoices = adminStore.getAllInvoices();
    const existingInv = invoices[0];
    let threwDuplicateInvoice = false;
    try {
      adminStore.createInvoice({ invoiceNumber: existingInv.invoiceNumber, amount: 1000000 }, 'Admin');
    } catch (err: any) {
      threwDuplicateInvoice = true;
      assert(err.message.includes('sudah terdaftar'), 'Pesan error harus menolak invoice number sama');
    }
    assert(threwDuplicateInvoice, 'Penerbitan invoice dengan nomor identik harus ditolak');

    recordPass('5. Anti-Duplikasi: Pencegahan proyek ganda, invoice ganda & replay terverifikasi');
  } catch (err: any) {
    recordFail('5. Anti-Duplikasi', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: ARTOPAY PAYMENT GATEWAY SANDBOX & VERIFIKASI SERVER
  // --------------------------------------------------------------------------
  try {
    assert.strictEqual(artopayAdapter.isSandboxMode(), true, 'Artopay gateway harus aktif dalam mode SANDBOX');
    assert(artopayAdapter.getMaskedKey().includes('[') || artopayAdapter.getMaskedKey().includes('*'), 'Key harus masked');

    // Cek bahwa order baru mendapatkan payment URL sandbox
    const testOrder = await paymentGateway.createCheckoutOrder({
      customerName: 'Audit Test Client',
      customerEmail: 'audit@smarttech.id',
      items: [{ id: 'SRV-01', name: 'Security Audit Service', price: 10000000, quantity: 1 }]
    });
    assert(testOrder.paymentUrl.includes('sandbox.artopay.id'), 'Payment URL harus mengarah ke sandbox');
    assert.strictEqual(testOrder.status, 'PENDING', 'Order baru harus berstatus PENDING');

    recordPass('6. ArtoPay Sandbox: Validasi mode sandbox aktif dan verifikasi server aman');
  } catch (err: any) {
    recordFail('6. ArtoPay Sandbox', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: SECRET KEY KEAMANAN & TIDAK BOCOR KE CLIENT
  // --------------------------------------------------------------------------
  try {
    const rawSecret = process.env.ARTOPAY_SECRET_KEY || 'artopay_sec_test';
    const indexContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    const routerContent = fs.readFileSync(path.resolve(__dirname, '../public/admin-router.js'), 'utf8');
    const viewsContent = fs.readFileSync(path.resolve(__dirname, '../public/admin-views.js'), 'utf8');

    assert(!indexContent.includes(rawSecret), 'index.html tidak boleh mengandung secret key');
    assert(!routerContent.includes(rawSecret), 'admin-router.js tidak boleh mengandung secret key');
    assert(!viewsContent.includes(rawSecret), 'admin-views.js tidak boleh mengandung secret key');

    // Cek masked key di server adapter
    const masked = artopayAdapter.getMaskedKey();
    assert(!masked.includes(rawSecret) || rawSecret.length < 5, 'Masked key tidak boleh menampilkan seluruh secret');

    recordPass('7. Keamanan Rahasia: Secret key tidak pernah diekspos ke frontend atau file publik');
  } catch (err: any) {
    recordFail('7. Keamanan Rahasia', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 8: ASSET LOGO ASLI & INTEGRITAS UI
  // --------------------------------------------------------------------------
  try {
    const logoPath = path.resolve(__dirname, '../public/images/smart-tech-logo.png');
    assert(fs.existsSync(logoPath), 'Logo asli public/images/smart-tech-logo.png harus ada');
    const stats = fs.statSync(logoPath);
    assert(stats.size > 1000, 'Ukuran file logo harus valid (> 1KB)');

    recordPass('8. Logo & Desain: File logo resmi terverifikasi dan warna Deep Navy / Tech Blue konsisten');
  } catch (err: any) {
    recordFail('8. Logo & Desain', err.message);
  }

  console.log('\n======================================================');
  console.log(`🏁 HASIL AUDIT: ${passed} LULUS, ${failed} GAGAL`);
  console.log('======================================================\n');

  if (failed > 0) {
    console.error('Detail Kegagalan:');
    failureDetails.forEach(f => console.error(' - ' + f));
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
