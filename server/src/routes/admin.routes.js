const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  checkInBooking,
  startProcessing,
  completeBooking,
  updatePayment,
  getCentreStats,
  updateBookingPriority,
} = require('../controllers/admin.controller');

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

router.patch('/bookings/:id/check-in', checkInBooking);
router.patch('/bookings/:id/start', startProcessing);
router.patch('/bookings/:id/priority', updateBookingPriority);
router.patch(
  '/bookings/:id/complete',
  [
    body('actual_quantity_kg').isFloat({ min: 0 }).withMessage('Actual quantity required'),
    body('actual_moisture_percentage').isFloat({ min: 0, max: 100 }).withMessage('Moisture percentage required'),
    body('quality_grade').isIn(['A', 'B', 'C', 'Rejected']).withMessage('Valid quality grade required'),
    body('quality_notes').optional().isString(),
  ],
  validate,
  completeBooking
);

router.patch(
  '/payments/:id',
  [
    body('status')
      .isIn(['pending', 'processing', 'paid', 'failed'])
      .withMessage('Valid status required'),
  ],
  validate,
  updatePayment
);

router.get('/centres/:id/stats', getCentreStats);

module.exports = router;
