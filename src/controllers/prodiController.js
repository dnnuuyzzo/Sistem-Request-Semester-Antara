const prodiService = require('../services/prodiService');

exports.getQuotaSummary = (req, res, next) => {
  try {
    const summary = prodiService.getQuotaSummary();
    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmClasses = (req, res, next) => {
  try {
    const result = prodiService.confirmAndOpenClasses();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.openCourse = (req, res, next) => {
  try {
    const result = prodiService.openCourse(req.params.code);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.closeCourse = (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const result = prodiService.closeCourse(req.params.code, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = (req, res, next) => {
  try {
    const result = prodiService.updateCourse(req.params.code, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
