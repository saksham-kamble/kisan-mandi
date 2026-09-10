const db = require('../config/db');
const smsService = require('../services/sms.service');
const { getYieldRate } = require('./landRecord.controller');

/**
 * Generate a token number like "KM-0042" for a given slot.
 * Token is unique per slot per day.
 */
const generateToken = async (slotId) => {
  const count = await db('bookings').where({ slot_id: slotId }).count('id as total');
  const num = parseInt(count[0].total, 10) + 1;
  return `KM-${String(num).padStart(4, '0')}`;
};

/** POST /api/bookings — book a slot */
const createBooking = async (req, res, next) => {
  try {
    const {
      slot_id,
      commodity,
      estimated_quantity_kg,
      priority_level = 'standard',
      quality_grade = null,
      quality_score = null,
      quality_metrics = null,
      crop_image_url = null,
      priority_reason = null,
    } = req.body;
    const farmer_id = req.user.id;
    const requestedQty = parseFloat(estimated_quantity_kg);

    if (isNaN(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({ error: 'Valid estimated quantity is required' });
    }

    // 1. Quota Enforcement: Check 7/12 Land Records
    const landRecords = await db('farmer_land_records')
      .where({ farmer_id })
      .where('crop_sown', 'ilike', `%${commodity}%`);

    let totalQuotaKg = 0;
    let matchingRecordId = null;

    if (landRecords.length > 0) {
      matchingRecordId = landRecords[0].id;
      landRecords.forEach((rec) => {
        const yieldPerAcre = getYieldRate(rec.crop_sown);
        totalQuotaKg += parseFloat(rec.cultivated_area_acres) * yieldPerAcre;
      });
    } else {
      // Default 3 acres allowance if no record exists yet
      totalQuotaKg = 3.0 * getYieldRate(commodity);
    }

    // Check existing usage
    const usage = await db('bookings')
      .where({ farmer_id })
      .where('commodity', 'ilike', `%${commodity}%`)
      .whereNotIn('status', ['cancelled'])
      .sum('estimated_quantity_kg as used_kg')
      .first();

    const usedKg = parseFloat(usage?.used_kg || 0);
    const remainingQuotaKg = Math.max(0, totalQuotaKg - usedKg);

    if (requestedQty > remainingQuotaKg) {
      return res.status(400).json({
        error: `प्रमाणित ७/१२ कोटा मर्यादा ओलांडली (Exceeds 7/12 Quota Limit). उपलब्ध कोटा (Remaining): ${remainingQuotaKg.toFixed(0)} kg. एकूण कोटा (Total): ${totalQuotaKg.toFixed(0)} kg.`,
      });
    }

    // Check slot exists and is available
    const slot = await db('time_slots').where({ id: slot_id }).first();
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    if (slot.status === 'full' || slot.booked_count >= slot.max_farmers) {
      return res.status(409).json({ error: 'Slot is fully booked' });
    }
    if (slot.status === 'closed') {
      return res.status(409).json({ error: 'Slot is closed' });
    }

    // Check if farmer already booked this slot
    const existingBooking = await db('bookings')
      .where({ farmer_id, slot_id })
      .whereNot({ status: 'cancelled' })
      .first();
    if (existingBooking) {
      return res.status(409).json({ error: 'You have already booked this slot' });
    }

    const token_number = await generateToken(slot_id);
    const queue_position = slot.booked_count + 1;

    // Determine priority weight
    let priorityWeight = 0;
    if (priority_level === 'express_grade_a') priorityWeight = 2;
    if (priority_level === 'moisture_urgent') priorityWeight = 3;

    const [booking] = await db('bookings')
      .insert({
        farmer_id,
        slot_id,
        land_record_id: matchingRecordId,
        token_number,
        commodity,
        estimated_quantity_kg: requestedQty,
        queue_position,
        status: 'booked',
        priority_level,
        priority_weight: priorityWeight,
        quality_grade,
        quality_score: quality_score ? parseInt(quality_score, 10) : null,
        quality_metrics: typeof quality_metrics === 'object' ? JSON.stringify(quality_metrics) : quality_metrics,
        crop_image_url,
        priority_reason: priority_reason || (priority_level === 'express_grade_a' ? 'AI Pre-Checked Grade A' : 'Standard Queue'),
      })
      .returning('*');

    // Update slot booked count
    const newCount = slot.booked_count + 1;
    await db('time_slots')
      .where({ id: slot_id })
      .update({
        booked_count: newCount,
        status: newCount >= slot.max_farmers ? 'full' : 'available',
      });

    // Create initial payment record
    await db('payments').insert({
      booking_id: booking.id,
      status: 'pending',
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`centre-${slot.centre_id}`).emit('queue:updated', {
        centre_id: slot.centre_id,
        slot_id,
      });
    }

    // Send SMS confirmation
    try {
      const farmer = await db('farmers').where({ id: farmer_id }).first();
      const centre = await db('procurement_centres').where({ id: slot.centre_id }).first();
      await smsService.sendBookingConfirmation(farmer, booking, slot, centre);
    } catch (smsErr) {
      console.error('SMS notification failed:', smsErr.message);
      // Don't block the booking response if SMS fails
    }

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

/** GET /api/bookings/mine — farmer's bookings */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await db('bookings')
      .join('time_slots', 'bookings.slot_id', 'time_slots.id')
      .join('procurement_centres', 'time_slots.centre_id', 'procurement_centres.id')
      .where({ 'bookings.farmer_id': req.user.id })
      .select(
        'bookings.*',
        'time_slots.date',
        'time_slots.start_time',
        'time_slots.end_time',
        'procurement_centres.name as centre_name',
        'procurement_centres.location as centre_location'
      )
      .orderBy('time_slots.date', 'desc');

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

/** GET /api/bookings/:id — single booking detail */
const getBooking = async (req, res, next) => {
  try {
    const booking = await db('bookings')
      .join('time_slots', 'bookings.slot_id', 'time_slots.id')
      .join('procurement_centres', 'time_slots.centre_id', 'procurement_centres.id')
      .leftJoin('payments', 'bookings.id', 'payments.booking_id')
      .where({ 'bookings.id': req.params.id, 'bookings.farmer_id': req.user.id })
      .select(
        'bookings.*',
        'time_slots.date',
        'time_slots.start_time',
        'time_slots.end_time',
        'procurement_centres.name as centre_name',
        'procurement_centres.location as centre_location',
        'payments.amount as payment_amount',
        'payments.status as payment_status',
        'payments.payment_reference',
        'payments.paid_at'
      )
      .first();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/bookings/:id/cancel — cancel a booking */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await db('bookings')
      .where({ id: req.params.id, farmer_id: req.user.id })
      .first();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'booked') {
      return res.status(409).json({ error: 'Only booked (not checked-in) bookings can be cancelled' });
    }

    await db('bookings')
      .where({ id: booking.id })
      .update({ status: 'cancelled' });

    // Decrement slot count
    await db('time_slots')
      .where({ id: booking.slot_id })
      .decrement('booked_count', 1)
      .update({ status: 'available' });

    const io = req.app.get('io');
    const slot = await db('time_slots').where({ id: booking.slot_id }).first();
    if (io && slot) {
      io.to(`centre-${slot.centre_id}`).emit('queue:updated', {
        centre_id: slot.centre_id,
        slot_id: booking.slot_id,
      });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking };
