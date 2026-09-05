const db = require('../config/db');
const smsService = require('../services/sms.service');

/** PATCH /api/admin/bookings/:id/check-in — admin marks farmer as checked in */
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await db('bookings').where({ id: req.params.id }).first();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'booked') {
      return res.status(409).json({ error: 'Booking already checked in or completed' });
    }

    await db('bookings')
      .where({ id: booking.id })
      .update({ status: 'checked_in', checked_in_at: db.fn.now() });

    const slot = await db('time_slots').where({ id: booking.slot_id }).first();
    const io = req.app.get('io');
    if (io && slot) {
      io.to(`centre-${slot.centre_id}`).emit('queue:updated', {
        centre_id: slot.centre_id,
        slot_id: booking.slot_id,
      });
    }

    // Send Check-in SMS
    try {
      const farmer = await db('farmers').where({ id: booking.farmer_id }).first();
      await smsService.sendCheckIn(farmer, booking, booking.queue_position);
    } catch (smsErr) {
      console.error('SMS notification failed:', smsErr.message);
    }

    res.json({ message: 'Farmer checked in successfully' });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/bookings/:id/start — admin starts processing a booking */
const startProcessing = async (req, res, next) => {
  try {
    const booking = await db('bookings').where({ id: req.params.id }).first();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db('bookings').where({ id: booking.id }).update({ status: 'in_progress' });

    const slot = await db('time_slots').where({ id: booking.slot_id }).first();
    const io = req.app.get('io');
    if (io && slot) {
      io.to(`centre-${slot.centre_id}`).emit('queue:updated', {
        centre_id: slot.centre_id,
        slot_id: booking.slot_id,
      });
    }

    // Send "Now Serving" SMS
    try {
      const farmer = await db('farmers').where({ id: booking.farmer_id }).first();
      await smsService.sendTurnStarted(farmer, booking);
    } catch (smsErr) {
      console.error('SMS notification failed:', smsErr.message);
    }

    res.json({ message: 'Processing started' });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/bookings/:id/complete — admin completes a booking */
const completeBooking = async (req, res, next) => {
  try {
    let {
      actual_quantity_kg,
      actual_moisture_percentage,
      quality_grade,
      quality_notes
    } = req.body;

    const booking = await db('bookings').where({ id: req.params.id }).first();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Fetch MSP record for rate and max moisture
    const mspRecord = await db('msp_rates')
      .where('commodity', 'ilike', `%${booking.commodity}%`)
      .first();

    const msp_rate = mspRecord ? parseFloat(mspRecord.msp_rate_per_quintal) : 2275.0;
    const max_allowed_moisture = mspRecord ? parseFloat(mspRecord.max_moisture_percentage) : 12.0;

    // Calculate moisture deduction
    let moisture_deduction_kg = 0;
    if (actual_moisture_percentage > max_allowed_moisture) {
      const excess = actual_moisture_percentage - max_allowed_moisture;
      // Standard formula: 0.5% weight deduction per 1% excess moisture
      moisture_deduction_kg = (parseFloat(actual_quantity_kg) * excess * 0.5) / 100;
    }

    const net_quantity_kg = parseFloat(actual_quantity_kg) - moisture_deduction_kg;

    // Calculate quality deduction percentage
    const qualityDeductions = { A: 0, B: 2, C: 5, Rejected: 100 };
    const quality_deduction_percentage = qualityDeductions[quality_grade] || 0;

    // Calculate amounts
    const quintals = net_quantity_kg / 100;
    const gross_amount = quintals * msp_rate;
    const deduction_amount = (gross_amount * quality_deduction_percentage) / 100;
    const final_amount = gross_amount - deduction_amount;

    await db('bookings')
      .where({ id: booking.id })
      .update({ status: 'completed', completed_at: db.fn.now() });

    // Update payment with quality inspection data
    const paymentRef = `DBT-MH-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}`;

    await db('payments')
      .where({ booking_id: booking.id })
      .update({
        actual_quantity_kg: parseFloat(actual_quantity_kg),
        actual_moisture_percentage: parseFloat(actual_moisture_percentage),
        max_allowed_moisture_percentage: max_allowed_moisture,
        moisture_deduction_kg,
        quality_grade,
        quality_deduction_percentage,
        net_quantity_kg,
        gross_amount,
        deduction_amount,
        amount: final_amount,
        msp_rate,
        payment_reference: paymentRef,
        status: quality_grade === 'Rejected' ? 'failed' : 'processing',
        quality_notes: quality_notes || null
      });

    const slot = await db('time_slots').where({ id: booking.slot_id }).first();
    const io = req.app.get('io');
    if (io && slot) {
      io.to(`centre-${slot.centre_id}`).emit('queue:updated', {
        centre_id: slot.centre_id,
        slot_id: booking.slot_id,
      });
    }

    // Send Procurement Completed SMS
    try {
      const farmer = await db('farmers').where({ id: booking.farmer_id }).first();
      await smsService.sendProcurementCompleted(farmer, booking, actual_quantity_kg, final_amount);
    } catch (smsErr) {
      console.error('SMS notification failed:', smsErr.message);
    }

    res.json({ message: 'Booking completed with quality inspection', amount: final_amount });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/payments/:id — admin updates payment status */
const updatePayment = async (req, res, next) => {
  try {
    const { status, payment_reference } = req.body;
    const payment = await db('payments').where({ id: req.params.id }).first();
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updates = { status };
    if (payment_reference) updates.payment_reference = payment_reference;
    if (status === 'paid') updates.paid_at = db.fn.now();

    await db('payments').where({ id: payment.id }).update(updates);

    // Send Payment Paid SMS
    if (status === 'paid') {
      try {
        const booking = await db('bookings').where({ id: payment.booking_id }).first();
        const farmer = await db('farmers').where({ id: booking.farmer_id }).first();
        await smsService.sendPaymentPaid(farmer, booking, payment.amount, payment_reference);
      } catch (smsErr) {
        console.error('SMS notification failed:', smsErr.message);
      }
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/centres/:id/stats — centre statistics for today */
const getCentreStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const slots = await db('time_slots')
      .where({ centre_id: id, date: today })
      .select('id');

    if (slots.length === 0) {
      return res.json({
        total_bookings: 0,
        completed: 0,
        in_progress: 0,
        waiting: 0,
      });
    }

    const slotIds = slots.map((s) => s.id);
    const bookings = await db('bookings')
      .whereIn('slot_id', slotIds)
      .whereNot('status', 'cancelled')
      .select('status');

    const stats = {
      total_bookings: bookings.length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      in_progress: bookings.filter((b) => b.status === 'in_progress').length,
      waiting: bookings.filter((b) => ['booked', 'checked_in'].includes(b.status)).length,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkInBooking,
  startProcessing,
  completeBooking,
  updatePayment,
  getCentreStats,
};
