const express = require('express');
const router = express.Router();
const { healthCheck, getCurrencies, getDestinations } = require('../controllers/healthController');

// Health check
router.get('/health', healthCheck);

// Metadata
router.get('/metadata/currencies', getCurrencies);
router.get('/metadata/destinations', getDestinations);

module.exports = router;
