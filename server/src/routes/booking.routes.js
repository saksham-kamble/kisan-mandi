const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
} = require('../controllers/booking.controller');

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('slot_id').isInt().withMessage('Slot ID is required'),
    body('commodity').trim().notEmpty().withMessage('Commodity is required'),
    body('estimated_quantity_kg')
      .isFloat({ min: 1 })
      .withMessage('Estimated quantity must be at least 1 kg'),
  ],
  validate,
  createBooking
);

router.get('/mine', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
