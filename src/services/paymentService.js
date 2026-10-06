const db = require('../database/db');
const { STATUS_LIFECYCLE } = require('../config/academicRules');

class PaymentService {
  getInvoice(nim = '1251420128') {
    let invoice = db.findOne('invoices', inv => inv.nim === nim);
    if (!invoice) {
      // Auto-create or fetch from krs
      const krs = db.findOne('krs_requests', r => r.nim === nim);
      if (krs) {
        const allCourses = db.get('courses');
        const selected = krs.courseCodes.map(c => allCourses.find(course => course.code === c)).filter(Boolean);
        const subtotal = krs.totalSks * 150000;
        const total = subtotal + 50000;

        invoice = {
          invoiceNumber: `INV-SA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          requestId: krs.requestId,
          nim: krs.nim,
          studentName: krs.studentName,
          prodi: 'Teknik Informatika',
          items: [
            ...selected.map(c => ({
              name: c.name,
              code: c.code,
              sks: c.sks,
              rate: 150000,
              subtotal: c.sks * 150000
            })),
            {
              name: 'Biaya Administrasi & Registrasi Sistem',
              code: 'ADM-01',
              sks: 0,
              rate: 50000,
              subtotal: 50000
            }
          ],
          subtotalCourses: subtotal,
          adminFee: 50000,
          totalAmount: total,
          virtualAccounts: {
            bsi: { bankName: 'Bank Syariah Indonesia', bankCode: '451', vaNumber: `988${krs.nim}042`, accountName: `BSI VA - SIA SA ${krs.studentName.toUpperCase()}` },
            mandiri: { bankName: 'Bank Mandiri', bankCode: '008', vaNumber: `8808${krs.nim}801`, accountName: `MANDIRI VA - SIA SA ${krs.studentName.toUpperCase()}` }
          },
          selectedBank: 'bsi',
          dueDate: '2026-07-17T23:59:59+07:00',
          status: 'MENUNGGU_PEMBAYARAN',
          paidAt: null
        };
        db.insert('invoices', invoice);
      }
    }
    return invoice;
  }

  selectBank(nim, bank) {
    const invoice = this.getInvoice(nim);
    if (!invoice) throw new Error('Invoice tidak ditemukan.');

    invoice.selectedBank = bank === 'mandiri' ? 'mandiri' : 'bsi';
    db.update('invoices', inv => inv.nim === nim, () => invoice);
    return invoice;
  }

  simulatePayment(nim = '1251420128') {
    const invoice = this.getInvoice(nim);
    if (!invoice) throw new Error('Invoice tidak ditemukan.');

    const now = new Date().toISOString();
    invoice.status = 'LUNAS';
    invoice.paidAt = now;
    db.update('invoices', inv => inv.nim === nim, () => invoice);

    const krs = db.findOne('krs_requests', r => r.nim === nim);
    if (krs) {
      krs.stage = STATUS_LIFECYCLE.TERDAFTAR_RESMI;
      krs.isPaid = true;
      krs.paidAt = now;
      db.update('krs_requests', r => r.nim === nim, () => krs);

      db.insert('audit_logs', {
        id: `LOG-${Date.now()}`,
        requestId: krs.requestId,
        event: 'Pembayaran Virtual Account Lunas & Terverifikasi',
        description: `Mutasi pembayaran senilai Rp ${invoice.totalAmount.toLocaleString('id-ID')} pada VA ${invoice.virtualAccounts[invoice.selectedBank].vaNumber} berhasil disinkronisasikan. Status: Terdaftar Resmi.`,
        timestamp: now,
        actor: 'Gateway Bank & Sistem Finansial FST'
      });
    }

    return {
      success: true,
      message: 'Pembayaran berhasil diverifikasi. Status perkuliahan mahasiswa telah "Terdaftar Resmi".',
      invoice,
      krs
    };
  }

  checkMutation(nim = '1251420128') {
    const invoice = this.getInvoice(nim);
    const isPaid = invoice && invoice.status === 'LUNAS';
    return {
      success: true,
      isPaid,
      status: isPaid ? 'LUNAS' : 'MENUNGGU_PEMBAYARAN',
      invoice
    };
  }
}

module.exports = new PaymentService();
