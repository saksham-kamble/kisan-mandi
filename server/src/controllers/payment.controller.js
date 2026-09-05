const db = require('../config/db');

/** GET /api/payments/:bookingId — get payment status */
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await db('payments')
      .join('bookings', 'payments.booking_id', 'bookings.id')
      .join('farmers', 'bookings.farmer_id', 'farmers.id')
      .where({ 'payments.booking_id': req.params.bookingId, 'bookings.farmer_id': req.user.id })
      .select(
        'payments.*',
        'farmers.bank_name',
        'farmers.bank_account_number',
        'farmers.bank_ifsc',
        'farmers.bank_branch'
      )
      .first();

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

/** GET /api/payments — all payments for logged-in farmer */
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await db('payments')
      .join('bookings', 'payments.booking_id', 'bookings.id')
      .join('farmers', 'bookings.farmer_id', 'farmers.id')
      .join('time_slots', 'bookings.slot_id', 'time_slots.id')
      .join('procurement_centres', 'time_slots.centre_id', 'procurement_centres.id')
      .where({ 'bookings.farmer_id': req.user.id })
      .select(
        'payments.*',
        'bookings.token_number',
        'bookings.commodity',
        'procurement_centres.name as centre_name',
        'time_slots.date',
        'farmers.bank_name',
        'farmers.bank_account_number',
        'farmers.bank_ifsc',
        'farmers.bank_branch'
      )
      .orderBy('payments.created_at', 'desc');

    res.json({ payments });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPaymentStatus, getMyPayments };
