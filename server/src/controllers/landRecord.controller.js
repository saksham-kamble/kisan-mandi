const db = require('../config/db');

// Standard Government of Maharashtra Yield Rates (kg per Acre)
const YIELD_RATES_KG_PER_ACRE = {
  'Wheat': 1800,
  'Rice (Paddy)': 2000,
  'Mustard': 800,
  'Maize': 2200,
  'Gram (Chana)': 1000,
  'Soybean': 1000,
  'Cotton (Medium Staple)': 900,
  'Cotton': 900,
};

const getYieldRate = (cropName) => {
  for (const [key, val] of Object.entries(YIELD_RATES_KG_PER_ACRE)) {
    if (cropName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cropName.toLowerCase())) {
      return val;
    }
  }
  return 1500; // Default fallback yield
};

/**
 * Ensure default 7/12 land record exists for a farmer
 */
const ensureFarmerLandRecords = async (farmerId) => {
  try {
    const hasTable = await db.schema.hasTable('farmer_land_records');
    if (!hasTable) return;

    const existing = await db('farmer_land_records').where({ farmer_id: farmerId });
    if (existing.length === 0) {
      const farmer = await db('farmers').where({ id: farmerId }).first();
      // Auto-generate sample verified 7/12 land records for demo
      await db('farmer_land_records').insert([
        {
          farmer_id: farmerId,
          survey_number: `Gat-${Math.floor(100 + Math.random() * 900)}/2A`,
          village: farmer?.village || 'Baramati',
          taluka: farmer?.district || 'Baramati',
          district: farmer?.district || 'Pune',
          total_land_acres: 5.5,
          cultivated_area_acres: 3.5,
          crop_sown: 'Wheat',
          season: 'Rabi 2024-25',
          verification_status: 'verified',
          verified_by: 'MahaBhumi Digital 7/12 Portal',
        },
        {
          farmer_id: farmerId,
          survey_number: `Gat-${Math.floor(100 + Math.random() * 900)}/1B`,
          village: farmer?.village || 'Baramati',
          taluka: farmer?.district || 'Baramati',
          district: farmer?.district || 'Pune',
          total_land_acres: 4.0,
          cultivated_area_acres: 2.5,
          crop_sown: 'Gram (Chana)',
          season: 'Rabi 2024-25',
          verification_status: 'verified',
          verified_by: 'MahaBhumi Digital 7/12 Portal',
        },
      ]);
    }
  } catch (err) {
    console.error('Error ensuring 7/12 records:', err.message);
  }
};

/** GET /api/land-records — get logged-in farmer's 7/12 land records + quota summary */
const getMyLandRecords = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    await ensureFarmerLandRecords(farmerId);

    const records = await db('farmer_land_records').where({ farmer_id: farmerId });

    // Calculate quota for each record and check used quantity from bookings
    const enrichedRecords = await Promise.all(
      records.map(async (rec) => {
        const yieldPerAcre = getYieldRate(rec.crop_sown);
        const totalQuotaKg = parseFloat(rec.cultivated_area_acres) * yieldPerAcre;

        // Sum booked & completed quantities for this commodity
        const usage = await db('bookings')
          .where({ farmer_id: farmerId })
          .where('commodity', 'ilike', `%${rec.crop_sown}%`)
          .whereNotIn('status', ['cancelled'])
          .sum('estimated_quantity_kg as used_kg')
          .first();

        const usedKg = parseFloat(usage?.used_kg || 0);
        const remainingKg = Math.max(0, totalQuotaKg - usedKg);

        return {
          ...rec,
          yield_per_acre_kg: yieldPerAcre,
          total_quota_kg: totalQuotaKg,
          used_quota_kg: usedKg,
          remaining_quota_kg: remainingKg,
          usage_percentage: Math.min(100, Math.round((usedKg / totalQuotaKg) * 100)),
        };
      })
    );

    res.json({ land_records: enrichedRecords });
  } catch (err) {
    next(err);
  }
};

