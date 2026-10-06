const express = require('express');
const router = express.Router();
const dpaController = require('../controllers/dpaController');

router.get('/advisees', dpaController.getAdvisees);
router.post('/approve', dpaController.approve);
router.post('/reject', dpaController.reject);

module.exports = router;
