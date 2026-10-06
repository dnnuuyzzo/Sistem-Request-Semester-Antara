const krsService = require('../services/krsService');

exports.validateKrs = (req, res, next) => {
  try {
    const { nim, courseCodes } = req.body;
    const result = krsService.validateKrs(nim || '1251420128', courseCodes);
    res.json({
      success: result.isValid,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.submitKrs = (req, res, next) => {
  try {
    const { nim, courseCodes, agreementChecked } = req.body;
    const result = krsService.submitKrs(nim || '1251420128', courseCodes, agreementChecked);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getStatus = (req, res, next) => {
  try {
    const nim = req.params.nim || '1251420128';
    const result = krsService.getKrsStatus(nim);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
