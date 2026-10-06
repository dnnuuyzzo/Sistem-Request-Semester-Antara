const express = require('express');
const router = express.Router();
const krsController = require('../controllers/krsController');

router.post('/validate', krsController.validateKrs);
router.post('/submit', krsController.submitKrs);
router.get('/status/:nim?', krsController.getStatus);

module.exports = router;
