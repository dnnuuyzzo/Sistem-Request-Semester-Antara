const db = require('../database/db');
const validationService = require('./validationService');
const { STATUS_LIFECYCLE, COST_PER_SKS, ADMIN_FEE } = require('../config/academicRules');

class KrsService {
  validateKrs(nim, courseCodes) {
    return validationService.validateKrsSubmission(nim, courseCodes);
  }

  submitKrs(nim, courseCodes, agreementChecked = true) {
    if (!agreementChecked) {
      const err = new Error('Anda harus menyetujui pernyataan kepatuhan regulasi akademik sebelum mengirimkan KRS.');
      err.statusCode = 400;
      throw err;
    }

    const validation = validationService.validateKrsSubmission(nim, courseCodes);
    if (!validation.isValid) {
      const err = new Error('Validasi akademik gagal.');
      err.statusCode = 400;
      err.details = validation.errors;
      throw err;
    }

    const existing = db.findOne('krs_requests', r => r.nim === nim);
    const requestId = existing ? existing.requestId : `REQ-SA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const requestData = {
      requestId,
      nim: validation.student.nim,
      studentName: validation.student.name,
      academicYear: '2025/2026',
      courseCodes,
      totalSks: validation.totalSks,
      stage: STATUS_LIFECYCLE.MENUNGGU_DPA,
      submittedAt: now,
      dpaApprovedAt: null,
      dpaNotes: null,
      prodiApprovedAt: null,
      isPaid: false,
      paidAt: null
    };

    if (existing) {
      db.update('krs_requests', r => r.nim === nim, () => requestData);
    } else {
      db.insert('krs_requests', requestData);
    }

    // Add Audit Log
    db.insert('audit_logs', {
      id: `LOG-${Date.now()}`,
      requestId,
      event: 'KRS Diajukan oleh Mahasiswa',
      description: `Pengajuan KRS ${validation.selectedCourses.length} mata kuliah (${validation.totalSks} SKS) berhasil diteruskan ke DPA.`,
      timestamp: now,
      actor: `${validation.student.name} (${validation.student.nim})`
    });

    return {
      success: true,
      message: 'Pengajuan KRS berhasil dikirimkan ke Dosen Pembimbing Akademik.',
      data: {
        ...requestData,
        selectedCourses: validation.selectedCourses
      }
    };
  }

  getKrsStatus(nim) {
    const krs = db.findOne('krs_requests', r => r.nim === nim);
    if (!krs) {
      // Default fallback sample for student
      return {
        hasRequest: false,
        stage: STATUS_LIFECYCLE.DRAFT,
        message: 'Belum ada pengajuan KRS aktif.'
      };
    }

    const allCourses = db.get('courses');
    const courses = krs.courseCodes.map(code => allCourses.find(c => c.code === code)).filter(Boolean);
    const invoice = db.findOne('invoices', inv => inv.requestId === krs.requestId || inv.nim === nim);
    const logs = db.find('audit_logs', l => l.requestId === krs.requestId);

    return {
      hasRequest: true,
      krs: {
        ...krs,
        courses
      },
      invoice,
      logs
    };
  }

  updateStage(requestId, newStage, note = null) {
    const krs = db.findOne('krs_requests', r => r.requestId === requestId);
    if (!krs) {
      const err = new Error(`Berkas pengajuan ${requestId} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    krs.stage = newStage;
    if (newStage === STATUS_LIFECYCLE.TERDAFTAR_RESMI) {
      krs.isPaid = true;
      krs.paidAt = new Date().toISOString();
    }
    db.update('krs_requests', r => r.requestId === requestId, () => krs);

    return krs;
  }
}

module.exports = new KrsService();
