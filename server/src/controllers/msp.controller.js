const db = require('../config/db');

/**
 * Seed initial official MSP rates if table is empty
 */
const ensureMSPRates = async () => {
  try {
    const hasTable = await db.schema.hasTable('msp_rates');
    if (!hasTable) return;

    const count = await db('msp_rates').count('id as total');
    if (parseInt(count[0].total, 10) === 0) {
      await db('msp_rates').insert([
        {
          commodity: 'Wheat',
          commodity_marathi: 'गहू',
          msp_rate_per_quintal: 2275.00,
          max_moisture_percentage: 12.0,
          season: 'Rabi 2024-25',
          category: 'Cereal',
        },
        {
          commodity: 'Rice (Paddy)',
          commodity_marathi: 'भात / धान',
          msp_rate_per_quintal: 2183.00,
          max_moisture_percentage: 14.0,
          season: 'Kharif 2024-25',
          category: 'Cereal',
        },
        {
          commodity: 'Mustard',
          commodity_marathi: 'मोहरी',
          msp_rate_per_quintal: 5650.00,
          max_moisture_percentage: 8.0,
          season: 'Rabi 2024-25',
          category: 'Oilseed',
        },
        {
          commodity: 'Maize',
          commodity_marathi: 'मका',
          msp_rate_per_quintal: 2090.00,
          max_moisture_percentage: 14.0,
          season: 'Kharif 2024-25',
          category: 'Coarse Cereal',
        },
        {
          commodity: 'Gram (Chana)',
          commodity_marathi: 'हरभरा / चणा',
          msp_rate_per_quintal: 5440.00,
          max_moisture_percentage: 10.0,
          season: 'Rabi 2024-25',
          category: 'Pulse',
        },
        {
          commodity: 'Soybean',
          commodity_marathi: 'सोयाबीन',
          msp_rate_per_quintal: 4892.00,
          max_moisture_percentage: 12.0,
          season: 'Kharif 2024-25',
          category: 'Oilseed',
        },
        {
          commodity: 'Cotton (Medium Staple)',
          commodity_marathi: 'कापूस',
          msp_rate_per_quintal: 7121.00,
          max_moisture_percentage: 8.0,
          season: 'Kharif 2024-25',
          category: 'Commercial',
        },
      ]);
      console.log('✅ Official Government MSP Master Rates seeded');
    }
  } catch (err) {
    console.error('Error ensuring MSP rates:', err.message);
  }
};

/** GET /api/msp-rates — list all active MSP rates */
const getMSPRates = async (req, res, next) => {
  try {
    await ensureMSPRates();
    const rates = await db('msp_rates').where({ is_active: true }).orderBy('category');
    res.json({ rates });
  } catch (err) {
    next(err);
  }
};

/** GET /api/msp-rates/:commodity — get rate for specific commodity */
const getRateForCommodity = async (req, res, next) => {
  try {
    await ensureMSPRates();
    const rawCommodity = req.params.commodity || '';
    const cleanCommodity = decodeURIComponent(rawCommodity).trim();

    // 1. Direct or partial match on English or Marathi commodity name
    let rate = await db('msp_rates')
      .where('commodity', 'ilike', `%${cleanCommodity}%`)
      .orWhere('commodity_marathi', 'ilike', `%${cleanCommodity}%`)
      .first();

    // 2. If not matched directly, extract first word / base name (e.g. 'Rice' from 'Rice (Paddy)')
    if (!rate && cleanCommodity) {
      const baseName = cleanCommodity.split(/[\s(]/)[0].trim();
      if (baseName.length >= 3) {
        rate = await db('msp_rates')
          .where('commodity', 'ilike', `%${baseName}%`)
          .orWhere('commodity_marathi', 'ilike', `%${baseName}%`)
          .first();
      }
    }

    // 3. Fallback standard government default if crop is not explicitly configured
    if (!rate) {
      rate = {
        commodity: cleanCommodity || 'Wheat',
        commodity_marathi: 'धान्य / पीक',
        msp_rate_per_quintal: 2275.0,
        max_moisture_percentage: 12.0,
        season: '2024-25',
        category: 'Cereal',
      };
    }

    res.json({ rate });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMSPRates, getRateForCommodity, ensureMSPRates };
