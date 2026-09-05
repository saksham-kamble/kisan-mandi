const db = require('../config/db');
const smsService = require('../services/sms.service');

/**
 * Generate a unique Government Grievance / Vigilance Ticket Number
 * Format: GRV-MH-2024-XXXX or VIG-MH-2024-XXXX (for direct mandi reports to Super Admin)
 */
const generateTicketNumber = (isVigilance = false) => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const prefix = isVigilance ? 'VIG-MH' : 'GRV-MH';
  return `${prefix}-${year}-${randomPart}`;
};

/**
 * Farmer: Raise a new grievance / dispute ticket (or direct vigilance report against Mandi to Super Admin)
 */
const createGrievance = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const {
      category,
      subject,
      description,
      booking_id,
      centre_id,
      priority,
      target_authority,
      is_against_mandi,
    } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        error: 'Category, subject, and description are required',
      });
    }

    let targetCentreId = centre_id || null;

    // If booking_id is provided, resolve centre_id if not explicitly sent
    if (booking_id && !targetCentreId) {
      const booking = await db('bookings').where({ id: booking_id }).first();
      if (booking) {
        targetCentreId = booking.centre_id;
      }
    }

    const isDirectToSuperAdmin = target_authority === 'super_admin' || is_against_mandi === true;
    const ticketNumber = generateTicketNumber(isDirectToSuperAdmin);

    const [grievance] = await db('grievances')
      .insert({
        ticket_number: ticketNumber,
        farmer_id: farmerId,
        booking_id: booking_id || null,
        centre_id: targetCentreId,
        category,
        subject,
        description,
        priority: priority || (isDirectToSuperAdmin ? 'urgent' : 'medium'),
        status: 'open',
        target_authority: isDirectToSuperAdmin ? 'super_admin' : 'mandi_admin',
        is_against_mandi: Boolean(isDirectToSuperAdmin),
      })
      .returning('*');

    // Fetch farmer profile for SMS alert
    const farmer = await db('farmers').where({ id: farmerId }).first();
    if (farmer) {
      smsService.sendGrievanceFiled(farmer, grievance).catch((err) => {
        console.error('Failed to send grievance SMS:', err.message);
      });
    }

    res.status(201).json({
      message: isDirectToSuperAdmin
        ? 'मंडी तक्रार थेट जिल्हा नियंत्रण अधिकाऱ्यांकडे (Super Admin) नोंदवली गेली (Report directly submitted to District Super Admin)'
        : 'तक्रार यशस्वीरित्या नोंदवली गेली (Grievance ticket created successfully)',
      grievance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Farmer: Get all grievances filed by logged-in farmer
 */
const getMyGrievances = async (req, res, next) => {
  try {
    const farmerId = req.user.id;

    const grievances = await db('grievances')
      .leftJoin('bookings', 'grievances.booking_id', 'bookings.id')
      .leftJoin('procurement_centres', 'grievances.centre_id', 'procurement_centres.id')
      .where('grievances.farmer_id', farmerId)
      .select(
        'grievances.*',
        'bookings.token_number as booking_token',
        'bookings.commodity as booking_commodity',
        'procurement_centres.name as centre_name',
        'procurement_centres.location as centre_location'
      )
      .orderBy('grievances.created_at', 'desc');

    res.json({ grievances });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin / Super Admin: Get all grievances across mandi centres with filters
 */
const getAllGrievances = async (req, res, next) => {
  try {
    const { status, category, centre_id, target_authority, is_against_mandi } = req.query;

    let query = db('grievances')
      .join('farmers', 'grievances.farmer_id', 'farmers.id')
      .leftJoin('bookings', 'grievances.booking_id', 'bookings.id')
      .leftJoin('procurement_centres', 'grievances.centre_id', 'procurement_centres.id')
      .select(
        'grievances.*',
        'farmers.name as farmer_name',
        'farmers.phone as farmer_phone',
        'farmers.aadhaar_last4 as farmer_aadhaar',
        'bookings.token_number as booking_token',
        'bookings.commodity as booking_commodity',
        'procurement_centres.name as centre_name'
      );

    if (status && status !== 'all') {
      query = query.where('grievances.status', status);
    }

    if (category && category !== 'all') {
      query = query.where('grievances.category', category);
    }

    if (centre_id) {
      query = query.where('grievances.centre_id', centre_id);
    }

    if (target_authority && target_authority !== 'all') {
      query = query.where('grievances.target_authority', target_authority);
    }

    if (is_against_mandi !== undefined && is_against_mandi !== 'all') {
      query = query.where('grievances.is_against_mandi', is_against_mandi === 'true' || is_against_mandi === true);
    }

    const grievances = await query.orderBy('grievances.created_at', 'desc');

    res.json({ grievances });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Resolve / update remarks on a grievance
 */
const resolveGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks, resolved_by } = req.body;

    const existing = await db('grievances').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Grievance ticket not found' });
    }

    const updateData = {
      status: status || existing.status,
      admin_remarks: admin_remarks || existing.admin_remarks,
      resolved_by: resolved_by || req.user?.name || 'Mandi Grievance Officer',
      updated_at: db.fn.now(),
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = db.fn.now();
    }

    const [updatedGrievance] = await db('grievances')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Notify farmer via SMS
    const farmer = await db('farmers').where({ id: updatedGrievance.farmer_id }).first();
    if (farmer) {
      smsService.sendGrievanceResolved(farmer, updatedGrievance).catch((err) => {
        console.error('Failed to send resolution SMS:', err.message);
      });
    }

    res.json({
      message: 'तक्रार निवारण अद्ययावत केले (Grievance updated successfully)',
      grievance: updatedGrievance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGrievance,
  getMyGrievances,
  getAllGrievances,
  resolveGrievance,
};
