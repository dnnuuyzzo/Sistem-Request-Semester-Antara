const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getCourses);
router.get('/recommendations/:nim?', courseController.getRecommendations);
router.get('/:code', courseController.getCourseDetails);

module.exports = router;
