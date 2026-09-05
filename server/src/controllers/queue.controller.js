const db = require('../config/db');

/** GET /api/queue/:centreId/live — live queue for a centre */
const getLiveQueue = async (req, res, next) => {
  try {
    const { centreId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Get today's slots for this centre
    const slots = await db('time_slots')
      .where({ centre_id: centreId, date: today })
      .orderBy('start_time');

    if (slots.length === 0) {
      return res.json({ queue: [], currentToken: null, stats: { total: 0, completed: 0, waiting: 0 } });
    }

    const slotIds = slots.map((s) => s.id);

    // Get all bookings for today's slots
    const bookings = await db('bookings')
      .join('farmers', 'bookings.farmer_id', 'farmers.id')
      .whereIn('bookings.slot_id', slotIds)
      .whereNot('bookings.status', 'cancelled')
      .select(
        'bookings.id',
        'bookings.token_number',
        'bookings.commodity',
        'bookings.status',
        'bookings.queue_position',
        'bookings.checked_in_at',
        'bookings.completed_at',
        'farmers.name as farmer_name'
      )
      .orderBy('bookings.queue_position');

    // Current serving
    const currentToken = bookings.find((b) => b.status === 'in_progress') || null;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const waiting = bookings.filter((b) =>
      ['booked', 'checked_in'].includes(b.status)
    ).length;

    res.json({
      queue: bookings,
      currentToken,
      stats: {
        total: bookings.length,
        completed,
        waiting,
        in_progress: currentToken ? 1 : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/queue/:centreId/position/:bookingId — farmer's position in queue */
const getQueuePosition = async (req, res, next) => {
  try {
    const { centreId, bookingId } = req.params;

    const booking = await db('bookings')
      .join('time_slots', 'bookings.slot_id', 'time_slots.id')
      .where({ 'bookings.id': bookingId, 'time_slots.centre_id': centreId })
      .select('bookings.*', 'time_slots.centre_id')
      .first();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found at this centre' });
    }

    // Count people ahead
    const ahead = await db('bookings')
      .where({ slot_id: booking.slot_id })
      .whereIn('status', ['booked', 'checked_in', 'in_progress'])
      .where('queue_position', '<', booking.queue_position)
      .count('id as count');

    const position = parseInt(ahead[0].count, 10) + 1;
    const estimatedWaitMinutes = (position - 1) * 10; // ~10 min per farmer

    res.json({
      token_number: booking.token_number,
      status: booking.status,
      position,
      people_ahead: position - 1,
      estimated_wait_minutes: estimatedWaitMinutes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLiveQueue, getQueuePosition };
