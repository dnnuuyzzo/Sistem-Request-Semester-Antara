const courseService = require('../services/courseService');

exports.getCourses = (req, res, next) => {
  try {
    const courses = courseService.getAllCourses(req.query);
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

exports.getCourseDetails = (req, res, next) => {
  try {
    const course = courseService.getCourseByCode(req.params.code);
    res.json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecommendations = (req, res, next) => {
  try {
    const nim = req.params.nim || '1251420128';
    const result = courseService.getStudentRecommendations(nim);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
