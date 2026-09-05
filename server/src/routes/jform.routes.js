const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { generateJForm } = require('../controllers/jform.controller');

const router = Router();

// Farmer or admin can download their J-Form receipt
router.get('/:bookingId', authenticate, generateJForm);

module.exports = router;
