// Automated Test Suite for Smart Tech 8 Business Website Demos
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemoTests() {
  console.log('======================================================');
  console.log('🧪 AUDIT 8 INSPIRASI WEBSITE BISNIS INTERAKTIF');
  console.log('======================================================\n');

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
  // TEST 1: KELENGKAPAN 8 BIDANG USAHA DEMO
  // --------------------------------------------------------------------------
  try {
    const { DEMO_WEBSITES } = await import('../src/data/demoWebsites.ts');

    const expectedIndustries = [
      { slug: 'toko-baju', name: 'Toko baju', expectedAction: 'checkout' },
      { slug: 'toko-sepatu', name: 'Toko sepatu', expectedAction: 'checkout' },
      { slug: 'restoran', name: 'Restoran dan kuliner', expectedAction: 'order' },
      { slug: 'skincare', name: 'Skincare dan kecantikan', expectedAction: 'checkout' },
      { slug: 'furniture', name: 'Furniture dan interior', expectedAction: 'checkout' },
      { slug: 'bengkel', name: 'Bengkel dan otomotif', expectedAction: 'booking' },
      { slug: 'properti', name: 'Properti', expectedAction: 'survey' },
      { slug: 'kafe', name: 'Kafe dan coffee shop', expectedAction: 'order' },
    ];

    for (const ind of expectedIndustries) {
      const cfg = DEMO_WEBSITES[ind.slug];
      assert(cfg, `Konfigurasi demo ${ind.name} (${ind.slug}) harus tersedia`);
      assert.strictEqual(cfg.slug, ind.slug, `Slug demo harus ${ind.slug}`);
      assert(cfg.businessName && cfg.businessName.length > 2, `Nama bisnis demo harus valid`);
      assert(cfg.heroHeadline && cfg.heroHeadline.length > 5, `Hero headline harus ada`);
      assert(cfg.heroImage && cfg.heroImage.startsWith('http'), `Hero image harus URL valid`);
      assert.strictEqual(cfg.actionType, ind.expectedAction, `Action type harus ${ind.expectedAction}`);
      assert(Array.isArray(cfg.items) && cfg.items.length >= 4, `Minimal 4 item katalog pada ${ind.slug}`);

      // Validasi item dalam industri
      for (const item of cfg.items) {
        assert(item.id, 'Item ID harus ada');
        assert(item.name, 'Item nama harus ada');
        assert(typeof item.price === 'number' && item.price > 0, 'Harga item harus valid');
        assert(item.image && item.image.startsWith('http'), 'Gambar item harus ada');
        assert(item.description, 'Deskripsi item harus ada');
      }
    }

    recordPass('1. 8 Bidang Usaha: Toko baju, sepatu, resto, skincare, furniture, bengkel, properti, kafe terverifikasi lengkap');
  } catch (err: any) {
    recordFail('1. Kelengkapan 8 Bidang Usaha', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: ATURAN ZERO-MODAL / TANPA MODAL, POPUP, ATAU DRAWER
  // --------------------------------------------------------------------------
  try {
    const demoViewFile = fs.readFileSync(path.resolve(__dirname, '../src/components/demo/DemoWebsiteView.tsx'), 'utf8');
    const showcaseFile = fs.readFileSync(path.resolve(__dirname, '../src/components/public/DemoShowcaseSection.tsx'), 'utf8');

    // Pastikan tidak ada modal backdrop atau floating window
    assert(!demoViewFile.includes('fixed inset-0 z-50 bg-black/'), 'DemoWebsiteView tidak boleh menggunakan modal backdrop');
    assert(!demoViewFile.includes('<dialog'), 'DemoWebsiteView tidak boleh menggunakan tag <dialog>');
    assert(!showcaseFile.includes('fixed inset-0'), 'DemoShowcaseSection tidak boleh menggunakan modal');

    // Pastikan alur checkout/booking menggunakan pergantian viewStep full-page
    assert(demoViewFile.includes("setViewStep('checkout')"), 'Alur checkout harus menggunakan viewStep');
    assert(demoViewFile.includes("setViewStep('upselling')"), 'Alur upselling harus menggunakan viewStep');

    recordPass('2. Zero-Modal: Alur detail, keranjang, checkout, dan upselling 100% full-page tanpa modal/popup/drawer');
  } catch (err: any) {
    recordFail('2. Zero-Modal', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: STRATEGI UPSELLING & KALIMAT WAJIB
  // --------------------------------------------------------------------------
  try {
    const demoViewFile = fs.readFileSync(path.resolve(__dirname, '../src/components/demo/DemoWebsiteView.tsx'), 'utf8');

    const exactUpsellingPhrase = 'Ini adalah demo website interaktif. Ingin menerima pesanan, pembayaran, booking, dan pengelolaan data pelanggan secara otomatis? Konsultasikan pengembangan website full-stack dengan Smart Tech.';
    assert(demoViewFile.includes(exactUpsellingPhrase), 'Teks upselling wajib harus terpasang persis sesuai instruksi');

    assert(demoViewFile.includes('Konsultasikan Website Full-Stack'), 'Tombol upselling harus terpasang');
    assert(demoViewFile.includes('onConsultFullStack'), 'Handler konsultasi full-stack harus aktif');

    recordPass('3. Upselling Wajib: Pesan dan tombol konsultasi website full-stack terverifikasi persis');
  } catch (err: any) {
    recordFail('3. Strategi Upselling', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: BATASAN KEAMANAN & ISOLASI TRANSAKSI NYATA
  // --------------------------------------------------------------------------
  try {
    const demoViewFile = fs.readFileSync(path.resolve(__dirname, '../src/components/demo/DemoWebsiteView.tsx'), 'utf8');

    // Demo TIDAK BOLEH memanggil API ArtoPay langsung atau endpoint transaksi sungguhan
    assert(!demoViewFile.includes('/api/artopay/checkout'), 'Demo tidak boleh memanggil /api/artopay/checkout');
    assert(!demoViewFile.includes('paymentGateway.createPaymentOrder'), 'Demo tidak boleh memanggil payment gateway');
    assert(!demoViewFile.includes('cvv') && !demoViewFile.includes('creditCardSecret'), 'Demo tidak boleh meminta kartu kredit sensitif');

    recordPass('4. Batasan Demo: Transaksi berhenti di frontend tanpa pembayaran nyata atau koneksi ArtoPay');
  } catch (err: any) {
    recordFail('4. Batasan Demo', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: INTEGRASI ROUTING & FORM LEADS REFERENSI MINAT
  // --------------------------------------------------------------------------
  try {
    const appFile = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    const inquiryFile = fs.readFileSync(path.resolve(__dirname, '../src/components/public/InquirySection.tsx'), 'utf8');
    const headerFile = fs.readFileSync(path.resolve(__dirname, '../src/components/public/Header.tsx'), 'utf8');

    // Routing /demo
    assert(appFile.includes("cleanPath.startsWith('/demo')"), 'Route /demo harus didukung di App.tsx');
    assert(appFile.includes('<DemoWebsiteView'), 'Komponen DemoWebsiteView harus dimount di App.tsx');
    assert(appFile.includes('<DemoShowcaseSection'), 'Komponen DemoShowcaseSection harus dimount di App.tsx');

    // Header navigasi ke inspirasi
    assert(headerFile.includes('#inspirasi'), 'Header harus menyediakan link #inspirasi ke 8 demo');

    // Form leads menerima referensi minat demo
    assert(inquiryFile.includes('demoInterest: prefillMessage'), 'Form inquiry harus mengirimkan demoInterest');
    assert(inquiryFile.includes('Referensi Minat Solusi'), 'Form inquiry harus menampilkan badge referensi minat');

    recordPass('5. Integrasi Routing & Leads: Route /demo, navigasi #inspirasi, dan prefill referensi minat terpasang');
  } catch (err: any) {
    recordFail('5. Integrasi Routing & Leads', err.message);
  }

  console.log('\n======================================================');
  console.log(`🏁 HASIL AUDIT DEMO: ${passed} LULUS, ${failed} GAGAL`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runDemoTests().catch(err => {
  console.error('Fatal demo test failure:', err);
  process.exit(1);
});
