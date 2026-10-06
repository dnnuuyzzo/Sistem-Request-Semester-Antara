const db = require('../database/db');

class CourseService {
  getAllCourses(query = {}) {
    let courses = db.get('courses');

    const { search, prodi, semester, status } = query;

    if (search) {
      const q = search.toLowerCase().trim();
      courses = courses.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.lecturer.toLowerCase().includes(q)
      );
    }

    if (prodi && prodi !== 'all') {
      courses = courses.filter(c => c.prodi.toLowerCase() === prodi.toLowerCase());
    }

    if (semester && semester !== 'all') {
      courses = courses.filter(c => c.semester === semester);
    }

    if (status && status !== 'all') {
      courses = courses.filter(c => c.status === status);
    }

    return courses;
  }

  getCourseByCode(code) {
    const course = db.findOne('courses', c => c.code.toUpperCase() === code.toUpperCase());
    if (!course) {
      const err = new Error(`Mata kuliah dengan kode ${code} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }
    return course;
  }

  getStudentRecommendations(nim) {
    const student = db.findOne('students', s => s.nim === nim);
    if (!student) {
      const err = new Error(`Mahasiswa ${nim} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const allCourses = db.get('courses');
    const eligibleRecommendations = [];
    const ineligibleCourses = [];

    for (const h of student.transcriptHistory || []) {
      const matchedCourse = allCourses.find(c => c.code === h.courseCode);
      if (matchedCourse) {
        if (['C', 'D', 'E'].includes(h.grade)) {
          eligibleRecommendations.push({
            ...matchedCourse,
            oldGrade: h.grade,
            termOldGrade: h.term,
            eligible: true
          });
        } else {
          ineligibleCourses.push({
            ...matchedCourse,
            oldGrade: h.grade,
            termOldGrade: h.term,
            eligible: false,
            reason: `Nilai sebelumnya ${h.grade} (Lulus Baik). Hanya nilai C, D, atau E yang dapat diperbaiki.`
          });
        }
      }
    }

    return {
      student: {
        nim: student.nim,
        name: student.name,
        prodi: student.prodi,
        ipk: student.ipk,
        status: student.academicStatus
      },
      eligibleRecommendations,
      ineligibleCourses
    };
  }
}

module.exports = new CourseService();
