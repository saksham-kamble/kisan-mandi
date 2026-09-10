/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  return knex.schema.table('bookings', (table) => {
    table.string('priority_level', 50).defaultTo('standard'); // 'standard' | 'express_grade_a' | 'moisture_urgent'
    table.integer('priority_weight').defaultTo(0); // 0 = standard, 2 = express_grade_a, 3 = moisture_urgent
    table.string('quality_grade', 50).nullable(); // 'Grade A (Premium)', 'Grade B (Standard FAQ)', etc.
    table.integer('quality_score').nullable(); // 0 to 100
    table.text('quality_metrics').nullable(); // JSON string with broken_pct, foreign_matter_pct, moisture_est_pct
    table.text('crop_image_url').nullable(); // Crop photo data URL or sample path
    table.string('priority_reason', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  return knex.schema.table('bookings', (table) => {
    table.dropColumn('priority_level');
    table.dropColumn('priority_weight');
    table.dropColumn('quality_grade');
    table.dropColumn('quality_score');
    table.dropColumn('quality_metrics');
    table.dropColumn('crop_image_url');
    table.dropColumn('priority_reason');
  });
};
