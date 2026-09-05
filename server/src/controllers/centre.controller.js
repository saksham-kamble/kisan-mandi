const db = require('../config/db');

/** GET /api/centres — list all active centres */
const getCentres = async (req, res, next) => {
  try {
    const { district } = req.query;
    let query = db('procurement_centres').where({ status: 'active' });
    if (district) {
      query = query.where('district', 'ilike', `%${district}%`);
    }
    const centres = await query.orderBy('name');
    // Parse commodities_accepted safely
    centres.forEach((c) => {
      try {
        c.commodities_accepted = typeof c.commodities_accepted === 'string'
          ? JSON.parse(c.commodities_accepted)
          : (Array.isArray(c.commodities_accepted) ? c.commodities_accepted : []);
      } catch (e) {
        c.commodities_accepted = [];
      }
    });
    res.json({ centres });
  } catch (err) {
    next(err);
  }
};

/** GET /api/centres/:id — single centre details */
const getCentre = async (req, res, next) => {
  try {
    const centre = await db('procurement_centres')
      .where({ id: req.params.id })
      .first();
    if (!centre) {
      return res.status(404).json({ error: 'Centre not found' });
    }
    try {
      centre.commodities_accepted = typeof centre.commodities_accepted === 'string'
        ? JSON.parse(centre.commodities_accepted)
        : (Array.isArray(centre.commodities_accepted) ? centre.commodities_accepted : []);
    } catch (e) {
      centre.commodities_accepted = [];
    }
    res.json({ centre });
  } catch (err) {
    next(err);
  }
};

/** GET /api/centres/:id/slots — available slots for a centre on a date */
const getCentreSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = db('time_slots')
      .where({ centre_id: req.params.id })
      .where('status', '!=', 'closed');

    if (date) {
      query = query.where({ date });
    } else {
      // Default: today and future
      query = query.where('date', '>=', new Date().toISOString().split('T')[0]);
    }

    const slots = await query.orderBy(['date', 'start_time']);
    res.json({ slots });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCentres, getCentre, getCentreSlots };
