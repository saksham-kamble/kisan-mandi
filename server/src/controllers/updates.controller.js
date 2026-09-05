const db = require('../config/db');

/**
 * GET /api/updates — Fetch active Mandi Announcements, Weather Advisories, MSP News, and Gov Schemes
 */
const getUpdates = async (req, res, next) => {
  try {
    const { category, centre_id } = req.query;

    const hasTable = await db.schema.hasTable('mandi_announcements');
    if (!hasTable) {
      return res.json({ updates: [] });
    }

    let query = db('mandi_announcements')
      .leftJoin('procurement_centres', 'mandi_announcements.centre_id', 'procurement_centres.id')
      .select(
        'mandi_announcements.*',
        'procurement_centres.name as centre_name',
        'procurement_centres.district as centre_district'
      )
      .where('mandi_announcements.is_active', true);

    if (category && category !== 'all') {
      query = query.where('mandi_announcements.category', category);
    }

    if (centre_id) {
      query = query.where((builder) => {
        builder.where('mandi_announcements.centre_id', centre_id).orWhereNull('mandi_announcements.centre_id');
      });
    }

    const updates = await query.orderBy([
      { column: 'mandi_announcements.priority', order: 'asc' }, // alert / urgent / normal
      { column: 'mandi_announcements.created_at', order: 'desc' },
    ]);

    res.json({ updates });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/updates — Create an announcement (Admin / Super Admin)
 */
const createUpdate = async (req, res, next) => {
  try {
    const {
      title,
      title_marathi,
      content,
      content_marathi,
      category,
      priority,
      centre_id,
      created_by,
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const [announcement] = await db('mandi_announcements')
      .insert({
        title: title.trim(),
        title_marathi: title_marathi ? title_marathi.trim() : null,
        content: content.trim(),
        content_marathi: content_marathi ? content_marathi.trim() : null,
        category,
        priority: priority || 'normal',
        centre_id: centre_id || null,
        is_active: true,
        created_by: created_by || req.user?.name || 'District Agricultural Nodal Officer',
      })
      .returning('*');

    res.status(201).json({
      message: 'महत्त्वाची सूचना यशस्वीरीत्या प्रसिद्ध केली (Announcement published successfully)',
      announcement,
      update: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/updates/:id — Remove an announcement (Admin / Super Admin)
 */
const deleteUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db('mandi_announcements').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await db('mandi_announcements').where({ id }).del();

    res.json({ message: 'सूचना हटवण्यात आली (Announcement deleted successfully)' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUpdates,
  createUpdate,
  deleteUpdate,
};
