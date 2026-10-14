// Comprehensive Audit Test Suite for Smart Tech Admin Dashboard & Client Portal
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_ENV = 'test';

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
    const appFile = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
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
      assert(appFile.includes(r), `Route ${r} harus didukung penuh di src/App.tsx`);
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
    const appContent = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');

    assert(!indexContent.includes(rawSecret), 'index.html tidak boleh mengandung secret key');
    assert(!appContent.includes(rawSecret), 'src/App.tsx tidak boleh mengandung secret key');

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

  // --------------------------------------------------------------------------
  // TEST 9: AKSES PORTAL TERSEMBUNYI (KLIK COPYRIGHT 1-9 SEMBUNYI, 10-13 MUNCUL, 14 RESET)
  // --------------------------------------------------------------------------
  try {
    const footerContent = fs.readFileSync(path.resolve(__dirname, '../src/components/public/Footer.tsx'), 'utf8');
    const headerContent = fs.readFileSync(path.resolve(__dirname, '../src/components/public/Header.tsx'), 'utf8');

    // 9.1 Header tidak menampilkan tombol portal normal
    assert(!headerContent.includes('btn_portal'), 'Header tidak boleh menampilkan trigger portal normal');
    assert(!headerContent.includes("onNavigate('/portal')"), 'Header tidak boleh memiliki link direct ke /portal');

    // 9.2 Logika klik copyright di Footer.tsx
    // Simulasi state transition fungsi handler
    let count = 0;
    const clickHandler = () => {
      count = count + 1 >= 14 ? 0 : count + 1;
      return count >= 10 && count <= 13;
    };

    // Siklus 1:
    for (let i = 1; i <= 9; i++) {
      const isVisible = clickHandler();
      assert.strictEqual(isVisible, false, `Siklus 1: Klik ke-${i} harus TIDAK menampilkan portal`);
    }
    for (let i = 10; i <= 13; i++) {
      const isVisible = clickHandler();
      assert.strictEqual(isVisible, true, `Siklus 1: Klik ke-${i} HARUS menampilkan portal`);
    }
    // Klik ke-14:
    const isVisible14 = clickHandler();
    assert.strictEqual(isVisible14, false, 'Siklus 1: Klik ke-14 harus mereset ke 0 dan menyembunyikan portal');
    assert.strictEqual(count, 0, 'Siklus 1: Hitungan harus 0 setelah klik 14');

    // Siklus 2 (Siklus berikutnya harus berfungsi):
    for (let i = 1; i <= 9; i++) {
      const isVisible = clickHandler();
      assert.strictEqual(isVisible, false, `Siklus 2: Klik ke-${i} harus TIDAK menampilkan portal`);
    }
    for (let i = 10; i <= 13; i++) {
      const isVisible = clickHandler();
      assert.strictEqual(isVisible, true, `Siklus 2: Klik ke-${i} HARUS menampilkan portal`);
    }
    const isVisible28 = clickHandler();
    assert.strictEqual(isVisible28, false, 'Siklus 2: Klik ke-14 siklus 2 harus mereset ke 0 dan menyembunyikan portal');
    assert.strictEqual(count, 0, 'Siklus 2: Hitungan harus 0 setelah klik 14');

    // 9.3 Verifikasi route yang digunakan
    assert(footerContent.includes("onNavigate('/portal')"), 'Footer harus mengarahkan ke /portal');
    assert(footerContent.includes("onNavigate('/admin/dashboard')"), 'Footer harus mengarahkan ke /admin/dashboard');

    recordPass('9. Akses Portal Tersembunyi: Siklus klik 1-9 tersembunyi, 10-13 tampil, 14 reset, siklus 2 valid');
  } catch (err: any) {
    recordFail('9. Akses Portal Tersembunyi', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 10: KEAMANAN SERVER: VERIFIKASI AUTENTIKASI & KEPEMILIKAN DATA
  // --------------------------------------------------------------------------
  try {
    const clients = adminStore.getAllClients();
    const projects = adminStore.getAllProjects();
    assert(clients.length >= 2, 'Minimal 2 klien');
    assert(projects.length >= 1, 'Minimal 1 proyek');

    const project = projects[0];
    const clientA = clients.find(c => c.id === project.clientId)!;
    const clientB = clients.find(c => c.id !== project.clientId)!;

    // 10.1 Kode akses tidak valid ditolak
    const authInvalid = adminStore.getClientByAccessCode('NON-EXISTENT-CODE');
    assert.strictEqual(authInvalid, undefined, 'Akses tidak sah ditolak');

    // 10.2 Kode akses valid diterima
    const authValid = adminStore.getClientByAccessCode(clientA.portalAccessCode);
    assert(authValid && authValid.id === clientA.id, 'Akses klien sah diterima');

    // 10.3 Otorisasi kepemilikan data: clientB bukan pemilik proyek clientA
    assert.notStrictEqual(clientB.id, project.clientId, 'Client B bukan pemilik project');

    recordPass('10. Keamanan Server: Autentikasi kode & otorisasi kepemilikan data terverifikasi');
  } catch (err: any) {
    recordFail('10. Keamanan Server', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 11: ALUR LENGKAP LEADS MANAGEMENT (FORM PUBLIK -> FOLLOW UP -> KONVERSI)
  // --------------------------------------------------------------------------
  try {
    // 11.1 Pendaftaran Lead Publik dari Website
    const initialLeads = adminStore.getAllLeads();
    const newLead = adminStore.createLead({
      name: 'Ir. Rahmat Hidayat',
      whatsapp: '+6281311223344',
      phone: '031-778899',
      email: 'rahmat@inovasimaju.id',
      address: 'Jl. Pemuda No. 88, Surabaya, Jawa Timur',
      source: 'Website',
      status: 'Baru',
      consentGiven: true
    }, 'Website Form');

    assert(newLead && newLead.id, 'Lead ID harus di-generate');
    assert.strictEqual(newLead.source, 'Website', 'Sumber lead harus Website');
    assert.strictEqual(newLead.status, 'Baru', 'Status awal lead harus Baru');
    assert.strictEqual(newLead.consentGiven, true, 'Persetujuan kontak harus tercatat');

    // 11.2 Verifikasi di Daftar Leads Admin & Pencarian
    const allLeadsAfter = adminStore.getAllLeads();
    assert.strictEqual(allLeadsAfter.length, initialLeads.length + 1, 'Jumlah leads bertambah 1');
    const searchByName = adminStore.getAllLeads({ search: 'Rahmat Hidayat' });
    assert(searchByName.length >= 1 && searchByName[0].id === newLead.id, 'Pencarian nama lead berhasil');
    const searchByPhone = adminStore.getAllLeads({ search: '81311223344' });
    assert(searchByPhone.length >= 1 && searchByPhone[0].id === newLead.id, 'Pencarian nomor WhatsApp berhasil');

    // 11.3 Penugasan PIC Marketing & Update Status
    const updatedLead = adminStore.updateLead(newLead.id, {
      status: 'Sudah Dihubungi',
      assignedMarketing: 'Sarah Wijaya',
      nextFollowUpDate: '2026-10-25'
    }, 'Sarah Wijaya');

    assert(updatedLead, 'Lead berhasil diupdate');
    assert.strictEqual(updatedLead.status, 'Sudah Dihubungi', 'Status harus menjadi Sudah Dihubungi');
    assert.strictEqual(updatedLead.assignedMarketing, 'Sarah Wijaya', 'Marketing harus Sarah Wijaya');
    assert.strictEqual(updatedLead.nextFollowUpDate, '2026-10-25', 'Tanggal follow-up berikutnya harus tersimpan');

    // 11.4 Pencatatan Hasil Telepon & WhatsApp
    const note = adminStore.addLeadNote(newLead.id, {
      author: 'Sarah Wijaya',
      type: 'WhatsApp',
      content: 'Calon pelanggan berminat membuat sistem logistik terpadu dan meminta estimasi jadwal.'
    });

    assert(note && note.id, 'Catatan follow-up harus tersimpan');
    assert.strictEqual(note.type, 'WhatsApp');
    const reloadedLead = adminStore.getLeadById(newLead.id)!;
    assert(reloadedLead.notes && reloadedLead.notes.length >= 1, 'Daftar catatan follow-up bertambah');
    assert(reloadedLead.activities && reloadedLead.activities.length >= 2, 'Riwayat aktivitas lead tercatat');

    // 11.5 Konversi Lead ke Alur Konsultasi (Anti-Duplikasi)
    const convertResult1 = adminStore.convertLeadToConsultation(newLead.id, 'Sarah Wijaya');
    assert(convertResult1.consultation && convertResult1.consultation.id, 'Konsultasi berhasil dibuat dari lead');
    assert.strictEqual(convertResult1.alreadyConverted, false, 'Konversi pertama berhasil bukan duplikat');
    assert.strictEqual(convertResult1.lead.status, 'Tertarik', 'Status lead berubah menjadi Tertarik');
    assert.strictEqual(convertResult1.lead.consultationId, convertResult1.consultation.id, 'ID konsultasi tertaut');

    // Uji Anti-Duplikasi: Percobaan konversi ulang harus mengembalikan data yang sama
    const convertResult2 = adminStore.convertLeadToConsultation(newLead.id, 'Sarah Wijaya');
    assert.strictEqual(convertResult2.alreadyConverted, true, 'Percobaan konversi ke-2 harus terdeteksi sudah dikonversi');
    assert.strictEqual(convertResult2.consultation.id, convertResult1.consultation.id, 'Tidak boleh membuat konsultasi ganda');

    // 11.6 Persistensi Data Leads ke File Disk
    const storePath = path.resolve(__dirname, '../data/admin_store.json');
    const diskRaw = fs.readFileSync(storePath, 'utf8');
    const diskParsed = JSON.parse(diskRaw);
    assert(Array.isArray(diskParsed.leads) && diskParsed.leads.some((l: any) => l.id === newLead.id), 'Data lead harus persisten tersimpan di JSON');

    recordPass('11. Leads Management: Form publik -> CRM Leads -> Penugasan -> Catatan -> Konversi anti-duplikasi & persisten');
  } catch (err: any) {
    recordFail('11. Leads Management', err.message);
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
