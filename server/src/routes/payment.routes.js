const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getPaymentStatus, getMyPayments } = require('../controllers/payment.controller');

const router = Router();

router.get('/', authenticate, getMyPayments);
router.get('/:bookingId', authenticate, getPaymentStatus);

module.exports = router;
