const express = require('express');
const billerController = require('../controllers/biller');
const router = express.Router();

// GET /billers
router.get('/', billerController.getAllBillers);
router.get('/item', billerController.getBillerItem);

module.exports = router;
