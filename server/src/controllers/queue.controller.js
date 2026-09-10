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
    const rawBookings = await db('bookings')
      .join('farmers', 'bookings.farmer_id', 'farmers.id')
      .whereIn('bookings.slot_id', slotIds)
      .whereNot('bookings.status', 'cancelled')
      .select(
        'bookings.*',
        'farmers.name as farmer_name',
        'farmers.phone as farmer_phone',
        'farmers.village as farmer_village',
        'farmers.district as farmer_district'
      );

    // Safely parse quality_metrics
    rawBookings.forEach((b) => {
      if (b.quality_metrics && typeof b.quality_metrics === 'string') {
        try {
          b.quality_metrics = JSON.parse(b.quality_metrics);
        } catch (e) {
          b.quality_metrics = null;
        }
      }
    });

    // Priority Queue Sorting Algorithm:
    // 1. in_progress first
    // 2. checked_in: higher priority_weight first, then checked_in_at ASC
    // 3. booked: higher priority_weight first, then queue_position ASC
    // 4. completed: completed_at DESC
    const sortedQueue = rawBookings.sort((a, b) => {
      const statusWeight = { in_progress: 1, checked_in: 2, booked: 3, completed: 4 };
      const aStatus = statusWeight[a.status] || 5;
      const bStatus = statusWeight[b.status] || 5;

      if (aStatus !== bStatus) return aStatus - bStatus;

      // If both are checked in: compare priority_weight (higher first), then checked_in_at
      if (a.status === 'checked_in') {
        const pWeightDiff = (b.priority_weight || 0) - (a.priority_weight || 0);
        if (pWeightDiff !== 0) return pWeightDiff;
        return new Date(a.checked_in_at || 0) - new Date(b.checked_in_at || 0);
      }

      // If both are booked: compare priority_weight (higher first), then queue_position
      if (a.status === 'booked') {
        const pWeightDiff = (b.priority_weight || 0) - (a.priority_weight || 0);
        if (pWeightDiff !== 0) return pWeightDiff;
        return (a.queue_position || 0) - (b.queue_position || 0);
      }

      // If completed: latest first
      if (a.status === 'completed') {
        return new Date(b.completed_at || 0) - new Date(a.completed_at || 0);
      }

      return 0;
    });

    // Current serving
    const currentToken = sortedQueue.find((b) => b.status === 'in_progress') || null;
    const completed = sortedQueue.filter((b) => b.status === 'completed').length;
    const waiting = sortedQueue.filter((b) =>
      ['booked', 'checked_in'].includes(b.status)
    ).length;
    const priorityCount = sortedQueue.filter(
      (b) => (b.priority_weight || 0) > 0 && ['booked', 'checked_in', 'in_progress'].includes(b.status)
    ).length;

    res.json({
      queue: sortedQueue,
      currentToken,
      stats: {
        total: sortedQueue.length,
        completed,
        waiting,
        priority_count: priorityCount,
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
