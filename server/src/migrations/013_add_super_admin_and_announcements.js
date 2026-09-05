/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  // 0. Update farmers role check constraint to allow 'super_admin'
  try {
    await knex.raw(`
      ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_role_check;
      ALTER TABLE farmers ADD CONSTRAINT farmers_role_check CHECK (role IN ('farmer', 'admin', 'super_admin'));
    `);
  } catch (err) {
    console.warn('Could not update farmers_role_check constraint:', err.message);
  }

  // 1. Add vigilance & super admin fields to grievances table
  const hasGrievances = await knex.schema.hasTable('grievances');
  if (hasGrievances) {
    const hasTargetAuth = await knex.schema.hasColumn('grievances', 'target_authority');
    if (!hasTargetAuth) {
      await knex.schema.table('grievances', (table) => {
        table.string('target_authority', 50).defaultTo('mandi_admin'); // 'mandi_admin' | 'super_admin'
        table.boolean('is_against_mandi').defaultTo(false);
        table.text('super_admin_remarks').nullable();
        table.string('super_admin_resolved_by').nullable();
        table.timestamp('super_admin_resolved_at').nullable();
      });
    }
  }

  // 2. Create mandi_announcements table for Live Updates, Weather Advisories, MSP News & Schemes
  const hasAnnouncements = await knex.schema.hasTable('mandi_announcements');
  if (!hasAnnouncements) {
    await knex.schema.createTable('mandi_announcements', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.string('title_marathi', 255).nullable();
      table.text('content').notNullable();
      table.text('content_marathi').nullable();
      table.string('category', 50).notNullable(); // 'msp_update', 'weather_advisory', 'gov_scheme', 'mandi_notice'
      table.string('priority', 20).defaultTo('normal'); // 'normal', 'urgent', 'alert'
      table.integer('centre_id').unsigned().nullable()
        .references('id').inTable('procurement_centres').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.string('created_by', 100).defaultTo('District Nodal Officer');
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('mandi_announcements');

  const hasGrievances = await knex.schema.hasTable('grievances');
  if (hasGrievances) {
    await knex.schema.table('grievances', (table) => {
      table.dropColumn('target_authority');
      table.dropColumn('is_against_mandi');
      table.dropColumn('super_admin_remarks');
      table.dropColumn('super_admin_resolved_by');
      table.dropColumn('super_admin_resolved_at');
    });
  }

  try {
    await knex.raw(`
      ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_role_check;
      ALTER TABLE farmers ADD CONSTRAINT farmers_role_check CHECK (role IN ('farmer', 'admin'));
    `);
  } catch (err) {
    console.warn('Could not revert farmers_role_check constraint:', err.message);
  }
};
