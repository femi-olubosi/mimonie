const express = require('express');
const billerController = require('../controllers/biller');
const router = express.Router();

// GET /billers
router.get('/', billerController.getAllBillers);

// GET /billers/:billerId
router.get('/:billerId', billerController.getBillerById);

// GET /billers/:billerId/items
router.get('/:billerId/items', billerController.getBillerItems);

module.exports = router;
