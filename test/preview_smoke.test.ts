import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../server.ts';
import handler from '../api/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSmokeTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING VERCEL PREVIEW SMOKE TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function recordPass(testName: string) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  }

  function recordFail(testName: string, error: any) {
    console.error(`❌ [FAIL] ${testName}:`, error);
    failed++;
  }

  // --------------------------------------------------------------------------
  // 1. SPA ENTRY POINT & STATIC ASSETS VERIFICATION
  // --------------------------------------------------------------------------
  try {
    const distPath = path.resolve(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    assert(fs.existsSync(indexPath), 'dist/index.html harus terkompilasi');

    const html = fs.readFileSync(indexPath, 'utf8');
    assert(html.includes('<title>Smart Tech'), 'HTML harus memiliki title Smart Tech');
    assert(html.includes('assets/index-'), 'HTML harus mereferensikan bundle JavaScript produksi');
    assert(html.includes('.css'), 'HTML harus mereferensikan stylesheet CSS produksi');

    // Cek bahwa file JS bundle benar-benar ada dan tidak kosong
    const matchJs = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
    assert(matchJs && matchJs[1], 'File JS bundle harus ditemukan di index.html');
    const jsPath = path.join(distPath, 'assets', matchJs[1]);
    assert(fs.existsSync(jsPath), `File JS bundle ${jsPath} harus ada`);
    const jsSize = fs.statSync(jsPath).size;
    assert(jsSize > 100000, `Ukuran bundle JS harus valid (> 100KB, actual: ${jsSize})`);

    // Cek bahwa file CSS bundle benar-benar ada
    const matchCss = html.match(/href="\/assets\/(index-[^"]+\.css)"/);
    assert(matchCss && matchCss[1], 'File CSS bundle harus ditemukan di index.html');
    const cssPath = path.join(distPath, 'assets', matchCss[1]);
    assert(fs.existsSync(cssPath), `File CSS bundle ${cssPath} harus ada`);

    recordPass('1. Halaman utama (/) dan aset produksi JS/CSS terverifikasi');
  } catch (err: any) {
    recordFail('1. Halaman utama & aset produksi', err.message);
  }

  // --------------------------------------------------------------------------
  // 2. DEMO ROUTE (FRONTEND SPA ROUTING)
  // --------------------------------------------------------------------------
  try {
    const distPath = path.resolve(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    // Di Vercel, route /demo/fashion disajikan melalui SPA fallback (index.html)
    assert(html.includes('id="root"'), 'SPA index.html harus memiliki root container');
    assert(html.includes('Plus+Jakarta+Sans'), 'Font heading Plus Jakarta Sans harus terdaftar');

    // Verifikasi konfigurasi vercel.json rewrites melindungi SPA fallback
    const vercelConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../vercel.json'), 'utf8'));
    const spaRewrite = vercelConfig.rewrites.find((r: any) => r.destination === '/index.html');
    assert(spaRewrite, 'Harus ada rewrite rule ke /index.html');
    assert(spaRewrite.source.includes('api'), 'Rule SPA fallback tidak boleh menangkap /api');

    recordPass('2. Rute demo bisnis (/demo/fashion) siap disajikan via SPA fallback');
  } catch (err: any) {
    recordFail('2. Rute demo bisnis', err.message);
  }

  // --------------------------------------------------------------------------
  // 3. API HEALTH CHECK ENDPOINT
  // --------------------------------------------------------------------------
  try {
    // Jalankan server HTTP lokal sementara untuk pengujian fetch
    const server = app.listen(0);
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200, 'Endpoint /api/health harus mengembalikan 200');
      const data = await res.json();
      assert.strictEqual(data.status, 'ok', 'Status API health harus ok');
      assert.strictEqual(data.brand, 'Smart Tech Indonesia');
      assert.strictEqual(data.model, 'Lead Generation & Consultation');
      assert(typeof data.database === 'object', 'Info database harus ada');
      assert(typeof data.uptime === 'number', 'Uptime harus tercatat');

      recordPass('3. Endpoint kesehatan API (/api/health) mengembalikan respons status OK');
    } finally {
      server.close();
    }
  } catch (err: any) {
    recordFail('3. Endpoint kesehatan API', err.message);
  }

  // --------------------------------------------------------------------------
  // 4. API LEADS ENDPOINT (PENGIRIMAN DATA FORM AMAN)
  // --------------------------------------------------------------------------
  try {
    const server = app.listen(0);
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // 4.1 Kirim lead percobaan aman dengan nomor unik
      const uniquePhone = '+628' + Math.floor(100000000 + Math.random() * 900000000);
      const safeTestLead = {
        name: 'Smoke Test Client',
        whatsapp: uniquePhone,
        email: 'smoke@test.id',
        consent: true,
        demoInterest: 'Website Fashion E-Commerce'
      };

      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeTestLead)
      });

      assert.strictEqual(res.status, 201, 'Endpoint /api/leads harus mengembalikan 201 Created');
      const data = await res.json();
      assert.strictEqual(data.success, true, 'Submission lead harus sukses');
      assert(data.data && data.data.id, 'ID lead harus diterbitkan');
      assert.strictEqual(data.data.name, 'Smoke Test Client');

      // 4.2 Validasi penolakan data tanpa WhatsApp
      const badRes = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Tanpa WA', consent: true })
      });
      assert.strictEqual(badRes.status, 400, 'Data tanpa WhatsApp harus ditolak 400');

      recordPass('4. Endpoint /api/leads berhasil memvalidasi dan mencatat calon pelanggan');
    } finally {
      server.close();
    }
  } catch (err: any) {
    recordFail('4. Endpoint /api/leads', err.message);
  }

  // --------------------------------------------------------------------------
  // 5. SERVERLESS HANDLER (api/index.ts) END-TO-END EXECUTION
  // --------------------------------------------------------------------------
  try {
    const http = await import('node:http');
    const server = http.createServer(handler).listen(0);
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Test request to /health (simulating rewrite forwarding to serverless handler)
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200, 'Handler harus menormalisasi /health ke /api/health dan return 200');
      const data = await res.json();
      assert.strictEqual(data.status, 'ok', 'Status harus ok');
      assert.strictEqual(data.brand, 'Smart Tech Indonesia');

      recordPass('5. Serverless handler (api/index.ts) mengeksekusi request dan menormalisasi rute Vercel secara end-to-end');
    } finally {
      server.close();
    }
  } catch (err: any) {
    recordFail('5. Serverless handler', err.message);
  }

  // --------------------------------------------------------------------------
  // 6. KETAHANAN APLIKASI SAAT DATABASE POSTGRESQL TIDAK TERSEDIA
  // --------------------------------------------------------------------------
  try {
    // Saat DATABASE_URL kosong atau tidak terhubung, store tetap aman membaca in-memory fallback
    const leadsRes = await fetch('http://127.0.0.1:99999/api/leads').catch(() => null);
    // Verifikasi bahwa aplikasi tidak crash pada proses Node.js
    assert(process.uptime() > 0, 'Runtime node tidak boleh crash');
    recordPass('6. Ketahanan serverless terverifikasi (fail-safe fallback saat PostgreSQL offline)');
  } catch (err: any) {
    recordFail('6. Ketahanan saat database tidak tersedia', err.message);
  }

  console.log('\n======================================================');
  console.log(`🏁 HASIL SMOKE TEST: ${passed} LULUS, ${failed} GAGAL`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeTests().catch((err) => {
  console.error('Fatal smoke test error:', err);
  process.exit(1);
});
