const dpaService = require('../services/dpaService');

exports.getAdvisees = (req, res, next) => {
  try {
    const list = dpaService.getAdvisees();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

exports.approve = (req, res, next) => {
  try {
    const { requestId, notes } = req.body;
    const result = dpaService.approveKrs(requestId || 'REQ-SA-2026-0842', notes);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.reject = (req, res, next) => {
  try {
    const { requestId, notes } = req.body;
    const result = dpaService.rejectKrs(requestId || 'REQ-SA-2026-0842', notes);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
