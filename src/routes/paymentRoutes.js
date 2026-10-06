const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/invoice/:nim?', paymentController.getInvoice);
router.post('/select-bank', paymentController.selectBank);
router.post('/simulate-pay', paymentController.simulatePayment);
router.get('/check-mutation/:nim?', paymentController.checkMutation);

module.exports = router;
