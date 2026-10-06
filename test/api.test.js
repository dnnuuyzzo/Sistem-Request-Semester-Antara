const assert = require('assert');
const app = require('../src/app');

// Mini test runner using Node.js built-in http request
function runTest() {
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`\n======================================================`);
    console.log(`🧪 RUNNING AUTOMATED API TEST SUITE: SIA-SA FST`);
    console.log(`======================================================\n`);

    async function fetchApi(path, options = {}) {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data };
    }

    let passed = 0;
    let failed = 0;

    async function it(title, fn) {
      try {
        await fn();
        console.log(`  ✅ PASS: ${title}`);
        passed++;
      } catch (err) {
        console.error(`  ❌ FAIL: ${title}`);
        console.error(`     Reason:`, err.message);
        failed++;
      }
    }

    try {
      // Test 1: Health check
      await it('GET /api/health returns online status', async () => {
        const res = await fetchApi('/api/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.status, 'ONLINE');
      });

      // Test 2: Course catalog
      await it('GET /api/courses returns course catalog list', async () => {
        const res = await fetchApi('/api/courses');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert(res.data.data.length >= 5, 'Must contain at least 5 courses');
      });

      // Test 3: Filter course by prodi
      await it('GET /api/courses?prodi=Teknik Informatika filters properly', async () => {
        const res = await fetchApi('/api/courses?prodi=Teknik%20Informatika');
        assert.strictEqual(res.status, 200);
        assert(res.data.data.every(c => c.prodi === 'Teknik Informatika'));
      });

      // Test 4: Academic rule - Valid 6 SKS (TIF204 & TIF106)
      await it('POST /api/krs/validate accepts valid <= 9 SKS with C/D grades', async () => {
        const res = await fetchApi('/api/krs/validate', {
          method: 'POST',
          body: JSON.stringify({
            nim: '1251420128',
            courseCodes: ['TIF204', 'TIF106']
          })
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.totalSks, 6);
      });

      // Test 5: Academic rule - Reject exceeding 9 SKS
      await it('POST /api/krs/validate rejects > 9 SKS (MAX_SKS_EXCEEDED)', async () => {
        const res = await fetchApi('/api/krs/validate', {
          method: 'POST',
          body: JSON.stringify({
            nim: '1251420128',
            courseCodes: ['TIF204', 'TIF106', 'TIF208', 'TIF210'] // 12 SKS
          })
        });
        assert.strictEqual(res.data.success, false);
        const hasRule = res.data.data.errors.some(e => e.rule === 'MAX_SKS_EXCEEDED');
        assert(hasRule, 'Should contain MAX_SKS_EXCEEDED error');
      });

      // Test 6: Academic rule - Reject retaking course with previous grade B
      await it('POST /api/krs/validate rejects retaking course with grade B (INVALID_GRADE_FOR_RETAKE)', async () => {
        const res = await fetchApi('/api/krs/validate', {
          method: 'POST',
          body: JSON.stringify({
            nim: '1251420128',
            courseCodes: ['TIF209'] // Pemrograman Web (Grade B)
          })
        });
        assert.strictEqual(res.data.success, false);
        const hasGradeErr = res.data.data.errors.some(e => e.rule === 'INVALID_GRADE_FOR_RETAKE');
        assert(hasGradeErr, 'Should contain INVALID_GRADE_FOR_RETAKE error');
      });

      // Test 7: Submit KRS workflow
      await it('POST /api/krs/submit submits KRS and sets stage to MENUNGGU_DPA', async () => {
        const res = await fetchApi('/api/krs/submit', {
          method: 'POST',
          body: JSON.stringify({
            nim: '1251420128',
            courseCodes: ['TIF204', 'TIF106'],
            agreementChecked: true
          })
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.stage, 'MENUNGGU_DPA');
      });

      // Test 8: DPA Approval workflow
      await it('POST /api/dpa/approve approves student submission and advances to VERIFIKASI_KUOTA', async () => {
        const res = await fetchApi('/api/dpa/approve', {
          method: 'POST',
          body: JSON.stringify({
            requestId: 'REQ-SA-2026-0842',
            notes: 'Disetujui. Maksimalkan nilai praktikum.'
          })
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.stage, 'VERIFIKASI_KUOTA');
      });

      // Test 9: Prodi quota verification & class confirmation
      await it('POST /api/prodi/confirm-classes confirms class and issues invoice', async () => {
        const res = await fetchApi('/api/prodi/confirm-classes', {
          method: 'POST'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
      });

      // Test 10: Invoice & Payment simulation
      await it('POST /api/payments/simulate-pay verifies VA and updates status to TERDAFTAR_RESMI', async () => {
        const res = await fetchApi('/api/payments/simulate-pay', {
          method: 'POST',
          body: JSON.stringify({ nim: '1251420128' })
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.invoice.status, 'LUNAS');
        assert.strictEqual(res.data.krs.stage, 'TERDAFTAR_RESMI');
      });

      console.log(`\n------------------------------------------------------`);
      console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
      console.log(`------------------------------------------------------\n`);

      server.close();
      process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
      console.error('Fatal test error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runTest();
