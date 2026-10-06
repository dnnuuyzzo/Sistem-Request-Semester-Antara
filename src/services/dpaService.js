const db = require('../database/db');
const { STATUS_LIFECYCLE } = require('../config/academicRules');

class DpaService {
  getAdvisees() {
    const students = db.get('students');
    const requests = db.get('krs_requests');
    const allCourses = db.get('courses');

    return students.map(st => {
      const krs = requests.find(r => r.nim === st.nim);
      const courses = krs ? krs.courseCodes.map(code => allCourses.find(c => c.code === code)).filter(Boolean) : [];

      return {
        student: st,
        krsRequest: krs ? { ...krs, courses } : null
      };
    });
  }

  approveKrs(requestId, notes = null) {
    const krs = db.findOne('krs_requests', r => r.requestId === requestId);
    if (!krs) {
      const err = new Error(`Berkas pengajuan ${requestId} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    const finalNotes = notes || 'Disetujui. Fokus pada mata kuliah perbaikan untuk peningkatan IPK. Maksimalkan praktikum dan kehadiran.';

    krs.stage = STATUS_LIFECYCLE.VERIFIKASI_KUOTA;
    krs.dpaApprovedAt = now;
    krs.dpaNotes = finalNotes;

    db.update('krs_requests', r => r.requestId === requestId, () => krs);

    db.insert('audit_logs', {
      id: `LOG-${Date.now()}`,
      requestId,
      event: 'Disetujui Dosen Penasihat Akademik',
      description: `Dr. Dewi Khairani, M.Sc. menyetujui permohonan KRS. Catatan: "${finalNotes}"`,
      timestamp: now,
      actor: 'Dr. Dewi Khairani, M.Sc. (DPA)'
    });

    return {
      success: true,
      message: 'KRS mahasiswa bimbingan berhasil disetujui. Berkas diteruskan ke Program Studi.',
      data: krs
    };
  }

  rejectKrs(requestId, notes) {
    const krs = db.findOne('krs_requests', r => r.requestId === requestId);
    if (!krs) {
      const err = new Error(`Berkas pengajuan ${requestId} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    const finalNotes = notes || 'Mohon perbaiki pilihan mata kuliah. Sesuaikan dengan prioritas kelulusan kurikulum.';

    krs.stage = STATUS_LIFECYCLE.DRAFT;
    krs.dpaNotes = finalNotes;

    db.update('krs_requests', r => r.requestId === requestId, () => krs);

    db.insert('audit_logs', {
      id: `LOG-${Date.now()}`,
      requestId,
      event: 'KRS Dikembalikan oleh DPA (Revisi)',
      description: `Dr. Dewi Khairani, M.Sc. mengembalikan berkas KRS untuk diperbaiki. Catatan: "${finalNotes}"`,
      timestamp: now,
      actor: 'Dr. Dewi Khairani, M.Sc. (DPA)'
    });

    return {
      success: true,
      message: 'Berkas KRS dikembalikan ke mahasiswa untuk revisi pilihan mata kuliah.',
      data: krs
    };
  }
}

module.exports = new DpaService();
