const db = require('../database/db');
const { MAX_SKS, ALLOWED_RETAKE_GRADES, DISALLOWED_RETAKE_GRADES } = require('../config/academicRules');

class ValidationService {
  /**
   * Validate entire KRS submission request against academic rules (Tugas 2)
   */
  validateKrsSubmission(nim, courseCodes) {
    const student = db.findOne('students', s => s.nim === nim);
    const errors = [];
    const warnings = [];

    // 1. Validasi Status Keaktifan Mahasiswa
    if (!student) {
      errors.push({
        field: 'nim',
        rule: 'STUDENT_EXISTS',
        message: `Mahasiswa dengan NIM ${nim} tidak ditemukan dalam pangkalan data akademik FST.`
      });
      return { isValid: false, errors, warnings, student: null, selectedCourses: [], totalSks: 0 };
    }

    if (student.academicStatus !== 'AKTIF') {
      errors.push({
        field: 'academicStatus',
        rule: 'STUDENT_ACTIVE',
        message: `Status akademik Anda adalah "${student.academicStatus}". Pengajuan Semester Antara hanya dapat dilakukan oleh mahasiswa aktif.`
      });
    }

    // 2. Validasi Ketersediaan Mata Kuliah
    if (!Array.isArray(courseCodes) || courseCodes.length === 0) {
      errors.push({
        field: 'courseCodes',
        rule: 'COURSE_REQUIRED',
        message: 'Minimal pilih 1 mata kuliah untuk pengajuan KRS Semester Antara.'
      });
      return { isValid: false, errors, warnings, student, selectedCourses: [], totalSks: 0 };
    }

    const allCourses = db.get('courses');
    const selectedCourses = [];
    let totalSks = 0;

    for (const code of courseCodes) {
      const course = allCourses.find(c => c.code === code);
      if (!course) {
        errors.push({
          field: 'courseCodes',
          rule: 'COURSE_NOT_FOUND',
          message: `Mata kuliah dengan kode ${code} tidak terdaftar pada penawaran Semester Antara.`
        });
        continue;
      }
      selectedCourses.push(course);
      totalSks += course.sks;
    }

    // 3. Validasi Batas Maksimal 9 SKS
    if (totalSks > MAX_SKS) {
      errors.push({
        field: 'totalSks',
        rule: 'MAX_SKS_EXCEEDED',
        message: `Total beban studi yang dipilih (${totalSks} SKS) melebihi batas maksimal ${MAX_SKS} SKS yang diizinkan untuk Semester Antara.`
      });
    }

    // 4. Validasi Kualifikasi Nilai Lama (Hanya C, D, atau E)
    for (const course of selectedCourses) {
      const historyItem = (student.transcriptHistory || []).find(h => h.courseCode === course.code);

      if (historyItem) {
        if (DISALLOWED_RETAKE_GRADES.includes(historyItem.grade)) {
          errors.push({
            field: 'courseCodes',
            courseCode: course.code,
            rule: 'INVALID_GRADE_FOR_RETAKE',
            message: `Mata kuliah "${course.name}" (${course.code}) tidak memenuhi syarat perbaikan karena riwayat nilai sebelumnya adalah ${historyItem.grade} (Lulus Baik). Sesuai Pedoman Akademik FST, Semester Antara hanya diperuntukkan bagi perbaikan nilai C, D, atau E.`
          });
        }
      }
    }

    // 5. Validasi Bentrok Jadwal (Schedule Conflict)
    for (let i = 0; i < selectedCourses.length; i++) {
      for (let j = i + 1; j < selectedCourses.length; j++) {
        const c1 = selectedCourses[i];
        const c2 = selectedCourses[j];
        if (c1.schedule === c2.schedule) {
          errors.push({
            field: 'schedule',
            rule: 'SCHEDULE_CLASH',
            message: `Bentrok jadwal antara "${c1.name}" dan "${c2.name}" (${c1.schedule}).`
          });
        }
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      student: {
        nim: student.nim,
        name: student.name,
        prodi: student.prodi,
        semester: student.semester,
        academicStatus: student.academicStatus,
        dpa: student.dpa
      },
      selectedCourses,
      totalSks,
      estimatedCost: totalSks * 150000
    };
  }
}

module.exports = new ValidationService();
