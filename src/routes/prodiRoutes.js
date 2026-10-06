const express = require('express');
const router = express.Router();
const prodiController = require('../controllers/prodiController');

router.get('/quota-summary', prodiController.getQuotaSummary);
router.post('/confirm-classes', prodiController.confirmClasses);
router.post('/courses/:code/open', prodiController.openCourse);
router.post('/courses/:code/close', prodiController.closeCourse);
router.put('/courses/:code', prodiController.updateCourse);

module.exports = router;
