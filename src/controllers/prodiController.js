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