/** GET /api/land-records/quota/:commodity — get quota status for a specific crop */
const getQuotaForCommodity = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const { commodity } = req.params;
    await ensureFarmerLandRecords(farmerId);

    // Find land records for this crop
    const records = await db('farmer_land_records')
      .where({ farmer_id: farmerId })
      .where('crop_sown', 'ilike', `%${commodity}%`);

    if (records.length === 0) {
      // If no explicit record, give default quota allowance (3 acres yield)
      const defaultYield = getYieldRate(commodity);
      const defaultTotalQuota = 3.0 * defaultYield;

      const usage = await db('bookings')
        .where({ farmer_id: farmerId })
        .where('commodity', 'ilike', `%${commodity}%`)
        .whereNotIn('status', ['cancelled'])
        .sum('estimated_quantity_kg as used_kg')
        .first();

      const usedKg = parseFloat(usage?.used_kg || 0);
      const remainingKg = Math.max(0, defaultTotalQuota - usedKg);

      return res.json({
        has_712_record: false,
        total_quota_kg: defaultTotalQuota,
        used_quota_kg: usedKg,
        remaining_quota_kg: remainingKg,
        cultivated_acres: 3.0,
        survey_number: 'Unregistered / Self-Declared',
        verification_status: 'verified',
      });
    }

    // Sum all matching land records
    let totalQuotaKg = 0;
    let totalAcres = 0;
    const surveyNumbers = [];

    records.forEach((r) => {
      const yieldPerAcre = getYieldRate(r.crop_sown);
      totalQuotaKg += parseFloat(r.cultivated_area_acres) * yieldPerAcre;
      totalAcres += parseFloat(r.cultivated_area_acres);
      surveyNumbers.push(r.survey_number);
    });

    const usage = await db('bookings')
      .where({ farmer_id: farmerId })
      .where('commodity', 'ilike', `%${commodity}%`)
      .whereNotIn('status', ['cancelled'])
      .sum('estimated_quantity_kg as used_kg')
      .first();

    const usedKg = parseFloat(usage?.used_kg || 0);
    const remainingKg = Math.max(0, totalQuotaKg - usedKg);

    res.json({
      has_712_record: true,
      total_quota_kg: totalQuotaKg,
      used_quota_kg: usedKg,
      remaining_quota_kg: remainingKg,
      cultivated_acres: totalAcres,
      survey_number: surveyNumbers.join(', '),
      verification_status: records[0].verification_status,
      verified_by: records[0].verified_by,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/land-records — register a new 7/12 record */
const addLandRecord = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const {
      survey_number,
      village,
      taluka,
      district,
      total_land_acres,
      cultivated_area_acres,
      crop_sown,
      season,
    } = req.body;

    const [record] = await db('farmer_land_records')
      .insert({
        farmer_id: farmerId,
        survey_number,
        village,
        taluka: taluka || district,
        district,
        total_land_acres: parseFloat(total_land_acres),
        cultivated_area_acres: parseFloat(cultivated_area_acres),
        crop_sown,
        season: season || 'Rabi 2024-25',
        verification_status: 'verified', // Auto-verified in prototype
        verified_by: 'MahaBhumi Digital 7/12 Portal',
      })
      .returning('*');

    res.status(201).json({ land_record: record });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/land-records/:id — update a 7/12 record */
const updateLandRecord = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const {
      survey_number,
      village,
      taluka,
      district,
      total_land_acres,
      cultivated_area_acres,
      crop_sown,
      season,
    } = req.body;

    const existing = await db('farmer_land_records')
      .where({ id, farmer_id: farmerId })
      .first();

    if (!existing) {
      return res.status(404).json({ error: '7/12 Land record not found' });
    }

    const updateData = {};
    if (survey_number !== undefined) updateData.survey_number = survey_number.trim();
    if (village !== undefined) updateData.village = village.trim();
    if (taluka !== undefined) updateData.taluka = taluka.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (total_land_acres !== undefined) updateData.total_land_acres = parseFloat(total_land_acres);
    if (cultivated_area_acres !== undefined) updateData.cultivated_area_acres = parseFloat(cultivated_area_acres);
    if (crop_sown !== undefined) updateData.crop_sown = crop_sown.trim();
    if (season !== undefined) updateData.season = season.trim();
    updateData.updated_at = db.fn.now();

    const [updatedRecord] = await db('farmer_land_records')
      .where({ id, farmer_id: farmerId })
      .update(updateData)
      .returning('*');

    res.json({
      message: '७/१२ नोंद यशस्वीरित्या अद्ययावत केली (7/12 record updated successfully)',
      land_record: updatedRecord,
    });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/land-records/:id — delete a 7/12 record */
const deleteLandRecord = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const existing = await db('farmer_land_records')
      .where({ id, farmer_id: farmerId })
      .first();

    if (!existing) {
      return res.status(404).json({ error: '7/12 Land record not found' });
    }

    // Check if linked to an active booking
    const activeBooking = await db('bookings')
      .where({ land_record_id: id })
      .whereIn('status', ['booked', 'checked_in', 'in_progress'])
      .first();

    if (activeBooking) {
      return res.status(400).json({
        error: 'Cannot delete 7/12 land record linked to an active booking token. Please complete or cancel the booking first.',
      });
    }

    await db('farmer_land_records').where({ id, farmer_id: farmerId }).del();

    res.json({
      message: '७/१२ नोंद यशस्वीरित्या हटवली (7/12 record deleted successfully)',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyLandRecords,
  getQuotaForCommodity,
  addLandRecord,
  updateLandRecord,
  deleteLandRecord,
  getYieldRate,
};
