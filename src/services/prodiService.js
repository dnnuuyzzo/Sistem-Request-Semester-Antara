const db = require('../database/db');
const { MIN_QUOTA_PER_CLASS, STATUS_LIFECYCLE, COST_PER_SKS, ADMIN_FEE } = require('../config/academicRules');

class ProdiService {
  getQuotaSummary() {
    const courses = db.get('courses');
    return courses.map(c => {
      const isEligible = c.enrolled >= MIN_QUOTA_PER_CLASS;
      const percentage = Math.min(100, Math.round((c.enrolled / c.capacity) * 100));

      return {
        ...c,
        isEligible,
        percentage,
        thresholdRemaining: Math.max(0, MIN_QUOTA_PER_CLASS - c.enrolled),
        statusBadge: isEligible ? 'Lolos Kuota (≥ 10 Mhs)' : `Kurang ${MIN_QUOTA_PER_CLASS - c.enrolled} Mhs`
      };
    });
  }

  confirmAndOpenClasses() {
    const requests = db.find('krs_requests', r => r.stage === STATUS_LIFECYCLE.VERIFIKASI_KUOTA);
    const allCourses = db.get('courses');
    const now = new Date().toISOString();

    for (const req of requests) {
      req.stage = STATUS_LIFECYCLE.MENUNGGU_PEMBAYARAN;
      req.prodiApprovedAt = now;
      db.update('krs_requests', r => r.requestId === req.requestId, () => req);

      // Generate Invoice if not already created
      const existingInv = db.findOne('invoices', inv => inv.requestId === req.requestId);
      if (!existingInv) {
        const selectedCourses = req.courseCodes.map(code => allCourses.find(c => c.code === code)).filter(Boolean);
        const subtotal = req.totalSks * COST_PER_SKS;
        const total = subtotal + ADMIN_FEE;

        const invoice = {
          invoiceNumber: `INV-SA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          requestId: req.requestId,
          nim: req.nim,
          studentName: req.studentName,
          prodi: 'Teknik Informatika',
          items: [
            ...selectedCourses.map(c => ({
              name: c.name,
              code: c.code,
              sks: c.sks,
              rate: COST_PER_SKS,
              subtotal: c.sks * COST_PER_SKS
            })),
            {
              name: 'Biaya Administrasi & Registrasi Sistem',
              code: 'ADM-01',
              sks: 0,
              rate: ADMIN_FEE,
              subtotal: ADMIN_FEE
            }
          ],
          subtotalCourses: subtotal,
          adminFee: ADMIN_FEE,
          totalAmount: total,
          virtualAccounts: {
            bsi: { bankName: 'Bank Syariah Indonesia', bankCode: '451', vaNumber: `988${req.nim}042`, accountName: `BSI VA - SIA SA ${req.studentName.toUpperCase()}` },
            mandiri: { bankName: 'Bank Mandiri', bankCode: '008', vaNumber: `8808${req.nim}801`, accountName: `MANDIRI VA - SIA SA ${req.studentName.toUpperCase()}` }
          },
          selectedBank: 'bsi',
          dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          status: 'MENUNGGU_PEMBAYARAN',
          paidAt: null
        };
        db.insert('invoices', invoice);
      }

      db.insert('audit_logs', {
        id: `LOG-${Date.now()}`,
        requestId: req.requestId,
        event: 'Validasi Kuota Prodi Selesai',
        description: 'Admin Program Studi TI mengonfirmasi kuota kelas terpenuhi (min. 10 mahasiswa). Tagihan Virtual Account diterbitkan.',
        timestamp: now,
        actor: 'Admin Program Studi TI'
      });
    }

    return {
      success: true,
      message: 'Seluruh kelas yang memenuhi kuota telah dikunci dan dibuka secara definitif. Tagihan Virtual Account diterbitkan.',
      updatedRequestsCount: requests.length
    };
  }
}

module.exports = new ProdiService();
