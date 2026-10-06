const express = require('express');
const router = express.Router();
const prodiController = require('../controllers/prodiController');

router.get('/quota-summary', prodiController.getQuotaSummary);
router.post('/confirm-classes', prodiController.confirmClasses);

module.exports = router;
