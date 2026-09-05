const db = require('../config/db');
const smsService = require('../services/sms.service');

/**
 * GET /api/super-admin/stats — Statewide APMC & Procurement Executive Stats
 */
const getSuperAdminStats = async (req, res, next) => {
  try {
    // 1. Total Farmers
    const totalFarmersRes = await db('farmers').where({ role: 'farmer' }).count('id as count').first();
    const totalFarmers = parseInt(totalFarmersRes?.count || 0, 10);

    // 2. Total Mandi Centres
    const totalCentresRes = await db('procurement_centres').where({ status: 'active' }).count('id as count').first();
    const totalCentres = parseInt(totalCentresRes?.count || 0, 10);

    // 3. Total Procurement Volume & Total Payouts
    const procurementStats = await db('payments')
      .select(
        db.raw('COALESCE(SUM(actual_quantity_kg), 0) as total_procured_kg'),
        db.raw('COALESCE(SUM(amount), 0) as total_payout_amount'),
        db.raw("COALESCE(SUM(CASE WHEN status = 'transferred' THEN amount ELSE 0 END), 0) as dbt_transferred_amount")
      )
      .first();

    const totalProcuredKg = parseFloat(procurementStats?.total_procured_kg || 0);
    const totalPayoutAmount = parseFloat(procurementStats?.total_payout_amount || 0);
    const dbtTransferredAmount = parseFloat(procurementStats?.dbt_transferred_amount || 0);

    // 4. Bookings Breakdown
    const bookingStats = await db('bookings')
      .select(
        db.raw('COUNT(id) as total_bookings'),
        db.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings"),
        db.raw("COUNT(CASE WHEN status IN ('in_progress', 'checked_in') THEN 1 END) as active_queue_bookings")
      )
      .first();

    // 5. Grievances & Vigilance
    const grievanceStats = await db('grievances')
      .select(
        db.raw('COUNT(id) as total_grievances'),
        db.raw("COUNT(CASE WHEN status = 'open' THEN 1 END) as open_grievances"),
        db.raw("COUNT(CASE WHEN is_against_mandi = true OR target_authority = 'super_admin' THEN 1 END) as mandi_vigilance_reports"),
        db.raw("COUNT(CASE WHEN (is_against_mandi = true OR target_authority = 'super_admin') AND status = 'open' THEN 1 END) as pending_vigilance_reports")
      )
      .first();

    const statsData = {
      total_farmers: totalFarmers,
      total_centres: totalCentres,
      total_procured_quintals: (totalProcuredKg / 100).toFixed(1),
      total_procured_kg: totalProcuredKg,
      total_payout_amount: totalPayoutAmount,
      total_payouts_disbursed: dbtTransferredAmount,
      dbt_transferred_amount: dbtTransferredAmount,
      total_bookings: parseInt(bookingStats?.total_bookings || 0, 10),
      completed_bookings: parseInt(bookingStats?.completed_bookings || 0, 10),
      active_queue_bookings: parseInt(bookingStats?.active_queue_bookings || 0, 10),
      total_grievances: parseInt(grievanceStats?.total_grievances || 0, 10),
      open_grievances: parseInt(grievanceStats?.open_grievances || 0, 10),
      mandi_vigilance_reports: parseInt(grievanceStats?.mandi_vigilance_reports || 0, 10),
      pending_vigilance_reports: parseInt(grievanceStats?.pending_vigilance_reports || 0, 10),
    };

    res.json({
      stats: statsData,
      overview: statsData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/mandi-reports — List direct vigilance reports and complaints against mandis
 */
const getMandiReports = async (req, res, next) => {
  try {
    const { status, centre_id, priority } = req.query;

    let query = db('grievances')
      .join('farmers', 'grievances.farmer_id', 'farmers.id')
      .leftJoin('bookings', 'grievances.booking_id', 'bookings.id')
      .leftJoin('procurement_centres', 'grievances.centre_id', 'procurement_centres.id')
      .select(
        'grievances.*',
        'farmers.name as farmer_name',
        'farmers.phone as farmer_phone',
        'farmers.aadhaar_last4 as farmer_aadhaar',
        'farmers.village as farmer_village',
        'farmers.district as farmer_district',
        'bookings.token_number as booking_token',
        'bookings.commodity as booking_commodity',
        'procurement_centres.name as centre_name',
        'procurement_centres.district as centre_district'
      )
      .where((builder) => {
        builder.where('grievances.is_against_mandi', true)
          .orWhere('grievances.target_authority', 'super_admin');
      });

    if (status && status !== 'all') {
      query = query.where('grievances.status', status);
    }

    if (centre_id) {
      query = query.where('grievances.centre_id', centre_id);
    }

    if (priority && priority !== 'all') {
      query = query.where('grievances.priority', priority);
    }

    const reports = await query.orderBy('grievances.created_at', 'desc');

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/super-admin/grievances/:id — Super Admin Executive Resolution & Sanctions
 */
const resolveSuperAdminGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, super_admin_remarks, administrative_action } = req.body;

    const existing = await db('grievances').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Grievance ticket not found' });
    }

    const remarksWithAction = administrative_action
      ? `[प्रशासकीय कारवाई / Executive Action: ${administrative_action}] ${super_admin_remarks || ''}`
      : super_admin_remarks || existing.super_admin_remarks;

    const updateData = {
      status: status || 'resolved',
      super_admin_remarks: remarksWithAction,
      super_admin_resolved_by: req.user?.name || 'जिल्हा कृषी व पणन नियंत्रण अधिकारी (District Nodal Officer)',
      super_admin_resolved_at: db.fn.now(),
      admin_remarks: existing.admin_remarks
        ? `${existing.admin_remarks} | [Super Admin Directive]: ${remarksWithAction}`
        : `[Super Admin Directive]: ${remarksWithAction}`,
      resolved_by: req.user?.name || 'District Super Admin',
      resolved_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const [updatedGrievance] = await db('grievances')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Notify farmer via SMS
    const farmer = await db('farmers').where({ id: updatedGrievance.farmer_id }).first();
    if (farmer) {
      smsService.sendGrievanceResolved(farmer, updatedGrievance).catch((err) => {
        console.error('Failed to send super admin grievance SMS:', err.message);
      });
    }

    res.json({
      message: 'जिल्हा नियंत्रण अधिकाऱ्यांचा निर्णय नोंदवला गेला (Super Admin directive recorded successfully)',
      grievance: updatedGrievance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/centres-audit — Comprehensive Mandi Audits
 */
const getCentresAudit = async (req, res, next) => {
  try {
    const centres = await db('procurement_centres').where({ status: 'active' });

    const auditData = await Promise.all(
      centres.map(async (centre) => {
        const stats = await db('bookings')
          .join('time_slots', 'bookings.slot_id', 'time_slots.id')
          .where('time_slots.centre_id', centre.id)
          .select(
            db.raw('COUNT(bookings.id) as total_bookings'),
            db.raw("COUNT(CASE WHEN bookings.status = 'completed' THEN 1 END) as completed_count"),
            db.raw("COUNT(CASE WHEN bookings.status IN ('in_progress', 'checked_in') THEN 1 END) as in_queue_count"),
            db.raw("COUNT(CASE WHEN bookings.status = 'cancelled' THEN 1 END) as cancelled_count")
          )
          .first();

        const paymentStats = await db('payments')
          .join('bookings', 'payments.booking_id', 'bookings.id')
          .join('time_slots', 'bookings.slot_id', 'time_slots.id')
          .where('time_slots.centre_id', centre.id)
          .select(
            db.raw('COALESCE(SUM(payments.actual_quantity_kg), 0) as total_procured_kg'),
            db.raw('COALESCE(SUM(payments.amount), 0) as total_payout_amount')
          )
          .first();

        const grievanceCount = await db('grievances')
          .where({ centre_id: centre.id })
          .select(
            db.raw('COUNT(id) as total_grievances'),
            db.raw("COUNT(CASE WHEN is_against_mandi = true OR target_authority = 'super_admin' THEN 1 END) as vigilance_complaints")
          )
          .first();

        return {
          id: centre.id,
          name: centre.name,
          location: centre.location,
          district: centre.district,
          state: centre.state,
          operating_hours: centre.operating_hours,
          max_daily_capacity: centre.max_daily_capacity,
          commodities_accepted: centre.commodities_accepted ? (typeof centre.commodities_accepted === 'string' ? JSON.parse(centre.commodities_accepted) : centre.commodities_accepted) : [],
          total_bookings: parseInt(stats?.total_bookings || 0, 10),
          completed_count: parseInt(stats?.completed_count || 0, 10),
          in_queue_count: parseInt(stats?.in_queue_count || 0, 10),
          cancelled_count: parseInt(stats?.cancelled_count || 0, 10),
          total_procured_kg: parseFloat(paymentStats?.total_procured_kg || 0),
          total_payout_amount: parseFloat(paymentStats?.total_payout_amount || 0),
          total_grievances: parseInt(grievanceCount?.total_grievances || 0, 10),
          vigilance_complaints: parseInt(grievanceCount?.vigilance_complaints || 0, 10),
        };
      })
    );

    res.json({
      centres: auditData,
      centres_audit: auditData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuperAdminStats,
  getMandiReports,
  resolveSuperAdminGrievance,
  getCentresAudit,
};
