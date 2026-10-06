const paymentService = require('../services/paymentService');

exports.getInvoice = (req, res, next) => {
  try {
    const nim = req.params.nim || '1251420128';
    const invoice = paymentService.getInvoice(nim);
    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

exports.selectBank = (req, res, next) => {
  try {
    const { nim, bank } = req.body;
    const invoice = paymentService.selectBank(nim || '1251420128', bank);
    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

exports.simulatePayment = (req, res, next) => {
  try {
    const { nim } = req.body;
    const result = paymentService.simulatePayment(nim || '1251420128');
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.checkMutation = (req, res, next) => {
  try {
    const nim = req.params.nim || '1251420128';
    const result = paymentService.checkMutation(nim);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
