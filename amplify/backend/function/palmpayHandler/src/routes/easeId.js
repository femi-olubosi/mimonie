const express = require('express');
const easeIdController = require('../controllers/easeId');
const router = express.Router();

router.post('/', easeIdController.inquireNIN);
router.post('/face-compare', easeIdController.compareFace);

module.exports = router;
